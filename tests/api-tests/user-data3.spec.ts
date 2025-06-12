import { test, expect, request, APIRequestContext } from "@playwright/test";
import { config } from "../../utils/config";
import path from "path";
// Update the import path or filename as needed if the file exists with a different name or extension
import { excelToJson } from "../../utils/ExcelToJsonUtil";
// If the file is actually named 'excelToJsonUtil.ts' (case-sensitive), use the above import.
// Otherwise, correct the path and filename to match your project structure.

// Load user test data from Excel file
const userDataPath = path.resolve(
  __dirname,
  "../../testdata/api_test_data/user-data.xlsx"
);
const [userTestData] = excelToJson(userDataPath); // Only one row expected

const BASE_URL = config.apiBaseUrl;

test.describe("Update User API tests (Excel)", () => {
  let apiContext: APIRequestContext;
  let createdUserId: number | undefined;

  // Use data from Excel
  const newUser = {
    name: userTestData.name,
    gender: userTestData.gender,
    email: userTestData.email,
    status: userTestData.status,
  };
  const updateUser = {
    name: userTestData.update_name,
    gender: userTestData.update_gender,
    email: userTestData.update_email,
    status: userTestData.update_status,
  };

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: BASE_URL });
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
