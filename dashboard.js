const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const LOW_STOCK_THRESHOLD = 5;

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// GET /api/dashboard/alerts -> lightweight counts for topbar notification bell
router.get('/alerts', requireAdmin, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const [lowStockCount, pendingOrders, cancelledOrders, recentOrders, recentDelivered] = await Promise.all([
      Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD }, stockStatus: 'in_stock' }),
      Order.countDocuments({ status: 'Placed' }),
      Order.countDocuments({ status: 'Cancelled' }),
      Order.find({ createdAt: { $gte: yesterdayStart } }).sort({ createdAt: -1 }).limit(5),
      Order.find({ status: 'Delivered', updatedAt: { $gte: yesterdayStart } }).sort({ updatedAt: -1 }).limit(5),
    ]);

    res.json({
      lowStockCount,
      lowStock: lowStockCount,
      pendingOrders,
      cancelledOrders,
      recentOrdersCount: recentOrders.length,
      deliveredCount: recentDelivered.length,
      recentOrders,
      recentDelivered,
      total: lowStockCount + pendingOrders + cancelledOrders + recentOrders.length,
    });
  } catch (err) {
    console.error('Dashboard alerts error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/dashboard -> everything the admin dashboard needs, in one call
router.get('/', requireAdmin, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const fourteenDaysAgo = new Date(startOfToday);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // Core counts — run all in parallel for speed
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      processingOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      recentOrders,
      todaysOrdersCount,
      newCustomersToday,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ status: 'Placed' }),
      Order.countDocuments({ status: 'Confirmed' }),
      Order.countDocuments({ status: 'Shipped' }),
      Order.countDocuments({ status: 'Delivered' }),
      Order.countDocuments({ status: 'Cancelled' }),
      Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }).sort({ stock: 1 }).limit(10),
      Order.find().sort({ createdAt: -1 }).limit(8),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    // Sales aggregation — run in parallel
    const [salesAgg, todaysSalesAgg] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const totalSales = salesAgg[0]?.total || 0;
    const todaysSales = todaysSalesAgg[0]?.total || 0;

    // Week-over-week comparisons
    const [ordersThisWeek, ordersPrevWeek, usersThisWeek, usersPrevWeek, productsThisWeek, productsPrevWeek] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      Product.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Product.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
    ]);

    const [salesThisWeekAgg, salesPrevWeekAgg] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const salesThisWeek = salesThisWeekAgg[0]?.total || 0;
    const salesPrevWeek = salesPrevWeekAgg[0]?.total || 0;

    const trends = {
      orders: pctChange(ordersThisWeek, ordersPrevWeek),
      sales: pctChange(salesThisWeek, salesPrevWeek),
      customers: pctChange(usersThisWeek, usersPrevWeek),
      products: pctChange(productsThisWeek, productsPrevWeek),
    };

    // Last 7 days daily series
    const dayLabels = [];
    const salesByDay = [];
    const ordersByDay = [];
    const customersByDay = [];

    // Build all 7 day queries at once instead of sequential
    const dayQueries = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(startOfToday);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      dayLabels.push(dayStart.toLocaleDateString('en-IN', { weekday: 'short' }));
      dayQueries.push(
        Promise.all([
          Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: dayStart, $lt: dayEnd } } },
            { $group: { _id: null, total: { $sum: '$total' } } },
          ]),
          Order.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
          User.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
        ])
      );
    }

    const dayResults = await Promise.all(dayQueries);
    for (const [daySalesAgg, dayOrders, dayCustomers] of dayResults) {
      salesByDay.push(daySalesAgg[0]?.total || 0);
      ordersByDay.push(dayOrders);
      customersByDay.push(dayCustomers);
    }

    // Monthly sales graph (last 12 months)
    const monthlyAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlySales = [];
    const cursor = new Date(twelveMonthsAgo);
    for (let i = 0; i < 12; i++) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const found = monthlyAgg.find(x => x._id.year === y && x._id.month === m);
      monthlySales.push({ label: monthNames[m - 1], total: found ? found.total : 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // Top selling products
    const topProductsAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          qtySold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        },
      },
      { $sort: { qtySold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalSales,
      totalUsers,
      pendingOrders,
      processingOrders,
      shippedOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      lowStockCount: lowStockProducts.length,
      recentOrders,
      todaysSales,
      todaysOrdersCount,
      newCustomersToday,
      monthlySales,
      topProducts: topProductsAgg,
      trends,
      last7Days: { labels: dayLabels, sales: salesByDay, orders: ordersByDay, customers: customersByDay },
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/dashboard/sales-filtered?year=2026&month=3
router.get('/sales-filtered', requireAdmin, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || 0;

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let labels = [];
    let values = [];

    if (month >= 1 && month <= 12) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      const dailyAgg = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: { $dayOfMonth: '$createdAt' }, total: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]);

      for (let d = 1; d <= daysInMonth; d++) {
        labels.push(d.toString());
        const found = dailyAgg.find(x => x._id === d);
        values.push(found ? found.total : 0);
      }
    } else {
      const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      const monthlyAgg = await Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: yearStart, $lte: yearEnd } } },
        { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]);

      for (let m = 1; m <= 12; m++) {
        labels.push(monthNames[m - 1]);
        const found = monthlyAgg.find(x => x._id === m);
        values.push(found ? found.total : 0);
      }
    }

    const totalAgg = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: month >= 1 && month <= 12
            ? { $gte: new Date(year, month - 1, 1, 0, 0, 0, 0), $lte: new Date(year, month, 0, 23, 59, 59, 999) }
            : { $gte: new Date(year, 0, 1, 0, 0, 0, 0), $lte: new Date(year, 11, 31, 23, 59, 59, 999) },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    let prevStart, prevEnd;
    if (month >= 1 && month <= 12) {
      prevStart = new Date(year, month - 2, 1, 0, 0, 0, 0);
      prevEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);
    } else {
      prevStart = new Date(year - 1, 0, 1, 0, 0, 0, 0);
      prevEnd = new Date(year - 1, 11, 31, 23, 59, 59, 999);
    }
    const prevAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const currentTotal = totalAgg[0]?.total || 0;
    const prevTotal = prevAgg[0]?.total || 0;
    const trend = prevTotal === 0 ? (currentTotal > 0 ? 100 : 0) : Math.round(((currentTotal - prevTotal) / prevTotal) * 100);

    res.json({ labels, values, total: currentTotal, trend });
  } catch (err) {
    console.error('Sales filtered error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
