import { test,expect,request,APIRequestContext } from "@playwright/test";
import { config } from '../../utils/config';
import fs from 'fs';
import path from 'path';

// Determine environment (default to 'qa' if not set)
const env = process.env.ENV || 'qa';
// Load user test data from JSON file
const userDataPath = path.resolve(__dirname, '../../testdata/api_test_data/user-data.json');
const allUserTestData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
const userTestData = allUserTestData[env];

const BASE_URL = config.apiBaseUrl;


test.describe('Update User API tests', () => {  
  let apiContext: APIRequestContext;
  let createdUserId: number | undefined;

  // Use environment-specific update data
  const updateUser = { ...userTestData.updateUser };
  const newUser = { ...userTestData.newUser };
  


  /**
   * Set up API request context before all tests.
   */
  test.beforeAll(async () => {
    apiContext = await request.newContext({baseURL: BASE_URL }); 
  });

   test('should create a user with valid data', async () => {
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
     createdUserId = body.id;
   });



   test('should update a user with valid data', async () => {
     const response = await apiContext.put(`/public/v2/users/${createdUserId}`, {
       data: updateUser,
       headers: { 'Content-Type': 'application/json',
         Authorization: `Bearer ${config.apiToken}`  
        },
     });
     expect(response.status()).toBe(200);
     const body = await response.json();
     expect(body).toHaveProperty('id');
     expect(typeof body.id).toBe('number');
     const { id, ...responseUser } = body;
     expect(responseUser).toEqual(updateUser);
     expect(id).toBe(createdUserId);
   });

   

  

  

  

   
   

   test.afterAll(async () => {
     if (createdUserId) {
       const response = await apiContext.delete(`/public/v2/users/${createdUserId}`, {
         headers: { Authorization: `Bearer ${config.apiToken}` },
       });
        expect(response.status()).toBe(204);
     }
   });

 

  



    })