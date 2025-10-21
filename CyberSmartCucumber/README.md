# Cucumber BDD Test Framework for Electron

A comprehensive BDD test automation framework for Electron applications using Cucumber, Playwright, and TypeScript.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set App Path
```bash
# Windows PowerShell
$env:APP_PATH="C:\Users\damie\Documents\Cybersmart\shopping-electron"

# Windows CMD
set APP_PATH=C:\Users\damie\Documents\Cybersmart\shopping-electron

# Linux/Mac
export APP_PATH=/path/to/shopping-electron
```

### 3. Run Tests
```bash
npm test
```

## 📦 What's Included

- **16 BDD Test Scenarios** in Gherkin syntax
- **Automatic Screenshots** on test failure
- **HTML Reports** for test results
- **Tag-Based Execution** for running specific tests
- **Page Object Model** integration
- **Custom World** with Electron support

## 🎯 Available Commands
```bash
npm test                      # Run all tests
npm run test:products         # Run products tests only
npm run test:checkout         # Run checkout tests only
npm run test:tags "@smoke"    # Run smoke tests
npm run test:tags "@e2e"      # Run end-to-end tests
npm run test:report           # Generate HTML report
npm run test:parallel         # Run tests in parallel
```

## 🏷️ Available Tags

- `@smoke` - Critical smoke tests
- `@products` - Products page tests
- `@checkout` - Checkout page tests
- `@cart` - Cart functionality
- `@promo` - Promo code tests
- `@shipping` - Shipping logic tests
- `@navigation` - Navigation tests
- `@e2e` - End-to-end flows
- `@calculations` - Calculation tests

## 📂 Project Structure
```
playwright-electron-cucumber/
├── features/                 # Gherkin feature files
│   ├── products.feature
│   ├── checkout.feature
│   └── step-definitions/     # Step implementations
│       ├── products.steps.ts
│       └── checkout.steps.ts
├── support/                  # Test configuration
│   ├── world.ts             # Custom World
│   └── hooks.ts             # Lifecycle hooks
├── tests/
│   └── pages/               # Page Object Models
│       ├── ProductsPage.ts
│       └── CheckoutPage.ts
├── reports/                 # Test reports (auto-generated)
├── screenshots/             # Failure screenshots
├── package.json
├── tsconfig.json
└── cucumber.js
```

## 📝 Writing New Tests

### 1. Create a Feature File

Create a new `.feature` file in `features/`:
```gherkin
Feature: New Feature Name
  As a user
  I want to do something
  So that I can achieve a goal

  @smoke
  Scenario: Test scenario name
    Given precondition
    When action
    Then expected result
```

### 2. Run Tests

Cucumber will suggest step definitions for any missing steps:
```bash
npm test
```

### 3. Implement Steps

Add step implementations in `features/step-definitions/`:
```typescript
Given('precondition', async function (this: ICustomWorld) {
  // Your test code
});
```

## 🎨 Example Scenarios

### Simple Test
```gherkin
@smoke @cart
Scenario: Add product to cart
  Given the products page is loaded
  When I add the first product to the cart
  Then the cart should not be empty
  And the cart should contain 1 item
```

### Using Data Tables
```gherkin
@checkout
Scenario: Place order with shipping details
  When I fill in the shipping details:
    | name     | John Smith             |
    | email    | john@example.com       |
    | address  | 123 High Street        |
  And I place the order
  Then I should see a success message
```

## 🔧 Configuration

### Cucumber Configuration (`cucumber.js`)
- Set parallel execution
- Configure report formats
- Set default timeouts

### App Path Configuration
Set your Electron app path in one of these ways:

**Option 1:** Environment variable (recommended)
```bash
$env:APP_PATH="path-to-your-app"
```

**Option 2:** Edit `support/hooks.ts` line 18

## 📊 Reports

### HTML Report
After running tests, open `reports/cucumber-report.html` in your browser.
```bash
npm run test:report
```

### Screenshots
Failed scenarios automatically capture screenshots in `screenshots/` folder.

## 🐛 Troubleshooting

### Tests not running?
- Check APP_PATH is set correctly
- Ensure `npm install` completed successfully
- Verify shopping-electron folder exists

### Import errors?
```bash
npm install
```

### Multiple Electron instances?
Check `parallel: 1` in `cucumber.js`

### Page Objects not found?
Ensure `ProductsPage.ts` and `CheckoutPage.ts` are in `tests/pages/`

## 🎯 Best Practices

1. **Use descriptive scenario names** - Clear, business-focused language
2. **Keep scenarios independent** - Each scenario should run standalone
3. **Use Background for common setup** - Avoid repetition
4. **Tag scenarios appropriately** - Makes running subsets easier
5. **Use data tables for complex input** - More readable
6. **Store data in context** - Share between steps using `this.setContext()`

## 📚 Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Playwright Documentation](https://playwright.dev/)
- [Gherkin Syntax Reference](https://cucumber.io/docs/gherkin/reference/)

## 🤝 Contributing

To add new test scenarios:

1. Write feature file in `features/`
2. Run tests - Cucumber suggests step definitions
3. Implement steps in `features/step-definitions/`
4. Use existing page objects or create new ones
5. Add appropriate tags

## 📄 License

MIT

---

Happy Testing! 🎉