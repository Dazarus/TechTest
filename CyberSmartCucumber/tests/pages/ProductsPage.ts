import { Page, Locator } from 'playwright';

/**
 * Page Object Model for the Products/Shopping page
 * Represents index.html with products, cart, and checkout functionality
 */
export class ProductsPage {
    readonly page: Page;

    // Navigation elements
    readonly navProducts: Locator;
    readonly navCheckout: Locator;

    // Filter and Sort controls
    readonly filterCategory: Locator;
    readonly sortPrice: Locator;

    // Product grid
    readonly productGrid: Locator;

    // Cart elements
    readonly cartEmpty: Locator;
    readonly cartTable: Locator;
    readonly cartBody: Locator;

    // Promo code elements
    readonly promoInput: Locator;
    readonly applyPromoButton: Locator;
    readonly clearPromoButton: Locator;
    readonly promoError: Locator;
    readonly promoApplied: Locator;

    // Cart totals
    readonly subtotal: Locator;
    readonly vat: Locator;
    readonly shipping: Locator;
    readonly grandTotal: Locator;

    // Checkout button
    readonly goToCheckoutButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Navigation
        this.navProducts = page.locator('[data-testid="nav-products"]');
        this.navCheckout = page.locator('[data-testid="nav-checkout"]');

        // Filters and sorting
        this.filterCategory = page.locator('[data-testid="filter-category"]');
        this.sortPrice = page.locator('[data-testid="sort-price"]');

        // Product grid
        this.productGrid = page.locator('#product-grid');

        // Cart
        this.cartEmpty = page.locator('[data-testid="cart-empty"]');
        this.cartTable = page.locator('#cart-table');
        this.cartBody = page.locator('#cart-body');

        // Promo code
        this.promoInput = page.locator('[data-testid="promo-input"]');
        this.applyPromoButton = page.locator('[data-testid="apply-promo"]');
        this.clearPromoButton = page.locator('[data-testid="clear-promo"]');
        this.promoError = page.locator('[data-testid="promo-error"]');
        this.promoApplied = page.locator('[data-testid="promo-applied"]');

        // Totals
        this.subtotal = page.locator('[data-testid="subtotal"]');
        this.vat = page.locator('[data-testid="vat"]');
        this.shipping = page.locator('[data-testid="shipping"]');
        this.grandTotal = page.locator('[data-testid="grand"]');

