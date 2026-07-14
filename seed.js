require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Yeh aapki purani all-products.html se nikaale gaye 60 products hain
const productsData = 
[
  {
    "id": 1,
    "category": "LED TV",
    "name": "Wiscon LED TV 32\"",
    "price": 15000,
    "priceStr": "₹15,000",
    "size": "32\"",
    "date": 1,
    "images": [
      "LED TV Images/led1-1.png",
      "LED TV Images/led1-2.png",
      "LED TV Images/led1-3.png",
      "LED TV Images/led1-4.png",
      "LED TV Images/led1-5.png"
    ]
  },
  {
    "id": 2,
    "category": "LED TV",
    "name": "Wiscon LED TV 40\"",
    "price": 18000,
    "priceStr": "₹18,000",
    "size": "40\"",
    "date": 2,
    "images": [
      "LED TV Images/led2-1.png",
      "LED TV Images/led2-2.png",
      "LED TV Images/led2-3.png",
      "LED TV Images/led2-4.png",
      "LED TV Images/led2-5.png"
    ]
  },
  {
    "id": 3,
    "category": "LED TV",
    "name": "Wiscon LED TV 43\"",
    "price": 20000,
    "priceStr": "₹20,000",
    "size": "43\"",
    "date": 3,
    "images": [
      "LED TV Images/led3-1.png",
      "LED TV Images/led3-2.png",
      "LED TV Images/led3-3.png",
      "LED TV Images/led3-4.png",
      "LED TV Images/led3-5.png"
    ]
  },
  {
    "id": 4,
    "category": "LED TV",
    "name": "Wiscon LED TV 50\"",
    "price": 25000,
    "priceStr": "₹25,000",
    "size": "50\"",
    "date": 4,
    "images": [
      "LED TV Images/led4-1.png",
      "LED TV Images/led4-2.png",
      "LED TV Images/led4-3.png",
      "LED TV Images/led4-4.png",
      "LED TV Images/led4-5.png"
    ]
  },
  {
    "id": 5,
    "category": "LED TV",
    "name": "Wiscon LED TV 55\"",
    "price": 28000,
    "priceStr": "₹28,000",
    "size": "55\"",
    "date": 5,
    "images": [
      "LED TV Images/led5-1.png",
      "LED TV Images/led5-2.png",
      "LED TV Images/led5-3.png",
      "LED TV Images/led5-4.png",
      "LED TV Images/led5-5.png"
    ]
  },
  {
    "id": 6,
    "category": "LED TV",
    "name": "Wiscon LED TV 58\"",
    "price": 30000,
    "priceStr": "₹30,000",
    "size": "58\"",
    "date": 6,
    "images": [
      "LED TV Images/led6-1.png",
      "LED TV Images/led6-2.png",
      "LED TV Images/led6-3.png",
      "LED TV Images/led6-4.png",
      "LED TV Images/led6-5.png"
    ]
  },
  {
    "id": 7,
    "category": "LED TV",
    "name": "Wiscon LED TV 65\"",
    "price": 35000,
    "priceStr": "₹35,000",
    "size": "65\"",
    "date": 7,
    "images": [
      "LED TV Images/led7-1.png",
      "LED TV Images/led7-2.png",
      "LED TV Images/led7-3.png",
      "LED TV Images/led7-4.png",
      "LED TV Images/led7-5.png"
    ]
  },
  {
    "id": 8,
    "category": "LED TV",
    "name": "Wiscon Smart TV 32\"",
    "price": 17000,
    "priceStr": "₹17,000",
    "size": "32\"",
    "date": 8,
    "images": [
      "LED TV Images/led8-1.png",
      "LED TV Images/led8-2.png",
      "LED TV Images/led8-3.png",
      "LED TV Images/led8-4.png",
      "LED TV Images/led8-5.png"
    ]
  },
  {
    "id": 9,
    "category": "LED TV",
    "name": "Wiscon Smart TV 40\"",
    "price": 22000,
    "priceStr": "₹22,000",
    "size": "40\"",
    "date": 9,
    "images": [
      "LED TV Images/led9-1.png",
      "LED TV Images/led9-2.png",
      "LED TV Images/led9-3.png",
      "LED TV Images/led9-4.png",
      "LED TV Images/led9-5.png"
    ]
  },
  {
    "id": 10,
    "category": "LED TV",
    "name": "Wiscon Smart TV 43\"",
    "price": 24000,
    "priceStr": "₹24,000",
    "size": "43\"",
    "date": 10,
    "images": [
      "LED TV Images/led10-1.png",
      "LED TV Images/led10-2.png",
      "LED TV Images/led10-3.png",
      "LED TV Images/led10-4.png",
      "LED TV Images/led10-5.png"
    ]
  },
  {
    "id": 11,
    "category": "LED TV",
    "name": "Wiscon Smart TV 50\"",
    "price": 29000,
    "priceStr": "₹29,000",
    "size": "50\"",
    "date": 11,
    "images": [
      "LED TV Images/led11-1.png",
      "LED TV Images/led11-2.png",
      "LED TV Images/led11-3.png",
      "LED TV Images/led11-4.png",
      "LED TV Images/led11-5.png"
    ]
  },
  {
    "id": 12,
    "category": "LED TV",
    "name": "Wiscon Smart TV 55\"",
    "price": 32000,
    "priceStr": "₹32,000",
    "size": "55\"",
    "date": 12,
    "images": [
      "LED TV Images/led12-1.png",
      "LED TV Images/led12-2.png",
      "LED TV Images/led12-3.png",
      "LED TV Images/led12-4.png",
      "LED TV Images/led12-5.png"
    ]
  },
  {
    "id": 13,
    "category": "LED TV",
    "name": "Wiscon 4K TV 50\"",
    "price": 38000,
    "priceStr": "₹38,000",
    "size": "50\"",
    "date": 13,
    "images": [
      "LED TV Images/led13-1.png",
      "LED TV Images/led13-2.png",
      "LED TV Images/led13-3.png",
      "LED TV Images/led13-4.png",
      "LED TV Images/led13-5.png"
    ]
  },
  {
    "id": 14,
    "category": "LED TV",
    "name": "Wiscon 4K TV 55\"",
    "price": 42000,
    "priceStr": "₹42,000",
    "size": "55\"",
    "date": 14,
    "images": [
      "LED TV Images/led14-1.png",
      "LED TV Images/led14-2.png",
      "LED TV Images/led14-3.png",
      "LED TV Images/led14-4.png",
      "LED TV Images/led14-5.png"
    ]
  },
  {
    "id": 15,
    "category": "LED TV",
    "name": "Wiscon 4K TV 65\"",
    "price": 50000,
    "priceStr": "₹50,000",
    "size": "65\"",
    "date": 15,
    "images": [
      "LED TV Images/led15-1.png",
      "LED TV Images/led15-2.png",
      "LED TV Images/led15-3.png",
      "LED TV Images/led15-4.png",
      "LED TV Images/led15-5.png"
    ]
  },
  {
    "id": 16,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Semi Auto 6.5kg",
    "price": 8000,
    "priceStr": "₹8,000",
    "size": "6.5kg",
    "date": 16,
    "images": [
      "Washing Machine Images/wm1-1.png",
      "Washing Machine Images/wm1-2.png",
      "Washing Machine Images/wm1-3.png",
      "Washing Machine Images/wm1-4.png",
      "Washing Machine Images/wm1-5.png"
    ]
  },
  {
    "id": 17,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Semi Auto 7.5kg",
    "price": 9000,
    "priceStr": "₹9,000",
    "size": "7.5kg",
    "date": 17,
    "images": [
      "Washing Machine Images/wm2-1.png",
      "Washing Machine Images/wm2-2.png",
      "Washing Machine Images/wm2-3.png",
      "Washing Machine Images/wm2-4.png",
      "Washing Machine Images/wm2-5.png"
    ]
  },
  {
    "id": 18,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Semi Auto 8.5kg",
    "price": 10000,
    "priceStr": "₹10,000",
    "size": "8.5kg",
    "date": 18,
    "images": [
      "Washing Machine Images/wm3-1.png",
      "Washing Machine Images/wm3-2.png",
      "Washing Machine Images/wm3-3.png",
      "Washing Machine Images/wm3-4.png",
      "Washing Machine Images/wm3-5.png"
    ]
  },
  {
    "id": 19,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Front Load 6kg",
    "price": 11000,
    "priceStr": "₹11,000",
    "size": "6kg",
    "date": 19,
    "images": [
      "Washing Machine Images/wm4-1.png",
      "Washing Machine Images/wm4-2.png",
      "Washing Machine Images/wm4-3.png",
      "Washing Machine Images/wm4-4.png",
      "Washing Machine Images/wm4-5.png"
    ]
  },
  {
    "id": 20,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Front Load 7kg",
    "price": 12000,
    "priceStr": "₹12,000",
    "size": "7kg",
    "date": 20,
    "images": [
      "Washing Machine Images/wm5-1.png",
      "Washing Machine Images/wm5-2.png",
      "Washing Machine Images/wm5-3.png",
      "Washing Machine Images/wm5-4.png",
      "Washing Machine Images/wm5-5.png"
    ]
  },
  {
    "id": 21,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Front Load 8kg",
    "price": 13000,
    "priceStr": "₹13,000",
    "size": "8kg",
    "date": 21,
    "images": [
      "Washing Machine Images/wm6-1.png",
      "Washing Machine Images/wm6-2.png",
      "Washing Machine Images/wm6-3.png",
      "Washing Machine Images/wm6-4.png",
      "Washing Machine Images/wm6-5.png"
    ]
  },
  {
    "id": 22,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Top Load 6.5kg",
    "price": 10500,
    "priceStr": "₹10,500",
    "size": "6.5kg",
    "date": 22,
    "images": [
      "Washing Machine Images/wm7-1.png",
      "Washing Machine Images/wm7-2.png",
      "Washing Machine Images/wm7-3.png",
      "Washing Machine Images/wm7-4.png",
      "Washing Machine Images/wm7-5.png"
    ]
  },
  {
    "id": 23,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Top Load 7.5kg",
    "price": 11500,
    "priceStr": "₹11,500",
    "size": "7.5kg",
    "date": 23,
    "images": [
      "Washing Machine Images/wm8-1.png",
      "Washing Machine Images/wm8-2.png",
      "Washing Machine Images/wm8-3.png",
      "Washing Machine Images/wm8-4.png",
      "Washing Machine Images/wm8-5.png"
    ]
  },
  {
    "id": 24,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Top Load 8kg",
    "price": 12500,
    "priceStr": "₹12,500",
    "size": "8kg",
    "date": 24,
    "images": [
      "Washing Machine Images/wm9-1.png",
      "Washing Machine Images/wm9-2.png",
      "Washing Machine Images/wm9-3.png",
      "Washing Machine Images/wm9-4.png",
      "Washing Machine Images/wm9-5.png"
    ]
  },
  {
    "id": 25,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Top Load 9kg",
    "price": 14000,
    "priceStr": "₹14,000",
    "size": "9kg",
    "date": 25,
    "images": [
      "Washing Machine Images/wm10-1.png",
      "Washing Machine Images/wm10-2.png",
      "Washing Machine Images/wm10-3.png",
      "Washing Machine Images/wm10-4.png",
      "Washing Machine Images/wm10-5.png"
    ]
  },
  {
    "id": 26,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Fully Auto 7kg",
    "price": 15000,
    "priceStr": "₹15,000",
    "size": "7kg",
    "date": 26,
    "images": [
      "Washing Machine Images/wm11-1.png",
      "Washing Machine Images/wm11-2.png",
      "Washing Machine Images/wm11-3.png",
      "Washing Machine Images/wm11-4.png",
      "Washing Machine Images/wm11-5.png"
    ]
  },
  {
    "id": 27,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Fully Auto 8kg",
    "price": 16000,
    "priceStr": "₹16,000",
    "size": "8kg",
    "date": 27,
    "images": [
      "Washing Machine Images/wm12-1.png",
      "Washing Machine Images/wm12-2.png",
      "Washing Machine Images/wm12-3.png",
      "Washing Machine Images/wm12-4.png",
      "Washing Machine Images/wm12-5.png"
    ]
  },
  {
    "id": 28,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Fully Auto 9kg",
    "price": 17000,
    "priceStr": "₹17,000",
    "size": "9kg",
    "date": 28,
    "images": [
      "Washing Machine Images/wm13-1.png",
      "Washing Machine Images/wm13-2.png",
      "Washing Machine Images/wm13-3.png",
      "Washing Machine Images/wm13-4.png",
      "Washing Machine Images/wm13-5.png"
    ]
  },
  {
    "id": 29,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Fully Auto 10kg",
    "price": 19000,
    "priceStr": "₹19,000",
    "size": "10kg",
    "date": 29,
    "images": [
      "Washing Machine Images/wm14-1.png",
      "Washing Machine Images/wm14-2.png",
      "Washing Machine Images/wm14-3.png",
      "Washing Machine Images/wm14-4.png",
      "Washing Machine Images/wm14-5.png"
    ]
  },
  {
    "id": 30,
    "category": "WASHING MACHINE",
    "name": "Wiscon WM Fully Auto 12kg",
    "price": 22000,
    "priceStr": "₹22,000",
    "size": "12kg",
    "date": 30,
    "images": [
      "Washing Machine Images/wm15-1.png",
      "Washing Machine Images/wm15-2.png",
      "Washing Machine Images/wm15-3.png",
      "Washing Machine Images/wm15-4.png",
      "Washing Machine Images/wm15-5.png"
    ]
  },
  {
    "id": 31,
    "category": "AIR CONDITIONER",
    "name": "Wiscon AC 1 Ton 3 Star",
    "price": 28000,
    "priceStr": "₹28,000",
    "size": "1 Ton",
    "date": 31,
    "images": [
      "Air Conditioner Images/ac1-1.png",
      "Air Conditioner Images/ac1-2.png",
      "Air Conditioner Images/ac1-3.png",
      "Air Conditioner Images/ac1-4.png",
      "Air Conditioner Images/ac1-5.png"
    ]
  },
  {
    "id": 32,
    "category": "AIR CONDITIONER",
    "name": "Wiscon AC 1 Ton 5 Star",
    "price": 32000,
    "priceStr": "₹32,000",
    "size": "1 Ton",
    "date": 32,
    "images": [
      "Air Conditioner Images/ac2-1.png",
      "Air Conditioner Images/ac2-2.png",
      "Air Conditioner Images/ac2-3.png",
      "Air Conditioner Images/ac2-4.png",
      "Air Conditioner Images/ac2-5.png"
    ]
  },
  {
    "id": 33,
    "category": "AIR CONDITIONER",
    "name": "Wiscon AC 1.5 Ton 3 Star",
    "price": 33000,
    "priceStr": "₹33,000",
    "size": "1.5 Ton",
    "date": 33,
    "images": [
      "Air Conditioner Images/ac3-1.png",
      "Air Conditioner Images/ac3-2.png",
      "Air Conditioner Images/ac3-3.png",
      "Air Conditioner Images/ac3-4.png",
      "Air Conditioner Images/ac3-5.png"
    ]
  },
  {
    "id": 34,
    "category": "AIR CONDITIONER",
    "name": "Wiscon AC 1.5 Ton 5 Star",
    "price": 37000,
    "priceStr": "₹37,000",
    "size": "1.5 Ton",
    "date": 34,
    "images": [
      "Air Conditioner Images/ac4-1.png",
      "Air Conditioner Images/ac4-2.png",
      "Air Conditioner Images/ac4-3.png",
      "Air Conditioner Images/ac4-4.png",
      "Air Conditioner Images/ac4-5.png"
    ]
  },
  {
    "id": 35,
    "category": "AIR CONDITIONER",
    "name": "Wiscon AC 2 Ton 3 Star",
    "price": 40000,
    "priceStr": "₹40,000",
    "size": "2 Ton",
    "date": 35,
    "images": [
      "Air Conditioner Images/ac5-1.png",
      "Air Conditioner Images/ac5-2.png",
      "Air Conditioner Images/ac5-3.png",
      "Air Conditioner Images/ac5-4.png",
      "Air Conditioner Images/ac5-5.png"
    ]
  },
  {
    "id": 36,
    "category": "AIR CONDITIONER",
    "name": "Wiscon AC 2 Ton 5 Star",
    "price": 45000,
    "priceStr": "₹45,000",
    "size": "2 Ton",
    "date": 36,
    "images": [
      "Air Conditioner Images/ac6-1.png",
      "Air Conditioner Images/ac6-2.png",
      "Air Conditioner Images/ac6-3.png",
      "Air Conditioner Images/ac6-4.png",
      "Air Conditioner Images/ac6-5.png"
    ]
  },
  {
    "id": 37,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Inverter AC 1 Ton",
    "price": 35000,
    "priceStr": "₹35,000",
    "size": "1 Ton",
    "date": 37,
    "images": [
      "Air Conditioner Images/ac7-1.png",
      "Air Conditioner Images/ac7-2.png",
      "Air Conditioner Images/ac7-3.png",
      "Air Conditioner Images/ac7-4.png",
      "Air Conditioner Images/ac7-5.png"
    ]
  },
  {
    "id": 38,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Inverter AC 1.5 Ton",
    "price": 40000,
    "priceStr": "₹40,000",
    "size": "1.5 Ton",
    "date": 38,
    "images": [
      "Air Conditioner Images/ac8-1.png",
      "Air Conditioner Images/ac8-2.png",
      "Air Conditioner Images/ac8-3.png",
      "Air Conditioner Images/ac8-4.png",
      "Air Conditioner Images/ac8-5.png"
    ]
  },
  {
    "id": 39,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Inverter AC 2 Ton",
    "price": 48000,
    "priceStr": "₹48,000",
    "size": "2 Ton",
    "date": 39,
    "images": [
      "Air Conditioner Images/ac9-1.png",
      "Air Conditioner Images/ac9-2.png",
      "Air Conditioner Images/ac9-3.png",
      "Air Conditioner Images/ac9-4.png",
      "Air Conditioner Images/ac9-5.png"
    ]
  },
  {
    "id": 40,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Split AC 1 Ton",
    "price": 30000,
    "priceStr": "₹30,000",
    "size": "1 Ton",
    "date": 40,
    "images": [
      "Air Conditioner Images/ac10-1.png",
      "Air Conditioner Images/ac10-2.png",
      "Air Conditioner Images/ac10-3.png",
      "Air Conditioner Images/ac10-4.png",
      "Air Conditioner Images/ac10-5.png"
    ]
  },
  {
    "id": 41,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Split AC 1.5 Ton",
    "price": 36000,
    "priceStr": "₹36,000",
    "size": "1.5 Ton",
    "date": 41,
    "images": [
      "Air Conditioner Images/ac11-1.png",
      "Air Conditioner Images/ac11-2.png",
      "Air Conditioner Images/ac11-3.png",
      "Air Conditioner Images/ac11-4.png",
      "Air Conditioner Images/ac11-5.png"
    ]
  },
  {
    "id": 42,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Split AC 2 Ton",
    "price": 43000,
    "priceStr": "₹43,000",
    "size": "2 Ton",
    "date": 42,
    "images": [
      "Air Conditioner Images/ac12-1.png",
      "Air Conditioner Images/ac12-2.png",
      "Air Conditioner Images/ac12-3.png",
      "Air Conditioner Images/ac12-4.png",
      "Air Conditioner Images/ac12-5.png"
    ]
  },
  {
    "id": 43,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Window AC 1 Ton",
    "price": 27000,
    "priceStr": "₹27,000",
    "size": "1 Ton",
    "date": 43,
    "images": [
      "Air Conditioner Images/ac13-1.png",
      "Air Conditioner Images/ac13-2.png",
      "Air Conditioner Images/ac13-3.png",
      "Air Conditioner Images/ac13-4.png",
      "Air Conditioner Images/ac13-5.png"
    ]
  },
  {
    "id": 44,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Window AC 1.5 Ton",
    "price": 32000,
    "priceStr": "₹32,000",
    "size": "1.5 Ton",
    "date": 44,
    "images": [
      "Air Conditioner Images/ac14-1.png",
      "Air Conditioner Images/ac14-2.png",
      "Air Conditioner Images/ac14-3.png",
      "Air Conditioner Images/ac14-4.png",
      "Air Conditioner Images/ac14-5.png"
    ]
  },
  {
    "id": 45,
    "category": "AIR CONDITIONER",
    "name": "Wiscon Window AC 2 Ton",
    "price": 38000,
    "priceStr": "₹38,000",
    "size": "2 Ton",
    "date": 45,
    "images": [
      "Air Conditioner Images/ac15-1.png",
      "Air Conditioner Images/ac15-2.png",
      "Air Conditioner Images/ac15-3.png",
      "Air Conditioner Images/ac15-4.png",
      "Air Conditioner Images/ac15-5.png"
    ]
  },
  {
    "id": 46,
    "category": "AIR COOLER",
    "name": "Wiscon Air Cooler 20L",
    "price": 4000,
    "priceStr": "₹4,000",
    "size": "20L",
    "date": 46,
    "images": [
      "Air Cooler Images/acl1-1.png",
      "Air Cooler Images/acl1-2.png",
      "Air Cooler Images/acl1-3.png",
      "Air Cooler Images/acl1-4.png",
      "Air Cooler Images/acl1-5.png"
    ]
  },
  {
    "id": 47,
    "category": "AIR COOLER",
    "name": "Wiscon Air Cooler 30L",
    "price": 5000,
    "priceStr": "₹5,000",
    "size": "30L",
    "date": 47,
    "images": [
      "Air Cooler Images/acl2-1.png",
      "Air Cooler Images/acl2-2.png",
      "Air Cooler Images/acl2-3.png",
      "Air Cooler Images/acl2-4.png",
      "Air Cooler Images/acl2-5.png"
    ]
  },
  {
    "id": 48,
    "category": "AIR COOLER",
    "name": "Wiscon Air Cooler 40L",
    "price": 6000,
    "priceStr": "₹6,000",
    "size": "40L",
    "date": 48,
    "images": [
      "Air Cooler Images/acl3-1.png",
      "Air Cooler Images/acl3-2.png",
      "Air Cooler Images/acl3-3.png",
      "Air Cooler Images/acl3-4.png",
      "Air Cooler Images/acl3-5.png"
    ]
  },
  {
    "id": 49,
    "category": "AIR COOLER",
    "name": "Wiscon Air Cooler 50L",
    "price": 7000,
    "priceStr": "₹7,000",
    "size": "50L",
    "date": 49,
    "images": [
      "Air Cooler Images/acl4-1.png",
      "Air Cooler Images/acl4-2.png",
      "Air Cooler Images/acl4-3.png",
      "Air Cooler Images/acl4-4.png",
      "Air Cooler Images/acl4-5.png"
    ]
  },
  {
    "id": 50,
    "category": "AIR COOLER",
    "name": "Wiscon Air Cooler 60L",
    "price": 8000,
    "priceStr": "₹8,000",
    "size": "60L",
    "date": 50,
    "images": [
      "Air Cooler Images/acl5-1.png",
      "Air Cooler Images/acl5-2.png",
      "Air Cooler Images/acl5-3.png",
      "Air Cooler Images/acl5-4.png",
      "Air Cooler Images/acl5-5.png"
    ]
  },
  {
    "id": 51,
    "category": "AIR COOLER",
    "name": "Wiscon Desert Cooler 70L",
    "price": 9000,
    "priceStr": "₹9,000",
    "size": "70L",
    "date": 51,
    "images": [
      "Air Cooler Images/acl6-1.png",
      "Air Cooler Images/acl6-2.png",
      "Air Cooler Images/acl6-3.png",
      "Air Cooler Images/acl6-4.png",
      "Air Cooler Images/acl6-5.png"
    ]
  },
  {
    "id": 52,
    "category": "AIR COOLER",
    "name": "Wiscon Desert Cooler 80L",
    "price": 10000,
    "priceStr": "₹10,000",
    "size": "80L",
    "date": 52,
    "images": [
      "Air Cooler Images/acl7-1.png",
      "Air Cooler Images/acl7-2.png",
      "Air Cooler Images/acl7-3.png",
      "Air Cooler Images/acl7-4.png",
      "Air Cooler Images/acl7-5.png"
    ]
  },
  {
    "id": 53,
    "category": "AIR COOLER",
    "name": "Wiscon Desert Cooler 100L",
    "price": 12000,
    "priceStr": "₹12,000",
    "size": "100L",
    "date": 53,
    "images": [
      "Air Cooler Images/acl8-1.png",
      "Air Cooler Images/acl8-2.png",
      "Air Cooler Images/acl8-3.png",
      "Air Cooler Images/acl8-4.png",
      "Air Cooler Images/acl8-5.png"
    ]
  },
  {
    "id": 54,
    "category": "AIR COOLER",
    "name": "Wiscon Tower Cooler 35L",
    "price": 6500,
    "priceStr": "₹6,500",
    "size": "35L",
    "date": 54,
    "images": [
      "Air Cooler Images/acl9-1.png",
      "Air Cooler Images/acl9-2.png",
      "Air Cooler Images/acl9-3.png",
      "Air Cooler Images/acl9-4.png",
      "Air Cooler Images/acl9-5.png"
    ]
  },
  {
    "id": 55,
    "category": "AIR COOLER",
    "name": "Wiscon Tower Cooler 45L",
    "price": 7500,
    "priceStr": "₹7,500",
    "size": "45L",
    "date": 55,
    "images": [
      "Air Cooler Images/acl10-1.png",
      "Air Cooler Images/acl10-2.png",
      "Air Cooler Images/acl10-3.png",
      "Air Cooler Images/acl10-4.png",
      "Air Cooler Images/acl10-5.png"
    ]
  },
  {
    "id": 56,
    "category": "AIR COOLER",
    "name": "Wiscon Personal Cooler 20L",
    "price": 3500,
    "priceStr": "₹3,500",
    "size": "20L",
    "date": 56,
    "images": [
      "Air Cooler Images/acl11-1.png",
      "Air Cooler Images/acl11-2.png",
      "Air Cooler Images/acl11-3.png",
      "Air Cooler Images/acl11-4.png",
      "Air Cooler Images/acl11-5.png"
    ]
  },
  {
    "id": 57,
    "category": "AIR COOLER",
    "name": "Wiscon Personal Cooler 25L",
    "price": 4500,
    "priceStr": "₹4,500",
    "size": "25L",
    "date": 57,
    "images": [
      "Air Cooler Images/acl12-1.png",
      "Air Cooler Images/acl12-2.png",
      "Air Cooler Images/acl12-3.png",
      "Air Cooler Images/acl12-4.png",
      "Air Cooler Images/acl12-5.png"
    ]
  },
  {
    "id": 58,
    "category": "AIR COOLER",
    "name": "Wiscon Window Cooler 50L",
    "price": 8500,
    "priceStr": "₹8,500",
    "size": "50L",
    "date": 58,
    "images": [
      "Air Cooler Images/acl13-1.png",
      "Air Cooler Images/acl13-2.png",
      "Air Cooler Images/acl13-3.png",
      "Air Cooler Images/acl13-4.png",
      "Air Cooler Images/acl13-5.png"
    ]
  },
  {
    "id": 59,
    "category": "AIR COOLER",
    "name": "Wiscon Window Cooler 60L",
    "price": 9500,
    "priceStr": "₹9,500",
    "size": "60L",
    "date": 59,
    "images": [
      "Air Cooler Images/acl14-1.png",
      "Air Cooler Images/acl14-2.png",
      "Air Cooler Images/acl14-3.png",
      "Air Cooler Images/acl14-4.png",
      "Air Cooler Images/acl14-5.png"
    ]
  },
  {
    "id": 60,
    "category": "AIR COOLER",
    "name": "Wiscon Window Cooler 70L",
    "price": 10500,
    "priceStr": "₹10,500",
    "size": "70L",
    "date": 60,
    "images": [
      "Air Cooler Images/acl15-1.png",
      "Air Cooler Images/acl15-2.png",
      "Air Cooler Images/acl15-3.png",
      "Air Cooler Images/acl15-4.png",
      "Air Cooler Images/acl15-5.png"
    ]
  }
];

async function seed() {
  await connectDB();

  console.log('Purane products delete kar rahe hain (agar hain to)...');
  await Product.deleteMany({});

  console.log(`${productsData.length} products database mein daal rahe hain...`);
  // Note: insertMany() skips pre('save') hooks, so we set all computed fields explicitly here.
  await Product.insertMany(
    productsData.map((p) => ({
      ...p,
      stock: 20,
      isActive: true,
      isBestSeller: false,
      status: 'active',
      brand: 'Wiscon',
      mainImage: p.images && p.images[0] ? p.images[0] : '',
      mrp: p.price,
      discountPercent: 0,
      stockStatus: 'in_stock',
      lowStockAlert: 5,
      freeShipping: true,
      cashOnDelivery: true,
      showOnHome: true,
      showInCategory: true,
      showInSearch: true,
      allowReviews: true,
      allowRatings: true,
      slug: p.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }))
  );

  console.log('✅ Seeding complete! Sab products database mein aa gaye.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
