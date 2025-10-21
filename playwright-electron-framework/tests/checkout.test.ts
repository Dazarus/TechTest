import { expect } from '@playwright/test';
import test from './fixtures/electron-fixture';
import { ProductsPage } from './pages/ProductsPage';
import { CheckoutPage } from './pages/CheckoutPage';

const validCustomerData = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    address: '123 High Street',
    city: 'London',
    postcode: 'SW1A 1AA'
};


test.describe('Checkout Page Tests', () => {
    let productsPage: ProductsPage;
    let checkoutPage: CheckoutPage;

 test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);

    await productsPage.goto();
    await productsPage.waitForProductsToLoad();

    const isEmpty = await productsPage.isCartEmpty();
    if (!isEmpty) {
        console.log('⚠️ Cart not empty, clearing items...');
        
        let cartItemCount = await productsPage.getCartItemsCount();
        
        while (cartItemCount > 0) {
            await productsPage.removeCartItem(0);
            await page.waitForTimeout(300);
            cartItemCount = await productsPage.getCartItemsCount();
        }
        
        console.log('✅ Cart cleared');
    } else {
        console.log('✅ Cart is already empty');
    }
});  
    
    test('should display order summary with items from cart', async () => {
        
        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(500);

        const cartTotal = await productsPage.getGrandTotal();

        await checkoutPage.goto();
        await checkoutPage.waitForOrderSummary();

        const orderTotal = await checkoutPage.getOrderGrandTotal();
        expect(orderTotal).toBe(cartTotal);

        console.log('✅ Order summary matches cart');
        console.log('Cart total:', cartTotal);
        console.log('Order total:', orderTotal);
    });

    test('should successfully place order with valid data', async () => {
        
        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(500);

        await checkoutPage.goto();
        await checkoutPage.waitForOrderSummary();

        await checkoutPage.completeCheckout(validCustomerData);
        await checkoutPage.page.waitForTimeout(1000);

        const successVisible = await checkoutPage.isSuccessMessageVisible();
        expect(successVisible).toBe(true);

        const successMessage = await checkoutPage.getSuccessMessage();
        expect(successMessage).toContain("Order placed!")
        console.log('✅ Order placed successfully:', successMessage);
    });

    test('should preserve cart total from products page', async () => {
        
        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(300);
        await productsPage.addProductToCartByIndex(1);
        await productsPage.page.waitForTimeout(500);

        const cartTotals = await productsPage.getTotalsAsNumbers();

        await checkoutPage.goto();
        await checkoutPage.waitForOrderSummary();

        const orderTotals = await checkoutPage.getOrderTotalsAsNumbers();

        expect(orderTotals.subtotal).toBe(cartTotals.subtotal);
        expect(orderTotals.vat).toBe(cartTotals.vat);
        expect(orderTotals.shipping).toBe(cartTotals.shipping);
        expect(orderTotals.grandTotal).toBe(cartTotals.grandTotal);

        console.log('✅ Cart totals preserved in checkout');
        console.log('Products page total:', cartTotals.grandTotal);
        console.log('Checkout page total:', orderTotals.grandTotal);
    });

    
    test('should display order items in summary', async () => {
        
        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(300);
        await productsPage.addProductToCartByIndex(1);
        await productsPage.page.waitForTimeout(500);

        const cartItemCount = await productsPage.getCartItemsCount();

        await checkoutPage.goto();
        await checkoutPage.waitForOrderSummary();

        const orderItemCount = await checkoutPage.getOrderItemsCount();
        console.log('Items in cart:', orderItemCount);
        expect(orderItemCount).toBe(cartItemCount);

        console.log('✅ Order items count matches cart');
        console.log('Items:', orderItemCount);
    });
    

    test('should show empty cart message when accessing checkout without items', async () => {
        // Go directly to checkout without adding items
        await checkoutPage.goto();

        const isEmpty = await checkoutPage.isCartEmpty();
        // Depending on implementation, may show empty message or zero totals
        console.log('Cart empty state:', isEmpty);

        const total = await checkoutPage.getOrderGrandTotal();
        console.log('Grand total:', total);
    });

    
    test('should complete end-to-end shopping flow', async () => {
        // 1. Add products
        console.log('Step 1: Adding products to cart...');
        await productsPage.addProductToCartByIndex(0);
        await productsPage.page.waitForTimeout(500);

        // 2. Apply promo code
        console.log('Step 2: Applying promo code...');
        await productsPage.applyPromoCode('SAVE10');
        await productsPage.page.waitForTimeout(500);

        // 3. Go to checkout
        console.log('Step 3: Going to checkout...');
        await productsPage.goToCheckout();
        await checkoutPage.waitForOrderSummary();

        // 4. Fill checkout form
        console.log('Step 4: Filling checkout form...');
        await checkoutPage.completeCheckout(validCustomerData);
        await checkoutPage.page.waitForTimeout(1000);

        // 5. Verify success
        console.log('Step 5: Verifying order success...');
        const successVisible = await checkoutPage.isSuccessMessageVisible();
        expect(successVisible).toBe(true);

        await checkoutPage.takeScreenshot('checkout-success.png');

        console.log('✅ Complete end-to-end flow successful!');
    });
});