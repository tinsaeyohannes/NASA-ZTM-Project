// Importing the supertest library to test HTTP requests and responses
const request = require('supertest');

// Importing the app module that contains the server logic
const app = require('../../app');

// Test suite for GET /launches endpoint
describe('Test GET /launches', () => {
  // Test case for successful response with status code 200
  test('It should respond with 200 success', async () => {
    // Sending a GET request to /launches endpoint using supertest
    const response = await request(app)
      .get('/launches')
      // Expecting the response content type to be JSON
      .expect('Content-Type', /json/)
      // Expecting the response status code to be 200
      .expect(200);
  });
});

// Test suite for POST /launches endpoint
describe('Test POST /launches', () => {
  // Creating an object containing complete launch data
  const completeLaunchData = {
    mission: 'USS Enterprise',
    rocket: 'NCC 1701-D',
    target: 'kepler-186 f',
    launchDate: 'january 14, 2028',
  };

  // Creating an object containing launch data without date
  const launchDataWithoutDate = {
    mission: 'USS Enterprise',
    rocket: 'NCC 1701-D',
    target: 'kepler-186 f',
  };
  const launchDataWithInvalidDate = {
    mission: 'USS Enterprise',
    rocket: 'NCC 1701-D',
    target: 'kepler-186 f',
    launchDate: 'january',
  };
  // Test case for successful response with status code 201
  test('It should respond with 201 created!', async () => {
    // Sending a POST request to /launches endpoint using supertest
    const response = await request(app)
      .post('/launches')
      // Sending the complete launch data in the request body
      .send(completeLaunchData)
      // Expecting the response content type to be JSON
      .expect('Content-Type', /json/)
      // Expecting the response status code to be 201
      .expect(201);

    // Converting the launch date from request data and response data to milliseconds
    const requestDate = new Date(completeLaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();

    // Expecting the launch date in the response to match the launch date in the request
    expect(responseDate).toBe(requestDate);

    // Expecting the response body to match the launch data without date
    expect(response.body).toMatchObject(launchDataWithoutDate);
  });

  test('It should catch missing required properties', async () => {
    const response = await request(app)
      .post('/launches')
      .send(launchDataWithoutDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: 'Missing required launch property',
    });
  });

  // Test case for invalid dates
  test('It should catch invalid dates', async () => {
    const response = await request(app)
      .post('/launches')
      .send(launchDataWithInvalidDate)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: 'Invalid launch date',
    });
  });
});
