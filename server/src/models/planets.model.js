const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');

const habitablePlanets = [];
const planets = [];

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
      .on('data', (data) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', () => {
        habitablePlanets.map((planet) => planets.push(planet['kepler_name']));
        console.log(planets);
        console.log(`${habitablePlanets.length} habitable planets found`);
        resolve();
      });
  });
}
module.exports = {
  loadPlanetsData,
  planets: habitablePlanets,
};
