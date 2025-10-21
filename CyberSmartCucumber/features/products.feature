Feature: Products Page Functionality
  As a customer
  I want to browse and manage products
  So that I can add items to my cart

  Background:
    Given the products page is loaded

  @smoke @products
  Scenario: Filter products by category
    When I view the available categories
    And I filter products by the second category
    Then I should see filtered products displayed

  @smoke @products
  Scenario: Sort products by price
    When I sort products by "Low to High"
    Then the products should be sorted accordingly
    When I sort products by "High to Low"
    Then the products should be sorted accordingly

  @cart @products
  Scenario: Add product to cart
    When I add the first product to the cart
    Then the cart should not be empty
    And the cart should contain 1 item
    And the grand total should not be "£0.00"

  @calculations @products
  Scenario: VAT calculation is correct
    When I add the first product to the cart
    Then the VAT should be calculated correctly at 20%

  @promo @products
  Scenario: Apply valid promo code
    Given I add the first product to the cart
    When I apply the promo code "SAVE10"
    Then the promo code should be applied successfully
    And the grand total should be less than before

  @shipping @products
  Scenario: Shipping cost for orders under £50
    When I add 3 products to the cart
    And the subtotal is less than £50
    Then shipping cost should be applied

  @shipping @products
  Scenario: Free shipping for orders £50 and above
    When I add 2 items of product at index 5 to the cart
    And the subtotal is £50 or more
    Then shipping should be free

  @cart @products
  Scenario: Remove item from cart
    Given I add 2 products to the cart
    When I remove the first item from the cart
    Then the cart should contain 1 item

  @navigation @products
  Scenario: Navigate to checkout page
    Given I add the first product to the cart
    When I click the "Go to checkout" button
    Then I should be on the checkout page

  @navigation @products
  Scenario: Navigate using top navigation
    When I click the checkout navigation link
    Then I should be on the checkout page
    When I click the products navigation link
    Then I should be on the products page