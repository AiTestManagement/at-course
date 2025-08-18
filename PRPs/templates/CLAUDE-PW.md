# CLAUDE.md - TypeScript Playwright Project Memory

This file contains project context and conventions for Claude to reference when assisting with this TypeScript Playwright testing project.

## Project Overview

### Application Under Test
- **Type**: [Web application type - e.g., SPA, e-commerce, dashboard, etc.]
- **Framework**: [Frontend framework - React, Vue, Angular, etc.]
- **Key Features**: [Main functionality areas to test]
- **Authentication**: [Auth method - OAuth, JWT, session-based, etc.]

### Testing Scope
- **Primary Focus**: End-to-end functional testing
- **Secondary**: API testing, visual regression, accessibility
- **Test Types**: Smoke, regression, integration, user journey

## Project Structure & Architecture

```
project-root/
├── tests/
│   ├── e2e/                 # End-to-end tests
│   ├── api/                 # API tests
│   ├── visual/              # Visual regression tests
│   └── fixtures/            # Test data and fixtures
├── pages/                   # Page Object Models
├── utils/                   # Test utilities and helpers
├── config/                  # Environment configurations
├── reports/                 # Test reports output
├── playwright.config.ts     # Main Playwright configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

### Key Configuration Files
- **playwright.config.ts**: Main test configuration with browser settings, timeouts, and reporters
- **tsconfig.json**: TypeScript compiler options optimized for testing
- **.env files**: Environment-specific variables (dev, staging, prod)
- **package.json**: Test scripts and dependencies

## Testing Patterns & Conventions

### Test Organization
- **File Naming**: `*.spec.ts` for test files
- **Test Grouping**: Organize by feature/module, not by test type
- **Folder Structure**: Mirror application structure where logical

### Page Object Model (POM)
```typescript
// Preferred POM structure
export class LoginPage {
  constructor(private page: Page) {}

  // Locators as getters
  get emailInput() { return this.page.locator('[data-testid="email"]'); }
  get passwordInput() { return this.page.locator('[data-testid="password"]'); }
  get loginButton() { return this.page.locator('[data-testid="login-btn"]'); }

  // Actions as methods
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Assertions as methods
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/dashboard/);
  }
}
```

### Element Selection Strategy
1. **Primary**: `data-testid` attributes
2. **Secondary**: Semantic locators (role, text)
3. **Fallback**: CSS selectors (stable ones only)
4. **Avoid**: XPath, brittle CSS selectors

### Test Structure Convention
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup common to all tests in describe block
  });

  test('should do something specific @smoke', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Test Data Management
- **Static Data**: JSON files in `fixtures/` directory
- **Dynamic Data**: Factory functions for generating test data
- **Sensitive Data**: Environment variables, never hardcoded
- **User Accounts**: Dedicated test accounts per environment

### Error Handling & Retries
- **Flaky Tests**: Use `test.retry()` sparingly, fix root cause
- **Timeouts**: Generous but realistic (30s for navigation, 5s for actions)
- **Screenshots**: Auto-capture on failure
- **Videos**: Retain only on failure to save space

## Environment & Setup Details

### Target Browsers & Devices
- **Desktop**: Chromium, Firefox, WebKit
- **Mobile**: Chrome on Android, Safari on iOS (using device emulation)
- **Viewports**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

### Environment Configuration
```typescript
// Environment-specific settings
const environments = {
  dev: { baseURL: 'https://dev.example.com', timeout: 60000 },
  staging: { baseURL: 'https://staging.example.com', timeout: 30000 },
  prod: { baseURL: 'https://example.com', timeout: 30000 }
};
```

### CI/CD Integration
- **Pipeline**: [GitHub Actions / Jenkins / Azure DevOps / etc.]
- **Triggers**: PR creation, merge to main, nightly builds
- **Parallel Execution**: Tests run in parallel across multiple workers
- **Reporting**: Results published to [reporting tool/location]

### Dependencies & Tools
- **Core**: Playwright, TypeScript, Node.js
- **Utilities**: [Additional tools like Faker.js, date-fns, etc.]
- **Reporting**: [HTML Reporter, Allure, custom dashboard, etc.]
- **CI Tools**: [Docker, specific CI platform tools]

## Project-Specific Context

### Application Characteristics
- **SPA Behavior**: [How the app handles routing, state management]
- **Loading Patterns**: [Spinners, skeleton screens, lazy loading]
- **Authentication Flow**: [Login process, session management, logout]
- **Data Dependencies**: [APIs, databases, external services]

### Critical User Flows
1. **User Registration & Login**
2. **Core Feature Workflows** (list 3-5 most important)
3. **Payment/Transaction Flows** (if applicable)
4. **Admin/Management Functions** (if applicable)

### Known Challenges & Quirks
- **Timing Issues**: [Specific areas prone to race conditions]
- **Browser-Specific**: [Known compatibility issues]
- **Performance**: [Slow-loading components or pages]
- **Third-Party**: [External service dependencies and their quirks]

### Common Test Scenarios
- **Happy Path**: Core functionality working as expected
- **Error Handling**: Network failures, validation errors, timeouts
- **Edge Cases**: Boundary conditions, unusual data inputs
- **Accessibility**: Keyboard navigation, screen reader compatibility

## Development Preferences

### Code Style & Standards
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with 2-space indentation
- **Imports**: Absolute imports preferred, organize by type
- **Naming**: Descriptive test names, camelCase for functions/variables

### Debugging Approaches
- **Browser DevTools**: Use `page.pause()` for interactive debugging
- **Console Logging**: Strategic `console.log()` for data inspection
- **Screenshots**: Capture at key points during complex tests
- **Step-by-Step**: Break complex tests into smaller, testable units

### Refactoring Guidelines
- **DRY Principle**: Extract common actions into utility functions
- **Single Responsibility**: Each test should verify one specific behavior
- **Maintainability**: Prefer readability over clever code
- **Documentation**: Comment complex business logic, not obvious code

### New Test Development
1. **Start with Manual Test**: Understand the feature manually first
2. **Identify Test Cases**: List positive, negative, and edge cases
3. **Plan Test Data**: Determine what data/setup is needed
4. **Write Failing Test**: Write the test before implementation (when possible)
5. **Implement & Iterate**: Build the test incrementally

## Useful Commands & Scripts

```bash
# Run all tests
npm run test

# Run tests in headed mode (browser visible)
npm run test:headed

# Run specific test file
npm run test tests/login.spec.ts

# Run tests with specific tag
npm run test -- --grep "@smoke"

# Generate and open test report
npm run test:report

# Update Playwright browsers
npx playwright install

# Run tests in debug mode
npm run test:debug
```

## Team Conventions

### Pull Request Guidelines
- **Test Coverage**: New features require corresponding tests
- **Test Naming**: Tests should clearly describe the expected behavior
- **Review Focus**: Pay attention to test stability and maintainability

### Documentation
- **README Updates**: Keep setup instructions current
- **Test Documentation**: Document complex test scenarios
- **Known Issues**: Maintain list of known flaky tests and workarounds

---

*Last Updated: [Date]*
*Version: 1.0*

## Notes for Claude
- When suggesting code, follow the patterns and conventions outlined above
- Consider the project structure when recommending file organization
- Be aware of the testing challenges specific to this application
- Prioritize maintainable and readable test code over brevity
- Ask for clarification about environment or setup when relevant to the solution