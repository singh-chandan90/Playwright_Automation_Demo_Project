import { test, expect, request, APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/LoggerUtil';

const BASE_URL = 'https://restful-booker.herokuapp.com';
const usersPath = path.resolve(__dirname, '../../testdata/api_data/auth_users.json');
const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

test.describe('Restful Booker Auth API', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  test('should create a token with valid credentials', async () => {
    const validUser = users[0];
    const response = await apiContext.post('/auth', {
      data: validUser,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.debug('POST /auth response: ' + (await response.text()));
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
  });

  test('should not create a token with invalid credentials', async () => {
    const invalidUser = users[1];
    const response = await apiContext.post('/auth', {
      data: invalidUser,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.debug('POST /auth (invalid) response: ' + (await response.text()));
    expect(response.status()).toBe(200); // API returns 200 with error message
    const body = await response.json();
    expect(body).toHaveProperty('reason');
    expect(body.reason).toMatch(/Bad credentials/i);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });
});
