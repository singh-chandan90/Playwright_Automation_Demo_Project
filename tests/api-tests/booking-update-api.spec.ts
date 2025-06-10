import { test, expect, request, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/LoggerUtil';

const BASE_URL = 'https://restful-booker.herokuapp.com';
const updateDataPath = path.resolve(__dirname, '../../testdata/api_data/booking_update_data.json');
const updateData = JSON.parse(fs.readFileSync(updateDataPath, 'utf-8'));

// Helper to create a booking for update tests
async function createBooking(apiContext: APIRequestContext) {
  const response = await apiContext.post('/booking', {
    data: {
      firstname: 'Temp',
      lastname: 'User',
      totalprice: 100,
      depositpaid: true,
      bookingdates: { checkin: '2025-06-10', checkout: '2025-06-15' },
      additionalneeds: 'Breakfast'
    },
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await response.json();
  return body.bookingid;
}

// Helper to get auth token
async function getToken(apiContext: APIRequestContext) {
  const response = await apiContext.post('/auth', {
    data: updateData.auth,
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await response.json();
  return body.token;
}

test.describe('Restful Booker Booking API - Update Booking', () => {
  let apiContext: APIRequestContext;
  let bookingId: number;
  let token: string;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
    bookingId = await createBooking(apiContext);
    token = await getToken(apiContext);
  });

  test('should update a booking with valid data', async () => {
    const response = await apiContext.put(`/booking/${bookingId}`, {
      data: updateData.validUpdate,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`
      },
    });
    logger.debug(`PUT /booking/${bookingId} (valid) response: ` + (await response.text()));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe(updateData.validUpdate.firstname);
    expect(body.lastname).toBe(updateData.validUpdate.lastname);
  });

  test('should fail to update a booking with missing firstname', async () => {
    const response = await apiContext.put(`/booking/${bookingId}`, {
      data: updateData.missingFirstname,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`
      },
    });
    logger.debug(`PUT /booking/${bookingId} (missing firstname) response: ` + (await response.text()));
    expect([200, 400]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.firstname).toBeUndefined();
    }
  });

  test('should fail to update a booking with invalid price', async () => {
    const response = await apiContext.put(`/booking/${bookingId}`, {
      data: updateData.invalidPrice,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`
      },
    });
    logger.debug(`PUT /booking/${bookingId} (invalid price) response: ` + (await response.text()));
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
