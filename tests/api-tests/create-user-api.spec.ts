import { test, expect, request, APIRequestContext } from '@playwright/test';
import { config } from '../../utils/config';
import { CreateUserData } from '../../testdata/api_test_data/create-user-data';

const env = process.env.ENV || 'qa';
const BASE_URL = config.apiBaseUrl;

/**
 * API Tests for User Creation endpoint (/public/v2/users)
 *
 * This suite covers:
 * - Successful user creation with valid data
 * - Failure scenarios: missing/invalid email, missing name, duplicate email
 *
 * Uses the CreateUserData class to generate random user data for each test run.
 */
test.describe('Create User API test', () => {    
  let apiContext: APIRequestContext;
  let createdUserId: number | undefined;

  /**
   * Set up API request context before all tests.
   */
  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  /**
   * Should create a user with valid random data.
   * Expects HTTP 201 and a numeric user id in the response.
   */
  test('should create a user with valid data', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const response = await apiContext.post('/public/v2/users', {
      data: newUser,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`  
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('number');
    //createdUserId = body.id;

    // Validate request body equals response body (excluding id)
    const { id, ...responseUser } = body;
    createdUserId = id; // Store created user ID for cleanup
    // Some APIs wrap the user object, adjust if needed
    // If response is { id, ...fields }, this works
    // If response is { id, user: {...fields} }, use: const { id, ...responseUser } = body.user;
    expect(responseUser).toEqual(newUser);
  });

  /**
   * Should fail to create a user when email is missing.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with missing email', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    // Remove email
    const userWithoutEmail = { ...newUser, email: undefined };
    const response = await apiContext.post('/public/v2/users', {
      data: userWithoutEmail,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`  // Assuming an API token is required
       },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Should fail to create a user with an invalid email format.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with invalid email', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const userWithInvalidEmail = { ...newUser, email: 'not-an-email' };
    const response = await apiContext.post('/public/v2/users', {
      data: userWithInvalidEmail,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`
      },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Should fail to create a user when name is missing.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with missing name', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const userWithoutName = { ...newUser, name: undefined };
    const response = await apiContext.post('/public/v2/users', {
      data: userWithoutName,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`
      },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Should fail to create a user with a duplicate email address.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with duplicate email', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    // First, create a user
    const response1 = await apiContext.post('/public/v2/users', {
      data: newUser,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`
      },
    });
    expect(response1.status()).toBe(201);
    // Try to create another user with the same email
    const userWithDuplicateEmail = new CreateUserData(env as 'qa' | 'staging');
    userWithDuplicateEmail.email = newUser.email;
    const response2 = await apiContext.post('/public/v2/users', {
      data: userWithDuplicateEmail,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`
      },
    });
    expect(response2.status()).toBe(422);
  });

  /**
   * Should fail to create a user with an invalid token.
   * Expects HTTP 401 (Unauthorized) or 403 (Forbidden).
   */
  test('should fail to create a user with invalid token', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const response = await apiContext.post('/public/v2/users', {
      data: newUser,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid_token_123',
      },
    });
    expect(response.status()).toBe(401);
  });

  /**
   * Should fail to create a user with an invalid gender.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with invalid gender', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const userWithInvalidGender = { ...newUser, gender: 'other' };
    const response = await apiContext.post('/public/v2/users', {
      data: userWithInvalidGender,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`
      },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Should fail to create a user with an invalid status.
   * Expects HTTP 422 (Unprocessable Entity).
   */
  test('should fail to create a user with invalid status', async () => {
    const newUser = new CreateUserData(env as 'qa' | 'staging');
    const userWithInvalidStatus = { ...newUser, status: 'pending' };
    const response = await apiContext.post('/public/v2/users', {
      data: userWithInvalidStatus,
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`
      },
    });
    expect(response.status()).toBe(422);
  });

  /**
   * Dispose API request context after all tests.
   */
  test.afterAll(async () => {
    // Cleanup: delete the created user if it exists
    if (createdUserId) {
      const deleteResponse = await apiContext.delete(`/public/v2/users/${createdUserId}`, {
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiToken}`
        },
      });
      // Optionally, check for successful deletion (204 or 200)
      expect(deleteResponse.status()).toBe(204);
    }
    await apiContext.dispose();
  });
});