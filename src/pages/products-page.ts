import { Page, Locator } from '@playwright/test';

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
        await this.productTitle.waitFor({ state: 'visible' });
    }

    async addProductToCart(productName: string): Promise<void> {
        const addToCartButton = this.page.locator(
            `div.inventory_item:has-text("${productName}") >> button:text-is("Add to cart")`
        );
        await addToCartButton.click();
    }

    async goToCart(): Promise<void> {
        await this.cartIcon.click();
    }
}