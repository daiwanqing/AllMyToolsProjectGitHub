import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import {
  Button,
  ChoiceGroup,
  FloatingNotice,
  SelectField,
  StatusBadge,
  TextAreaField,
  TextField,
  ToggleField,
  type FloatingNoticeTone,
} from '@allmytools/ui';
import {
  calendarDays,
  dateFromKey,
  dateKey,
  isCheckInScheduledOnDate,
  monthTitle,
  moveMonth,
  yearMonths,
} from './calendar';
import { manifest } from './manifest';
import {
  loadCalendarTodos,
  saveCalendarTodos,
  type CalendarTodosData,
  type CheckInItem,
  type CheckInFrequency,
  type DailyNote,
  type TodoItem,
  type TodoStatus,
} from './storage';

export { manifest };

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const taskStatuses: readonly TodoStatus[] = ['not-started', 'completed'];
const taskStatusLabels: Readonly<Record<TodoStatus, string>> = {
  'not-started': '未开始',
  'in-progress': '进行中',
  completed: '已完成',
};
const checkInFrequencies: readonly { value: CheckInFrequency; label: string }[] = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
];
const weekdays: readonly { value: string; label: string }[] = [
  { value: '1', label: '星期一' },
  { value: '2', label: '星期二' },
  { value: '3', label: '星期三' },
  { value: '4', label: '星期四' },
  { value: '5', label: '星期五' },
  { value: '6', label: '星期六' },
  { value: '0', label: '星期日' },
];
const monthDays: readonly { value: string; label: string }[] = Array.from(
  { length: 31 },
  (_, index) => ({ value: String(index + 1), label: `${index + 1} 号` }),
);

type CalendarView = 'year' | 'month';

type TodoCounts = Readonly<Record<TodoStatus, number>>;
type DisplayTodo = TodoItem & Readonly<{ checkInId?: string }>;

type TodoNotice = Readonly<{
  id: string;
  message: string;
  tone: FloatingNoticeTone;
}>;

type CheckInDraft = Readonly<{
  title: string;
  frequency: CheckInFrequency;
  startDate: string;
  weekdays: readonly number[];
  monthDays: readonly number[];
}>;

function createRecordId(prefix: string): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function selectedDateTitle(key: string): string {
  const date = dateFromKey(key);
  return date ? `${date.getMonth() + 1}月${date.getDate()}日` : key;
}

function emptyCounts(): TodoCounts {
  return { 'not-started': 0, 'in-progress': 0, completed: 0 };
}

function statusLabel(counts: TodoCounts): string {
  return taskStatuses
    .filter((status) => counts[status])
    .map((status) => `${counts[status]} 项${taskStatusLabels[status]}`)
    .join('，');
}

function checkInScheduleDescription(item: CheckInItem): string {
  if (item.frequency === 'weekly') {
    const days = item.weekdays ?? [item.weekday ?? dateFromKey(item.startDate)?.getDay() ?? 0];
    return `每周${days.map((day) => ['日', '一', '二', '三', '四', '五', '六'][day]).join('、')}`;
  }
  if (item.frequency === 'monthly') {
    const days = item.monthDays ?? [item.dayOfMonth ?? dateFromKey(item.startDate)?.getDate() ?? 1];
    return `每月${days.join('、')}号`;
  }
  return '每日';
}

function createCheckInDraft(dateKey: string): CheckInDraft {
  const date = dateFromKey(dateKey);
  return {
    title: '',
    frequency: 'daily',
    startDate: dateKey,
    weekdays: [date?.getDay() ?? 1],
    monthDays: [date?.getDate() ?? 1],
  };
}

function checkInDraftFromItem(item: CheckInItem): CheckInDraft {
  return {
    title: item.title,
    frequency: item.frequency,
    startDate: item.startDate,
    weekdays: item.weekdays ?? [item.weekday ?? dateFromKey(item.startDate)?.getDay() ?? 0],
    monthDays: item.monthDays ?? [item.dayOfMonth ?? dateFromKey(item.startDate)?.getDate() ?? 1],
  };
}

