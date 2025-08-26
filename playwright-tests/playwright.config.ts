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