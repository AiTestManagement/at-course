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