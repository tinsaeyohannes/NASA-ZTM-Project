const mongoose = require('mongoose');

const MONGO_URL =
  'mongodb+srv://nasa_api:iHYmYxbNEiheqiPA@nasacluster.g8ohhol.mongodb.net/nasa?retryWrites=true&w=majority';
// const MONGO_URL = 'mongodb://localhost:27017/nasa';

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
