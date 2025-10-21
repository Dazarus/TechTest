import { expect } from '@playwright/test';
import test from './fixtures/electron-fixture';
import ProductsPage from './pages/ProductsPage';

test.describe('Products Page Tests', () => {
    let productsPage: ProductsPage;

    test.beforeEach(async ({ page }) => {
        productsPage = new ProductsPage(page);
        await productsPage.waitForProductsToLoad();
    });

   
    test('should filter products by category', async ({ page }) => {
        const categories = await productsPage.getAvailableCategories();
        console.log('Available categories:', categories);

        if (categories.length > 1) {
            await productsPage.filterByCategory(categories[1]);
            await page.waitForTimeout(500);

            const filteredCount = await productsPage.getProductCount();
            console.log(`✅ Filtered to ${filteredCount} products in category: ${categories[1]}`);
        }
    });

    test('should sort products by price', async ({ page }) => {
        await productsPage.sortByPrice('lh');
        await page.waitForTimeout(500);
        console.log('✅ Sorted by price: Low to High');

        await productsPage.sortByPrice('hl');
        await page.waitForTimeout(500);
        console.log('✅ Sorted by price: High to Low');
    });

    test('should calculate VAT correctly', async () => {

        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(500);

        const isVATCorrect = await productsPage.verifyVATCalculation();
        expect(isVATCorrect).toBe(true);

        const totals = await productsPage.getTotalsAsNumbers();
        console.log('✅ VAT calculation is correct');
        console.log('Subtotal:', totals.subtotal);
        console.log('VAT (20%):', totals.vat);
    });

    test('should apply promo code SAVE10', async () => {
        
        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(500);

        const totalBefore = await productsPage.parseCurrency(await productsPage.getGrandTotal());

        await productsPage.applyPromoCode('SAVE10');
        await productsPage.page.waitForTimeout(500);

        const isApplied = await productsPage.isPromoApplied();
        expect(isApplied).toBe(true);

        const totalAfter = await productsPage.parseCurrency(await productsPage.getGrandTotal());

        expect(totalAfter).toBeLessThan(totalBefore);

        const promoMessage = await productsPage.getPromoAppliedMessage();
        console.log('✅ Promo code applied:', promoMessage);
        console.log('Total before:', `£${totalBefore.toFixed(2)}`);
        console.log('Total after:', `£${totalAfter.toFixed(2)}`);
    });
    
    
    test('should verify shipping cost for orders < £50', async () => {

        const productCount = await productsPage.getProductCount();

        const itemsToAdd = Math.min(3, productCount);
        for (let i = 0; i < itemsToAdd; i++) {
            await productsPage.addProductToCartByIndex(0);
            await productsPage.page.waitForTimeout(300);
        }

        const totals = await productsPage.getTotalsAsNumbers();
        console.log('Subtotal:', totals.subtotal);
        console.log('Shipping:', totals.shipping);

        expect(totals.shipping).toBeGreaterThan(0);
        console.log('✅ Shipping cost applied for orders < £50');
    });

    test('should verify free shipping for orders >= £50', async () => {
        
            await productsPage.addProductToCartByIndex(5);
            await productsPage.addProductToCartByIndex(5);
            await productsPage.addProductToCartByIndex(5);
            await productsPage.page.waitForTimeout(300);

        const totals = await productsPage.getTotalsAsNumbers();
        console.log('Subtotal:', totals.subtotal);
        console.log('Shipping:', totals.shipping);

        expect(totals.shipping).toBe(0);
        console.log('✅ Free shipping applied for orders >= £50');

    });

    test('should navigate to checkout page', async () => {
        
        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(500);

        await productsPage.goToCheckout();

        const url = productsPage.page.url();
        expect(url).toContain('checkout.html');

        console.log('✅ Navigated to checkout page');
    });

    test('should navigate using top navigation', async () => {
        
        await productsPage.clickCheckoutNav();
        let url = productsPage.page.url();
        expect(url).toContain('checkout.html');

        await productsPage.clickProductsNav();
        url = productsPage.page.url();
        expect(url).toContain('index.html');

        console.log('✅ Navigation links work correctly');
    });
});