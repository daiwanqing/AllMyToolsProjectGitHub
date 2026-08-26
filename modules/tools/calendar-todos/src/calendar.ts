export type CalendarDay = Readonly<{
  date: Date;
  key: string;
  inCurrentMonth: boolean;
}>;

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) {
    return undefined;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dateKey(date) === key ? date : undefined;
}

export function monthTitle(month: Date): string {
  return `${month.getFullYear()}年${month.getMonth() + 1}月`;
}

export function moveMonth(month: Date, offset: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + offset, 1);
}

export function yearMonths(year: number): readonly Date[] {
  return Array.from({ length: 12 }, (_, month) => new Date(year, month, 1));
}

export function calendarDays(month: Date): readonly CalendarDay[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return {
      date,
      key: dateKey(date),
      inCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}
