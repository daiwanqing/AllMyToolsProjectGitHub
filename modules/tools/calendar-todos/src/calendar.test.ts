import { describe, expect, it } from 'vitest';
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
