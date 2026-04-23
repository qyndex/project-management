import { test, expect } from '@playwright/test';

test.describe('Kanban Board — home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the top navigation with Board and Calendar links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Board' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Calendar' })).toBeVisible();
  });

  test('renders all three kanban columns', async ({ page }) => {
    await expect(page.getByText('todo')).toBeVisible();
    await expect(page.getByText('in-progress')).toBeVisible();
    await expect(page.getByText('done')).toBeVisible();
  });

  test('renders initial seed tasks', async ({ page }) => {
    await expect(page.getByText('Design landing page')).toBeVisible();
    await expect(page.getByText('Implement auth')).toBeVisible();
    await expect(page.getByText('Write tests')).toBeVisible();
  });

  test('navigates to calendar page', async ({ page }) => {
    await page.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL('/calendar');
    // Calendar shows a month heading and day grid
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('calendar page shows day-of-week headers', async ({ page }) => {
    await page.goto('/calendar');
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      await expect(page.getByText(day)).toBeVisible();
    }
  });

  test('navigates back to board from calendar', async ({ page }) => {
    await page.goto('/calendar');
    await page.getByRole('link', { name: 'Board' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('todo')).toBeVisible();
  });
});
