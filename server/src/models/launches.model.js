const launchesDB = require('./launches.mongo');
const planets = require('./planets.mongo');

//add the launches model
const launches = new Map();

let latestFlightNumber = 100;

//create launch object
const launch = {
  flightNumber: 100,
  mission: 'kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['NASA', 'SpaceX'],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

//get the launch object from the map
launches.get(100) === launch;

//check if the launch exists in the map
function existLaunchWithId(launchId) {
  return launches.has(launchId);
}
//get all the launches
async function getAllLaunches() {
  return await launchesDB.find({}, { _id: 0, __v: 0 });
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching Planet was Found!');
  }

  return await launchesDB.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  launch.flightNumber = latestFlightNumber;
  launches.set(
    launch.flightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customers: ['NASA', 'SpaceX'],
      success: true,
      upcoming: true,
    })
  );
}

function abortLaunchById(launchId) {
  const aborted = launches.get(launchId);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
}

//export the launches model
module.exports = {
  existLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
