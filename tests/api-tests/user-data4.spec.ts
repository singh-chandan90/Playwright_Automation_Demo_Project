import { test, expect, request, APIRequestContext } from "@playwright/test";
import { config } from "../../utils/config";
import path from "path";
import { getUserTestDataFromMySQL } from "../../utils/MySqlUtil";
import fs from "fs";

// Load query from environment-specific data file
const env = process.env.ENV || "qa";
const queryDataPath = path.resolve(
  __dirname,
  "../../testdata/api_test_data/user-query.json"
);
const allQueryData = JSON.parse(fs.readFileSync(queryDataPath, "utf-8"));
const newUserQuery = allQueryData[env].newUserQuery;
const updateUserQuery = allQueryData[env].updateUserQuery;

const BASE_URL = config.apiBaseUrl;

test.describe("Update User API tests (MySQL)", () => {
  let apiContext: APIRequestContext;
  let createdUserId: number | undefined;
  let newUser: Record<string, unknown>;
  let updateUser: Record<string, unknown>;

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
    // Fetch new user and update user using separate queries
    const [newUserResult] = await getUserTestDataFromMySQL(newUserQuery);
    const [updateUserResult] = await getUserTestDataFromMySQL(updateUserQuery);
    newUser = newUserResult;
    updateUser = updateUserResult;
  });

  test("should create a user with valid data", async () => {
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
    const response = await apiContext.put(`/public/v2/users/${createdUserId}`, {
      data: updateUser,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiToken}`,
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(typeof body.id).toBe("number");
    const { id, ...responseUser } = body;
    expect(responseUser).toEqual(updateUser);
    expect(id).toBe(createdUserId);
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
