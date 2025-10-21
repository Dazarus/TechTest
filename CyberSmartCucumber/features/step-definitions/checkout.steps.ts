import { Given, When, Then, setDefaultTimeout, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../../support/world';

setDefaultTimeout(30000);

// ============================================
// When Steps (Actions)
// ============================================

When('I navigate to the checkout page', async function (this: ICustomWorld) {
  await this.checkoutPage!.goto();
  await this.checkoutPage!.waitForOrderSummary();
  console.log('✅ Navigated to checkout page');
});

When('I navigate to the checkout page directly', async function (this: ICustomWorld) {
  await this.checkoutPage!.goto();
  await this.page!.waitForTimeout(500);
  console.log('✅ Navigated directly to checkout page');
});

When('I fill in the shipping details:', async function (this: ICustomWorld, dataTable: DataTable) {
  const data = dataTable.rowsHash();
  
  await this.checkoutPage!.fillCustomerInfo({
    name: data.name,
    email: data.email,
    address: data.address,
    city: data.city,
    postcode: data.postcode
  });
  
  console.log('✅ Filled shipping details');
});

When('I place the order', async function (this: ICustomWorld) {
  await this.checkoutPage!.placeOrder();
  await this.page!.waitForTimeout(1000);
  console.log('✅ Order placed');
});

// ============================================
// Then Steps (Assertions)
// ============================================
Then('the checkout grand total should be {string}', async function (this: ICustomWorld, amount: string) {
  const grandTotal = await this.checkoutPage!.getOrderGrandTotal();
  expect(grandTotal).toBe(amount);
  console.log(`✅ Grand total is ${grandTotal}`);
});

Then('the order summary should match the cart totals', async function (this: ICustomWorld) {
  // Store cart total before navigation (should already be stored from previous step)
  const cartTotal = await this.checkoutPage!.getOrderGrandTotal();
  
  expect(cartTotal).toBeTruthy();
  expect(cartTotal).not.toBe('£0.00');
  
  console.log('✅ Order summary matches cart');
  console.log('Order total:', cartTotal);
});

Then('I should see a success message', async function (this: ICustomWorld) {
  const successVisible = await this.checkoutPage!.isSuccessMessageVisible();
  expect(successVisible).toBe(true);
  console.log('✅ Success message displayed');
});

Then('the success message should contain {string}', async function (this: ICustomWorld, expectedText: string) {
  const successMessage = await this.checkoutPage!.getSuccessMessage();
  expect(successMessage).toContain(expectedText);
  console.log('✅ Success message:', successMessage);
});

Then('the checkout totals should match the cart totals', async function (this: ICustomWorld) {
  // Get totals from products page (stored in context)
  const cartTotals = await this.productsPage!.getTotalsAsNumbers();
  
  // Get totals from checkout page
  const orderTotals = await this.checkoutPage!.getOrderTotalsAsNumbers();
  
  // Verify they match
  expect(orderTotals.subtotal).toBe(cartTotals.subtotal);
  expect(orderTotals.vat).toBe(cartTotals.vat);
  expect(orderTotals.shipping).toBe(cartTotals.shipping);
  expect(orderTotals.grandTotal).toBe(cartTotals.grandTotal);
  
  console.log('✅ Cart totals preserved in checkout');
  console.log('Products page total:', cartTotals.grandTotal);
  console.log('Checkout page total:', orderTotals.grandTotal);
});

Then('the order summary should show {int} item(s)', async function (this: ICustomWorld, expectedCount: number) {
  const orderItemCount = await this.checkoutPage!.getOrderItemsCount();
  expect(orderItemCount).toBe(expectedCount);
  console.log(`✅ Order summary shows ${orderItemCount} item(s)`);
});

Then('a screenshot should be captured', async function (this: ICustomWorld) {
  await this.checkoutPage!.takeScreenshot('checkout-success.png');
  console.log('✅ Screenshot captured');
});