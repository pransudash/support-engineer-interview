import { test, expect } from '@playwright/test';
import { findNextAppointment, rescheduleAppointment } from '../candidate/automation.js';
import { openPatient, setScenario } from './helpers.js';
const request = {patientId:'PT-1001',appointmentId:'APT-101',target:{date:'2026-10-23',time:'14:00',provider:'Dr. Priya Shah',location:'North Clinic'}};
test('easy: next scheduled appointment for the exact patient', async ({page}) => {
  await page.goto('/');
  expect(await findNextAppointment(page,'PT-1001')).toEqual({status:'found',appointment:{id:'APT-101',date:'2026-10-22',time:'09:30',provider:'Dr. Priya Shah',location:'North Clinic'}});
});
test('easy: patient missing', async ({page}) => {
  await page.goto('/');expect(await findNextAppointment(page,'PT-MISSING')).toEqual({status:'patient_not_found'});
});
test('easy: no appointments', async ({page}) => {
  await page.goto('/');expect(await findNextAppointment(page,'PT-1003')).toEqual({status:'no_upcoming_appointments'});
});
for (const [scenario,status] of Object.entries({normal:'rescheduled',rerender:'rescheduled',lost_confirmation:'rescheduled',save_failed:'failed',slot_taken:'slot_unavailable',already_done:'already_matches',unverifiable:'needs_review'})) {
  test(`follow-up: ${scenario}`, async ({page}) => {
    await setScenario(page,scenario);
    expect((await rescheduleAppointment(page,request)).status).toBe(status);
    if (scenario === 'unverifiable') return;
    await openPatient(page);
    const matches = ['rescheduled','already_matches'].includes(status);
    const row = page.getByTestId('appointment-APT-101');
    await expect(row).toContainText(matches ? request.target.date : '2026-10-22');
    await expect(row).toContainText(matches ? request.target.time : '09:30');
    await expect(row).toContainText(request.target.provider);
    await expect(row).toContainText(request.target.location);
    await expect(page.getByTestId('save-count')).toHaveText(`Successful saves: ${status === 'rescheduled' ? 1 : 0}`);
    await expect(page.getByTestId('appointment-APT-104')).toContainText('2026-11-02');
    await openPatient(page, 'PT-1002'); await expect(page.getByTestId('appointment-APT-201')).toContainText('2026-10-21');
    if (status === 'rescheduled') {
      expect((await rescheduleAppointment(page,request)).status).toBe('already_matches');
      await openPatient(page); await expect(page.getByTestId('save-count')).toHaveText('Successful saves: 1');
    }
  });
}
