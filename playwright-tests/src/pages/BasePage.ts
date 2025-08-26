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
  
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
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