        // Checkout
        this.goToCheckoutButton = page.locator('[data-testid="go-checkout"]');
    }

    /**
     * Navigate to the products page
     * Note: In Electron apps, the page is already loaded by default
     * This method is here for consistency but may not be needed
     */
    async goto() {
        // For Electron apps, the page is already loaded
        // Just wait for it to be ready
        await this.page.waitForLoadState('domcontentloaded');

        // If you need to navigate, use the navigation click instead
        const url = this.page.url();
        if (!url.includes('index.html') && !url.includes('file://')) {
            // Click the products nav if not on products page
            await this.navProducts.click();
            await this.page.waitForLoadState('domcontentloaded');
        }
    }

    /**
     * Filter products by category
     * @param category - Category name to filter by
     */
    async filterByCategory(category: string) {
        await this.filterCategory.selectOption(category);
        // Wait for the grid to update
        await this.page.waitForTimeout(500);
    }

    /**
     * Sort products by price
     * @param order - 'lh' for Low to High, 'hl' for High to Low
     */
    async sortByPrice(order: 'lh' | 'hl') {
        await this.sortPrice.selectOption(order);
        await this.page.waitForTimeout(500);
    }

    /**
     * Get all products currently displayed in the grid
     */
    async getProducts() {
        return await this.productGrid.locator('.card').all();
    }

    /**
     * Get the count of products displayed
     */
    async getProductCount(): Promise<number> {
        return await this.productGrid.locator('.card').count();
    }

    /**
     * Add a product to cart by product name
     * @param productName - Name of the product to add
     */
    async addProductToCart(productName: string) {
        const product = this.page.locator('.card', { hasText: productName });
        const addButton = product.locator('button:has-text("Add to cart")');
        await addButton.click();
    }

    /**
     * Add a product to cart by index (0-based)
     * @param index - Index of the product in the grid
     */
    async addProductToCartByIndex(index: number) {
        const products = await this.getProducts();
        if (index >= products.length) {
            throw new Error(`Product index ${index} out of range. Only ${products.length} products available.`);
        }
        const addButton = products[index].locator('button');
        await addButton.click();
    }

    /**
     * Check if cart is empty
     */
    async isCartEmpty(): Promise<boolean> {
        return await this.cartEmpty.isVisible();
    }

    /**
     * Get cart items count from the cart table
     */
    async getCartItemsCount(): Promise<number> {
        const isTableVisible = await this.cartTable.isVisible();
        if (!isTableVisible) return 0;
        return await this.cartBody.locator('tr').count();
    }

    /**
     * Get cart item details by row index
     * @param index - Row index (0-based)
     */
    async getCartItem(index: number) {
        const row = this.cartBody.locator('tr').nth(index);
        return {
            name: await row.locator('td').nth(0).textContent(),
            price: await row.locator('td').nth(1).textContent(),
            quantity: await row.locator('td').nth(2).textContent(),
            total: await row.locator('td').nth(3).textContent()
        };
    }

    /**
     * Remove item from cart by row index
     * @param index - Row index (0-based)
     */
    async removeCartItem(index: number) {
        const row = this.cartBody.locator('tr').nth(index);
        const removeButton = row.locator('button');
        await removeButton.click();
    }

    /**
     * Apply a promo code
     * @param promoCode - The promo code to apply
     */
    async applyPromoCode(promoCode: string) {
        await this.promoInput.fill(promoCode);
        await this.applyPromoButton.click();
    }

    /**
     * Clear the applied promo code
     */
    async clearPromoCode() {
        await this.clearPromoButton.click();
    }

    /**
     * Check if promo code was applied successfully
     */
    async isPromoApplied(): Promise<boolean> {
        return await this.promoApplied.isVisible();
    }

    /**
     * Get promo error message
     */
    async getPromoErrorMessage(): Promise<string | null> {
        const isVisible = await this.promoError.isVisible();
        if (!isVisible) return null;
        return await this.promoError.textContent();
    }

    /**
     * Get promo applied message
     */
    async getPromoAppliedMessage(): Promise<string | null> {
        const isVisible = await this.promoApplied.isVisible();
        if (!isVisible) return null;
        return await this.promoApplied.textContent();
    }

    /**
     * Get subtotal amount
     */
    async getSubtotal(): Promise<string | null> {
        return await this.subtotal.textContent();
    }

    /**
     * Get VAT amount
     */
    async getVAT(): Promise<string | null> {
        return await this.vat.textContent();
    }

    /**
     * Get shipping cost
     */
    async getShipping(): Promise<string | null> {
        return await this.shipping.textContent();
    }

    /**
     * Get grand total amount
     */
    async getGrandTotal(): Promise<string | null> {
        return await this.grandTotal.textContent();
    }

    /**
     * Parse currency string to number
     * @param currencyString - String like "£10.00"
     */
    parseCurrency(currencyString: string | null): number {
        if (!currencyString) return 0;

        console.log('Parsing currency input:', JSON.stringify(currencyString));

        // Simple approach: remove everything except digits, dots, and minus signs
        const cleaned = currencyString.replace(/[^0-9.-]/g, '');
        console.log('Cleaned string:', cleaned);

        const parsed = parseFloat(cleaned);
        console.log('Parsed result:', parsed);

        return isNaN(parsed) ? 0 : parsed;
    }


    /**
     * Get all totals as numbers
     */
    async getTotalsAsNumbers() {
        const subtotalText = await this.getSubtotal();
        const vatText = await this.getVAT();
        const shippingText = await this.getShipping();
        const grandTotalText = await this.getGrandTotal();

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
     * Verify VAT calculation (should be 20% of subtotal)
     */
    async verifyVATCalculation(): Promise<boolean> {
        const totals = await this.getTotalsAsNumbers();
        const expectedVAT = totals.subtotal * 0.20;
        // Allow for small floating point differences
        return Math.abs(totals.vat - expectedVAT) < 0.01;
    }

    /**
     * Verify free shipping is applied (when subtotal >= £50)
     */
    async verifyFreeShipping(): Promise<boolean> {
        const totals = await this.getTotalsAsNumbers();
        if (totals.subtotal >= 50) {
            return totals.shipping === 0;
        }
        return true; // Shipping cost is expected when < £50
    }

    /**
     * Navigate to checkout page
     */
    async goToCheckout() {
        await this.goToCheckoutButton.click();
        await this.page.waitForLoadState('domcontentloaded');
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
     * Wait for products to load
     */
    async waitForProductsToLoad() {
        await this.productGrid.waitFor({ state: 'visible' });
        // Wait for at least one product to appear
        //await this.page.waitForSelector('.product-grid', { timeout: 15000 });
    }

    /**
     * Get all available categories from the filter dropdown
     */
    async getAvailableCategories(): Promise<string[]> {
        const options = await this.filterCategory.locator('option').all();
        const categories: string[] = [];
        for (const option of options) {
            const text = await option.textContent();
            if (text) categories.push(text.trim());
        }
        return categories;
    }

    /**
     * Take a screenshot of the page
     * @param filename - Name for the screenshot file
     */
    async takeScreenshot(filename: string) {
        await this.page.screenshot({
            path: `screenshots/${filename}`,
            fullPage: true
        });
    }
}

export default ProductsPage;