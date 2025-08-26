# Playwright TypeScript Project Setup Patterns

## Initial Project Setup Commands

### Quick Setup (Recommended for New Projects)
```bash
# Create new directory and initialize
mkdir playwright-tests
cd playwright-tests

# Initialize Playwright with TypeScript support
npm init playwright@latest

# During setup, select:
# - TypeScript
# - tests folder
# - Add GitHub Actions workflow: false (for now)
# - Install Playwright browsers: true
```

### Manual Setup (For Existing Projects)
```bash
# Initialize npm if not already done
npm init -y

# Install Playwright Test with TypeScript support
npm i -D @playwright/test
npm i -D typescript @types/node

# Install supported browsers
npx playwright install

# Create TypeScript config
npx tsc --init
```

## Essential Configuration Files

### 1. package.json
```json
{
  "name": "playwright-tests",
  "version": "1.0.0",
  "description": "Playwright TypeScript test framework for the-internet.herokuapp.com",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:chrome": "playwright test --project=chromium",
    "test:firefox": "playwright test --project=firefox",
    "test:webkit": "playwright test --project=webkit",
    "test:checkbox": "playwright test checkbox.spec.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"**/*.{ts,json,md}\"",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.45.0",
    "@types/node": "^20.14.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0",
    "typescript": "^5.5.0"
  }
}
```

### 2. playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Test match pattern
  testMatch: '**/*.spec.ts',
  
  // Parallel execution
  fullyParallel: true,
  
  // Fail build on CI if test.only is left
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Number of workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for the application
    baseURL: 'http://the-internet.herokuapp.com',
    
    // Collect trace when retrying failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Test id attribute
    testIdAttribute: 'data-testid'
  },
  
  // Configure projects for major browsers
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
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Output folder for test artifacts
  outputDir: 'test-results/',
  
  // Global timeout
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 5000,
  },
});
```

### 3. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@fixtures/*": ["src/fixtures/*"],
      "@utils/*": ["src/utils/*"],
      "@data/*": ["src/data/*"]
    },
    "types": ["@playwright/test"]
  },
  "include": [
    "src/**/*",
    "tests/**/*"
  ],
  "exclude": [
    "node_modules",
    "playwright-report",
    "test-results"
  ]
}
```

### 4. Test-Specific tsconfig.json (tests/tsconfig.json)
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "allowJs": true,
    "strict": false
  },
  "include": [
    "**/*.spec.ts",
    "../src/**/*"
  ]
}
```

## Project Structure

### Recommended Directory Layout
```
playwright-tests/
├── src/
│   ├── pages/
│   │   ├── BasePage.ts
│   │   └── CheckboxPage.ts
│   ├── fixtures/
│   │   └── test.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── constants.ts
│   └── data/
│       └── test-data.ts
├── tests/
│   ├── checkbox.spec.ts
│   └── tsconfig.json
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .gitignore
├── .eslintrc.json
└── .prettierrc
```

## Base Page Implementation

### BasePage.ts
```typescript
import { Page, Response } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;
  
  constructor(page: Page) {
    this.page = page;
    this.baseURL = 'http://the-internet.herokuapp.com';
  }
  
  async goto(path: string): Promise<Response | null> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    return await this.page.goto(url);
  }
  
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('load');
  }
  
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
  
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ 
      path: `screenshots/${name}.png`,
      fullPage: true 
    });
  }
  
  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    await this.page.locator(selector).waitFor({ 
      state: 'visible', 
      timeout 
    });
  }
  
  async getPageHeading(): Promise<string | null> {
    const heading = this.page.locator('h3').first();
    return await heading.textContent();
  }
}
```

## Custom Test Fixtures

### fixtures/test.ts
```typescript
import { test as base } from '@playwright/test';
import { CheckboxPage } from '@pages/CheckboxPage';

// Define custom fixtures
type MyFixtures = {
  checkboxPage: CheckboxPage;
};

// Extend base test with custom fixtures
export const test = base.extend<MyFixtures>({
  checkboxPage: async ({ page }, use) => {
    const checkboxPage = new CheckboxPage(page);
    await use(checkboxPage);
  },
});

export { expect } from '@playwright/test';
```

## Utility Functions

### utils/helpers.ts
```typescript
import { Page } from '@playwright/test';

export async function waitForNetworkIdle(page: Page, timeout = 3000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function scrollToElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

export async function clearAndType(page: Page, selector: string, text: string): Promise<void> {
  const locator = page.locator(selector);
  await locator.clear();
  await locator.fill(text);
}

export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function takeElementScreenshot(
  page: Page, 
  selector: string, 
  name: string
): Promise<void> {
  await page.locator(selector).screenshot({ path: `screenshots/${name}.png` });
}
```

## Environment Configuration

### .env.example
```bash
# Test Environment Configuration
BASE_URL=http://the-internet.herokuapp.com
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000
RETRY_COUNT=2
PARALLEL_WORKERS=4
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
TRACE_ON_FAILURE=true
```

### Loading Environment Variables
```typescript
// config/env.ts
import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL || 'http://the-internet.herokuapp.com',
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0'),
  timeout: parseInt(process.env.TIMEOUT || '30000'),
  retryCount: parseInt(process.env.RETRY_COUNT || '2'),
  workers: parseInt(process.env.PARALLEL_WORKERS || '4'),
  screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true',
  video: process.env.VIDEO_ON_FAILURE === 'true',
  trace: process.env.TRACE_ON_FAILURE === 'true',
};
```

## ESLint Configuration

### .eslintrc.json
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:playwright/recommended"
  ],
  "plugins": ["@typescript-eslint", "playwright"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "playwright/no-wait-for-timeout": "warn",
    "playwright/no-force-option": "warn",
    "playwright/no-page-pause": "error"
  }
}
```

## Prettier Configuration

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## Git Ignore

### .gitignore
```
node_modules/
test-results/
playwright-report/
playwright/.cache/
screenshots/
videos/
traces/
.env
*.log
.DS_Store
dist/
coverage/
.vscode/
.idea/
```

## VS Code Settings

### .vscode/settings.json
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript"],
  "files.exclude": {
    "node_modules": true,
    "test-results": true,
    "playwright-report": true
  }
}
```

## Running Tests

### Common Commands
```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run specific test file
npm run test:checkbox

# Run with specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Debug mode
npm run test:debug

# Type checking
npm run typecheck

# Generate and open HTML report
npm run report

# Run tests with custom configuration
npx playwright test --config=custom.config.ts

# Run tests matching a pattern
npx playwright test -g "checkbox"

# Run tests in headed mode
npm run test:headed

# Update snapshots
npx playwright test --update-snapshots
```

## CI/CD Integration (GitHub Actions)

### .github/workflows/playwright.yml
```yaml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
        
      - name: Run type checking
        run: npm run typecheck
        
      - name: Run linter
        run: npm run lint
        
      - name: Run Playwright tests
        run: npm test
        
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

This comprehensive setup provides a production-ready Playwright TypeScript test framework with all necessary configurations, patterns, and best practices for 2024-2025.