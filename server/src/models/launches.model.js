const axios = require('axios');

//require the launches and planets databases

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

//default flight number

const DEFAULT_FLIGHT_NUMBER = 100;

//create launch object

const launch = {
  flightNumber: 100, // flightNumber
  mission: 'kepler Exploration X', //name
  rocket: 'Explorer IS1', //rocket.name
  launchDate: new Date('December 27, 2030'), //date_local
  target: 'Kepler-1652 b', //not applicable
  customers: ['NASA', 'SpaceX'], // payload.customers for each payload
  upcoming: true, // upcoming
  success: true, //success
};

//save the launch

const SPACEX_API_URL = ' https://api.spacexdata.com/v4/launches/query';

saveLaunch(launch);

async function populateLaunches() {
  console.log('Downloading launch data...');

  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data!');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;

  launchDocs.forEach(async (launchDoc) => {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers: customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
    //TODO - populate launches collection ...???

    await saveLaunch(launch);
  });
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data already loaded');
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

//check if the launch exists in the db

async function existLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

//get the latest flight number from the db

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

//get all the launches from the db

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 }) // 1 for Ascending and -1 for descending
    .skip(skip)
    .limit(limit);
}

//save a launch to the db

async function saveLaunch(launch) {
  try {
    //update the launch in the database
    return await launchesDatabase.findOneAndUpdate(
      {
        flightNumber: launch.flightNumber,
      },
      launch,
      { upsert: true }
    );
  } catch (error) {
    console.error(error);
  }
}

//schedule a new launch, with a new flight number

async function scheduleNewLaunch(launch) {
  //find the planet associated with the launch

  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  //if there is no matching planet, throw an error

  if (!planet) {
    throw new Error('No matching Planet was Found!');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['NASA', 'Zero to Mastery'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

//abort a launch by ID

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  //return whether the operation was acknowledged

  return aborted.acknowledged === true;
}

//export the launches model so it can be used in other modules

module.exports = {
  loadLaunchData,
  existLaunchWithId,
  getAllLaunches,
  abortLaunchById,
  scheduleNewLaunch,
};
