const http = require('http');

const mongoose = require('mongoose');

const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model');

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

const MONGO_URL =
  'mongodb+srv://nasa_api:iHYmYxbNEiheqiPA@nasacluster.g8ohhol.mongodb.net/nasa?retryWrites=true&w=majority';

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URL);

    await loadPlanetsData();

    server.listen(PORT, () => {
      console.log(`listening on port ${PORT}!`);
    });
  } catch (error) {
    console.error(error);
  }
}
startServer();

//clustering ????
