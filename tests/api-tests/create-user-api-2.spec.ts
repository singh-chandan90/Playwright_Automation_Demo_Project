import { test, expect } from '@playwright/test';
import { config } from '../../utils/config';
import { CreateUserData } from '../../testdata/api_test_data/create-user-data';

const env = process.env.ENV || 'qa';
const BASE_URL = config.apiBaseUrl;

/**
 * API Tests for User Creation endpoint (/public/v2/users) using the built-in request fixture.
 *
 * This suite covers:
 * - Successful user creation with valid data
 * - Failure scenarios: missing/invalid email, missing name, duplicate email
 *
 * Uses the CreateUserData class to generate random user data for each test run.
 * Each test gets a fresh APIRequestContext via the request fixture.
 */
test.describe('Create User API tests using request fixture)', () => {
  let createdUserId: number | undefined;

  /**
   * Should create a user with valid random data.
   * Expects HTTP 201 and a numeric user id in the response.
   */
  test('should create a user with valid data', async ({ request }) => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const response = await request.post(BASE_URL + '/public/v2/users', {
      data: newUser,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiToken}` },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('number');
    createdUserId = body.id;
  });

  /**
   * Should fail to create a user when email is missing.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with missing email', async ({ request }) => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const userWithoutEmail = { ...newUser, email: undefined };
    const response = await request.post(BASE_URL + '/public/v2/users', {
      data: userWithoutEmail,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiToken}` },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Should fail to create a user with an invalid email format.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with invalid email', async ({ request }) => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const userWithInvalidEmail = { ...newUser, email: 'not-an-email' };
    const response = await request.post(BASE_URL + '/public/v2/users', {
      data: userWithInvalidEmail,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiToken}` },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Should fail to create a user when name is missing.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with missing name', async ({ request }) => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const userWithoutName = { ...newUser, name: undefined };
    const response = await request.post(BASE_URL + '/public/v2/users', {
      data: userWithoutName,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiToken}` },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Should fail to create a user with a duplicate email address.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with duplicate email', async ({ request }) => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const response1 = await request.post(BASE_URL + '/public/v2/users', {
      data: newUser,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiToken}` },
    });
    expect(response1.status()).toBe(201);
    const userWithDuplicateEmail = new CreateUserData(env as 'qa' | 'staging');
    userWithDuplicateEmail.email = newUser.email;
    const response2 = await request.post(BASE_URL + '/public/v2/users', {
      data: userWithDuplicateEmail,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiToken}` },
    });
    expect(response2.status()).toBe(422);
  });

  /**
   * Should fail to create a user with an invalid API token.
   * Expects HTTP 401 (Unauthorized) or HTTP 403 (Forbidden).
   */
  test('should fail to create a user with invalid token', async ({ request }) => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const response = await request.post(BASE_URL + '/public/v2/users', {
      data: newUser,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid_token_123' },
    });
    expect([401, 403]).toContain(response.status());
  });

  test.afterAll(async ({ request }) => {
    if (createdUserId) {
      const deleteResponse = await request.delete(BASE_URL + `/public/v2/users/${createdUserId}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiToken}` },
      });
      expect([200, 204, 404]).toContain(deleteResponse.status());
    }
  });
});