export function ToolView() {
  const today = dateKey(new Date());
  const todayDate = dateFromKey(today);
  const [data, setData] = useState<CalendarTodosData>(() => loadCalendarTodos(window.localStorage));
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = dateFromKey(today) ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Readonly<Record<string, string>>>({});
  const [checkInDraft, setCheckInDraft] = useState<CheckInDraft>(() =>
    createCheckInDraft(selectedDate),
  );
  const [checkInDialog, setCheckInDialog] = useState<'create' | string | null>(null);
  const [showCheckInManager, setShowCheckInManager] = useState(false);
  const [draggedTodoId, setDraggedTodoId] = useState<string>();
  const [dragOverStatus, setDragOverStatus] = useState<TodoStatus>();
  const [notice, setNotice] = useState<TodoNotice>();
  const mouseDragCleanup = useRef<(() => void) | undefined>(undefined);

  const days = useMemo(() => calendarDays(visibleMonth), [visibleMonth]);
  const checkInTodos = useMemo<readonly DisplayTodo[]>(
    () =>
      data.checkIns.flatMap((item) =>
        Array.from(
          new Set(
            (calendarView === 'year'
              ? yearMonths(visibleMonth.getFullYear()).flatMap((month) => calendarDays(month))
              : calendarDays(visibleMonth)
            ).map((day) => day.key),
          ),
        )
          .filter((key) => isCheckInScheduledOnDate(item, key))
          .map((key) => ({
            id: `check-in:${item.id}:${key}`,
            date: key,
            title: `${item.title}（打卡）`,
            status: item.dates.includes(key) ? 'completed' : 'not-started',
            createdAt: item.createdAt,
            checkInId: item.id,
          })),
      ),
    [calendarView, data.checkIns, visibleMonth],
  );
  const allTodos = useMemo<readonly DisplayTodo[]>(
    () => [...data.todos, ...checkInTodos],
    [data.todos, checkInTodos],
  );
  const todoCountsByDate = useMemo(
    () =>
      allTodos.reduce<ReadonlyMap<string, TodoCounts>>((counts, todo) => {
        const next = new Map(counts);
        const current = next.get(todo.date) ?? emptyCounts();
        next.set(todo.date, { ...current, [todo.status]: current[todo.status] + 1 });
        return next;
      }, new Map()),
    [allTodos],
  );
  const notedDates = useMemo(() => new Set(data.notes.map((note) => note.date)), [data.notes]);
  const selectedTodos = allTodos.filter((todo) => todo.date === selectedDate);
  const selectedNote = data.notes.find((note) => note.date === selectedDate);
  const selectedNoteContent = selectedNote?.content ?? '';
  const noteDraft = noteDrafts[selectedDate] ?? selectedNoteContent;
  const todosByStatus = useMemo(
    () =>
      taskStatuses.reduce<Readonly<Record<TodoStatus, readonly DisplayTodo[]>>>(
        (groups, status) => ({
          ...groups,
          [status]: selectedTodos.filter((todo) => todo.status === status),
        }),
        { 'not-started': [], 'in-progress': [], completed: [] },
      ),
    [selectedTodos],
  );
  function commit(nextData: CalendarTodosData) {
    setData(nextData);
    saveCalendarTodos(window.localStorage, nextData);
  }

  function showNotice(message: string, tone: FloatingNoticeTone = 'info') {
    setNotice({ id: createRecordId('notice'), message, tone });
  }

  function chooseDate(key: string, zoomToMonth = false) {
    const date = dateFromKey(key);
    if (!date) {
      return;
    }

    setSelectedDate(key);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    if (zoomToMonth) {
      setCalendarView('month');
    }
  }

  function chooseMonth(month: Date) {
    setVisibleMonth(month);
    setCalendarView('month');
  }

  function moveCalendar(offset: number) {
    setVisibleMonth((month) =>
      calendarView === 'year'
        ? new Date(month.getFullYear() + offset, month.getMonth(), 1)
        : moveMonth(month, offset),
    );
  }

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTodoTitle.trim();
    if (!title) {
      return;
    }

    commit({
      ...data,
      todos: [
        ...data.todos,
        {
          id: createRecordId('todo'),
          date: selectedDate,
          title,
          status: 'not-started',
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setNewTodoTitle('');
    showNotice('待办已添加。');
  }

  function deleteTodo(id: string) {
    const todo = data.todos.find((item) => item.id === id);
    if (!todo) {
      return;
    }

    commit({ ...data, todos: data.todos.filter((item) => item.id !== id) });
    showNotice(`待办已删除：${todo.title}`);
  }

  function updateNoteDraft(content: string) {
    setNoteDrafts((drafts) => ({ ...drafts, [selectedDate]: content }));
  }

  function saveDailyNote() {
    const content = noteDraft.trim();
    if (content === selectedNoteContent) {
      return;
    }

    const notes = content
      ? [
          ...data.notes.filter((note) => note.date !== selectedDate),
          {
            date: selectedDate,
            content,
            updatedAt: new Date().toISOString(),
          } satisfies DailyNote,
        ]
      : data.notes.filter((note) => note.date !== selectedDate);
    commit({ ...data, notes });
    setNoteDrafts((drafts) => {
      const remainingDrafts = { ...drafts };
      delete remainingDrafts[selectedDate];
      return remainingDrafts;
    });
    showNotice(content ? '当日笔记已保存。' : '当日笔记已清空。');
  }

  function deleteDailyNote() {
    if (!selectedNote) {
      return;
    }

    commit({
      ...data,
      notes: data.notes.filter((note) => note.date !== selectedDate),
    });
    setNoteDrafts((drafts) => {
      const remainingDrafts = { ...drafts };
      delete remainingDrafts[selectedDate];
      return remainingDrafts;
    });
    showNotice('当日笔记已删除。');
  }

  function setTodoStatus(id: string, status: TodoStatus) {
    const todo = data.todos.find((item) => item.id === id);
    if (todo) {
      if (todo.status === status) {
        return;
      }

      commit({
        ...data,
        todos: data.todos.map((item) => (item.id === id ? { ...item, status } : item)),
      });
      showNotice(
        `${taskStatusLabels[status]}：${todo.title}`,
        status === 'completed' ? 'success' : 'info',
      );
      return;
    }

    const checkInTodo = checkInTodos.find((item) => item.id === id);
    if (!checkInTodo?.checkInId) {
      return;
    }
    const checkIn = data.checkIns.find((item) => item.id === checkInTodo.checkInId);
    if (!checkIn) {
      return;
    }
    const completed = status === 'completed';
    const checkInDate = checkInTodo.date;
    const alreadyCompleted = checkIn.dates.includes(checkInDate);
    if (completed === alreadyCompleted) {
      return;
    }
    commit({
      ...data,
      checkIns: data.checkIns.map((item) =>
        item.id === checkIn.id
          ? {
              ...item,
              dates: completed
                ? [...item.dates, checkInDate]
                : item.dates.filter((itemDate) => itemDate !== checkInDate),
            }
          : item,
      ),
    });
    showNotice(
      `${completed ? '已完成打卡' : '已取消打卡'}：${checkIn.title}`,
      completed ? 'success' : 'info',
    );
  }

  function toggleTodoCompletion(todo: DisplayTodo) {
    setTodoStatus(todo.id, todo.status === 'completed' ? 'not-started' : 'completed');
  }

  function startDragging(event: DragEvent<HTMLLIElement>, id: string) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    setDraggedTodoId(id);
  }

  function startPointerDragging(event: PointerEvent<HTMLLIElement>, todo: DisplayTodo) {
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDraggedTodoId(todo.id);
  }

  function finishPointerDragging(event: PointerEvent<HTMLLIElement>, todo: DisplayTodo) {
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-todo-status]');
    const status = target?.dataset.todoStatus as TodoStatus | undefined;
    if (status) {
      setTodoStatus(todo.id, status);
    }
    if (
      typeof event.currentTarget.hasPointerCapture === 'function' &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggedTodoId(undefined);
    setDragOverStatus(undefined);
  }

  function movePointerDragging(event: PointerEvent<HTMLLIElement>) {
    if (!draggedTodoId) {
      return;
    }
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-todo-status]');
    setDragOverStatus((target?.dataset.todoStatus as TodoStatus | undefined) ?? undefined);
  }

  function startMouseDragging(event: MouseEvent<HTMLLIElement>, todo: DisplayTodo) {
    mouseDragCleanup.current?.();
    setDraggedTodoId(todo.id);

    const updateTarget = (clientX: number, clientY: number) => {
      const target = document
        .elementFromPoint(clientX, clientY)
        ?.closest<HTMLElement>('[data-todo-status]');
      setDragOverStatus((target?.dataset.todoStatus as TodoStatus | undefined) ?? undefined);
    };
    const handleMove = (moveEvent: globalThis.MouseEvent) => {
      updateTarget(moveEvent.clientX, moveEvent.clientY);
    };
    const handleUp = (upEvent: globalThis.MouseEvent) => {
      const target = document
        .elementFromPoint(upEvent.clientX, upEvent.clientY)
        ?.closest<HTMLElement>('[data-todo-status]');
      const status = target?.dataset.todoStatus as TodoStatus | undefined;
      if (status) {
        setTodoStatus(todo.id, status);
      }
      mouseDragCleanup.current?.();
      setDraggedTodoId(undefined);
      setDragOverStatus(undefined);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    mouseDragCleanup.current = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      mouseDragCleanup.current = undefined;
    };
    event.preventDefault();
  }

  function dropTodo(event: DragEvent<HTMLElement>, status: TodoStatus) {
    event.preventDefault();
    const id = draggedTodoId ?? event.dataTransfer.getData('text/plain');
    if (id) {
      setTodoStatus(id, status);
    }
    setDraggedTodoId(undefined);
    setDragOverStatus(undefined);
  }

  function moveTodoByKeyboard(todo: DisplayTodo, offset: number) {
    const currentIndex = taskStatuses.indexOf(todo.status);
    const nextStatus = taskStatuses[currentIndex + offset];
    if (nextStatus) {
      setTodoStatus(todo.id, nextStatus);
    }
  }

  function openCreateCheckIn() {
    setCheckInDraft(createCheckInDraft(selectedDate));
    setCheckInDialog('create');
  }

  function openEditCheckIn(id: string) {
    const item = data.checkIns.find((checkIn) => checkIn.id === id);
    if (!item) {
      return;
    }
    setCheckInDraft(checkInDraftFromItem(item));
    setCheckInDialog(id);
  }

  function closeCheckInDialog() {
    setCheckInDialog(null);
  }

  function saveCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = checkInDraft.title.trim();
    if (!title) {
      return;
    }
    if (checkInDraft.frequency === 'weekly' && !checkInDraft.weekdays.length) {
      showNotice('请至少选择一个星期。', 'error');
      return;
    }
    if (checkInDraft.frequency === 'monthly' && !checkInDraft.monthDays.length) {
      showNotice('请至少选择一个日期。', 'error');
      return;
    }

    const fields = {
      title,
      frequency: checkInDraft.frequency,
      startDate: checkInDraft.startDate,
      ...(checkInDraft.frequency === 'weekly' ? { weekdays: checkInDraft.weekdays } : {}),
      ...(checkInDraft.frequency === 'monthly' ? { monthDays: checkInDraft.monthDays } : {}),
    };
    const isEditing = checkInDialog !== 'create' && checkInDialog !== null;
    commit({
      ...data,
      checkIns: isEditing
        ? data.checkIns.map((item) => (item.id === checkInDialog ? { ...item, ...fields } : item))
        : [
            ...data.checkIns,
            {
              id: createRecordId('check-in'),
              ...fields,
              dates: [],
              createdAt: new Date().toISOString(),
            },
          ],
    });
    closeCheckInDialog();
    showNotice(isEditing ? '打卡项目已更新。' : '打卡项目已添加。');
  }

  function toggleCheckIn(id: string) {
    const item = data.checkIns.find((checkIn) => checkIn.id === id);
    if (!item) {
      return;
    }

    if (!isCheckInScheduledOnDate(item, selectedDate)) {
      return;
    }

    const checked = item.dates.includes(selectedDate);
    const dates = checked
      ? item.dates.filter((date) => date !== selectedDate)
      : [...item.dates, selectedDate];
    commit({
      ...data,
      checkIns: data.checkIns.map((checkIn) =>
        checkIn.id === id ? { ...checkIn, dates } : checkIn,
      ),
    });
    showNotice(
      `${checked ? '已取消打卡' : '已完成打卡'}：${item.title}`,
      checked ? 'info' : 'success',
    );
  }

  function deleteCheckIn(id: string) {
    commit({ ...data, checkIns: data.checkIns.filter((item) => item.id !== id) });
    showNotice('打卡项目已删除。');
  }

  function renderMonthDay(day: (typeof days)[number]) {
    const counts = todoCountsByDate.get(day.key) ?? emptyCounts();
    const isToday = day.key === today;
    const isSelected = day.key === selectedDate;
    const hasNote = notedDates.has(day.key);
    const statuses = statusLabel(counts);
    const label = `${day.key}${!day.inCurrentMonth ? '，非当月' : ''}${isToday ? '，今天' : ''}${hasNote ? '，有笔记' : ''}${statuses ? `，${statuses}` : ''}`;

    return (
      <button
        key={day.key}
        type="button"
        role="gridcell"
        className="calendar-day"
        aria-label={label}
        aria-current={isToday ? 'date' : undefined}
        aria-selected={isSelected}
        data-outside-month={!day.inCurrentMonth || undefined}
        onClick={() => chooseDate(day.key)}
      >
        <span>{day.date.getDate()}</span>
        {hasNote ? <span className="calendar-day-note-indicator" aria-hidden="true" /> : null}
        {statuses ? (
          <span className="calendar-day-status" aria-hidden="true">
            {taskStatuses.map((status) =>
              counts[status] ? (
                <span key={status} className={`calendar-day-${status}`}>
                  {counts[status]}
                </span>
              ) : null,
            )}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <section className="calendar-todo-workspace" aria-labelledby="calendar-todo-heading">
      <div className="calendar-todo-heading">
        <div>
          <p className="eyebrow">日程</p>
          <h2 id="calendar-todo-heading">{showCheckInManager ? '周期打卡' : '日历待办'}</h2>
        </div>
        <div className="calendar-todo-heading-actions">
          <Button
            variant={showCheckInManager ? 'secondary' : 'ghost'}
            onClick={() => setShowCheckInManager((visible) => !visible)}
            aria-pressed={showCheckInManager}
          >
            {showCheckInManager ? '返回日历待办' : '周期打卡'}
          </Button>
          {!showCheckInManager ? (
            <Button variant="ghost" onClick={() => chooseDate(today)} aria-label="回到今天">
              今天
            </Button>
          ) : null}
        </div>
      </div>
      {notice ? (
        <FloatingNotice
          key={notice.id}
          title="日程已更新"
          tone={notice.tone}
          onDismiss={() => setNotice(undefined)}
        >
          {notice.message}
        </FloatingNotice>
      ) : null}
      {!showCheckInManager ? (
        <div className="calendar-todo-layout">
          <section className="calendar-panel" aria-label="日历">
            <div className="calendar-view-controls">
              <ChoiceGroup
                ariaLabel="日历视图"
                value={calendarView}
                onChange={(value) => setCalendarView(value as CalendarView)}
                options={[
                  { id: 'year', label: '全年' },
                  { id: 'month', label: '月历' },
                ]}
              />
              <div className="calendar-month-heading">
                <Button variant="ghost" aria-label="上一个周期" onClick={() => moveCalendar(-1)}>
                  上一个
                </Button>
                <h3>
                  {calendarView === 'year'
                    ? `${visibleMonth.getFullYear()} 年`
                    : monthTitle(visibleMonth)}
                </h3>
                <Button variant="ghost" aria-label="下一个周期" onClick={() => moveCalendar(1)}>
                  下一个
                </Button>
              </div>
            </div>
            <div
              className="calendar-view-stage"
              key={`${calendarView}-${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}
            >
              {calendarView === 'month' ? (
                <>
                  <div className="calendar-weekdays" aria-hidden="true">
                    {weekDays.map((weekday) => (
                      <span key={weekday}>{weekday}</span>
                    ))}
                  </div>
                  <div
                    className="calendar-grid"
                    role="grid"
                    aria-label={`${monthTitle(visibleMonth)}日历`}
                  >
                    {days.map(renderMonthDay)}
                  </div>
                </>
              ) : (
                <div
                  className="calendar-year-grid"
                  aria-label={`${visibleMonth.getFullYear()} 年日历概览`}
                >
                  {yearMonths(visibleMonth.getFullYear()).map((month) => {
                    const miniDays = calendarDays(month);
                    return (
                      <section
                        className="calendar-year-month"
                        key={month.getMonth()}
                        aria-label={monthTitle(month)}
                      >
                        <Button variant="ghost" onClick={() => chooseMonth(month)}>
                          {monthTitle(month)}
                        </Button>
                        <div className="calendar-mini-weekdays" aria-hidden="true">
                          {weekDays.map((weekday) => (
                            <span key={weekday}>{weekday}</span>
                          ))}
                        </div>
                        <div className="calendar-mini-grid">
                          {miniDays.map((day) => {
                            const counts = todoCountsByDate.get(day.key) ?? emptyCounts();
                            const statuses = statusLabel(counts);
                            const isCurrentMonth =
                              todayDate !== undefined &&
                              day.date.getFullYear() === todayDate.getFullYear() &&
                              day.date.getMonth() === todayDate.getMonth();
                            return (
                              <button
                                key={day.key}
                                type="button"
                                className="calendar-mini-day"
                                aria-label={`${day.key}${statuses ? `，${statuses}` : ''}`}
                                aria-current={day.key === today ? 'date' : undefined}
                                aria-pressed={day.key === selectedDate}
                                data-current-month={isCurrentMonth || undefined}
                                data-outside-month={!day.inCurrentMonth || undefined}
                                onClick={() => chooseDate(day.key, true)}
                              >
                                <span>{day.date.getDate()}</span>
                                {statuses ? <i aria-hidden="true" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
          <section className="todo-panel" aria-labelledby="selected-date-heading">
            <div className="todo-panel-heading">
              <div>
                <p className="eyebrow">所选日期</p>
                <h3 id="selected-date-heading">{selectedDateTitle(selectedDate)}</h3>
              </div>
              <StatusBadge
                tone={
                  selectedTodos.length && !todosByStatus['not-started'].length ? 'success' : 'info'
                }
              >
                {selectedTodos.length
                  ? `${todosByStatus.completed.length}/${selectedTodos.length} 已完成`
                  : '暂无待办'}
              </StatusBadge>
            </div>
            <form className="todo-create-form" onSubmit={addTodo}>
              <TextField
                label="新增待办"
                placeholder="写下要完成的事"
                value={newTodoTitle}
                maxLength={120}
                required
                onChange={(event) => setNewTodoTitle(event.target.value)}
              />
              <Button variant="primary" type="submit">
                添加
              </Button>
            </form>
            <div className="todo-board" aria-label={`${selectedDateTitle(selectedDate)}任务看板`}>
              {taskStatuses.map((status) => (
                <section
                  key={status}
                  className="todo-column"
                  aria-label={taskStatusLabels[status]}
                  data-todo-status={status}
                  data-drag-over={dragOverStatus === status || undefined}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverStatus(status);
                  }}
                  onDragLeave={() => setDragOverStatus(undefined)}
                  onDrop={(event) => dropTodo(event, status)}
                >
                  <div className="todo-column-heading">
                    <h4>{taskStatusLabels[status]}</h4>
                    <StatusBadge tone={status === 'completed' ? 'success' : 'neutral'}>
                      {todosByStatus[status].length}
                    </StatusBadge>
                  </div>
                  <ul className="todo-list" aria-label={`${taskStatusLabels[status]}任务`}>
                    {todosByStatus[status].map((todo) => (
                      <li
                        key={todo.id}
                        className="todo-item"
                        tabIndex={0}
                        aria-label={`${todo.title}，${taskStatusLabels[todo.status]}`}
                        data-dragging={draggedTodoId === todo.id || undefined}
                        draggable={false}
                        onMouseDown={(event) => startMouseDragging(event, todo)}
                        onPointerDown={(event) => startPointerDragging(event, todo)}
                        onPointerMove={movePointerDragging}
                        onPointerUp={(event) => finishPointerDragging(event, todo)}
                        onPointerCancel={() => {
                          setDraggedTodoId(undefined);
                          setDragOverStatus(undefined);
                        }}
                        onDragStart={(event) => startDragging(event, todo.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                            event.preventDefault();
                            moveTodoByKeyboard(todo, 1);
                          }
                          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                            event.preventDefault();
                            moveTodoByKeyboard(todo, -1);
                          }
                        }}
                        onDragEnd={() => {
                          setDraggedTodoId(undefined);
                          setDragOverStatus(undefined);
                        }}
                      >
                        <div className="todo-item-actions">
                          <label className="todo-item-content">
                            <input
                              type="checkbox"
                              checked={todo.status === 'completed'}
                              aria-label={`完成 ${todo.title}`}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              onChange={() => toggleTodoCompletion(todo)}
                            />
                            <span className="todo-item-title">{todo.title}</span>
                          </label>
                          {!todo.checkInId ? (
                            <Button
                              variant="danger"
                              aria-label={`删除 ${todo.title}`}
                              onMouseDown={(event) => event.stopPropagation()}
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={() => deleteTodo(todo.id)}
                            >
                              删除
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <section className="daily-note" aria-labelledby="daily-note-heading">
              <div className="todo-panel-heading">
                <div>
                  <p className="eyebrow">记录</p>
                  <h4 id="daily-note-heading">当日笔记</h4>
                </div>
              </div>
              <TextAreaField
                label={`${selectedDateTitle(selectedDate)}笔记`}
                description="记录当天想法、进展或补充信息。"
                rows={6}
                maxLength={5000}
                value={noteDraft}
                onChange={(event) => updateNoteDraft(event.target.value)}
              />
              <div className="daily-note-actions">
                <Button
                  variant="secondary"
                  onClick={saveDailyNote}
                  disabled={noteDraft.trim() === selectedNoteContent}
                >
                  保存笔记
                </Button>
                <Button variant="danger" onClick={deleteDailyNote} disabled={!selectedNote}>
                  删除笔记
                </Button>
              </div>
            </section>
          </section>
        </div>
      ) : (
        <section className="check-in-manager" aria-label="周期打卡项目">
          <ul className="check-in-list check-in-gallery" aria-label="周期打卡项目">
            <li className="check-in-gallery-item">
              <button type="button" className="check-in-add-card" onClick={openCreateCheckIn}>
                <span className="check-in-add-icon" aria-hidden="true">
                  +
                </span>
                <span>添加打卡</span>
              </button>
            </li>
            {data.checkIns.map((item: CheckInItem) => {
              const checked = item.dates.includes(selectedDate);
              const scheduled = isCheckInScheduledOnDate(item, selectedDate);
              return (
                <li
                  key={item.id}
                  className="check-in-item check-in-card"
                  data-checked={checked || undefined}
                  data-scheduled={scheduled || undefined}
                >
                  <div className="check-in-card-header">
                    <button
                      type="button"
                      className="check-in-card-main"
                      onClick={() => openEditCheckIn(item.id)}
                      aria-label={`编辑 ${item.title}`}
                    >
                      <strong>{item.title}</strong>
                      <small>
                        {checkInScheduleDescription(item)} · 开始于 {item.startDate}
                      </small>
                    </button>
                  </div>
                  <div className="check-in-card-actions">
                    <label className="check-in-card-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!scheduled}
                        aria-label={item.title}
                        onChange={() => toggleCheckIn(item.id)}
                      />
                      <span>{checked ? '今日已打卡' : scheduled ? '完成打卡' : '今日不打卡'}</span>
                    </label>
                    <Button variant="danger" onClick={() => deleteCheckIn(item.id)}>
                      删除
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {checkInDialog ? (
            <dialog
              open
              className="check-in-dialog"
              aria-labelledby="check-in-dialog-heading"
              aria-modal="true"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeCheckInDialog();
                }
              }}
              onCancel={(event) => {
                event.preventDefault();
                closeCheckInDialog();
              }}
            >
              <form className="check-in-dialog-form" onSubmit={saveCheckIn}>
                <div className="check-in-dialog-heading">
                  <p className="eyebrow">{checkInDialog === 'create' ? '新项目' : '编辑项目'}</p>
                  <h3 id="check-in-dialog-heading">
                    {checkInDialog === 'create' ? '添加打卡' : '修改打卡'}
                  </h3>
                </div>
                <TextField
                  label="打卡名称"
                  placeholder="例如：阅读 30 分钟"
                  value={checkInDraft.title}
                  maxLength={120}
                  required
                  autoFocus
                  onChange={(event) =>
                    setCheckInDraft((draft) => ({ ...draft, title: event.target.value }))
                  }
                />
                <SelectField
                  label="打卡周期"
                  value={checkInDraft.frequency}
                  options={checkInFrequencies}
                  onChange={(event) =>
                    setCheckInDraft((draft) => ({
                      ...draft,
                      frequency: event.target.value as CheckInFrequency,
                    }))
                  }
                />
                {checkInDraft.frequency === 'weekly' ? (
                  <fieldset className="check-in-options">
                    <legend>每周几（可多选）</legend>
                    <div className="check-in-option-grid">
                      {weekdays.map((weekday) => {
                        const value = Number(weekday.value);
                        return (
                          <ToggleField
                            key={weekday.value}
                            label={weekday.label}
                            checked={checkInDraft.weekdays.includes(value)}
                            onChange={() =>
                              setCheckInDraft((draft) => ({
                                ...draft,
                                weekdays: draft.weekdays.includes(value)
                                  ? draft.weekdays.filter((item) => item !== value)
                                  : [...draft.weekdays, value].sort(),
                              }))
                            }
                          />
                        );
                      })}
                    </div>
                  </fieldset>
                ) : null}
                {checkInDraft.frequency === 'monthly' ? (
                  <fieldset className="check-in-options">
                    <legend>每月几号（可多选）</legend>
                    <div className="check-in-option-grid check-in-month-option-grid">
                      {monthDays.map((monthDay) => {
                        const value = Number(monthDay.value);
                        return (
                          <ToggleField
                            key={monthDay.value}
                            label={monthDay.label}
                            checked={checkInDraft.monthDays.includes(value)}
                            onChange={() =>
                              setCheckInDraft((draft) => ({
                                ...draft,
                                monthDays: draft.monthDays.includes(value)
                                  ? draft.monthDays.filter((item) => item !== value)
                                  : [...draft.monthDays, value].sort((a, b) => a - b),
                              }))
                            }
                          />
                        );
                      })}
                    </div>
                  </fieldset>
                ) : null}
                <TextField
                  label="开始日期"
                  type="date"
                  value={checkInDraft.startDate}
                  required
                  onChange={(event) =>
                    setCheckInDraft((draft) => ({ ...draft, startDate: event.target.value }))
                  }
                />
                <div className="check-in-dialog-actions">
                  <Button variant="ghost" type="button" onClick={closeCheckInDialog}>
                    取消
                  </Button>
                  <Button variant="primary" type="submit">
                    {checkInDialog === 'create' ? '添加项目' : '保存修改'}
                  </Button>
                </div>
              </form>
            </dialog>
          ) : null}
        </section>
      )}
    </section>
  );
}
