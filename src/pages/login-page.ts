import { Page, Locator } from '@playwright/test';
import logger from '../utils/LoggerUtil';

export class LoginPage {
    private readonly page: Page;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('#user-name');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('#login-button');
    }

    async navigate(url: string): Promise<void> {
        logger.info(`Navigating to URL: ${url}`);
        try {
            await this.page.goto(url);
        } catch (error) {
            logger.error(`Error navigating to URL ${url}: ${error}`);
            throw error;
        }
    }

    async login(username: string, password: string): Promise<void> {
        logger.info(`Attempting login for user: ${username}`);
        try {
            await this.usernameInput.fill(username);
            await this.passwordInput.fill(password);
            await this.loginButton.click();
            logger.info('Login button clicked');
        } catch (error) {
            logger.error(`Login failed for user ${username}: ${error}`);
            throw error;
        }
    }
}