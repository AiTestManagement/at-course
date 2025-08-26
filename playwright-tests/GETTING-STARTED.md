# 🚀 Getting Started with Playwright TypeScript Test Framework

Welcome to the team! This guide will help you get up and running with our Playwright test automation framework. By the end of this guide, you'll have your environment configured, understand the project structure, and be ready to write and run tests.

## 📋 Table of Contents
1. [Environment Setup](#-environment-setup)
2. [IDE Configuration](#-ide-configuration)
3. [Running Your First Test](#-running-your-first-test)
4. [Writing Your First Test](#-writing-your-first-test)
5. [Configuration Walkthrough](#-configuration-walkthrough)
6. [Debugging Setup](#-debugging-setup)
7. [Common Workflows](#-common-workflows)
8. [Troubleshooting](#-troubleshooting)
9. [Next Steps](#-next-steps)

---

## 🛠 Environment Setup

### Step 1: Install Prerequisites

#### Node.js Installation
1. Download Node.js (v18.x, 20.x, or 22.x) from [nodejs.org](https://nodejs.org/)
2. Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

#### Git Installation
1. Download Git from [git-scm.com](https://git-scm.com/)
2. Verify installation:
```bash
git --version  # Should show git version 2.x.x
```

### Step 2: Clone and Setup Project

```bash
# Clone the repository
git clone <repository-url>
cd playwright-tests

# Install dependencies
npm install

# Install Playwright browsers (this may take a few minutes)
npx playwright install

# Verify setup
npm run typecheck  # Should complete without errors
```

### Step 3: Verify Installation

Run a simple test to ensure everything is working:
```bash
npm run test:chrome -- -g "verify checkbox count"
```

You should see:
```
Running 1 test using 1 worker
✓ 1 [chromium] › tests\checkbox.spec.ts:85:7 › verify checkbox count (2s)
1 passed (3s)
```

---

## 💻 IDE Configuration

### Visual Studio Code (Recommended)

#### Essential Extensions

Install these VS Code extensions for the best development experience:

1. **Playwright Test for VSCode** (`ms-playwright.playwright`)
   - Run tests from the editor
   - Debug tests with breakpoints
   - Generate test code
   
2. **TypeScript and JavaScript** (Built-in)
   - IntelliSense and code completion
   - Type checking
   
3. **ESLint** (`dbaeumer.vscode-eslint`)
   - Real-time linting
   - Auto-fix on save
   
4. **Prettier** (`esbenp.prettier-vscode`)
   - Code formatting
   - Format on save

#### VS Code Settings

Create `.vscode/settings.json` in the project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": ["typescript"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "playwright.reuseBrowser": true,
  "playwright.showTrace": true
}
```

#### Workspace Layout

Recommended workspace layout for productivity:
```
Left Panel: Explorer (project files)
Main Editor: Test files
Right Panel: Split - Page Object / Test file
Bottom Panel: Terminal / Test Results
```

### Other IDEs

#### WebStorm / IntelliJ IDEA
1. Install Playwright plugin from JetBrains Marketplace
2. Configure TypeScript: Settings → Languages & Frameworks → TypeScript
3. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint

#### Sublime Text / Atom
- Install TypeScript syntax highlighting
- Configure build system for npm scripts
- Install linter packages

---

## 🎯 Running Your First Test

### Method 1: Command Line

```bash
# Run all tests
npm test

# Run tests in UI mode (recommended for beginners)
npm run test:ui

# Run a specific test file
npx playwright test tests/checkbox.spec.ts

# Run tests with a specific browser
npm run test:chrome
```

### Method 2: VS Code Playwright Extension

1. Open the Testing sidebar (flask icon)
2. You'll see all test files and individual tests
3. Click the play button next to any test to run it
4. Click the debug button to debug with breakpoints

### Method 3: Playwright UI Mode

```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See all tests in a tree view
- Run individual tests
- Watch tests execute in real-time
- View trace and debug information
- Time travel through test execution

---

## ✍️ Writing Your First Test

### Basic Test Structure

Let's write a simple test for a new feature. Create `tests/my-first-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My First Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page before each test
    await page.goto('http://the-internet.herokuapp.com');
  });

  test('should have correct title', async ({ page }) => {
    // Arrange - already done in beforeEach
    
    // Act - get the title
    const title = await page.title();
    
    // Assert - verify the title
    expect(title).toBe('The Internet');
  });

  test('should navigate to checkboxes page', async ({ page }) => {
    // Act - click the link
    await page.click('a[href="/checkboxes"]');
    
    // Assert - verify we're on the right page
    await expect(page).toHaveURL(/.*checkboxes/);
    await expect(page.locator('h3')).toHaveText('Checkboxes');
  });
});
```

### Using Page Objects

Create a more maintainable test using Page Objects:

```typescript
import { test, expect } from '@playwright/test';
import { CheckboxPage } from '../src/pages/CheckboxPage';

test.describe('Checkbox Tests with Page Objects', () => {
  let checkboxPage: CheckboxPage;

  test.beforeEach(async ({ page }) => {
    checkboxPage = new CheckboxPage(page);
    await checkboxPage.gotoCheckboxes();
  });

  test('toggle checkbox using page object', async () => {
    // Check if first checkbox is unchecked initially
    const initialState = await checkboxPage.isCheckboxChecked(0);
    expect(initialState).toBe(false);
    
    // Check the checkbox
    await checkboxPage.checkCheckbox(0);
    
    // Verify it's now checked
    const newState = await checkboxPage.isCheckboxChecked(0);
    expect(newState).toBe(true);
  });
});
```

### Test Writing Best Practices

```typescript
// ✅ GOOD: Descriptive test names
test('should display error message when login fails with invalid credentials', async () => {});

// ❌ BAD: Vague test names
test('test login', async () => {});

// ✅ GOOD: Use data-testid or semantic locators
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByTestId('username-input').fill('john');

// ❌ BAD: Brittle CSS selectors
await page.click('#app > div > form > button:nth-child(3)');

// ✅ GOOD: Use Page Objects for reusability
await loginPage.login('user@example.com', 'password');

// ❌ BAD: Duplicate code across tests
await page.fill('#username', 'user@example.com');
await page.fill('#password', 'password');
await page.click('#login-button');
```

---

## ⚙️ Configuration Walkthrough

### playwright.config.ts - Key Sections Explained

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 1. Test Discovery
  testDir: './tests',                    // Where to look for test files
  testMatch: '**/*.spec.ts',            // Pattern for test files
  
  // 2. Execution Settings
  fullyParallel: true,                  // Run tests in parallel
  workers: process.env.CI ? 1 : undefined, // Number of parallel workers
  retries: process.env.CI ? 2 : 0,      // Retry failed tests
  
  // 3. Timeouts
  timeout: 30000,                        // Test timeout (30 seconds)
  expect: {
    timeout: 5000,                      // Assertion timeout (5 seconds)
  },
  
  // 4. Reporter Configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],  // HTML report
    ['list'],                                          // Console output
    ['json', { outputFile: 'test-results.json' }]    // JSON report
  ],
  
  // 5. Global Test Settings
  use: {
    baseURL: 'http://the-internet.herokuapp.com',  // Base URL for all tests
    trace: 'on-first-retry',                       // Capture trace on retry
    screenshot: 'only-on-failure',                 // Screenshot on failure
    video: 'retain-on-failure',                    // Video on failure
    actionTimeout: 10000,                           // Action timeout
    navigationTimeout: 30000,                       // Navigation timeout
  },
  
  // 6. Browser Configuration
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### tsconfig.json - TypeScript Configuration

```typescript
{
  "compilerOptions": {
    "target": "ES2020",              // JavaScript version to compile to
    "strict": true,                  // Enable strict type checking
    "baseUrl": ".",                  // Base directory for paths
    "paths": {                       // Path aliases for cleaner imports
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"],
    }
  }
}
```

### Modifying Configuration

Common configuration changes:

```typescript
// Run tests sequentially (not in parallel)
fullyParallel: false,

// Increase timeout for slow tests
timeout: 60000,  // 60 seconds

// Always capture video
use: {
  video: 'on',
}

// Add custom test metadata
metadata: {
  team: 'QA',
  sprint: '2024-Q1',
}
```

---

## 🐛 Debugging Setup

### Method 1: VS Code Debugger

1. Set breakpoints by clicking left of line numbers
2. Run test in debug mode:
   - Via Testing sidebar: Click debug icon
   - Via terminal: `npm run test:debug`

### Method 2: Playwright Inspector

```bash
# Launch with Playwright Inspector
npx playwright test --debug

# Debug a specific test
npx playwright test --debug tests/checkbox.spec.ts -g "verify initial"
```

Features:
- Step through test execution
- Inspect page state
- View selector playground
- Record new actions

### Method 3: UI Mode Debugging

```bash
npm run test:ui
```

Benefits:
- Watch mode (auto-rerun on file changes)
- Time travel debugging
- View DOM snapshots
- Inspect network requests

### Method 4: Console Debugging

Add debug statements in your tests:

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/checkboxes');
  
  // Print page URL
  console.log('Current URL:', page.url());
  
  // Print element count
  const checkboxCount = await page.locator('input[type="checkbox"]').count();
  console.log('Number of checkboxes:', checkboxCount);
  
  // Pause execution (when running with --headed)
  await page.pause();
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png' });
});
```

### Debug Commands

```bash
# Run with browser visible
npx playwright test --headed

# Slow down execution (useful for debugging)
npx playwright test --slow-mo=1000  # 1 second delay between actions

# Keep browser open after test
npx playwright test --headed --no-exit

# Generate trace for debugging
npx playwright test --trace on

# View trace file
npx playwright show-trace test-results/trace.zip
```

---

## 📝 Common Workflows

### Daily Development Workflow

```bash
# 1. Start your day - pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-test-suite

# 3. Install any new dependencies
npm install

# 4. Write tests with UI mode open
npm run test:ui

# 5. Verify your tests
npm run test:chrome -- tests/your-new-test.spec.ts

# 6. Check code quality
npm run typecheck
npm run lint

# 7. Format code
npm run format

# 8. Run full test suite before committing
npm test

# 9. Commit and push
git add .
git commit -m "test: add new test suite for feature X"
git push origin feature/new-test-suite
```

### Adding a New Page Object

1. Create new page object file:
```typescript
// src/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }
  
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

2. Add to fixtures if needed:
```typescript
// src/fixtures/test.ts
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});
```

### Running Tests in CI/CD

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run typecheck
    npm test
    
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Updating Test Data

```typescript
// src/utils/test-data.ts
export const TEST_USERS = {
  valid: {
    username: 'testuser@example.com',
    password: 'Test123!',
  },
  invalid: {
    username: 'invalid@example.com',
    password: 'wrong',
  },
};

// Use in tests
import { TEST_USERS } from '@utils/test-data';

test('login with valid credentials', async ({ page }) => {
  await loginPage.login(TEST_USERS.valid.username, TEST_USERS.valid.password);
});
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Tests timing out
```bash
Error: Test timeout of 30000ms exceeded
```

**Solutions:**
```bash
# Increase timeout in specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000);  // 60 seconds
  // test code
});

# Run with fewer workers
npx playwright test --workers=1

# Check if site is accessible
curl http://the-internet.herokuapp.com
```

#### Issue 2: Browser installation fails
```bash
Error: Failed to install browser dependencies
```

**Solutions:**
```bash
# Force reinstall
npx playwright install --force

# Install with system dependencies (Linux/WSL)
sudo npx playwright install-deps

# Manual installation
npx playwright install chromium
```

#### Issue 3: TypeScript errors
```bash
Error: Cannot find module '@pages/CheckboxPage'
```

**Solutions:**
```bash
# Verify tsconfig.json paths
# Check that baseUrl is set to "."
# Ensure paths are correctly mapped

# Rebuild TypeScript
npm run typecheck

# Clear TypeScript cache
rm -rf node_modules/.cache
```

#### Issue 4: Tests pass locally but fail in CI
**Common causes:**
- Different browser versions
- Network restrictions
- Missing environment variables
- Timing issues

**Solutions:**
```typescript
// Add explicit waits
await page.waitForLoadState('networkidle');

// Use more robust locators
await page.getByRole('button', { name: 'Submit' }).click();

// Add retries for flaky tests
test('flaky test', async ({ page }) => {
  test.info().annotations.push({ type: 'flaky', description: 'Known issue' });
  // test code
});
```

#### Issue 5: Parallel execution issues
```bash
Error: EADDRINUSE: address already in use
```

**Solutions:**
```typescript
// Run tests serially
test.describe.serial('Sequential tests', () => {
  test('first test', async () => {});
  test('second test', async () => {});
});

// Or use --workers=1
npx playwright test --workers=1
```

### Debug Checklist

When a test fails, check:

1. ✅ Is the application accessible?
2. ✅ Are selectors still valid? (Check with inspector)
3. ✅ Is the test data correct?
4. ✅ Are there any console errors? (Check browser console)
5. ✅ Is the test isolated? (Run alone to verify)
6. ✅ Are assertions correct? (Check expected vs actual)
7. ✅ Is there a race condition? (Add proper waits)
8. ✅ Is it environment-specific? (Test in different browsers)

---

## 📚 Next Steps

### Level 1: Beginner (Week 1-2)
- [ ] Run existing tests and understand output
- [ ] Modify existing tests with small changes
- [ ] Write simple tests using existing page objects
- [ ] Use Playwright UI mode effectively
- [ ] Debug tests using VS Code

### Level 2: Intermediate (Week 3-4)
- [ ] Create new page objects
- [ ] Write complex test scenarios
- [ ] Implement custom fixtures
- [ ] Use advanced locator strategies
- [ ] Handle dynamic content and waits

### Level 3: Advanced (Month 2+)
- [ ] Implement visual regression tests
- [ ] Create custom reporters
- [ ] Set up API testing alongside UI tests
- [ ] Optimize test execution time
- [ ] Implement cross-browser testing strategies

### Additional Resources

#### Official Documentation
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

#### Tutorials and Guides
- [Playwright YouTube Channel](https://www.youtube.com/@Playwrightdev)
- [Test Automation University - Playwright Course](https://testautomationu.applitools.com/js-playwright-tutorial/)
- [Playwright Tips & Tricks](https://www.checklyhq.com/learn/headless/basics-playwright-intro/)

#### Community Resources
- [Playwright Discord](https://aka.ms/playwright/discord)
- [Stack Overflow - Playwright Tag](https://stackoverflow.com/questions/tagged/playwright)
- [GitHub Discussions](https://github.com/microsoft/playwright/discussions)

#### Tools and Extensions
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright Inspector](https://playwright.dev/docs/inspector)

### Quick Reference Card

```bash
# Most Used Commands
npm test                    # Run all tests
npm run test:ui            # UI mode
npm run test:chrome        # Chrome only
npm run test:debug         # Debug mode
npm run typecheck          # Type check
npm run lint               # Lint code
npm run report             # View report

# Playwright CLI
npx playwright test                           # Run tests
npx playwright test --debug                   # Debug mode
npx playwright test --ui                      # UI mode
npx playwright test --headed                  # See browser
npx playwright test --project=chromium        # Specific browser
npx playwright test -g "test name"            # Specific test
npx playwright test --reporter=html           # HTML report
npx playwright codegen                        # Generate code
npx playwright show-report                    # View report
npx playwright show-trace trace.zip           # View trace
```

### Getting Help

If you're stuck:

1. **Check the test output** - Error messages often indicate the issue
2. **Use UI mode** - Visual debugging helps identify problems
3. **Read the docs** - Playwright docs are comprehensive
4. **Ask the team** - We're here to help!
5. **Check existing tests** - Similar patterns might already exist

---

## 🎉 Congratulations!

You're now ready to start writing and running Playwright tests! Remember:

- **Start small** - Modify existing tests before writing new ones
- **Use Page Objects** - Keep tests maintainable
- **Ask questions** - The team is here to help
- **Practice** - The more tests you write, the easier it becomes

Welcome to the team, and happy testing! 🎭