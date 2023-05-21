const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

/** NOTE */
/* The code reads the kepler_data.csv file using fs.createReadStream(),
 pipes the data through the parse() function, and processes it line by line.
 */

function isHabitablePlanet(planet) {
  /*
    we are checking if the planet is habitable or not
    and if it is habitable we are pushing it to habitablePlanets array
  */

  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      .pipe(
        parse({
          comment: '#',
          columns: true,
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        const countPlanetFound = (await getAllPlanets()).length;
        console.log(`${countPlanetFound} habitable planets found`); // should output 8 habitable planets found
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    } // projection
  );
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
