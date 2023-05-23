// Importing the supertest library to test HTTP requests and responses
const request = require('supertest');

// Importing the app module that contains the server logic
const app = require('../../app');

const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });

  // Test suite for GET /launches endpoint
  describe('Test GET /v1/launches', () => {
    // Test case for successful response with status code 200
    test('It should respond with 200 success', async () => {
      // Sending a GET request to /launches endpoint using supertest
      const response = await request(app)
        .get('/v1/launches')
        // Expecting the response content type to be JSON
        .expect('Content-Type', /json/)
        // Expecting the response status code to be 200
        .expect(200);
    });
  });

  // Test suite for POST /launches endpoint
  describe('Test POST /v1/launches', () => {
    // Creating an object containing complete launch data
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-1652 b',
      launchDate: 'january 14, 2028',
    };

    // Creating an object containing launch data without date
    const launchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-1652 b',
    };
    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-1652 b',
      launchDate: 'january',
    };
    // Test case for successful response with status code 201
    test('It should respond with 201 created!', async () => {
      // Sending a POST request to /launches endpoint using supertest
      const response = await request(app)
        .post('/v1/launches')
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

    // Test case for missing required properties
    test('It should catch missing required properties', async () => {
      // Send a POST request to '/v1/launches' endpoint with launchDataWithoutDate
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        // Expecting response header 'Content-Type' to have value containing 'json'
        .expect('Content-Type', /json/)
        // Expecting HTTP status code of 400
        .expect(400);

      // Expecting response body to have error message 'Missing required launch property'
      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    // Test case for invalid dates
    test('It should catch invalid dates', async () => {
      // Send a POST request to '/v1/launches' endpoint with launchDataWithInvalidDate
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        // Expecting response header 'Content-Type' to have value containing 'json'
        .expect('Content-Type', /json/)
        // Expecting HTTP status code of 400
        .expect(400);

      // Expecting response body to have error message 'Invalid launch date'
      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
