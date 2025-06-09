import { Page, Locator } from '@playwright/test';

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
        await this.checkoutTitle.waitFor({ state: 'visible' });
    }

    async fillShippingInfo(firstName: string, lastName: string, zipCode: string): Promise<void> {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.zipCodeInput.fill(zipCode);
        await this.continueButton.click();
    }

    async completePurchase(): Promise<void> {
        await this.finishButton.click();
    }

    async verifyOrderComplete(): Promise<void> {
        await this.completeHeader.waitFor({ state: 'visible' });
    }
}