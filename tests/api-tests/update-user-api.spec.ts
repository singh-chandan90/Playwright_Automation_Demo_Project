import { test, expect, request, APIRequestContext } from "@playwright/test";
import { config } from "../../utils/config";
import { CreateUserData } from "../../testdata/api_test_data/create-user-data";
import { faker } from "@faker-js/faker";

const env = process.env.ENV || "qa";
const BASE_URL = config.apiBaseUrl;

test.describe("Update User API tests", () => {
  let apiContext: APIRequestContext;
  let createdUserId: number | undefined;

  // Use static update data for all environments, but randomize email and name
  const updateUserAllFields = {
    name: faker.person.fullName(),
    gender: "female",
    email: faker.internet.email({ provider: "example.com" }),
    status: "active",
  };
  const updateUserName = { name: faker.person.fullName() };
  const updateUserGender = { gender: "male" };
  const updateUserStatus = { status: "inactive" };

  // Always use a new random email for the email update test
  let updateUserEmail = {
    email: faker.internet.email({ provider: "example.com" }),
  };

  /**
   * Set up API request context before all tests.
   */
  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
  });

  test("should create a user with valid data", async () => {
    const newUser = new CreateUserData(env as "qa" | "staging");
    const response = await apiContext.post("/public/v2/users", {
      data: newUser,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiToken}`,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(typeof body.id).toBe("number");
    createdUserId = body.id;
  });

  test("should update a user with valid data", async () => {
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: updateUserAllFields,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(typeof body.id).toBe("number");
    // Validate response body (excluding id) matches request body
    const { id, ...responseUser } = body;
    expect(responseUser).toEqual(updateUserAllFields);
    expect(id).toBe(createdUserId);
  });

  test("should update only the user name", async () => {
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: updateUserName,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("name", updateUserName.name);
  });

  test("should update only the user gender", async () => {
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: updateUserGender,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("gender", updateUserGender.gender);
  });

  test("should update only the user email", async () => {
    updateUserEmail = {
      email: faker.internet.email({ provider: "example.com" }),
    };
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: updateUserEmail,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("email", updateUserEmail.email);
  });

  test("should update only the user status", async () => {
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: updateUserStatus,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status", updateUserStatus.status);
  });

  test("should fail to update user with invalid gender", async () => {
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: { gender: "other" },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(422);
  });

  test("should fail to update user with invalid status", async () => {
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: { status: "pending" },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(422);
  });

  test("should fail to update user with invalid auth token", async () => {
    const response = await apiContext.patch(
      `/public/v2/users/${createdUserId}`,
      {
        data: updateUserAllFields,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer invalid_token`,
        },
      }
    );
    expect(response.status()).toBe(401);
  });

  test("should fail to update user with invalid user ID", async () => {
    const invalidUserId = 999999999;
    const response = await apiContext.patch(
      `/public/v2/users/${invalidUserId}`,
      {
        data: updateUserAllFields,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );
    expect(response.status()).toBe(404);
  });

  test.afterAll(async () => {
    if (createdUserId) {
      const response = await apiContext.delete(
        `/public/v2/users/${createdUserId}`,
        {
          headers: { Authorization: `Bearer ${config.apiToken}` },
        }
      );
      expect(response.status()).toBe(204);
    }
  });
});
