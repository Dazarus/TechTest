Feature: Checkout Page Functionality
  As a customer
  I want to complete my purchase
  So that I can receive my ordered products

  Background:
    Given the products page is loaded

  @smoke @checkout
  Scenario: Display order summary with cart items
    When I add the first product to the cart
    And I navigate to the checkout page
    Then the order summary should match the cart totals

  @checkout
  Scenario: Successfully place order with valid data
    Given I add the first product to the cart
    When I navigate to the checkout page
    And I fill in the shipping details:
      | name     | John Smith              |
      | email    | john.smith@example.com  |
      | address  | 123 High Street         |
      | city     | London                  |
      | postcode | SW1A 1AA                |
    And I place the order
    Then I should see a success message
    And the success message should contain "Order placed!"

  @checkout @items
  Scenario: Order items are displayed in summary
    When I add 2 products to the cart
    And I navigate to the checkout page
    Then the order summary should show 2 items

  @checkout
  Scenario: Access checkout without items
    When I navigate to the checkout page directly
    Then the checkout grand total should be "£4.95"

  @e2e @checkout
  Scenario: Complete end-to-end shopping flow
    Given I add the first product to the cart
    When I apply the promo code "SAVE10"
    And I navigate to the checkout page
    And I fill in the shipping details:
      | name     | John Smith              |
      | email    | john.smith@example.com  |
      | address  | 123 High Street         |
      | city     | London                  |
      | postcode | SW1A 1AA                |
    And I place the order
    Then I should see a success message
    And a screenshot should be captured