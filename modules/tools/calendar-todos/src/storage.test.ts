import { describe, expect, it } from 'vitest';
import {
  calendarTodosStorageKey,
  calendarTodosStorageVersion,
  loadCalendarTodos,
  saveCalendarTodos,
  type CalendarTodosData,
} from './storage';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

const data: CalendarTodosData = {
  todos: [
    {
      id: 'todo-1',
      date: '2026-08-26',
      title: '整理本周计划',
      status: 'not-started',
      createdAt: '2026-08-26T09:00:00.000Z',
    },
  ],
  checkIns: [
    {
      id: 'check-in-1',
      title: '阅读 30 分钟',
      frequency: 'daily',
      startDate: '2026-08-26',
      dates: ['2026-08-26'],
      createdAt: '2026-08-26T09:00:00.000Z',
    },
  ],
  notes: [
    {
      date: '2026-08-26',
      content: '完成周计划初稿。',
      updatedAt: '2026-08-26T09:30:00.000Z',
    },
  ],
};

describe('calendar todo storage', () => {
  it('persists tasks and check-ins only in the calendar todo namespace', () => {
    const storage = createStorage();

    saveCalendarTodos(storage, data);

    expect(loadCalendarTodos(storage)).toEqual(data);
    expect(storage.values.has(calendarTodosStorageKey)).toBe(true);
    expect(JSON.parse(storage.values.get(calendarTodosStorageKey) ?? '')).toEqual({
      version: calendarTodosStorageVersion,
      ...data,
    });
    expect(storage.values.has('tools.text-workbench.draft')).toBe(false);
  });

  it('migrates legacy array and version one records into task statuses', () => {
    const storage = createStorage();
    const legacyTodo = {
      id: data.todos[0].id,
      date: data.todos[0].date,
      title: data.todos[0].title,
      completed: true,
      createdAt: data.todos[0].createdAt,
    };
    storage.setItem(calendarTodosStorageKey, JSON.stringify([legacyTodo]));

    expect(loadCalendarTodos(storage)).toEqual({
      todos: [{ ...data.todos[0], status: 'completed' }],
      checkIns: [],
      notes: [],
    });

    storage.setItem(calendarTodosStorageKey, JSON.stringify({ version: 1, items: [legacyTodo] }));
    expect(loadCalendarTodos(storage).todos[0]).toMatchObject({ status: 'completed' });
  });

  it('ignores malformed task and check-in records', () => {
    const storage = createStorage();
    storage.setItem(
      calendarTodosStorageKey,
      JSON.stringify({
        version: calendarTodosStorageVersion,
        todos: [{ ...data.todos[0], date: '2026-99-99' }],
        checkIns: [{ ...data.checkIns[0], dates: ['not-a-date'] }],
      }),
    );

    expect(loadCalendarTodos(storage)).toEqual({ todos: [], checkIns: [], notes: [] });
  });

  it('migrates the removed in-progress status to not-started', () => {
    const storage = createStorage();
    const legacyTodo = { ...data.todos[0], status: 'in-progress' as const };
    storage.setItem(
      calendarTodosStorageKey,
      JSON.stringify({
        version: calendarTodosStorageVersion,
        todos: [legacyTodo],
        checkIns: [],
        notes: [],
      }),
    );

    expect(loadCalendarTodos(storage).todos[0]).toMatchObject({ status: 'not-started' });
  });

  it('migrates version two check-ins to daily schedules', () => {
    const storage = createStorage();
    storage.setItem(
      calendarTodosStorageKey,
      JSON.stringify({
        version: 2,
        todos: [],
        checkIns: [{ ...data.checkIns[0], frequency: undefined, startDate: undefined }],
      }),
    );

    expect(loadCalendarTodos(storage).checkIns).toEqual([
      { ...data.checkIns[0], frequency: 'daily', startDate: '2026-08-26' },
    ]);
  });

  it('migrates version three records without daily notes', () => {
    const storage = createStorage();
    storage.setItem(
      calendarTodosStorageKey,
      JSON.stringify({
        version: 3,
        todos: data.todos,
        checkIns: data.checkIns,
      }),
    );

    expect(loadCalendarTodos(storage)).toEqual({
      todos: data.todos,
      checkIns: data.checkIns,
      notes: [],
    });
  });

  it('migrates version four records and keeps scheduled times', () => {
    const storage = createStorage();
    const scheduledTodo = { ...data.todos[0], startTime: '09:00', endTime: '10:30' };
    storage.setItem(
      calendarTodosStorageKey,
      JSON.stringify({
        version: 4,
        todos: [scheduledTodo],
        checkIns: data.checkIns,
        notes: data.notes,
      }),
    );

    expect(loadCalendarTodos(storage).todos[0]).toMatchObject({
      startTime: '09:00',
      endTime: '10:30',
    });
  });

  it('ignores invalid or reversed time ranges', () => {
    const storage = createStorage();
    storage.setItem(
      calendarTodosStorageKey,
      JSON.stringify({
        version: calendarTodosStorageVersion,
        todos: [
          { ...data.todos[0], startTime: '09:00', endTime: '08:30' },
          { ...data.todos[0], id: 'todo-2', startTime: '25:00', endTime: '26:00' },
          { ...data.todos[0], id: 'todo-3', startTime: '09:00' },
        ],
        checkIns: [],
        notes: [],
      }),
    );

    expect(loadCalendarTodos(storage).todos).toEqual([]);
  });
});
