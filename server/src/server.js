const http = require('http');
const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model');

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
async function startServer() {
  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}!`);
  });
}
startServer();

server.addListener('error', (err) => {
  console.log(err);
});
