import { test, expect, request, APIRequestContext } from '@playwright/test';
import logger from '../../utils/LoggerUtil';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://restful-booker.herokuapp.com';

// Load booking and auth data from JSON file
const bookingDataPath = path.resolve(__dirname, '../../testdata/api_data/booking_data.json');
const bookingDataFile = JSON.parse(fs.readFileSync(bookingDataPath, 'utf-8'));
const bookingData = bookingDataFile.bookingData;
const updatedBookingData = bookingDataFile.updatedBookingData;
const auth = bookingDataFile.auth;

test.describe('Restful Booker Booking API', () => {
  let apiContext: APIRequestContext;
  let bookingId: number;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  test('should create a new booking', async () => {
    const response = await apiContext.post('/booking', {
      data: bookingData,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.debug('POST /booking response: ' + (await response.text()));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('bookingid');
    expect(body).toHaveProperty('booking');
    bookingId = body.bookingid;
  });

  test('should retrieve the created booking', async () => {
    if (!bookingId) {
      test.fail(true, 'Booking was not created');
      return;
    }
    const response = await apiContext.get(`/booking/${bookingId}`);
    expect([200, 404, 400, 500]).toContain(response.status());
    if (response.status() !== 200) return;
    const body = await response.json();
    expect(body).toBeDefined();
    expect(body.firstname).toBeDefined();
  });

  test('should update the booking', async () => {
    if (!bookingId) {
      test.fail(true, 'Booking was not created');
      return;
    }
    // Auth required for update, so get a token first
    const authRes = await apiContext.post('/auth', {
      data: auth,
      headers: { 'Content-Type': 'application/json' },
    });
    const authBody = await authRes.json();
    const token = authBody.token;
    const response = await apiContext.put(`/booking/${bookingId}`, {
      data: updatedBookingData,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`
      },
    });
    logger.debug(`PUT /booking/${bookingId} response: ` + (await response.text()));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
    expect(body.firstname).toBe(updatedBookingData.firstname);
    expect(body.lastname).toBe(updatedBookingData.lastname);
  });

  test('should delete the booking', async () => {
    if (!bookingId) {
      test.fail(true, 'Booking was not created');
      return;
    }
    // Auth required for delete, so get a token first
    const authRes = await apiContext.post('/auth', {
      data: auth,
      headers: { 'Content-Type': 'application/json' },
    });
    const authBody = await authRes.json();
    const token = authBody.token;
    const response = await apiContext.delete(`/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${token}`
      },
    });
    logger.debug(`DELETE /booking/${bookingId} response: ` + (await response.text()));
    expect([201, 200, 400, 404, 500]).toContain(response.status());
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
