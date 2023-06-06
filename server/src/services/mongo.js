const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

const db = mongoose.connection;

db.once('open', () => {
  console.log('MongoDB connection ready!');
});

db.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = { mongoConnect, mongoDisconnect };
