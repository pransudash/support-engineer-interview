import { test, expect } from '@playwright/test';
import { openPatient, setScenario } from './helpers.js';
test('search distinguishes duplicate names and handles empty results', async ({ page }) => {
  await page.goto('/'); await page.getByLabel('Patient name or ID').fill('Alex Morgan');
  await page.getByRole('button', {name:'Search',exact:true}).click();
  await expect(page.getByRole('button', {name:/Open Alex Morgan/})).toHaveCount(2);
  await openPatient(page, 'PT-1003'); await expect(page.getByText('No appointments', {exact:true})).toBeVisible();
  await page.getByLabel('Patient name or ID').fill('PT-MISSING');
  await page.getByRole('button', {name:'Search',exact:true}).click();
  await expect(page.getByText('No patients found')).toBeVisible();
});
for (const scenario of ['normal','rerender','lost_confirmation','save_failed','slot_taken','unverifiable']) {
  test(`demo behavior: ${scenario}`, async ({ page }) => {
    await setScenario(page, scenario); await openPatient(page);
    await page.getByRole('button', {name:'Reschedule APT-101',exact:true}).click();
    await page.getByLabel('Available slot').selectOption('target');
    await page.getByRole('button', {name:'Save appointment',exact:true}).click();
    const message = scenario === 'slot_taken' ? 'Slot unavailable. No changes were saved.'
      : scenario === 'save_failed' ? 'Save failed. No changes were saved.'
      : ['lost_confirmation','unverifiable'].includes(scenario) ? 'Connection interrupted. Save outcome unknown.' : 'Appointment saved';
    await expect(page.getByText(message,{exact:true})).toBeVisible();
    await openPatient(page);
    if (scenario === 'unverifiable') {
      await expect(page.getByRole('alert')).toContainText('Unable to verify'); return;
    }
    const changed = !['save_failed','slot_taken'].includes(scenario);
    await expect(page.getByTestId('appointment-APT-101')).toContainText(changed ? '2026-10-23' : '2026-10-22');
    await expect(page.getByTestId('save-count')).toHaveText(`Successful saves: ${changed ? 1 : 0}`);
    await expect(page.getByTestId('appointment-APT-104')).toContainText('2026-11-02');
    await openPatient(page, 'PT-1002'); await expect(page.getByTestId('appointment-APT-201')).toContainText('2026-10-21');
  });
}
test('already done seed and reset', async ({page}) => {
  await setScenario(page,'already_done'); await openPatient(page);
  await expect(page.getByTestId('appointment-APT-101')).toContainText('2026-10-23');
  await expect(page.getByTestId('save-count')).toHaveText('Successful saves: 0');
  await setScenario(page,'normal'); await openPatient(page);
  await expect(page.getByTestId('appointment-APT-101')).toContainText('2026-10-22');
});
