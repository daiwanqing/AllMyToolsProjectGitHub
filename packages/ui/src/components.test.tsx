import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Button } from './Button';
import { ChoiceGroup } from './ChoiceGroup';
import { Disclosure } from './Disclosure';
import { EmptyState } from './EmptyState';
import { FloatingNotice } from './FloatingNotice';
import { IconButton } from './IconButton';
import { InlineMessage } from './InlineMessage';
import { NavigationItem } from './NavigationItem';
import { ProgressBar } from './ProgressBar';
import { SelectField } from './SelectField';
import { SettingRow } from './SettingRow';
import { StatusBadge } from './StatusBadge';
import { StepperField } from './StepperField';
import { Tabs } from './Tabs';
import { TextField } from './TextField';
import { TextAreaField } from './TextAreaField';
import { ToggleField } from './ToggleField';
import { uiComponentCatalog, uiGuidelineGroups } from './designSystemCatalog';

afterEach(() => {
  vi.useRealTimers();
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

  it('supports the shared destructive variant', () => {
    render(<Button variant="danger">删除</Button>);

    expect(screen.getByRole('button', { name: '删除' })).toHaveClass('amt-button-danger');
  });
});

describe('IconButton', () => {
  it('provides a tooltip, accessible name, and pressed state', () => {
    render(
      <IconButton label="收藏工具" pressed>
        <span aria-hidden="true">*</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: '收藏工具' });
    expect(button).toHaveAttribute('title', '收藏工具');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('NavigationItem', () => {
  it('exposes the current page state and forwards commands', () => {
    const onClick = vi.fn();

    render(
      <NavigationItem
        active
        aria-label="打开工具首页"
        icon={<span aria-hidden="true">*</span>}
        label="工具首页"
        onClick={onClick}
      />,
    );

    const item = screen.getByRole('button', { name: '打开工具首页' });
    expect(item).toHaveAttribute('aria-current', 'page');
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
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

describe('TextAreaField', () => {
  it('connects its label, description, and error message', () => {
    render(
      <TextAreaField
        label="输入文本"
        description="处理前不会自动保存。"
        error="请输入有效文本。"
      />,
    );

    const textarea = screen.getByRole('textbox', { name: '输入文本' });
    const alert = screen.getByRole('alert');

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', expect.stringContaining(alert.id));
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

  it('announces and automatically dismisses a floating confirmation', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <FloatingNotice
        title="待办状态已更新"
        tone="success"
        autoDismissMs={180}
        onDismiss={onDismiss}
      >
        已完成：整理今天的计划
      </FloatingNotice>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('已完成：整理今天的计划');
    vi.advanceTimersByTime(180);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Tabs', () => {
  it('connects tabs to panels and supports keyboard navigation', async () => {
    function ExampleTabs() {
      const [value, setValue] = useState('appearance');

      return (
        <Tabs
          ariaLabel="设置页签"
          idPrefix="settings"
          value={value}
          onChange={setValue}
          items={[
            { id: 'appearance', label: '外观', panel: <p>主题设置</p> },
            { id: 'shortcuts', label: '快捷键', panel: <p>快捷键设置</p> },
            { id: 'developer', label: '开发者', panel: <p>开发者设置</p> },
          ]}
        />
      );
    }

    render(<ExampleTabs />);

    const appearance = screen.getByRole('tab', { name: '外观' });
    expect(appearance).toHaveAttribute('aria-selected', 'true');
    expect(
      document.getElementById(appearance.getAttribute('aria-controls') ?? ''),
    ).toBeInTheDocument();
    expect(screen.getByText('主题设置')).toBeVisible();
    expect(screen.queryByText('快捷键设置')).not.toBeVisible();

    fireEvent.keyDown(appearance, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: '快捷键' })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(screen.getByRole('tab', { name: '快捷键' })).toHaveFocus());
    expect(screen.getByText('快捷键设置')).toBeVisible();
    expect(screen.queryByText('主题设置')).not.toBeVisible();
  });
});

describe('composite controls', () => {
  it('keeps the shared component and guideline catalog complete', () => {
    expect(uiComponentCatalog.map((component) => component.name)).toEqual([
      'Button',
      'TextField',
      'TextAreaField',
      'EmptyState',
      'InlineMessage',
      'FloatingNotice',
      'IconButton',
      'NavigationItem',
      'Tabs',
      'ChoiceGroup',
      'ToggleField',
      'SettingRow',
      'SelectField',
      'StepperField',
      'StatusBadge',
      'ProgressBar',
      'Disclosure',
    ]);
    expect(uiGuidelineGroups.map((group) => group.title)).toEqual([
      'Token 和主题',
      '布局和导航',
      '可访问性与交互',
      '状态和响应式',
    ]);
  });

  it('combines choice options with selected state', () => {
    const onChange = vi.fn();

    render(
      <ChoiceGroup
        ariaLabel="主题设置"
        options={[
          { id: 'light', label: '浅色' },
          { id: 'dark', label: '深色' },
        ]}
        value="light"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('group', { name: '主题设置' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '浅色' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '深色' }));
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('associates a toggle description and keeps the native checkbox contract', () => {
    const onChange = vi.fn();

    render(
      <ToggleField
        label="启用同步"
        description="允许在设备之间同步设置。"
        checked={false}
        onChange={onChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: '启用同步' });
    expect(checkbox).toHaveAttribute('aria-describedby', expect.stringContaining('-description'));
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('keeps setting copy and its control in one reusable row', () => {
    render(
      <SettingRow label="快捷键" description="控制主窗口显示与隐藏。">
        <button type="button">配置</button>
      </SettingRow>,
    );

    expect(screen.getByText('快捷键')).toBeInTheDocument();
    expect(screen.getByText('控制主窗口显示与隐藏。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '配置' })).toBeInTheDocument();
  });
});

describe('extended controls', () => {
  it('connects select labels, descriptions, and errors', () => {
    const onChange = vi.fn();

    render(
      <SelectField
        label="启动模式"
        description="选择应用启动时打开的工作区。"
        error="请选择有效模式。"
        options={[{ value: 'home', label: '工具首页' }]}
        value="home"
        onChange={onChange}
      />,
    );

    const select = screen.getByRole('combobox', { name: '启动模式' });
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby', expect.stringContaining('-error'));
    fireEvent.change(select, { target: { value: 'home' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('updates a bounded stepper through its increment control', () => {
    function ExampleStepper() {
      const [value, setValue] = useState(3);
      return <StepperField label="数量" min={1} max={4} value={value} onChange={setValue} />;
    }

    render(<ExampleStepper />);

    fireEvent.click(screen.getByRole('button', { name: '增加数量' }));
    expect(screen.getByRole('spinbutton', { name: '数量' })).toHaveValue(4);
    expect(screen.getByRole('button', { name: '增加数量' })).toBeDisabled();
  });

  it('exposes disclosure expansion state', () => {
    render(<Disclosure title="高级选项">补充设置</Disclosure>);

    const trigger = screen.getByRole('button', { name: '高级选项' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('补充设置')).toBeVisible();
  });

  it('exposes status and progress semantics', () => {
    render(
      <>
        <StatusBadge tone="success">已同步</StatusBadge>
        <ProgressBar label="同步进度" value={64} />
      </>,
    );

    expect(screen.getByText('已同步')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '同步进度' })).toHaveAttribute(
      'aria-valuenow',
      '64',
    );
  });
});
