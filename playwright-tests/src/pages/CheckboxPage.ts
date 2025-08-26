import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckboxPage extends BasePage {
  readonly form: Locator;
  readonly checkboxes: Locator;
  readonly pageHeading: Locator;
  
  constructor(page: Page) {
    super(page);
    this.form = page.locator('#checkboxes');
    this.checkboxes = page.locator('#checkboxes input[type="checkbox"]');
    this.pageHeading = page.locator('h3', { hasText: 'Checkboxes' });
  }
  
  async gotoCheckboxes(): Promise<void> {
    await super.goto('/checkboxes');
    await this.pageHeading.waitFor();
  }
  
  // Get specific checkbox by index (0-based)
  getCheckbox(index: number): Locator {
    return this.checkboxes.nth(index);
  }
  
  // Check a checkbox if not already checked
  async checkCheckbox(index: number): Promise<CheckboxPage> {
    const checkbox = this.getCheckbox(index);
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
    }
    return this;
  }
  
  // Uncheck a checkbox if checked
  async uncheckCheckbox(index: number): Promise<CheckboxPage> {
    const checkbox = this.getCheckbox(index);
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await checkbox.uncheck();
    }
    return this;
  }
  
  // Verify both property and attribute (due to custom JS)
  async isCheckboxChecked(index: number): Promise<boolean> {
    const checkbox = this.getCheckbox(index);
    const propertyChecked = await checkbox.isChecked();
    return propertyChecked;
  }
  
  // Verify property and attribute sync
  async verifyCheckboxSync(index: number): Promise<void> {
    const checkbox = this.getCheckbox(index);
    const propertyChecked = await checkbox.isChecked();
    const attributeChecked = await checkbox.getAttribute('checked') !== null;
    
    // Both should match due to the custom JavaScript
    expect(propertyChecked).toBe(attributeChecked);
  }
  
  // Get all checkbox states
  async getAllCheckboxStates(): Promise<boolean[]> {
    const count = await this.checkboxes.count();
    const states: boolean[] = [];
    for (let i = 0; i < count; i++) {
      states.push(await this.isCheckboxChecked(i));
    }
    return states;
  }
  
  // Get checkbox count
  async getCheckboxCount(): Promise<number> {
    return await this.checkboxes.count();
  }
}