require('dotenv').config();
const bcrypt = require('bcryptjs');
const readline = require('readline');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function run() {
  await connectDB();

  console.log('\n=== Naya Admin Account Banayein ===\n');
  const name = await ask('Aapka naam: ');
  const email = await ask('Admin login email: ');
  const password = await ask('Password (kam se kam 6 characters): ');

  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) {
    console.log('❌ Ye email se admin pehle se hai.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  await Admin.create({ name, email: email.toLowerCase(), password: hashed, role: 'superadmin' });

  console.log('\n✅ Admin account ban gaya! Ab is email/password se admin panel mein login karein.');
  rl.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
