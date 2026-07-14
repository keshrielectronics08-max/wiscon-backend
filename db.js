const mongoose = require('mongoose');

async function connectDB() {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
  });
  console.log('MongoDB connected:', conn.connection.host);
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Attempting reconnect in 5s...');
  setTimeout(() => {
    mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
    }).catch(err => console.error('Reconnect failed:', err.message));
  }, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB reconnected successfully');
});

module.exports = connectDB;
