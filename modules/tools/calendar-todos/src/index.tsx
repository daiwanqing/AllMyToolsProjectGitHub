import { useMemo, useState, type DragEvent, type FormEvent } from 'react';
import {
  Button,
  ChoiceGroup,
  EmptyState,
  FloatingNotice,
  StatusBadge,
  TextField,
  type FloatingNoticeTone,
} from '@allmytools/ui';
import { calendarDays, dateFromKey, dateKey, monthTitle, moveMonth, yearMonths } from './calendar';
import { manifest } from './manifest';
import {
  loadCalendarTodos,
  saveCalendarTodos,
  type CalendarTodosData,
  type CheckInItem,
  type TodoItem,
  type TodoStatus,
} from './storage';

export { manifest };

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const taskStatuses: readonly TodoStatus[] = ['not-started', 'in-progress', 'completed'];
const taskStatusLabels: Readonly<Record<TodoStatus, string>> = {
  'not-started': '未开始',
  'in-progress': '进行中',
  completed: '已完成',
};

type CalendarView = 'year' | 'month';

type TodoCounts = Readonly<Record<TodoStatus, number>>;

type TodoNotice = Readonly<{
  id: string;
  message: string;
  tone: FloatingNoticeTone;
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

export function ToolView() {
  const today = dateKey(new Date());
  const [data, setData] = useState<CalendarTodosData>(() => loadCalendarTodos(window.localStorage));
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = dateFromKey(today) ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newCheckInTitle, setNewCheckInTitle] = useState('');
  const [draggedTodoId, setDraggedTodoId] = useState<string>();
  const [dragOverStatus, setDragOverStatus] = useState<TodoStatus>();
  const [notice, setNotice] = useState<TodoNotice>();

  const days = useMemo(() => calendarDays(visibleMonth), [visibleMonth]);
  const todoCountsByDate = useMemo(
    () =>
      data.todos.reduce<ReadonlyMap<string, TodoCounts>>((counts, todo) => {
        const next = new Map(counts);
        const current = next.get(todo.date) ?? emptyCounts();
        next.set(todo.date, { ...current, [todo.status]: current[todo.status] + 1 });
        return next;
      }, new Map()),
    [data.todos],
  );
  const selectedTodos = data.todos.filter((todo) => todo.date === selectedDate);
  const todosByStatus = useMemo(
    () =>
      taskStatuses.reduce<Readonly<Record<TodoStatus, readonly TodoItem[]>>>(
        (groups, status) => ({
          ...groups,
          [status]: selectedTodos.filter((todo) => todo.status === status),
        }),
        { 'not-started': [], 'in-progress': [], completed: [] },
      ),
    [selectedTodos],
  );
  const checkInsCompletedToday = data.checkIns.filter((item) =>
    item.dates.includes(selectedDate),
  ).length;

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

  function setTodoStatus(id: string, status: TodoStatus) {
    const todo = data.todos.find((item) => item.id === id);
    if (!todo || todo.status === status) {
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
  }

  function deleteTodo(id: string) {
    commit({ ...data, todos: data.todos.filter((item) => item.id !== id) });
    showNotice('待办已删除。');
  }

  function startDragging(event: DragEvent<HTMLLIElement>, id: string) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    setDraggedTodoId(id);
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

  function addCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newCheckInTitle.trim();
    if (!title) {
      return;
    }

    commit({
      ...data,
      checkIns: [
        ...data.checkIns,
        { id: createRecordId('check-in'), title, dates: [], createdAt: new Date().toISOString() },
      ],
    });
    setNewCheckInTitle('');
    showNotice('打卡项目已添加。');
  }

  function toggleCheckIn(id: string) {
    const item = data.checkIns.find((checkIn) => checkIn.id === id);
    if (!item) {
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
    const statuses = statusLabel(counts);
    const label = `${day.key}${isToday ? '，今天' : ''}${statuses ? `，${statuses}` : ''}`;

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
          <h2 id="calendar-todo-heading">日历待办</h2>
        </div>
        <Button variant="ghost" onClick={() => chooseDate(today)} aria-label="回到今天">
          今天
        </Button>
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
                          return (
                            <button
                              key={day.key}
                              type="button"
                              className="calendar-mini-day"
                              aria-label={`${day.key}${statuses ? `，${statuses}` : ''}`}
                              aria-current={day.key === today ? 'date' : undefined}
                              aria-pressed={day.key === selectedDate}
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
                selectedTodos.length &&
                !todosByStatus['not-started'].length &&
                !todosByStatus['in-progress'].length
                  ? 'success'
                  : 'info'
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
                  <StatusBadge
                    tone={
                      status === 'completed'
                        ? 'success'
                        : status === 'in-progress'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {todosByStatus[status].length}
                  </StatusBadge>
                </div>
                <ul className="todo-list" aria-label={`${taskStatusLabels[status]}任务`}>
                  {todosByStatus[status].map((todo) => (
                    <li
                      key={todo.id}
                      className="todo-item"
                      draggable
                      onDragStart={(event) => startDragging(event, todo.id)}
                      onDragEnd={() => {
                        setDraggedTodoId(undefined);
                        setDragOverStatus(undefined);
                      }}
                    >
                      <span className="todo-item-title">{todo.title}</span>
                      <label className="todo-status-field">
                        <span>状态</span>
                        <select
                          value={todo.status}
                          aria-label={`${todo.title} 状态`}
                          onChange={(event) =>
                            setTodoStatus(todo.id, event.target.value as TodoStatus)
                          }
                        >
                          {taskStatuses.map((option) => (
                            <option key={option} value={option}>
                              {taskStatusLabels[option]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Button variant="ghost" onClick={() => deleteTodo(todo.id)}>
                        删除
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <section className="check-in-panel" aria-labelledby="check-in-heading">
            <div className="check-in-heading">
              <div>
                <p className="eyebrow">日常</p>
                <h4 id="check-in-heading">日常打卡</h4>
              </div>
              <StatusBadge
                tone={
                  checkInsCompletedToday === data.checkIns.length && data.checkIns.length
                    ? 'success'
                    : 'info'
                }
              >
                {data.checkIns.length
                  ? `${checkInsCompletedToday}/${data.checkIns.length} 已打卡`
                  : '暂无项目'}
              </StatusBadge>
            </div>
            <form className="check-in-create-form" onSubmit={addCheckIn}>
              <TextField
                label="新增打卡项目"
                placeholder="例如：阅读 30 分钟"
                value={newCheckInTitle}
                maxLength={120}
                required
                onChange={(event) => setNewCheckInTitle(event.target.value)}
              />
              <Button variant="secondary" type="submit">
                添加项目
              </Button>
            </form>
            {data.checkIns.length ? (
              <ul
                className="check-in-list"
                aria-label={`${selectedDateTitle(selectedDate)}日常打卡`}
              >
                {data.checkIns.map((item: CheckInItem) => {
                  const checked = item.dates.includes(selectedDate);
                  return (
                    <li key={item.id} className="check-in-item" data-checked={checked || undefined}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheckIn(item.id)}
                        />
                        <span>{item.title}</span>
                      </label>
                      <Button variant="ghost" onClick={() => deleteCheckIn(item.id)}>
                        删除
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="还没有打卡项目" description="添加一个可每天重复完成的日常项目。" />
            )}
          </section>
        </section>
      </div>
    </section>
  );
}
