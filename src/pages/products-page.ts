import { Page, Locator } from '@playwright/test';
import logger from '../utils/LoggerUtil';

export class ProductsPage {
    private readonly page: Page;
    private readonly productTitle: Locator;
    private readonly cartIcon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.productTitle = page.locator('.title');
        this.cartIcon = page.locator('.shopping_cart_link');
    }

    async verifyPageLoaded(): Promise<void> {
        logger.debug('Verifying Products page loaded');
        try {
            await this.productTitle.waitFor({ state: 'visible' });
        } catch (error) {
            logger.error('Error verifying Products page loaded: ' + error);
            throw error;
        }
    }

    async addProductToCart(productName: string): Promise<void> {
        logger.info(`Adding product to cart: ${productName}`);
        try {
            const addToCartButton = this.page.locator(
                `div.inventory_item:has-text("${productName}") >> button:text-is("Add to cart")`
            );
            await addToCartButton.click();
            logger.info(`Product added to cart: ${productName}`);
        } catch (error) {
            logger.error(`Failed to add product to cart: ${productName} - ${error}`);
            throw error;
        }
    }

    async goToCart(): Promise<void> {
        logger.info('Navigating to cart');
        try {
            await this.cartIcon.click();
        } catch (error) {
            logger.error('Error navigating to cart: ' + error);
            throw error;
        }
    }
}