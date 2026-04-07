import { type Page, type Locator, expect } from '@playwright/test';

export class OraclePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/oracle');
    await this.page.getByRole('heading', { name: '档案中心' }).waitFor();
  }

  async expectCardCount(count: number) {
    await expect(this.page.locator('.archive-card')).toHaveCount(count);
  }

  getCard(index: number) {
    return this.page.locator('.archive-card').nth(index);
  }

  async clickCard(index: number) {
    await this.getCard(index).click();
  }

  async filterBySource(sourceLabel: string) {
    await this.page.locator('.filter-btn', { hasText: sourceLabel }).click();
  }

  async expectSourceFilterActive(sourceLabel: string) {
    await expect(
      this.page.locator('.filter-btn.active', { hasText: sourceLabel }),
    ).toBeVisible();
  }
}
