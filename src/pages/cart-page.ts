import { Page, Locator } from '@playwright/test';

export class CartPage {
    private readonly page: Page;
    private readonly cartTitle: Locator;
    private readonly checkoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
       // this.cartTitle = page.locator('.title');
        this.cartTitle = page.getByTitle('.title');
        this.checkoutButton = page.locator('#checkout');
    }

    async verifyPageLoaded(): Promise<void> {
        await this.cartTitle.waitFor({ state: 'visible' });
    }

    async verifyProductInCart(productName: string): Promise<void> {
        const cartItem = this.page.locator(`.cart_item:has-text("${productName}")`);
        await cartItem.waitFor({ state: 'visible' });
    }

    async proceedToCheckout(): Promise<void> {
        await this.checkoutButton.click();
    }
}