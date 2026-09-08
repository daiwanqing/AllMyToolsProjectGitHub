import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  document.documentElement.dataset.theme = 'light';
  window.localStorage.clear();
});

describe('desktop shell', () => {
  it('renders category navigation, frequent tools, and the catalog tiles', () => {
    render(<App />);

    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '学习' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '生活' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '常用' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '其他工具' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '日历待办' })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: '文本工作台' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('opens travel notes and saves a quick entry in its own namespace', async () => {
    render(<App />);

    const travelTool = screen.getByRole('article', { name: '旅行笔记' });
    fireEvent.click(within(travelTool).getByRole('button', { name: '打开' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '大理，慢下来' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: '快速记录' }));
    fireEvent.change(screen.getByRole('textbox', { name: '标题' }), {
      target: { value: '新的片段' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '发生了什么' }), {
      target: { value: '风从湖面过来。' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存记录' }));
    expect(screen.getByText('新的片段')).toBeInTheDocument();
    expect(window.localStorage.getItem('tools.travel-notes.workspace')).toContain('新的片段');
  });

  it('searches a journey, records an expense, and opens its review', async () => {
    render(<App />);
    const travelTool = screen.getByRole('article', { name: '旅行笔记' });
    fireEvent.click(within(travelTool).getByRole('button', { name: '打开' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '大理，慢下来' })).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByRole('textbox', { name: '搜索这段旅程' }), {
      target: { value: '洱海' },
    });
    expect(screen.getByRole('heading', { name: '洱海边走了很久' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '抵达古城' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '记录花费' }));
    fireEvent.change(screen.getByRole('textbox', { name: '项目' }), { target: { value: '咖啡' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: '金额（CNY）' }), {
      target: { value: '28' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存花费' }));
    expect(window.localStorage.getItem('tools.travel-notes.workspace')).toContain('咖啡');

    fireEvent.click(screen.getByRole('tab', { name: '回顾' }));
    expect(screen.getByRole('heading', { name: '这段旅程留下了什么' })).toBeInTheDocument();
  });

  it('shows expense totals and switches between the timeline and review tabs', async () => {
    render(<App />);
    const travelTool = screen.getByRole('article', { name: '旅行笔记' });
    fireEvent.click(within(travelTool).getByRole('button', { name: '打开' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '大理，慢下来' })).toBeInTheDocument(),
    );
    expect(screen.getByText('214')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '回顾' }));
    expect(screen.getByRole('region', { name: '旅行回顾' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '时间线' }));
    expect(screen.getByRole('heading', { name: '抵达古城' })).toBeInTheDocument();
  });

  it('opens settings as a modal dialog from the toolbar', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    expect(screen.getByRole('dialog', { name: '设置' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '设置' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    expect(screen.queryByRole('dialog', { name: '设置' })).not.toBeInTheDocument();
  });

  it('shows the runtime console and toggles debug mode from the host toolbar', () => {
    render(<App />);

    expect(screen.getByRole('region', { name: '运行输出台' })).toBeInTheDocument();
    const consoleButton = screen.getByRole('button', { name: '输出台' });
    expect(consoleButton).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(consoleButton);
    expect(screen.queryByRole('region', { name: '运行输出台' })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: '1', ctrlKey: true, altKey: true });
    expect(screen.getByRole('region', { name: '运行输出台' })).toBeInTheDocument();
    const debugButton = screen.getByRole('button', { name: '调试' });
    fireEvent.click(debugButton);
    expect(debugButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('调试模式已开启。')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: '调试模式' })).not.toBeInTheDocument();

    const workspace = screen.getByRole('region', { name: '工具目录' }).parentElement;
    expect(workspace).not.toBeNull();
    fireEvent.pointerMove(screen.getByRole('heading', { name: '工具工作台' }));
    expect(screen.getByText(/悬浮 文本：/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('heading', { name: '工具工作台' }));
    expect(screen.getByRole('dialog', { name: '元素源码定位' })).toHaveTextContent(
      'apps/desktop/src/app/App.tsx',
    );
  });

  it('filters tools by category and search query', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: '学习' }));
    expect(screen.queryByRole('heading', { name: '学习' })).not.toBeInTheDocument();
    expect(screen.getAllByText('复习笔记').length).toBeGreaterThan(0);
    expect(screen.queryByText('活动选择器')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: '搜索工具' }), {
      target: { value: '不存在' },
    });
    expect(screen.getByRole('heading', { name: '没有匹配的工具' })).toBeInTheDocument();
  });

  it('opens the life module and preserves the selected module', () => {
    const firstRender = render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: '生活' }));

    expect(screen.getByRole('tab', { name: '生活' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: '收藏' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '桌游' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('shell.workspace-state') ?? '')).toMatchObject({
      category: 'life',
    });

    firstRender.unmount();
    render(<App />);

    expect(screen.getByRole('tab', { name: '生活' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: '收藏' })).toBeInTheDocument();
  });

  it('opens the board game collection from the life collection category and saves it', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: '生活' }));
    expect(screen.getByRole('heading', { name: '收藏' })).toBeInTheDocument();
    const boardGamesTool = screen.getByRole('article', { name: '桌游' });
    fireEvent.click(within(boardGamesTool).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: '桌游' })).toBeInTheDocument(),
    );
    const saveButton = screen.getByRole('button', { name: '保存收藏' });
    expect(saveButton).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: '桌游名称' }), {
      target: { value: '卡坦岛' },
    });
    fireEvent.click(screen.getByRole('button', { name: '加入收藏' }));
    expect(screen.getByText('卡坦岛')).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    expect(screen.getByRole('status')).toHaveTextContent('收藏已保存');
    expect(saveButton).toBeDisabled();
    expect(window.localStorage.getItem('life.board-games.collection')).toContain('卡坦岛');

    fireEvent.click(screen.getByRole('button', { name: '移除' }));
    expect(screen.getByRole('heading', { name: '还没有收藏桌游' })).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);
    expect(saveButton).toBeDisabled();
    expect(window.localStorage.getItem('life.board-games.collection')).toBe('[]');
  });

  it('groups a module by its second-level categories', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: '学习' }));
    expect(screen.queryByRole('tablist', { name: '学习分类' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '学习规划' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '美术' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '英语' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('article', { name: '复习笔记' })).toHaveLength(1);
    expect(screen.queryByRole('article', { name: '活动选择器' })).not.toBeInTheDocument();
  });

  it('keeps the selected module in the workspace state', () => {
    const firstRender = render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: '工具' }));
    expect(JSON.parse(window.localStorage.getItem('shell.workspace-state') ?? '')).toMatchObject({
      category: 'tools',
    });

    firstRender.unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: '日程' })).toBeInTheDocument();
  });

  it('updates favorites and recent tools through tool actions', async () => {
    render(<App />);

    const reviewTool = screen.getByRole('article', { name: '复习笔记' });
    fireEvent.click(within(reviewTool).getByRole('button', { name: '打开' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: '复习笔记' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('navigation', { name: '主导航' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: '应用菜单' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开设置' })).toBeInTheDocument();
    const backToWorkspaceButton = screen.getByRole('button', { name: '返回工具台' });
    expect(backToWorkspaceButton).toHaveTextContent('← 工具台');
    fireEvent.click(backToWorkspaceButton);
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '常用' }).closest('section')).toHaveTextContent(
      '复习笔记',
    );

    const updatedReviewTool = screen.getByRole('article', { name: '复习笔记' });
    fireEvent.click(within(updatedReviewTool).getByRole('button', { name: '收藏 复习笔记' }));
    expect(screen.getAllByRole('button', { name: '取消收藏 复习笔记' }).length).toBeGreaterThan(0);
  });

  it('persists the learning tool draft inside its own storage namespace', async () => {
    render(<App />);

    const reviewTool = screen.getByRole('article', { name: '复习笔记' });
    fireEvent.click(within(reviewTool).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: '复习笔记' })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByRole('textbox', { name: '待复习内容' }), {
      target: { value: '下一次复习重点' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存草稿' }));
    expect(screen.getByRole('status')).toHaveTextContent('草稿已保存');
    expect(window.localStorage.getItem('learning.note-review.draft')).toBe('下一次复习重点');
  });

  it('persists the entertainment selection inside its own storage namespace', async () => {
    render(<App />);

    const sessionPicker = screen.getByRole('article', { name: '活动选择器' });
    fireEvent.click(within(sessionPicker).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: '活动选择器' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('tab', { name: '玩一局游戏' }));
    expect(screen.getByRole('tab', { name: '玩一局游戏' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: '保存选择' }));

    expect(screen.getByText('选择已保存')).toBeInTheDocument();
    expect(window.localStorage.getItem('entertainment.session-picker.selection')).toBe(
      '玩一局游戏',
    );
    expect(window.localStorage.getItem('learning.note-review.draft')).toBeNull();
  });

  it('manages dated todos in the calendar tool namespace', async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    render(<App />);

    const calendarTool = screen.getByRole('article', { name: '日历待办' });
    fireEvent.click(within(calendarTool).getByRole('button', { name: '打开' }));

    await waitFor(() => expect(screen.getByLabelText('连续年历')).toBeInTheDocument());
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });
    expect(screen.getAllByLabelText(/年日历概览/)).toHaveLength(5);
    expect(screen.getByLabelText('连续年历')).toHaveClass('calendar-scroll-list');
    expect(screen.queryByRole('button', { name: '上一个周期' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '下一个周期' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '回到今天' }));
    expect(screen.getByLabelText('连续年历')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^\d+月\d+日$/ })).not.toBeInTheDocument();
    expect(
      document.querySelectorAll('.calendar-year-month[data-current-month="true"]'),
    ).toHaveLength(1);
    const currentYearMonth = screen
      .getAllByRole('button', { name: /进入\d+年8月/ })
      .find((button) =>
        button.getAttribute('aria-label')?.includes(`进入${new Date().getFullYear()}年8月`),
      );
    if (!currentYearMonth) {
      throw new Error('Expected the current year month to be present.');
    }
    fireEvent.click(currentYearMonth);
    const backToYearButton = screen.getByRole('button', { name: '返回年历' });
    expect(backToYearButton).toBeInTheDocument();
    expect(backToYearButton).toHaveTextContent('← 年历');
    expect(screen.getAllByRole('grid', { name: /日历/ }).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.calendar-month-block')).toHaveLength(13);
    expect(screen.getByLabelText('连续月历')).toHaveClass('calendar-scroll-list');
    expect(document.querySelectorAll('.calendar-day[data-current-month="true"]')).toHaveLength(0);
    const todayCell = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-current') === 'date');
    expect(todayCell).toBeDefined();
    expect(todayCell).not.toHaveAttribute('aria-selected', 'true');
    fireEvent.click(todayCell as HTMLElement);
    expect(screen.getAllByRole('heading', { name: /^\d+月\d+日$/ })).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: '时间安排' })).not.toBeInTheDocument();
    expect(screen.queryByText('时间安排')).not.toBeInTheDocument();
    expect(document.querySelector('.day-detail-panel')).toHaveClass('day-detail-panel');
    expect(document.querySelector('.day-detail-main .day-timeline')).toHaveClass('day-timeline');
    expect(screen.queryByRole('heading', { name: '已安排时间' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '未安排时间' })).not.toBeInTheDocument();

    const newTodoField = screen.getByRole('textbox', { name: '新增待办' });
    const newTodoForm = newTodoField.closest('form');
    if (!newTodoForm) {
      throw new Error('Expected the new todo field to be inside a form.');
    }

    fireEvent.submit(newTodoForm);
    expect(screen.queryByText('请输入待办内容后再添加。')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.change(newTodoField, {
      target: { value: '整理今天的计划' },
    });
    fireEvent.click(screen.getByRole('button', { name: '添加' }));

    expect(screen.getByRole('status')).toHaveTextContent('待办已添加。');
    expect(screen.getByText('整理今天的计划')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: /笔记$/ }), {
      target: { value: '今天先整理本周的重点事项。' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存笔记' }));
    expect(screen.getByRole('status')).toHaveTextContent('当日笔记已保存。');
    const backToCalendarButton = screen.getByRole('button', { name: '返回日历' });
    expect(backToCalendarButton).toHaveTextContent('← 日历');
    fireEvent.click(backToCalendarButton);
    const selectedCellWithNote = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-selected') === 'true');
    if (!selectedCellWithNote) {
      throw new Error('Expected the selected calendar day to be present.');
    }

    expect(selectedCellWithNote).toHaveAccessibleName(expect.stringContaining('有笔记'));
    expect(selectedCellWithNote.querySelector('.calendar-day-note-indicator')).toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem('tools.calendar-todos.items') ?? ''),
    ).toMatchObject({
      version: 5,
      todos: [{ title: '整理今天的计划', status: 'not-started' }],
      checkIns: [],
      notes: [{ content: '今天先整理本周的重点事项。' }],
    });
    fireEvent.click(selectedCellWithNote);
    fireEvent.click(screen.getByRole('button', { name: '删除笔记' }));
    expect(screen.getByRole('status')).toHaveTextContent('当日笔记已删除。');
    fireEvent.click(screen.getByRole('button', { name: '返回日历' }));
    const selectedCellWithoutNote = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-selected') === 'true');
    if (!selectedCellWithoutNote) {
      throw new Error('Expected the selected calendar day to be present after deleting note.');
    }
    expect(selectedCellWithoutNote).not.toHaveAccessibleName(expect.stringContaining('有笔记'));
    expect(
      selectedCellWithoutNote.querySelector('.calendar-day-note-indicator'),
    ).not.toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem('tools.calendar-todos.items') ?? ''),
    ).toMatchObject({ notes: [] });
    fireEvent.click(selectedCellWithoutNote);
    expect(screen.getByText('整理今天的计划')).toBeInTheDocument();

    const todoCard = screen.getByText('整理今天的计划').closest('li');
    if (!todoCard) {
      throw new Error('Expected the todo card to be present.');
    }
    const dataTransfer = {
      effectAllowed: '',
      setData: () => undefined,
      getData: () => 'todo-id',
    };
    fireEvent.dragStart(todoCard, { dataTransfer });
    fireEvent.dragOver(screen.getByRole('region', { name: '已完成' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('region', { name: '已完成' }), { dataTransfer });
    expect(screen.getByRole('status')).toHaveTextContent('已完成：整理今天的计划');
    fireEvent.click(screen.getByRole('button', { name: '返回日历' }));
    const completedDateCell = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-selected') === 'true');
    if (!completedDateCell) {
      throw new Error('Expected the selected calendar day after completing todo.');
    }
    expect(completedDateCell).toHaveAccessibleName(expect.stringContaining('1 项已完成'));
    fireEvent.click(completedDateCell);

    const completedTodoCard = screen.getByText('整理今天的计划').closest('li');
    if (!completedTodoCard) {
      throw new Error('Expected the completed todo card to be present.');
    }
    const elementFromPoint = document.elementFromPoint;
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => screen.getByRole('region', { name: '未开始' }),
    });
    fireEvent.mouseDown(completedTodoCard, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(window, { clientX: 10, clientY: 10 });
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: elementFromPoint,
    });
    expect(screen.getByRole('status')).toHaveTextContent('未开始：整理今天的计划');
    fireEvent.click(screen.getByRole('button', { name: '返回日历' }));
    const revertedDateCell = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-selected') === 'true');
    if (!revertedDateCell) {
      throw new Error('Expected the selected calendar day after reverting todo.');
    }
    expect(revertedDateCell).toHaveAccessibleName(expect.stringContaining('1 项未开始'));

    fireEvent.click(screen.getByRole('button', { name: '周期打卡' }));
    expect(screen.getByRole('region', { name: '周期打卡' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加打卡' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '添加打卡' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '添加打卡' }));
    fireEvent.change(screen.getByRole('textbox', { name: '打卡名称' }), {
      target: { value: '阅读 30 分钟' },
    });
    fireEvent.click(screen.getByRole('button', { name: '添加项目' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '阅读 30 分钟' }));
    expect(screen.getByRole('checkbox', { name: '阅读 30 分钟' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: '编辑 阅读 30 分钟' }));
    fireEvent.change(screen.getByRole('textbox', { name: '打卡名称' }), {
      target: { value: '阅读 45 分钟' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));
    expect(screen.getByRole('button', { name: '编辑 阅读 45 分钟' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回日历待办' }));
    const detailDateCell = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-current') === 'date');
    if (!detailDateCell) {
      throw new Error('Expected the current date to be present in the calendar.');
    }
    fireEvent.click(detailDateCell);
    expect(screen.getByText('阅读 45 分钟（打卡）')).toBeInTheDocument();
    const syncedCheckInCard = screen.getByText('阅读 45 分钟（打卡）').closest('li');
    if (!syncedCheckInCard) {
      throw new Error('Expected the synced check-in card to be present.');
    }
    fireEvent.dragStart(syncedCheckInCard, { dataTransfer });
    fireEvent.dragOver(screen.getByRole('region', { name: '未开始' }), { dataTransfer });
    fireEvent.drop(screen.getByRole('region', { name: '未开始' }), { dataTransfer });
    expect(screen.getByRole('checkbox', { name: '完成 阅读 45 分钟（打卡）' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: '完成 阅读 45 分钟（打卡）' }));
    expect(screen.getByRole('checkbox', { name: '完成 阅读 45 分钟（打卡）' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: '返回日历' }));
    fireEvent.click(screen.getByRole('button', { name: '周期打卡' }));
    const managerCheckInItem = screen.getByText('阅读 45 分钟').closest('li');
    if (!managerCheckInItem) {
      throw new Error('Expected the check-in item to be present in the manager.');
    }
    const deleteCheckInButton = within(managerCheckInItem).getByRole('button', { name: '删除' });
    expect(deleteCheckInButton).toHaveClass('amt-button-danger');
    fireEvent.click(deleteCheckInButton);
    expect(screen.getByRole('button', { name: '添加打卡' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回日历待办' }));
    const finalDateCell = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-current') === 'date');
    if (!finalDateCell) {
      throw new Error('Expected the current date to be present in the calendar.');
    }
    fireEvent.click(finalDateCell);
    fireEvent.click(screen.getByRole('button', { name: '删除 整理今天的计划' }));
    expect(screen.queryByText('整理今天的计划')).not.toBeInTheDocument();
  });

  it('creates and edits a timed task in the daily timeline', async () => {
    render(<App />);
    const calendarTool = screen.getByRole('article', { name: '日历待办' });
    fireEvent.click(within(calendarTool).getByRole('button', { name: '打开' }));
    await waitFor(() => expect(screen.getByLabelText('连续年历')).toBeInTheDocument());
    const todayCell = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-current') === 'date');
    if (!todayCell) throw new Error('Expected today in the year calendar.');
    fireEvent.click(todayCell);
    expect(screen.getByRole('heading', { name: /^\d+月\d+日$/ })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: '新增待办' }), {
      target: { value: '时间块任务' },
    });
    fireEvent.change(screen.getByLabelText('开始时间'), {
      target: { value: '09:00' },
    });
    fireEvent.change(screen.getByLabelText('结束时间'), {
      target: { value: '10:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: '添加' }));
    const timelineEvent = screen.getByRole('button', { name: /待办 时间块任务/ });
    expect(timelineEvent).toBeInTheDocument();
    expect(timelineEvent).toHaveStyle({ height: '192px' });
    expect(timelineEvent).toHaveTextContent('时间块任务');
    expect(timelineEvent).not.toHaveTextContent('09:00–10:30');
    expect(document.querySelector('.day-detail-main .timeline-event')).toBeInTheDocument();
    expect(document.querySelector('.day-detail-side .timeline-event')).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: '未开始任务' })).toHaveTextContent('时间块任务');
    expect(screen.getByRole('list', { name: '未开始任务' })).toHaveTextContent('09:00–10:30');
    expect(document.querySelector('.todo-board')).toHaveClass('todo-board');
    fireEvent.mouseDown(timelineEvent, { button: 0, clientY: 100 });
    fireEvent.mouseMove(window, { clientY: 164 });
    fireEvent.mouseUp(window);
    expect(
      JSON.parse(window.localStorage.getItem('tools.calendar-todos.items') ?? ''),
    ).toMatchObject({ todos: [{ title: '时间块任务', startTime: '09:30', endTime: '11:00' }] });
    fireEvent.click(timelineEvent);
    expect(screen.queryByRole('dialog', { name: '安排待办时间' })).not.toBeInTheDocument();
    const timedTodo = within(screen.getByRole('list', { name: '未开始任务' }))
      .getByText('时间块任务')
      .closest('li');
    if (!timedTodo) throw new Error('Expected the timed task to be present in the task board.');
    fireEvent.click(within(timedTodo).getByRole('button', { name: '安排时间' }));
    expect(screen.queryByRole('dialog', { name: '安排待办时间' })).not.toBeInTheDocument();
    fireEvent.change(within(timedTodo).getByLabelText('结束时间'), {
      target: { value: '11:30' },
    });
    fireEvent.click(within(timedTodo).getByRole('button', { name: '取消' }));
    expect(
      JSON.parse(window.localStorage.getItem('tools.calendar-todos.items') ?? ''),
    ).toMatchObject({ todos: [{ title: '时间块任务', endTime: '11:00' }] });
    fireEvent.click(within(timedTodo).getByRole('button', { name: '安排时间' }));
    fireEvent.change(within(timedTodo).getByLabelText('结束时间'), {
      target: { value: '11:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存时间' }));
    expect(
      JSON.parse(window.localStorage.getItem('tools.calendar-todos.items') ?? ''),
    ).toMatchObject({ todos: [{ title: '时间块任务', endTime: '11:30' }] });
  });

  it('opens settings, reports shortcut availability, and switches the active theme', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    expect(screen.getAllByRole('heading', { name: '设置' })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: '设置' })).toBeInTheDocument();
    expect(screen.queryByText('工作区')).not.toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: '设置页签' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '设置' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: '设置' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '外观' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tablist', { name: '主题设置' })).toBeInTheDocument();
    expect(screen.queryByText('按功能整理偏好设置，切换后立即生效。')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '快捷键' }));
    expect(screen.getByRole('tab', { name: '快捷键' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('全局快捷键')).toBeInTheDocument();
    expect(screen.getByText('运行输出台快捷键')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '运行输出台按键组合' })).toHaveValue(
      'CommandOrControl+Alt+1',
    );
    expect(screen.getByRole('checkbox', { name: '启用运行输出台快捷键' })).toBeChecked();
    expect(screen.queryByText(/启用后可使用/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '开发者' }));
    expect(screen.getByRole('region', { name: '设计系统查看器' })).toBeInTheDocument();
    expect(screen.queryByText('开发者', { selector: '.eyebrow' })).not.toBeInTheDocument();
    const developerTablist = screen.getByRole('tablist', { name: '开发者查看器页签' });
    expect(developerTablist).toBeInTheDocument();
    for (const tab of within(developerTablist).getAllByRole('tab')) {
      expect(document.getElementById(tab.getAttribute('aria-controls') ?? '')).toBeInTheDocument();
    }
    expect(screen.getByRole('tab', { name: 'Token' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('columnheader', { name: '当前解析值' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '用途说明' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('tabpanel', { name: 'Token' })).getByText('页面最底层画布背景。'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('tabpanel', { name: 'Token' })).getAllByText(
        '排版层级参数，用于统一字号、行高、字重和字体。',
      ).length,
    ).toBeGreaterThan(0);

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Token' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: '主题对比' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: '语义 Token 对比' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel', { name: '主题对比' })).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getByRole('tab', { name: '组件状态' }));
    expect(screen.getByRole('heading', { name: '公共组件' })).toBeInTheDocument();
    expect(screen.getByText('SettingRow')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '组件展厅' })).toBeInTheDocument();
    const showcaseToggle = screen.getByRole('button', { name: '调试状态' });
    expect(showcaseToggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(showcaseToggle);
    expect(showcaseToggle).toHaveAttribute('aria-pressed', 'true');
    const directionTablist = screen.getByRole('tablist', { name: '查看方向' });
    fireEvent.click(within(directionTablist).getByRole('tab', { name: '详情' }));
    expect(within(directionTablist).getByRole('tab', { name: '详情' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.click(
      within(screen.getByRole('tablist', { name: '组件展厅页签' })).getByRole('tab', {
        name: '详情',
      }),
    );
    expect(screen.getByText('在同一工作区查看补充信息。')).toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: '紧凑' }));
    expect(screen.getByRole('tab', { name: '紧凑' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('checkbox', { name: '启用同步' }));
    expect(screen.getByRole('checkbox', { name: '启用同步' })).toBeChecked();
    expect(screen.getByRole('button', { name: '创建视图' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '公共组件状态' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '动效' }));
    expect(screen.getByRole('heading', { name: '动效' })).toBeInTheDocument();
    expect(screen.getAllByText('快速反馈')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: '时长比例' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '播放动效示例' }));
    expect(screen.getByText('正在播放第 1 段，共 5 段。')).toBeInTheDocument();
    await waitFor(
      () =>
        expect(screen.getByRole('progressbar', { name: '动效预览进度' })).toHaveAttribute(
          'aria-valuenow',
          '100',
        ),
      { timeout: 1_500 },
    );
    fireEvent.click(screen.getByRole('tab', { name: 'UI规范' }));
    expect(screen.getByRole('heading', { name: 'UI 规范' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '可访问性与交互' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Token' }));
    fireEvent.change(screen.getByRole('textbox', { name: '筛选 Token' }), {
      target: { value: 'color.background.canvas' },
    });
    fireEvent.click(screen.getByRole('button', { name: '复制 color.background.canvas' }));
    await waitFor(() => expect(screen.getByText('复制状态')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('tab', { name: '快捷键' }));
    fireEvent.click(screen.getByRole('checkbox', { name: '启用全局快捷键' }));
    await waitFor(() =>
      expect(screen.getByText('全局快捷键仅在桌面应用中可用。')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('tab', { name: '外观' }));
    fireEvent.click(screen.getByRole('tab', { name: '使用深色主题' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('tab', { name: '使用深色主题' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('toggles debug mode with the default shortcut and opens source details for a tool element', async () => {
    render(<App />);
    const reviewTool = screen.getByRole('article', { name: '复习笔记' });
    fireEvent.click(within(reviewTool).getByRole('button', { name: '打开' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: '复习笔记' })).toBeInTheDocument(),
    );

    const consoleButton = screen.getByRole('button', { name: '输出台' });
    fireEvent.click(consoleButton);
    expect(screen.queryByRole('region', { name: '运行输出台' })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: '1', ctrlKey: true, altKey: true });
    expect(screen.getByRole('region', { name: '运行输出台' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: '0', ctrlKey: true, altKey: true });
    const toolRegion = await waitFor(() => screen.getByRole('region', { name: '复习笔记工具' }));
    fireEvent.pointerMove(toolRegion);
    expect(await screen.findByText('区域 · 复习笔记工具')).toBeInTheDocument();
    fireEvent.click(toolRegion);
    expect(screen.getByRole('dialog', { name: '元素源码定位' })).toHaveTextContent(
      'modules/learning/note-review/src/index.tsx:12',
    );
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    const noteField = screen.getByRole('textbox', { name: '待复习内容' });
    fireEvent.pointerMove(noteField);
    fireEvent.click(noteField);
    expect(screen.getByRole('dialog', { name: '元素源码定位' })).toHaveTextContent(
      'modules/learning/note-review/src/index.tsx:22',
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: '元素源码定位' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '调试' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: '返回工具台' }));
    expect(screen.getByRole('region', { name: '运行输出台' })).toBeInTheDocument();
  });

  it('switches settings tabs with keyboard and restores the selected tab', () => {
    const firstRender = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    const appearanceTab = screen.getByRole('tab', { name: '外观' });
    fireEvent.keyDown(appearanceTab, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: '快捷键' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: '快捷键' }), { key: 'End' });
    expect(screen.getByRole('tab', { name: '开发者' })).toHaveAttribute('aria-selected', 'true');

    firstRender.unmount();
    render(<App />);
    expect(screen.getByRole('tab', { name: '开发者' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('region', { name: '设计系统查看器' })).toBeInTheDocument();
  });

  it('previews the floating notice in settings', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    fireEvent.click(screen.getByRole('tab', { name: '开发者' }));
    fireEvent.click(screen.getByRole('tab', { name: '动效' }));
    fireEvent.click(screen.getByRole('button', { name: '播放悬浮提示' }));

    expect(screen.getByText('已完成：整理今天的计划')).toBeInTheDocument();
  });

  it('edits shared semantic colors, persists them, and restores defaults', async () => {
    const firstRender = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    fireEvent.click(screen.getByRole('tab', { name: '开发者' }));
    const colorField = screen.getByRole('textbox', { name: '编辑 color.background.canvas' });
    fireEvent.change(colorField, { target: { value: '#123456' } });

    expect(document.documentElement.style.getPropertyValue('--amt-color-background-canvas')).toBe(
      '#123456',
    );
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem('shell.theme-color-overrides') ?? '')).toEqual({
        light: { 'color.background.canvas': '#123456' },
        dark: {},
      }),
    );
    const primitiveColorField = screen.getByRole('textbox', {
      name: '编辑 color.neutral.50',
    });
    fireEvent.change(primitiveColorField, { target: { value: '#abcdef' } });
    expect(
      document.documentElement.style.getPropertyValue('--amt-primitive-color-neutral-50'),
    ).toBe('#abcdef');

    firstRender.unmount();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    fireEvent.click(screen.getByRole('tab', { name: '开发者' }));
    expect(screen.getByRole('textbox', { name: '编辑 color.background.canvas' })).toHaveValue(
      '#123456',
    );

    fireEvent.click(screen.getByRole('button', { name: '恢复默认颜色' }));
    expect(document.documentElement.style.getPropertyValue('--amt-color-background-canvas')).toBe(
      '',
    );
  });

  it('restores the shell workspace after remounting', () => {
    const firstRender = render(<App />);

    fireEvent.click(screen.getByRole('tab', { name: '学习' }));
    fireEvent.change(screen.getByRole('textbox', { name: '搜索工具' }), {
      target: { value: '笔记' },
    });
    fireEvent.click(screen.getByRole('tab', { name: '深色' }));
    firstRender.unmount();

    render(<App />);

    expect(screen.getByRole('tab', { name: '学习' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('heading', { name: '搜索结果' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '搜索工具' })).toHaveValue('笔记');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
