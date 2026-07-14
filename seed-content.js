require('dotenv').config();
const connectDB = require('./config/db');
const Banner = require('./models/Banner');
const TeamMember = require('./models/TeamMember');
const Category = require('./models/Category');
const Settings = require('./models/Settings');

const homepageBanners = [
  { title: 'Built for modern industry', subtitle: 'Reliable solutions for your everyday operations.', image: 'image slide bar/1.webp', position: 'Homepage', sortOrder: 1, isActive: true },
  { title: 'Better products, better workflow', subtitle: 'Explore quality that keeps your business moving.', image: 'image slide bar/2.webp', position: 'Homepage', sortOrder: 2, isActive: true },
  { title: 'Performance you can depend on', subtitle: 'Designed for speed, durability, and scale.', image: 'image slide bar/3.webp', position: 'Homepage', sortOrder: 3, isActive: true },
  { title: 'Powering your next project', subtitle: 'Fresh banner space for offers, launches, and updates.', image: 'image slide bar/4.webp', position: 'Homepage', sortOrder: 4, isActive: true },
];

const allProductsBanners = [
  { title: 'Explore our full range', subtitle: 'LED TVs, Washing Machines, ACs, Coolers and more.', image: 'ALL PRODUCTS SLIDER IMAGE/1.png', position: 'All Products', sortOrder: 1, isActive: true },
  { title: 'Warehouse products banner', subtitle: 'Quality you can trust for your business.', image: 'image slide bar/2.webp', position: 'All Products', sortOrder: 2, isActive: true },
  { title: 'Manufacturing banner', subtitle: 'Performance at scale.', image: 'image slide bar/3.webp', position: 'All Products', sortOrder: 3, isActive: true },
  { title: 'Factory and logistics banner', subtitle: 'Powering your next project.', image: 'image slide bar/4.webp', position: 'All Products', sortOrder: 4, isActive: true },
];

const innovationBanners = [
  {
    title: 'Innovation for the Future',
    subtitle: 'Welcome to Wiscon, where innovation and technology meet to create exceptional electronics products. With over 30 years of experience in the industry, we know what it takes to provide our customers with true value for their money. Our commitment to futuristic technologies ensures that we are always ahead of the curve, bringing you the latest and greatest products on the market. We take pride in our exceptional quality and unbeatable prices, making us your go-to choice for all your electronics needs. Experience the difference with Wiscon and discover a whole new world of innovation!',
    image: '',
    position: 'Innovation',
    sortOrder: 1,
    isActive: true,
  },
];

const team = [
  { image: 'Our Team/Front_View_1.webp', order: 1 },
  { image: 'Our Team/2.webp', order: 2 },
  { image: 'Our Team/3.webp', order: 3 },
  { image: 'Our Team/4.webp', order: 4 },
  { image: 'Our Team/5.webp', order: 5 },
  { image: 'Our Team/6.webp', order: 6 },
  { image: 'Our Team/7.webp', order: 7 },
  { image: 'Our Team/8.webp', order: 8 },
  { image: 'Our Team/9.webp', order: 9 },
  { image: 'Our Team/10.webp', order: 10 },
  { image: 'Our Team/11.webp', order: 11 },
  { image: 'Our Team/12.webp', order: 12 },
];

const categories = [
  { name: 'LED TV', order: 1 },
  { name: 'WASHING MACHINE', order: 2 },
  { name: 'AIR CONDITIONER', order: 3 },
  { name: 'AIR COOLER', order: 4 },
];

async function seed() {
  await connectDB();

  console.log('Clearing existing banners, team members, categories...');
  await Banner.deleteMany({});
  await TeamMember.deleteMany({});
  await Category.deleteMany({});

  console.log('Adding homepage banners...');
  await Banner.insertMany(homepageBanners);

  console.log('Adding all-products banners...');
  await Banner.insertMany(allProductsBanners);

  console.log('Adding innovation banner...');
  await Banner.insertMany(innovationBanners);

  console.log('Adding team members...');
  await TeamMember.insertMany(team);

  console.log('Adding categories...');
  await Category.insertMany(categories);

  console.log('Setting up default support info...');
  const existing = await Settings.findOne({ key: 'site_settings' });
  if (!existing) {
    await Settings.create({ key: 'site_settings', supportEmail: 'support@wiscon.in', supportPhone: '1800-3094-549' });
  }

  console.log('Done! All banners, team members, categories, and settings are ready.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
