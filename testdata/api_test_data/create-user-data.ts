/**
 * Class for generating random user data for API tests.
 *
 * Each instantiation creates a new user object with random name and email fields,
 * based on the specified environment ('qa' or 'staging').
 *
 * Usage:
 *   const user = new CreateUserData('qa');
 *   // user.name, user.email, etc. will be randomized for each instance
 */
export class CreateUserData {
  /** The user's name (randomized per instance) */
  public name: string;
  /** The user's gender */
  public gender: string;
  /** The user's email (randomized per instance) */
  public email: string;
  /** The user's status */
  public status: string;

  /**
   * Create a new user data object with random values for the given environment.
   * @param env - The environment to use ('qa' or 'staging'). Defaults to 'qa'.
   */
  constructor(env: 'qa' | 'staging' = 'qa') {
    const randomFirstName = 'User' + Math.floor(Math.random() * 10000);
    const randomEmail = `user${Math.floor(Math.random() * 10000)}@example.com`;
    const data = {
      qa: {
        name: randomFirstName,
        gender: 'male',
        email: randomEmail,
        status: 'active'
      },
      staging: {
        name: randomFirstName,
        gender: 'male',
        email: randomEmail,
        status: 'active'
      }
    };
    this.name = data[env].name;
    this.gender = data[env].gender;
    this.email = data[env].email;
    this.status = data[env].status;
  }
}
