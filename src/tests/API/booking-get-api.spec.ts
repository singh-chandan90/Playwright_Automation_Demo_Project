import { test, expect, request, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/LoggerUtil';

const BASE_URL = 'https://restful-booker.herokuapp.com';
const filtersPath = path.resolve(__dirname, '../../testdata/api_data/booking_get_filters.json');
const filtersFile = JSON.parse(fs.readFileSync(filtersPath, 'utf-8'));
const bookingFilters = filtersFile.bookingFilters;

test.describe('Restful Booker Booking API - Get Bookings', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  for (const filter of bookingFilters) {
    test(`should return correct results for ${filter.description}`, async () => {
      logger.info(`Sending GET /booking with params: ${JSON.stringify(filter.query)}`);
      const response = await apiContext.get('/booking', { params: filter.query });
      logger.debug(`GET /booking?${new URLSearchParams(filter.query).toString()} response: ` + (await response.text()));
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      if (filter.expectAtLeastOne) {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0]).toHaveProperty('bookingid');
      }
      logger.info(`Test for filter '${filter.description}' passed.`);
    });
  }

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
