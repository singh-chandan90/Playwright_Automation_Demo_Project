import { Page, Locator } from '@playwright/test';
import logger from '../utils/LoggerUtil';

export class CartPage {
    private readonly page: Page;
    private readonly cartTitle: Locator;
    private readonly checkoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartTitle = page.locator('.title');
        this.checkoutButton = page.locator('#checkout');
        logger.debug('CartPage initialized');
    }

    async verifyPageLoaded(): Promise<void> {
        logger.debug('Verifying Cart page loaded');
        try {
            await this.cartTitle.waitFor({ state: 'visible' });
        } catch (error) {
            logger.error('Error verifying Cart page loaded: ' + error);
            throw error;
        }
    }

    async verifyProductInCart(productName: string): Promise<void> {
        logger.info(`Verifying product in cart: ${productName}`);
        try {
            const cartItem = this.page.locator(`.cart_item:has-text("${productName}")`);
            await cartItem.waitFor({ state: 'visible' });
        } catch (error) {
            logger.error(`Error verifying product in cart: ${productName} - ${error}`);
            throw error;
        }
    }

    async proceedToCheckout(): Promise<void> {
        logger.info('Proceeding to checkout');
        try {
            await this.checkoutButton.click();
        } catch (error) {
            logger.error('Error proceeding to checkout: ' + error);
            throw error;
        }
    }
}