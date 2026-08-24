import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { InlineMessage } from './InlineMessage';
import { TextField } from './TextField';

afterEach(() => {
  document.body.replaceChildren();
});

describe('Button', () => {
  it('propagates commands and exposes loading as an unavailable state', () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>保存</Button>);

    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button loading onClick={onClick}>
        保存
      </Button>,
    );

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '保存' })).toHaveAttribute('aria-busy', 'true');
  });

  it('can receive keyboard focus', () => {
    render(<Button>继续</Button>);

    const button = screen.getByRole('button', { name: '继续' });
    button.focus();

    expect(button).toHaveFocus();
  });
});

describe('TextField', () => {
  it('connects its label, description, and error message', () => {
    render(<TextField label="工具名称" description="用于导航和搜索。" error="请输入工具名称。" />);

    const input = screen.getByRole('textbox', { name: '工具名称' });
    const alert = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(alert.id));
    expect(alert).toHaveTextContent('请输入工具名称。');
  });

  it('exposes disabled input state', () => {
    render(<TextField label="工具名称" disabled />);

    expect(screen.getByRole('textbox', { name: '工具名称' })).toBeDisabled();
  });
});

describe('content states', () => {
  it('renders an actionable empty state and a recoverable error message', () => {
    render(
      <>
        <EmptyState
          title="尚未添加工具"
          description="创建第一个工具后，它会显示在这里。"
          action={<Button>创建工具</Button>}
        />
        <InlineMessage tone="error" title="无法保存设置">
          请检查输入后重试。
        </InlineMessage>
      </>,
    );

    expect(screen.getByRole('heading', { name: '尚未添加工具' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '创建工具' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('请检查输入后重试。');
  });

  it('keeps title associations unique when multiple empty states render', () => {
    render(
      <>
        <EmptyState title="没有最近工具" description="打开工具后会显示在这里。" />
        <EmptyState title="没有收藏工具" description="收藏工具后会显示在这里。" />
      </>,
    );

    const sections = screen.getAllByRole('region');
    const labelledBy = sections.map((section) => section.getAttribute('aria-labelledby'));
    const headingIds = sections.map((section) => section.querySelector('h2')?.id);

    expect(new Set(labelledBy).size).toBe(2);
    expect(new Set(headingIds).size).toBe(2);
    expect(labelledBy).toEqual(headingIds);
  });
});
