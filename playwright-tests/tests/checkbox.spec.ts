import { test, expect } from '@playwright/test';
import { CheckboxPage } from '../src/pages/CheckboxPage';
import { INITIAL_STATES } from '../src/utils/constants';

test.describe('Checkbox Functionality', () => {
  let checkboxPage: CheckboxPage;
  
  test.beforeEach(async ({ page }) => {
    checkboxPage = new CheckboxPage(page);
    await checkboxPage.gotoCheckboxes();
  });
  
  test('verify initial checkbox states', async () => {
    // Checkbox 1 should be unchecked, Checkbox 2 should be checked
    const states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([INITIAL_STATES.checkbox1, INITIAL_STATES.checkbox2]);
  });
  
  test('check unchecked checkbox', async () => {
    await checkboxPage.checkCheckbox(0);
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(true);
    
    // Verify the attribute was also set (custom JS behavior)
    const checkbox = checkboxPage.getCheckbox(0);
    expect(await checkbox.getAttribute('checked')).not.toBeNull();
  });
  
  test('uncheck checked checkbox', async () => {
    await checkboxPage.uncheckCheckbox(1);
    expect(await checkboxPage.isCheckboxChecked(1)).toBe(false);
    
    // Verify the attribute was removed (custom JS behavior)
    const checkbox = checkboxPage.getCheckbox(1);
    expect(await checkbox.getAttribute('checked')).toBeNull();
  });
  
  test('toggle multiple checkboxes', async () => {
    // Toggle both checkboxes
    await checkboxPage.checkCheckbox(0);
    await checkboxPage.uncheckCheckbox(1);
    
    const states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([true, false]);
  });
  
  test('verify text labels are not clickable', async ({ page }) => {
    // GOTCHA: Text is not in label elements
    const initialState = await checkboxPage.isCheckboxChecked(0);
    await page.getByText('checkbox 1').click();
    
    // State should NOT change because text is not in a label
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(initialState);
  });
  
  test('keyboard interaction with checkboxes', async () => {
    const checkbox = checkboxPage.getCheckbox(0);
    await checkbox.focus();
    await checkbox.press('Space');
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(true);
    
    // Press space again to uncheck
    await checkbox.press('Space');
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(false);
  });
  
  test('verify checkbox attribute synchronization', async () => {
    // CRITICAL: Test the custom JavaScript behavior
    const checkbox = checkboxPage.getCheckbox(0);
    
    // Check the checkbox
    await checkbox.check();
    
    // Verify BOTH property and attribute are set
    expect(await checkbox.isChecked()).toBe(true);
    expect(await checkbox.getAttribute('checked')).not.toBeNull();
    
    // Uncheck the checkbox
    await checkbox.uncheck();
    
    // Verify BOTH property and attribute are cleared
    expect(await checkbox.isChecked()).toBe(false);
    expect(await checkbox.getAttribute('checked')).toBeNull();
  });
  
  test('verify checkbox count', async () => {
    const count = await checkboxPage.getCheckboxCount();
    expect(count).toBe(2);
  });
  
  test('verify page heading', async () => {
    const heading = await checkboxPage.getPageHeading();
    expect(heading).toBe('Checkboxes');
  });
  
  test('sequential checkbox operations', async () => {
    // Start with initial state
    let states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([false, true]);
    
    // Check first checkbox
    await checkboxPage.checkCheckbox(0);
    states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([true, true]);
    
    // Uncheck second checkbox
    await checkboxPage.uncheckCheckbox(1);
    states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([true, false]);
    
    // Uncheck first checkbox
    await checkboxPage.uncheckCheckbox(0);
    states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([false, false]);
    
    // Check both checkboxes
    await checkboxPage.checkCheckbox(0);
    await checkboxPage.checkCheckbox(1);
    states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([true, true]);
  });
});