import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  document.documentElement.dataset.theme = 'light';
  window.localStorage.clear();
});

describe('desktop shell', () => {
  it('renders category navigation, recent tools, favorites, and the catalog', () => {
    render(<App />);

    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '学习' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '最近使用' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '收藏' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '工具列表' })).toBeInTheDocument();
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

    const catalog = screen.getByRole('heading', { name: '工具列表' }).closest('section');
    expect(catalog).not.toBeNull();
    const reviewTool = within(catalog as HTMLElement)
      .getByRole('heading', { name: '复习笔记' })
      .closest('article');
    expect(reviewTool).not.toBeNull();

    fireEvent.click(within(reviewTool as HTMLElement).getByRole('button', { name: '打开' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '复习笔记工作区' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: '关闭工具' }));
    expect(screen.getByRole('heading', { name: '最近使用' }).closest('section')).toHaveTextContent(
      '复习笔记',
    );

    const updatedCatalog = screen.getByRole('heading', { name: '工具列表' }).closest('section');
    const updatedReviewTool = within(updatedCatalog as HTMLElement)
      .getByRole('heading', { name: '复习笔记' })
      .closest('article');
    fireEvent.click(
      within(updatedReviewTool as HTMLElement).getByRole('button', { name: '收藏 复习笔记' }),
    );
    expect(screen.getAllByRole('button', { name: '取消收藏 复习笔记' }).length).toBeGreaterThan(0);
  });

  it('persists the learning tool draft inside its own storage namespace', async () => {
    render(<App />);

    const catalog = screen.getByRole('heading', { name: '工具列表' }).closest('section');
    const reviewTool = within(catalog as HTMLElement)
      .getByRole('heading', { name: '复习笔记' })
      .closest('article');
    fireEvent.click(within(reviewTool as HTMLElement).getByRole('button', { name: '打开' }));

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

    const catalog = screen.getByRole('heading', { name: '工具列表' }).closest('section');
    const sessionPicker = within(catalog as HTMLElement)
      .getByRole('heading', { name: '活动选择器' })
      .closest('article');
    fireEvent.click(within(sessionPicker as HTMLElement).getByRole('button', { name: '打开' }));

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

  it('cleans and saves the tools text inside its own storage namespace', async () => {
    render(<App />);

    const catalog = screen.getByRole('heading', { name: '工具列表' }).closest('section');
    const textTool = within(catalog as HTMLElement)
      .getByRole('heading', { name: '文本工作台' })
      .closest('article');
    fireEvent.click(within(textTool as HTMLElement).getByRole('button', { name: '打开' }));

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: '临时文本' })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByRole('textbox', { name: '临时文本' }), {
      target: { value: '  待清理文本  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '清理空白' }));
    expect(screen.getByRole('textbox', { name: '临时文本' })).toHaveValue('待清理文本');
    expect(window.localStorage.getItem('tools.text-workbench.draft')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '保存文本' }));

    expect(screen.getByText('文本已保存')).toBeInTheDocument();
    expect(window.localStorage.getItem('tools.text-workbench.draft')).toBe('待清理文本');
    expect(window.localStorage.getItem('entertainment.session-picker.selection')).toBeNull();
  });

  it('opens settings, reports shortcut availability, and switches the active theme', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    expect(screen.getByRole('heading', { name: '主题' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '快捷键' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '设计系统查看器' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '当前解析值' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: '筛选 Token' }), {
      target: { value: 'color.background.canvas' },
    });
    fireEvent.click(screen.getByRole('button', { name: '复制 color.background.canvas' }));
    await waitFor(() => expect(screen.getByText('复制状态')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('checkbox', { name: '启用全局快捷键' }));
    await waitFor(() =>
      expect(screen.getByText('全局快捷键仅在桌面应用中可用。')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: '使用深色主题' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: '使用深色主题' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
