export const calendarTodosStorageKey = 'tools.calendar-todos.items';
export const calendarTodosStorageVersion = 3;
const maxCheckInDates = 3660;
const maxCheckIns = 100;
const maxTodoItems = 500;
const maxTodoTitleLength = 120;

export type CalendarTodosStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export type TodoStatus = 'not-started' | 'in-progress' | 'completed';

export type CheckInFrequency = 'daily' | 'weekly' | 'monthly';

export type TodoItem = Readonly<{
  id: string;
  date: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
}>;

export type CheckInItem = Readonly<{
  id: string;
  title: string;
  frequency: CheckInFrequency;
  startDate: string;
  weekday?: number;
  dayOfMonth?: number;
  weekdays?: readonly number[];
  monthDays?: readonly number[];
  dates: readonly string[];
  createdAt: string;
}>;

export type CalendarTodosData = Readonly<{
  todos: readonly TodoItem[];
  checkIns: readonly CheckInItem[];
}>;

type LegacyTodoItem = Readonly<{
  id: string;
  date: string;
  title: string;
  completed: boolean;
  createdAt: string;
}>;

type CalendarTodosDocument = Readonly<{
  version: typeof calendarTodosStorageVersion;
  todos: readonly TodoItem[];
  checkIns: readonly CheckInItem[];
}>;

function isDateKey(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return (
    date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
  );
}

function isRecordTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isRecordBase(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isTodoStatus(value: unknown): value is TodoStatus {
  return value === 'not-started' || value === 'in-progress' || value === 'completed';
}

function hasValidRecordFields(record: Record<string, unknown>): boolean {
  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    typeof record.title === 'string' &&
    record.title.trim().length > 0 &&
    record.title.length <= maxTodoTitleLength &&
    isRecordTimestamp(record.createdAt)
  );
}

function isTodoItem(value: unknown): value is TodoItem {
  if (!isRecordBase(value) || !hasValidRecordFields(value)) {
    return false;
  }

  return typeof value.date === 'string' && isDateKey(value.date) && isTodoStatus(value.status);
}

function isLegacyTodoItem(value: unknown): value is LegacyTodoItem {
  if (!isRecordBase(value) || !hasValidRecordFields(value)) {
    return false;
  }

  return (
    typeof value.date === 'string' && isDateKey(value.date) && typeof value.completed === 'boolean'
  );
}

function isCheckInFrequency(value: unknown): value is CheckInFrequency {
  return value === 'daily' || value === 'weekly' || value === 'monthly';
}

function isOptionalIntegerInRange(value: unknown, min: number, max: number): boolean {
  return (
    value === undefined ||
    (typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max)
  );
}

function isOptionalIntegerArrayInRange(value: unknown, min: number, max: number): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every(
        (item) => typeof item === 'number' && Number.isInteger(item) && item >= min && item <= max,
      ))
  );
}

function isCheckInItem(value: unknown): value is CheckInItem {
  if (!isRecordBase(value) || !hasValidRecordFields(value) || !Array.isArray(value.dates)) {
    return false;
  }

  return (
    isCheckInFrequency(value.frequency) &&
    typeof value.startDate === 'string' &&
    isDateKey(value.startDate) &&
    isOptionalIntegerInRange(value.weekday, 0, 6) &&
    isOptionalIntegerInRange(value.dayOfMonth, 1, 31) &&
    isOptionalIntegerArrayInRange(value.weekdays, 0, 6) &&
    isOptionalIntegerArrayInRange(value.monthDays, 1, 31) &&
    value.dates.every((date) => typeof date === 'string' && isDateKey(date))
  );
}

function isCalendarTodosDocument(value: unknown): value is CalendarTodosDocument {
  if (!isRecordBase(value)) {
    return false;
  }

  return (
    value.version === calendarTodosStorageVersion &&
    Array.isArray(value.todos) &&
    Array.isArray(value.checkIns)
  );
}

function legacyTodos(items: readonly unknown[]): readonly TodoItem[] {
  return items.filter(isLegacyTodoItem).map((item) => ({
    id: item.id,
    date: item.date,
    title: item.title,
    status: item.completed ? 'completed' : 'not-started',
    createdAt: item.createdAt,
  }));
}

function sanitizeCheckIns(items: readonly unknown[]): readonly CheckInItem[] {
  return items
    .filter(isCheckInItem)
    .slice(0, maxCheckIns)
    .map((item) => ({
      ...item,
      ...(item.frequency === 'weekly'
        ? {
            weekdays: item.weekdays ?? [
              item.weekday ?? new Date(`${item.startDate}T00:00:00`).getDay(),
            ],
          }
        : {}),
      ...(item.frequency === 'monthly'
        ? {
            monthDays: item.monthDays ?? [
              item.dayOfMonth ?? new Date(`${item.startDate}T00:00:00`).getDate(),
            ],
          }
        : {}),
      dates: [...new Set(item.dates)].slice(0, maxCheckInDates),
    }));
}

function migrateLegacyCheckIns(items: readonly unknown[]): readonly CheckInItem[] {
  return items
    .filter(isRecordBase)
    .filter((item) => {
      return (
        hasValidRecordFields(item) &&
        Array.isArray(item.dates) &&
        item.dates.every((date) => typeof date === 'string' && isDateKey(date))
      );
    })
    .slice(0, maxCheckIns)
    .map((item) => {
      const dates = [...new Set(item.dates as string[])].slice(0, maxCheckInDates);
      const createdAt = item.createdAt as string;
      const startDate = dates[0] ?? createdAt.slice(0, 10);
      return {
        id: item.id as string,
        title: item.title as string,
        frequency: 'daily',
        startDate: isDateKey(startDate) ? startDate : dateKeyFromTimestamp(createdAt),
        dates,
        createdAt,
      };
    });
}

function dateKeyFromTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function sanitizeTodos(items: readonly unknown[]): readonly TodoItem[] {
  return items.filter(isTodoItem).slice(0, maxTodoItems);
}

export function loadCalendarTodos(storage: CalendarTodosStorage): CalendarTodosData {
  const stored = storage.getItem(calendarTodosStorageKey);
  if (!stored) {
    return { todos: [], checkIns: [] };
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return { todos: legacyTodos(parsed).slice(0, maxTodoItems), checkIns: [] };
    }

    if (isCalendarTodosDocument(parsed)) {
      return {
        todos: sanitizeTodos(parsed.todos),
        checkIns: sanitizeCheckIns(parsed.checkIns),
      };
    }

    if (
      isRecordBase(parsed) &&
      parsed.version === 2 &&
      Array.isArray(parsed.todos) &&
      Array.isArray(parsed.checkIns)
    ) {
      return {
        todos: sanitizeTodos(parsed.todos),
        checkIns: migrateLegacyCheckIns(parsed.checkIns),
      };
    }

    if (isRecordBase(parsed) && parsed.version === 1 && Array.isArray(parsed.items)) {
      return { todos: legacyTodos(parsed.items).slice(0, maxTodoItems), checkIns: [] };
    }
  } catch {
    return { todos: [], checkIns: [] };
  }

  return { todos: [], checkIns: [] };
}

export function saveCalendarTodos(storage: CalendarTodosStorage, data: CalendarTodosData): void {
  storage.setItem(
    calendarTodosStorageKey,
    JSON.stringify({
      version: calendarTodosStorageVersion,
      todos: sanitizeTodos(data.todos),
      checkIns: sanitizeCheckIns(data.checkIns),
    }),
  );
}
