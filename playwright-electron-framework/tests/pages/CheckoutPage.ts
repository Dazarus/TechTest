import { Page, Locator } from 'playwright';

export class CheckoutPage {
    readonly page: Page;

    // Navigation elements
    readonly navProducts: Locator;
    readonly navCheckout: Locator;

    // Order summary elements
    readonly summaryItems: Locator;
    readonly orderSummarySection: Locator;
    readonly orderItems: Locator;
    readonly orderSubtotal: Locator;
    readonly orderVAT: Locator;
    readonly orderShipping: Locator;
    readonly orderGrandTotal: Locator;

    // Payment form elements
    readonly paymentForm: Locator;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly addressInput: Locator;
    readonly cityInput: Locator;
    readonly postcodeInput: Locator;
    readonly placeOrderButton: Locator;

    // Success/Error messages
    readonly successMessage: Locator;
    readonly errorMessage: Locator;

    // Form validation errors
    readonly formError: Locator;

    constructor(page: Page) {
        this.page = page;

        // Navigation
        this.navProducts = page.locator('[data-testid="nav-products"]');
        this.navCheckout = page.locator('[data-testid="nav-checkout"]');

        // Order summary
        this.summaryItems = page.locator('#summary-items');
        this.orderSummarySection = page.locator('body > div > div.checkout-wrap > aside > h3');
        this.orderItems = page.locator('.order-items, [data-testid="order-items"]');
        this.orderSubtotal = page.locator('[data-testid="sum-subtotal"], #sum-subtotal');
        this.orderVAT = page.locator('[data-testid="sum-vat"], #sum-vat');
        this.orderShipping = page.locator('[data-testid="sum-shipping"], #sum-shipping');
        this.orderGrandTotal = page.locator('[data-testid="sum-grand"], #sum-grand');

        // Payment form
        this.paymentForm = page.locator('form, [data-testid="payment-form"]');
        this.nameInput = page.locator('input[name="name"], [data-testid="name-input"], #name');
        this.emailInput = page.locator('input[name="email"], [data-testid="email-input"], #email');
        this.addressInput = page.locator('input[name="address"], [data-testid="address-input"], #address');
        this.cityInput = page.locator('input[name="city"], [data-testid="city-input"], #city');
        this.postcodeInput = page.locator('input[name="postcode"], [data-testid="postcode-input"], #postcode');
        this.placeOrderButton = page.locator('button[type="submit"], button:has-text("Place order"), [data-testid="place-order"]');

        // Messages
        this.successMessage = page.locator('.order-success, [data-testid="order-success"]');
        this.errorMessage = page.locator('.error-message, [data-testid="error-message"]');

        // Field validation errors
        this.formError = page.locator('[data-testid="form-error"], .form-error');
    }

