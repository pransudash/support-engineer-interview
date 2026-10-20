import { expect, type Page } from '@playwright/test';
export async function setScenario(page: Page, scenario: string) {
  await page.goto('/');
  await page.getByText('Interview controls', { exact: true }).click();
  const control = page.getByLabel('Scenario');
  if (await control.inputValue() === scenario) {
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Reset demo' }).click()]);
  } else {
    await Promise.all([page.waitForEvent('load'), control.selectOption(scenario)]);
  }
  await expect(page.getByRole('heading', { name: 'Patient directory' })).toBeVisible();
}
export async function openPatient(page: Page, id = 'PT-1001') {
  await page.goto('/');
  await page.getByLabel('Patient name or ID').fill(id);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(`Open .*${id}`) }).click();
}
