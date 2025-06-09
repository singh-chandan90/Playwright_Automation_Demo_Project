import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { ProductsPage } from '../pages/products-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';


test.describe.serial('End-to-End Workflow', () => {
    let page: Page; // Single page instance for all tests
    let loginPage: LoginPage;
    let productsPage: ProductsPage;
    let cartPage: CartPage;
    let checkoutPage: CheckoutPage;
    const productName = 'Sauce Labs Backpack';

    test.beforeAll(async ({ browser }) => {
        // Initialize a single page instance for all tests
        page = await browser.newPage();
        
        // Initialize all page objects once
        loginPage = new LoginPage(page);
        productsPage = new ProductsPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);
        
        // Perform initial setup
        await loginPage.navigate("https://www.saucedemo.com/");
        await loginPage.login('standard_user', 'secret_sauce');
    });

    test('Add product to cart', async () => {
        await productsPage.addProductToCart(productName);
        await productsPage.goToCart();
        await cartPage.verifyProductInCart(productName);
    });

    test('Complete checkout process', async () => {
        await cartPage.proceedToCheckout();
        await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
        await checkoutPage.completePurchase();
        await checkoutPage.verifyOrderComplete();
    });

    test.afterAll(async () => {
        // Clean up
        await page.close();
    });
});