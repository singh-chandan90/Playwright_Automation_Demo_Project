import { test, expect, request, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/LoggerUtil';

const BASE_URL = 'https://restful-booker.herokuapp.com';
const deleteDataPath = path.resolve(__dirname, '../../testdata/api_data/booking_delete_data.json');
const deleteData = JSON.parse(fs.readFileSync(deleteDataPath, 'utf-8'));

// Helper to create a booking for delete tests
async function createBooking(apiContext: APIRequestContext) {
  const response = await apiContext.post('/booking', {
    data: deleteData.deleteBookingData,
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await response.json();
  return body.bookingid;
}

// Helper to get auth token
async function getToken(apiContext: APIRequestContext) {
  const response = await apiContext.post('/auth', {
    data: deleteData.auth,
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await response.json();
  return body.token;
}

test.describe('Restful Booker Booking API - Delete Booking', () => {
  let apiContext: APIRequestContext;
  let bookingId: number;
  let token: string;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
    bookingId = await createBooking(apiContext);
    token = await getToken(apiContext);
  });

  test('should delete a booking with valid token', async () => {
    const response = await apiContext.delete(`/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${token}`
      },
    });
    logger.debug(`DELETE /booking/${bookingId} response: ` + (await response.text()));
    expect(response.status()).toBe(201); // 201: Created (for delete)
  });

  test('should fail to delete a booking with invalid token', async () => {
    // Create a new booking to test invalid token scenario
    const tempBookingId = await createBooking(apiContext);
    const response = await apiContext.delete(`/booking/${tempBookingId}`, {
      headers: {
        Cookie: `token=invalidtoken123`
      },
    });
    logger.debug(`DELETE /booking/${tempBookingId} (invalid token) response: ` + (await response.text()));
    expect([403, 401]).toContain(response.status()); // Forbidden or Unauthorized
  });

  test('should fail to delete a non-existent booking', async () => {
    const response = await apiContext.delete(`/booking/9999999`, {
      headers: {
        Cookie: `token=${token}`
      },
    });
    logger.debug(`DELETE /booking/9999999 (non-existent) response: ` + (await response.text()));
    expect([405, 404]).toContain(response.status()); // Method Not Allowed or Not Found
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
