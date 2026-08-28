import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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
    expect(screen.getByRole('button', { name: '学习' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '常用' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '其他工具' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '日历待办' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('filters tools by category and search query', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '学习' }));
    expect(screen.getByRole('heading', { name: '学习' })).toBeInTheDocument();
    expect(screen.getAllByText('复习笔记').length).toBeGreaterThan(0);
    expect(screen.queryByText('活动选择器')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: '搜索工具' }), {
      target: { value: '不存在' },
    });
    expect(screen.getByRole('heading', { name: '没有匹配的工具' })).toBeInTheDocument();
  });

  it('updates favorites and recent tools through tool actions', async () => {
    render(<App />);

    const reviewTool = screen.getByRole('article', { name: '复习笔记' });
    fireEvent.click(within(reviewTool).getByRole('button', { name: '打开' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '复习笔记工作区' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('navigation', { name: '主导航' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '打开设置' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回工具台' }));
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
      expect(screen.getByRole('heading', { name: '复习笔记工作区' })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByRole('textbox', { name: '待复习内容' }), {
      target: { value: '下一次复习重点' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存草稿' }));
    expect(screen.getByRole('status')).toHaveTextContent('草稿已保存');
    expect(window.localStorage.getItem('learning.note-review.draft')).toBe('下一次复习重点');
    expect(window.localStorage.getItem('tools.text-workbench.draft')).toBeNull();
  });

  it('persists the entertainment selection inside its own storage namespace', async () => {
    render(<App />);

    const sessionPicker = screen.getByRole('article', { name: '活动选择器' });
    fireEvent.click(within(sessionPicker).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '活动选择器工作区' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: '玩一局游戏' }));
    expect(screen.getByRole('button', { name: '玩一局游戏' })).toHaveAttribute(
      'aria-pressed',
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
    render(<App />);

    const calendarTool = screen.getByRole('article', { name: '日历待办' });
    fireEvent.click(within(calendarTool).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: '新增待办' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: '全年' }));
    expect(screen.getByLabelText(/年日历概览/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /年8月/ }));
    expect(screen.getByRole('grid', { name: /日历/ })).toBeInTheDocument();

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
    expect(
      JSON.parse(window.localStorage.getItem('tools.calendar-todos.items') ?? ''),
    ).toMatchObject({
      version: 3,
      todos: [{ title: '整理今天的计划', status: 'not-started' }],
      checkIns: [],
    });
    expect(window.localStorage.getItem('tools.text-workbench.draft')).toBeNull();
    const selectedDateCell = () => {
      const cell = screen
        .getAllByRole('gridcell')
        .find((candidate) => candidate.getAttribute('aria-selected') === 'true');
      if (!cell) {
        throw new Error('Expected the selected calendar day to be present.');
      }

      return cell;
    };
    expect(selectedDateCell()).toHaveAccessibleName(expect.stringContaining('1 项未开始'));

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
    expect(selectedDateCell()).toHaveAccessibleName(expect.stringContaining('1 项已完成'));

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
    expect(selectedDateCell()).toHaveAccessibleName(expect.stringContaining('1 项未开始'));

    fireEvent.click(screen.getByRole('button', { name: '周期打卡' }));
    expect(screen.getByRole('heading', { name: '周期打卡' })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: '周期打卡' }));
    const managerCheckInItem = screen.getByText('阅读 45 分钟').closest('li');
    if (!managerCheckInItem) {
      throw new Error('Expected the check-in item to be present in the manager.');
    }
    const deleteCheckInButton = within(managerCheckInItem).getByRole('button', { name: '删除' });
    expect(deleteCheckInButton).toHaveClass('amt-button-danger');
    fireEvent.click(deleteCheckInButton);
    expect(screen.getByRole('button', { name: '添加打卡' })).toBeInTheDocument();
  });

  it('processes, saves, and restores the tools text inside its own storage namespace', async () => {
    render(<App />);

    const textTool = screen.getByRole('article', { name: '文本工作台' });
    fireEvent.click(within(textTool).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: '待处理文本' })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByRole('textbox', { name: '待处理文本' }), {
      target: { value: '  待清理文本  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '处理文本' }));
    expect(screen.getByRole('textbox', { name: '待处理文本' })).toHaveValue('  待清理文本  ');
    expect(screen.getByRole('textbox', { name: '处理结果' })).toHaveValue('待清理文本');
    expect(window.localStorage.getItem('tools.text-workbench.draft')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '保存工作区' }));

    expect(screen.getByText('工作区已保存到本机。')).toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem('tools.text-workbench.draft') ?? ''),
    ).toMatchObject({
      source: '  待清理文本  ',
      result: '待清理文本',
      history: [{ operation: 'trim', output: '待清理文本' }],
    });
    expect(window.localStorage.getItem('entertainment.session-picker.selection')).toBeNull();
  });

  it('saves and applies a text-workbench preset without touching another tool namespace', async () => {
    render(<App />);

    const textTool = screen.getByRole('article', { name: '文本工作台' });
    fireEvent.click(within(textTool).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: '预设名称' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /正则替换/ }));
    fireEvent.change(screen.getByRole('textbox', { name: '查找（正则）' }), {
      target: { value: '\\s+' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: '替换为' }), { target: { value: ' ' } });
    fireEvent.change(screen.getByRole('textbox', { name: '预设名称' }), {
      target: { value: '压缩空白' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存预设' }));

    expect(screen.getByText('预设“压缩空白”已保存。')).toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem('tools.text-workbench.presets') ?? ''),
    ).toMatchObject([{ name: '压缩空白', operation: 'replace', find: '\\s+', replaceWith: ' ' }]);
    expect(window.localStorage.getItem('learning.note-review.draft')).toBeNull();
  });

  it('opens settings, reports shortcut availability, and switches the active theme', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    expect(screen.getByRole('tablist', { name: '设置页签' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '外观' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: '主题' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '全局快捷键' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '快捷键' }));
    expect(screen.getByRole('tab', { name: '快捷键' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: '全局快捷键' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '设计系统查看器' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '开发者' }));
    expect(screen.getByRole('heading', { name: '设计系统查看器' })).toBeInTheDocument();
    const developerTablist = screen.getByRole('tablist', { name: '开发者查看器页签' });
    expect(developerTablist).toBeInTheDocument();
    for (const tab of within(developerTablist).getAllByRole('tab')) {
      expect(document.getElementById(tab.getAttribute('aria-controls') ?? '')).toBeInTheDocument();
    }
    expect(screen.getByRole('tab', { name: 'Token' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('columnheader', { name: '当前解析值' })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Token' }), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: '主题对比' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: '语义 Token 对比' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel', { name: '主题对比' })).not.toHaveAttribute('hidden');
    fireEvent.click(screen.getByRole('tab', { name: '组件状态' }));
    expect(screen.getByRole('heading', { name: '公共组件' })).toBeInTheDocument();
    expect(screen.getByText('SettingRow')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '组件展厅' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '详情' }));
    expect(screen.getByText('在同一工作区查看补充信息。')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '紧凑' }));
    expect(screen.getByRole('button', { name: '紧凑' })).toHaveAttribute('aria-pressed', 'true');
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
    fireEvent.click(screen.getByRole('button', { name: '使用深色主题' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: '使用深色主题' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
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
    expect(screen.getByRole('heading', { name: '设计系统查看器' })).toBeInTheDocument();
  });

  it('previews the floating notice in settings', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    fireEvent.click(screen.getByRole('tab', { name: '开发者' }));
    fireEvent.click(screen.getByRole('tab', { name: '动效' }));
    fireEvent.click(screen.getByRole('button', { name: '播放悬浮提示' }));

    expect(screen.getByText('已完成：整理今天的计划')).toBeInTheDocument();
  });

  it('restores the shell workspace after remounting', () => {
    const firstRender = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '学习' }));
    fireEvent.change(screen.getByRole('textbox', { name: '搜索工具' }), {
      target: { value: '笔记' },
    });
    fireEvent.click(screen.getByRole('button', { name: '深色' }));
    firstRender.unmount();

    render(<App />);

    expect(screen.getByRole('button', { name: '学习' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: '搜索结果' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '搜索工具' })).toHaveValue('笔记');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
