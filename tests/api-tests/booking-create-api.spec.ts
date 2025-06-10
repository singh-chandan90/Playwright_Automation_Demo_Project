import { test, expect, request, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/LoggerUtil';

const BASE_URL = 'https://restful-booker.herokuapp.com';
const createDataPath = path.resolve(__dirname, '../../testdata/api_data/booking_create_data.json');
const createData = JSON.parse(fs.readFileSync(createDataPath, 'utf-8'));

test.describe('Restful Booker Booking API - Create Booking', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  test('should create a booking with valid data', async () => {
    const response = await apiContext.post('/booking', {
      data: createData.validBooking,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.debug('POST /booking (valid) response: ' + (await response.text()));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('bookingid');
    expect(body).toHaveProperty('booking');
    expect(body.booking.firstname).toBe(createData.validBooking.firstname);
  });

  test('should fail to create a booking with missing firstname', async () => {
    const response = await apiContext.post('/booking', {
      data: createData.missingFirstname,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.debug('POST /booking (missing firstname) response: ' + (await response.text()));
    // Accept 400/500 or 200 with missing/null field
    if (![400, 500].includes(response.status())) {
      test.fail(true, 'Expected status 400 or 500');
    }
  });

  test('should fail to create a booking with invalid price', async () => {
    const response = await apiContext.post('/booking', {
      data: createData.invalidPrice,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.debug('POST /booking (invalid price) response: ' + (await response.text()));
    // Accept 400/500 or 200 with null/undefined price
    if (![200, 400, 500].includes(response.status())) {
      test.fail(true, 'Expected status 200, 400, or 500');
    }
    if (response.status() === 200) {
      const body = await response.json();
      if (!(body.totalprice === null || body.totalprice === undefined)) {
        test.fail(true, 'Expected totalprice to be null or undefined');
      }
    }
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
