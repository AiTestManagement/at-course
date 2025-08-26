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