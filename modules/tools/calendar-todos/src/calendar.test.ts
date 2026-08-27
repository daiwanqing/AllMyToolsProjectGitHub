import { describe, expect, it } from 'vitest';
import type { CheckInItem } from './storage';
import { calendarDays, dateFromKey, dateKey, moveMonth, yearMonths } from './calendar';

describe('calendar helpers', () => {
  it('keeps dates in local calendar time and rejects invalid keys', () => {
    expect(dateKey(new Date(2026, 7, 26))).toBe('2026-08-26');
    expect(dateFromKey('2026-02-29')).toBeUndefined();
    expect(dateFromKey('2028-02-29')).toEqual(new Date(2028, 1, 29));
  });

  it('generates a Monday-first six-week calendar grid', () => {
    const days = calendarDays(new Date(2026, 7, 1));

    expect(days).toHaveLength(42);
    expect(days[0]?.key).toBe('2026-07-27');
    expect(days[5]?.key).toBe('2026-08-01');
    expect(days[5]?.inCurrentMonth).toBe(true);
    expect(moveMonth(new Date(2026, 0, 1), -1)).toEqual(new Date(2025, 11, 1));
    expect(yearMonths(2026)).toHaveLength(12);
    expect(yearMonths(2026)[0]).toEqual(new Date(2026, 0, 1));
    expect(yearMonths(2026)[11]).toEqual(new Date(2026, 11, 1));
  });
});

describe('check-in recurrence', () => {
  const item = (frequency: CheckInItem['frequency']): CheckInItem => ({
    id: 'check-in',
    title: '项目',
    frequency,
    startDate: '2026-08-26',
    dates: [],
    createdAt: '2026-08-26T09:00:00.000Z',
  });

  it('supports daily, weekly, and monthly schedules', async () => {
    const { isCheckInScheduledOnDate } = await import('./calendar');
    expect(isCheckInScheduledOnDate(item('daily'), '2026-08-27')).toBe(true);
    expect(isCheckInScheduledOnDate(item('weekly'), '2026-09-02')).toBe(true);
    expect(isCheckInScheduledOnDate(item('weekly'), '2026-09-03')).toBe(false);
    expect(isCheckInScheduledOnDate(item('monthly'), '2026-09-26')).toBe(true);
    expect(isCheckInScheduledOnDate(item('monthly'), '2026-09-27')).toBe(false);
    expect(isCheckInScheduledOnDate({ ...item('weekly'), weekdays: [1, 3] }, '2026-08-31')).toBe(
      true,
    );
    expect(isCheckInScheduledOnDate({ ...item('weekly'), weekdays: [1, 3] }, '2026-09-01')).toBe(
      false,
    );
    expect(isCheckInScheduledOnDate({ ...item('monthly'), monthDays: [5, 15] }, '2026-09-15')).toBe(
      true,
    );
    expect(isCheckInScheduledOnDate(item('daily'), '2026-08-25')).toBe(false);
  });
});