    /**
     * Navigate to the checkout page
     */
    async goto() {
        // For Electron apps, the page is already loaded
        // Just wait for it to be ready
        await this.page.waitForLoadState('domcontentloaded');
        await this.navCheckout.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
    /**
     * Fill customer information section
     */
    async fillCustomerInfo(data: {
        name: string;
        email: string;
        address: string;
        city: string;
        postcode: string;
    }) {
        await this.nameInput.fill(data.name);
        await this.emailInput.fill(data.email);
        await this.addressInput.fill(data.address);
        await this.cityInput.fill(data.city);
        await this.postcodeInput.fill(data.postcode);
    }

    /**
     * Fill complete checkout form
     */
    async fillCheckoutForm(customerData: {
        name: string;
        email: string;
        address: string;
        city: string;
        postcode: string;
    }) {
        await this.fillCustomerInfo(customerData);
    }

    /**
     * Submit the order
     */
    async placeOrder() {
        await this.placeOrderButton.click();
    }

    /**
     * Complete checkout with all information
     */
    async completeCheckout(customerData: {
        name: string;
        email: string;
        address: string;
        city: string;
        postcode: string;
    }) {
        await this.fillCheckoutForm(customerData);
        await this.placeOrder();
    }

    /**
     * Get order summary subtotal
     */
    async getOrderSubtotal(): Promise<string | null> {
        return await this.orderSubtotal.textContent();
    }

    /**
     * Get order summary VAT
     */
    async getOrderVAT(): Promise<string | null> {
        return await this.orderVAT.textContent();
    }

    /**
     * Get order summary shipping
     */
    async getOrderShipping(): Promise<string | null> {
        return await this.orderShipping.textContent();
    }

    /**
     * Get order summary grand total
     */
    async getOrderGrandTotal(): Promise<string | null> {
        return await this.orderGrandTotal.textContent();
    }

    /**
     * Parse currency string to number
     */
    parseCurrency(currencyString: string | null): number {
        if (!currencyString) return 0;

        console.log('Parsing currency input:', JSON.stringify(currencyString));
        
        const cleaned = currencyString.replace(/[^0-9.-]/g, '');
        console.log('Cleaned string:', cleaned);

        const parsed = parseFloat(cleaned);
        console.log('Parsed result:', parsed);

        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Get all order totals as numbers
     */
    async getOrderTotalsAsNumbers() {
        const subtotalText = await this.getOrderSubtotal();
        const vatText = await this.getOrderVAT();
        const shippingText = await this.getOrderShipping();
        const grandTotalText = await this.getOrderGrandTotal();

        console.log('Product total Raw values:', {
            subtotal: subtotalText,
            vat: vatText,
            shipping: shippingText,
            grandTotal: grandTotalText
        });

        const result = {
            subtotal: this.parseCurrency(subtotalText),
            vat: this.parseCurrency(vatText),
            shipping: this.parseCurrency(shippingText),
            grandTotal: this.parseCurrency(grandTotalText)
        };

        console.log('product parsed values:', result);

        return result;
    }
    

    /**
     * Get order items count
     */
    async getOrderItemsCount(): Promise<number> {
        // Counts child elements in #summary-items
        const items = await this.summaryItems.locator('> *').count();
        return items;
    }

    /**
     * Get order item details by row index
     * @param index - Row index (0-based)
     */
    async getOrderItem(index: number) {
        const row = this.page.locator('#cart-table tbody tr').nth(index);
        return {
            name: await row.locator('td').nth(0).textContent(),
            price: await row.locator('td').nth(1).textContent(),
            quantity: await row.locator('td').nth(2).textContent(),
            total: await row.locator('td').nth(3).textContent()
        };
    }


    /**
     * Check if success message is displayed
     */
    async isSuccessMessageVisible(): Promise<boolean> {
        return await this.successMessage.isVisible();
    }

    /**
     * Get success message text
     */
    async getSuccessMessage(): Promise<string | null> {
        const isVisible = await this.isSuccessMessageVisible();
        if (!isVisible) return null;
        return await this.successMessage.textContent();
    }

    /**
     * Check if error message is displayed
     */
    async isErrorMessageVisible(): Promise<boolean> {
        return await this.errorMessage.isVisible();
    }

    /**
     * Get error message text
     */
    async getErrorMessage(): Promise<string | null> {
        const isVisible = await this.isErrorMessageVisible();
        if (!isVisible) return null;
        return await this.errorMessage.textContent();
    }

    /**
     * Get validation error for a specific field
     */
    async getFieldError(field: 'name' | 'email' | 'address' | 'city' | 'postcode'): Promise<string | null> {
        const errorLocators = {
            name: this.formError,
            email: this.formError,
            address: this.formError,
            city: this.formError,
            postcode: this.formError
        };

        const errorLocator = errorLocators[field];
        const isVisible = await errorLocator.isVisible().catch(() => false);
        if (!isVisible) return null;
        return await errorLocator.textContent();
    }

    /**
     * Check if form has any validation errors
     */
    async hasValidationErrors(): Promise<boolean> {
        const fields = ['name', 'email', 'address', 'city', 'postcode'] as const;
        for (const field of fields) {
            const error = await this.getFieldError(field);
            if (error) return true;
        }
        return false;
    }

    /**
     * Navigate to products page via nav
     */
    async clickProductsNav() {
        await this.navProducts.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Navigate to checkout page via nav
     */
    async clickCheckoutNav() {
        await this.navCheckout.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Verify all required fields are present
     */
    async verifyFormFieldsPresent(): Promise<boolean> {
        const fields = [
            this.nameInput,
            this.emailInput,
            this.addressInput,
            this.cityInput,
            this.postcodeInput,
            this.placeOrderButton
        ];

        for (const field of fields) {
            const isVisible = await field.isVisible();
            if (!isVisible) return false;
        }
        return true;
    }

    /**
     * Clear all form fields
     */
    async clearForm() {
        await this.nameInput.clear();
        await this.emailInput.clear();
        await this.addressInput.clear();
        await this.cityInput.clear();
        await this.postcodeInput.clear();
    }

    /**
     * Get form data currently entered
     */
    async getFormData() {
        return {
            name: await this.nameInput.inputValue(),
            email: await this.emailInput.inputValue(),
            address: await this.addressInput.inputValue(),
            city: await this.cityInput.inputValue(),
            postcode: await this.postcodeInput.inputValue()
        };
    }

    /**
     * Take a screenshot of the checkout page
     */
    async takeScreenshot(filename: string) {
        await this.page.screenshot({
            path: `screenshots/${filename}`,
            fullPage: true
        });
    }

    /**
     * Wait for order summary to load
     */
    async waitForOrderSummary() {
        await this.orderSummarySection.waitFor({ state: 'visible', timeout: 5000 });
    }

    /**
     * Check if page indicates empty cart
     */
    async isCartEmpty(): Promise<boolean> {
        // Look for text indicating empty cart
        const emptyText = await this.page.locator('text=/cart is empty|no items/i').isVisible().catch(() => false);
        return emptyText;
    }
}
export default CheckoutPage;