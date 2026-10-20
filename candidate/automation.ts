import type { Page } from '@playwright/test';
export const REFERENCE_TIME = '2026-10-20T09:00:00-07:00';
export interface Slot { date: string; time: string; provider: string; location: string }
export interface Appointment extends Slot { id: string }
export type LookupResult = { status: 'found'; appointment: Appointment }
  | { status: 'patient_not_found' | 'no_upcoming_appointments' };
export interface RescheduleRequest { patientId: string; appointmentId: string; target: Slot }
export interface RescheduleResult {
  status: 'rescheduled' | 'already_matches' | 'slot_unavailable' | 'failed' | 'needs_review';
  detail: string;
}
export async function findNextAppointment(page: Page, patientId: string): Promise<LookupResult> {
  // TODO: Navigate using the UI, identify the exact patient, and return the next scheduled appointment.
  throw new Error('Not implemented: findNextAppointment');
}
export async function rescheduleAppointment(page: Page, request: RescheduleRequest): Promise<RescheduleResult> {
  // TODO: Use the UI to update the exact appointment and verify persisted state.
  throw new Error('Not implemented: rescheduleAppointment');
}
