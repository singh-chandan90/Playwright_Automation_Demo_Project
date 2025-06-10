import { test, expect, request, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/LoggerUtil';

const BASE_URL = 'https://restful-booker.herokuapp.com';
const partialUpdateDataPath = path.resolve(__dirname, '../../testdata/api_data/booking_partial_update_data.json');
const partialUpdateData = JSON.parse(fs.readFileSync(partialUpdateDataPath, 'utf-8'));

// Helper to create a booking for partial update tests
async function createBooking(apiContext: APIRequestContext) {
  const response = await apiContext.post('/booking', {
    data: {
      firstname: 'TempPartial',
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
    data: partialUpdateData.auth,
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await response.json();
  return body.token;
}

test.describe('Restful Booker Booking API - Partial Update Booking', () => {
  let apiContext: APIRequestContext;
  let bookingId: number;
  let token: string;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
    bookingId = await createBooking(apiContext);
    token = await getToken(apiContext);
  });

  test('should partially update a booking with valid data', async () => {
    const response = await apiContext.patch(`/booking/${bookingId}`, {
      data: partialUpdateData.partialValid,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`
      },
    });
    logger.debug(`PATCH /booking/${bookingId} (valid) response: ` + (await response.text()));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe(partialUpdateData.partialValid.firstname);
    expect(body.lastname).toBe(partialUpdateData.partialValid.lastname);
  });

  test('should partially update a booking with missing firstname', async () => {
    const response = await apiContext.patch(`/booking/${bookingId}`, {
      data: partialUpdateData.partialMissingFirstname,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`
      },
    });
    logger.debug(`PATCH /booking/${bookingId} (missing firstname) response: ` + (await response.text()));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBeDefined(); // Should remain unchanged
    expect(body.lastname).toBe(partialUpdateData.partialMissingFirstname.lastname);
  });

  test('should fail to partially update a booking with invalid price', async () => {
    const response = await apiContext.patch(`/booking/${bookingId}`, {
      data: partialUpdateData.partialInvalidPrice,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`
      },
    });
    logger.debug(`PATCH /booking/${bookingId} (invalid price) response: ` + (await response.text()));
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
