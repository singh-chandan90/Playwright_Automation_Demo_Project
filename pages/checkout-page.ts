import { Page, Locator } from '@playwright/test';
import logger from '../utils/LoggerUtil';

export class CheckoutPage {
    private readonly page: Page;
    private readonly checkoutTitle: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly zipCodeInput: Locator;
    private readonly continueButton: Locator;
    private readonly finishButton: Locator;
    private readonly completeHeader: Locator;

    constructor(page: Page) {
        this.page = page;
        this.checkoutTitle = page.locator('.title');
        this.firstNameInput = page.locator('#first-name');
        this.lastNameInput = page.locator('#last-name');
        this.zipCodeInput = page.locator('#postal-code');
        this.continueButton = page.locator('#continue');
        this.finishButton = page.locator('#finish');
        this.completeHeader = page.locator('.complete-header');
    }

    async verifyPageLoaded(): Promise<void> {
        logger.debug('Verifying Checkout page loaded');
        try {
            await this.checkoutTitle.waitFor({ state: 'visible' });
        } catch (error) {
            logger.error('Error verifying Checkout page loaded: ' + error);
            throw error;
        }
    }

    async fillShippingInfo(firstName: string, lastName: string, zipCode: string): Promise<void> {
        logger.info(`Filling shipping info: ${firstName} ${lastName}, ${zipCode}`);
        try {
            await this.firstNameInput.fill(firstName);
            await this.lastNameInput.fill(lastName);
            await this.zipCodeInput.fill(zipCode);
            await this.continueButton.click();
        } catch (error) {
            logger.error(`Failed to fill shipping info: ${error}`);
            throw error;
        }
    }

    async completePurchase(): Promise<void> {
        logger.info('Completing purchase');
        try {
            await this.finishButton.click();
        } catch (error) {
            logger.error('Error completing purchase: ' + error);
            throw error;
        }
    }

    async verifyOrderComplete(): Promise<void> {
        logger.info('Verifying order completion');
        try {
            await this.completeHeader.waitFor({ state: 'visible' });
        } catch (error) {
            logger.error('Error verifying order completion: ' + error);
            throw error;
        }
    }
}