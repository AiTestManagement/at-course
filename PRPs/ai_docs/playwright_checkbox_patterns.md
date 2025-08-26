# Playwright TypeScript Checkbox Testing Patterns

## Critical Implementation Details for the-internet.herokuapp.com/checkboxes

### DOM Structure Analysis
The checkbox page has unique implementation details that require specific handling:

```html
<div class="example">
  <h3>Checkboxes</h3>
  <form id='checkboxes'>
    <input type="checkbox"> checkbox 1</br>
    <input type="checkbox" checked> checkbox 2
  </form>
</div>
```

### JavaScript Behavior (CRITICAL)
The checkboxes have custom JavaScript that synchronizes the `checked` attribute with the `checked` property:

```javascript
checkboxes[i].onclick = function() {
  this.checked ? this.setAttribute("checked", "") : this.removeAttribute("checked");
}
```

**IMPORTANT**: This means you must verify BOTH the property AND attribute when testing checkbox state.

## Playwright Implementation Pattern

### CheckboxPage Class Structure

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class CheckboxPage {
  readonly page: Page;
  readonly form: Locator;
  readonly checkboxes: Locator;
  readonly pageHeading: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#checkboxes');
    this.checkboxes = page.locator('#checkboxes input[type="checkbox"]');
    this.pageHeading = page.locator('h3', { hasText: 'Checkboxes' });
  }
  
  async goto() {
    await this.page.goto('/checkboxes');
    await this.pageHeading.waitFor();
  }
  
  // Get specific checkbox by index (0-based)
  getCheckbox(index: number): Locator {
    return this.checkboxes.nth(index);
  }
  
  // Check a checkbox if not already checked
  async checkCheckbox(index: number): Promise<void> {
    const checkbox = this.getCheckbox(index);
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
    }
  }
  
  // Uncheck a checkbox if checked
  async uncheckCheckbox(index: number): Promise<void> {
    const checkbox = this.getCheckbox(index);
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await checkbox.uncheck();
    }
  }
  
  // Verify both property and attribute (due to custom JS)
  async isCheckboxChecked(index: number): Promise<boolean> {
    const checkbox = this.getCheckbox(index);
    const propertyChecked = await checkbox.isChecked();
    const attributeChecked = await checkbox.getAttribute('checked') !== null;
    
    // Both should match due to the custom JavaScript
    expect(propertyChecked).toBe(attributeChecked);
    return propertyChecked;
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
}
```

## Test Implementation Patterns

### Essential Test Scenarios

```typescript
import { test, expect } from '@playwright/test';
import { CheckboxPage } from '../pages/CheckboxPage';

test.describe('Checkbox Functionality', () => {
  let checkboxPage: CheckboxPage;
  
  test.beforeEach(async ({ page }) => {
    checkboxPage = new CheckboxPage(page);
    await checkboxPage.goto();
  });
  
  test('verify initial checkbox states', async () => {
    // Checkbox 1 should be unchecked, Checkbox 2 should be checked
    const states = await checkboxPage.getAllCheckboxStates();
    expect(states).toEqual([false, true]);
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
    // Click on the text "checkbox 1" - should NOT toggle the checkbox
    await page.getByText('checkbox 1').click();
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(false);
  });
  
  test('keyboard interaction with checkboxes', async () => {
    const checkbox = checkboxPage.getCheckbox(0);
    await checkbox.focus();
    await checkbox.press('Space');
    expect(await checkboxPage.isCheckboxChecked(0)).toBe(true);
  });
});
```

## Edge Cases and Gotchas

### 1. Attribute vs Property Synchronization
The custom JavaScript maintains both the `checked` property and `checked` attribute. Always verify both are in sync:

```typescript
const propertyChecked = await checkbox.isChecked();
const attributeChecked = await checkbox.getAttribute('checked') !== null;
expect(propertyChecked).toBe(attributeChecked);
```

### 2. No Label Elements
The checkbox text is NOT in `<label>` elements, so:
- Clicking the text won't toggle checkboxes
- Can't use `getByLabel()` locator
- Must click directly on the checkbox input

### 3. Form Has No Submit
The form has no submit button or action, so:
- No form submission testing needed
- Focus purely on checkbox state management
- No server-side validation to consider

### 4. Browser Differences
Different browsers may handle the custom JavaScript slightly differently. Always test across all target browsers:

```typescript
test.describe.parallel('Cross-browser checkbox tests', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`checkbox behavior in ${browserName}`, async ({ page, browserName }) => {
      // Test implementation
    });
  });
});
```

## Locator Strategies

### Recommended Approaches
1. **By ID for form**: `#checkboxes`
2. **By type for checkboxes**: `input[type="checkbox"]`
3. **By index**: `.nth(index)` for specific checkboxes
4. **Avoid**: CSS positional selectors that might break

### Anti-Patterns to Avoid
- Don't use text content to locate checkboxes (text is not in labels)
- Don't assume checkbox order will never change
- Don't use absolute XPath
- Don't rely on CSS classes that might change

## Performance Considerations

### Efficient State Checking
Instead of multiple individual checks, batch operations:

```typescript
// Inefficient
const state1 = await checkboxPage.isCheckboxChecked(0);
const state2 = await checkboxPage.isCheckboxChecked(1);

// Efficient
const states = await checkboxPage.getAllCheckboxStates();
```

### Wait Strategies
The page is simple with no dynamic loading, but still:
- Wait for the heading to ensure page is loaded
- No need for `networkidle` or complex waits
- Simple `waitFor()` on key elements is sufficient

## Visual Testing Considerations

For visual regression testing:

```typescript
test('checkbox visual appearance', async ({ page }) => {
  await checkboxPage.goto();
  await expect(page).toHaveScreenshot('checkboxes-initial.png', {
    fullPage: false,
    clip: { x: 0, y: 0, width: 400, height: 200 }
  });
  
  await checkboxPage.checkCheckbox(0);
  await expect(page).toHaveScreenshot('checkbox-checked.png', {
    fullPage: false,
    clip: { x: 0, y: 0, width: 400, height: 200 }
  });
});
```

## Data-Driven Testing Pattern

```typescript
const testCases = [
  { initial: [false, true], action: 'check-0', expected: [true, true] },
  { initial: [false, true], action: 'uncheck-1', expected: [false, false] },
  { initial: [false, true], action: 'toggle-both', expected: [true, false] },
];

testCases.forEach(({ initial, action, expected }) => {
  test(`checkbox state transition: ${action}`, async () => {
    // Implementation
  });
});
```