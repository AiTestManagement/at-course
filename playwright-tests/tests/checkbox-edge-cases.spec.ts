import { test, expect } from '@playwright/test';
import { CheckboxPage } from '../src/pages/CheckboxPage';
import { CheckboxTestData } from '../src/utils/constants';

test.describe('Checkbox Edge Cases', () => {
  let checkboxPage: CheckboxPage;
  
  test.beforeEach(async ({ page }) => {
    checkboxPage = new CheckboxPage(page);
    await checkboxPage.gotoCheckboxes();
  });
  
  test('rapid checkbox clicking', async () => {
    const checkbox = checkboxPage.getCheckbox(0);
    
    // Perform rapid clicks
    for (let i = 0; i < 5; i++) {
      await checkbox.click();
    }
    
    // After odd number of clicks, checkbox should be checked
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(true);
  });
  
  test('keyboard and mouse interaction combined', async () => {
    const checkbox = checkboxPage.getCheckbox(0);
    
    // Use keyboard to check
    await checkbox.focus();
    await checkbox.press('Space');
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(true);
    
    // Use mouse to uncheck
    await checkbox.click();
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(false);
    
    // Use keyboard again
    await checkbox.press('Space');
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(true);
  });
  
  test('focus behavior', async () => {
    const checkbox1 = checkboxPage.getCheckbox(0);
    const checkbox2 = checkboxPage.getCheckbox(1);
    
    // Focus first checkbox
    await checkbox1.focus();
    expect(await checkbox1.evaluate(el => document.activeElement === el)).toBe(true);
    
    // Tab to second checkbox
    await checkbox1.press('Tab');
    expect(await checkbox2.evaluate(el => document.activeElement === el)).toBe(true);
  });
  
  test('check already checked checkbox', async () => {
    // Second checkbox is already checked
    const initialState = await checkboxPage.isCheckboxChecked(1);
    expect(initialState).toBe(true);
    
    // Try to check it again
    await checkboxPage.checkCheckbox(1);
    
    // Should still be checked
    expect(await checkboxPage.isCheckboxChecked(1)).toBe(true);
  });
  
  test('uncheck already unchecked checkbox', async () => {
    // First checkbox is already unchecked
    const initialState = await checkboxPage.isCheckboxChecked(0);
    expect(initialState).toBe(false);
    
    // Try to uncheck it again
    await checkboxPage.uncheckCheckbox(0);
    
    // Should still be unchecked
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(false);
  });
  
  test('verify form element exists', async ({ page }) => {
    const form = page.locator('#checkboxes');
    await expect(form).toBeVisible();
    
    // Verify form contains exactly 2 checkboxes
    const checkboxCount = await checkboxPage.getCheckboxCount();
    expect(checkboxCount).toBe(2);
  });
  
  test('verify no form submission occurs', async ({ page }) => {
    // Listen for navigation (which shouldn't happen)
    let navigationOccurred = false;
    page.on('framenavigated', () => {
      navigationOccurred = true;
    });
    
    // Try to submit form with Enter key
    const checkbox = checkboxPage.getCheckbox(0);
    await checkbox.focus();
    await checkbox.press('Enter');
    
    // Wait a bit to ensure no navigation
    await page.waitForTimeout(1000);
    
    // Verify no navigation occurred
    expect(navigationOccurred).toBe(false);
    
    // Verify we're still on the same page
    expect(page.url()).toContain('/checkboxes');
  });
  
  test('method chaining works correctly', async () => {
    // Test method chaining pattern
    await checkboxPage
      .checkCheckbox(0)
      .then(page => page.uncheckCheckbox(1));
    
    const states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([true, false]);
  });
});

// Data-driven test pattern
test.describe('Data-driven checkbox tests', () => {
  let checkboxPage: CheckboxPage;
  
  test.beforeEach(async ({ page }) => {
    checkboxPage = new CheckboxPage(page);
    await checkboxPage.gotoCheckboxes();
  });
  
  const testCases: CheckboxTestData[] = [
    {
      description: 'check first checkbox',
      actions: [{ type: 'check', index: 0 }],
      expectedStates: [true, true]
    },
    {
      description: 'uncheck second checkbox',
      actions: [{ type: 'uncheck', index: 1 }],
      expectedStates: [false, false]
    },
    {
      description: 'toggle both checkboxes',
      actions: [
        { type: 'check', index: 0 },
        { type: 'uncheck', index: 1 }
      ],
      expectedStates: [true, false]
    },
    {
      description: 'check all then uncheck all',
      actions: [
        { type: 'check', index: 0 },
        { type: 'check', index: 1 },
        { type: 'uncheck', index: 0 },
        { type: 'uncheck', index: 1 }
      ],
      expectedStates: [false, false]
    }
  ];
  
  testCases.forEach(({ description, actions, expectedStates }) => {
    test(`data-driven: ${description}`, async () => {
      // Execute actions
      for (const action of actions) {
        if (action.type === 'check') {
          await checkboxPage.checkCheckbox(action.index);
        } else {
          await checkboxPage.uncheckCheckbox(action.index);
        }
      }
      
      // Verify expected states
      const states = await checkboxPage.getAllCheckboxStates();
      expect(states).toEqual(expectedStates);
    });
  });
});

// Cross-browser testing
test.describe('Cross-browser checkbox tests', () => {
  let checkboxPage: CheckboxPage;
  
  test.beforeEach(async ({ page }) => {
    checkboxPage = new CheckboxPage(page);
    await checkboxPage.gotoCheckboxes();
  });
  
  test('attribute synchronization across browsers', async ({ browserName }) => {
    // This test verifies the custom JS works across all browsers
    console.log(`Testing in browser: ${browserName}`);
    
    const checkbox = checkboxPage.getCheckbox(0);
    
    // Check and verify sync
    await checkbox.check();
    const checkedProperty = await checkbox.isChecked();
    const checkedAttribute = await checkbox.getAttribute('checked');
    expect(checkedProperty).toBe(true);
    expect(checkedAttribute).not.toBeNull();
    
    // Uncheck and verify sync
    await checkbox.uncheck();
    const uncheckedProperty = await checkbox.isChecked();
    const uncheckedAttribute = await checkbox.getAttribute('checked');
    expect(uncheckedProperty).toBe(false);
    expect(uncheckedAttribute).toBeNull();
  });
});