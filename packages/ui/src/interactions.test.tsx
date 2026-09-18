import { cleanup, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Modal } from './Modal';
import { StepperField } from './StepperField';
import { HorizontalTabs, VerticalTabs } from './TabControl';
import { Tabs } from './Tabs';
import { Button } from './Button';

afterEach(cleanup);

describe('弹窗焦点边界', () => {
  it('排除隐藏面板、禁用 fieldset、inert 和负 tabIndex 控件，首尾循环', () => {
    const { unmount } = render(
      <Modal open labelledBy="dialog-title" onClose={vi.fn()}>
        <h2 id="dialog-title">焦点验收</h2>
        <button disabled>禁用</button>
        <section hidden>
          <button>隐藏面板</button>
        </section>
        <section style={{ display: 'none' }}>
          <button>样式隐藏</button>
        </section>
        <section inert>
          <button>惰性区域</button>
        </section>
        <fieldset disabled>
          <button>禁用分组</button>
        </fieldset>
        <button tabIndex={-1}>非 Tab 入口</button>
        <button>首项</button>
        <button>末项</button>
        <section hidden>
          <input aria-label="隐藏输入" />
        </section>
      </Modal>,
    );
    const first = screen.getByRole('button', { name: '首项' });
    const last = screen.getByRole('button', { name: '末项' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(first).toHaveFocus();
    const forward = createEvent.keyDown(first, { key: 'Tab' });
    fireEvent(first, forward);
    expect(forward.defaultPrevented).toBe(false);
    unmount();
  });

  it('空弹窗仍可聚焦和关闭，卸载后回到打开入口', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const onClose = vi.fn();
    const { unmount } = render(
      <Modal open labelledBy="empty-title" onClose={onClose}>
        <h2 id="empty-title">空弹窗</h2>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(dialog).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('草稿 Escape 不关闭外层弹窗，内层弹窗 Escape 不关闭外层', () => {
    const outerClose = vi.fn();
    const innerClose = vi.fn();
    render(
      <Modal open labelledBy="outer-title" onClose={outerClose}>
        <h2 id="outer-title">外层</h2>
        <StepperField label="数量" value={3} onChange={vi.fn()} />
        <Modal open labelledBy="inner-title" onClose={innerClose}>
          <h2 id="inner-title">内层</h2>
          <button>内层操作</button>
        </Modal>
      </Modal>,
    );
    const input = screen.getByRole('spinbutton', { name: '数量' });
    fireEvent.change(input, { target: { value: '8' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue(3);
    expect(outerClose).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('button', { name: '内层操作' }), { key: 'Escape' });
    expect(innerClose).toHaveBeenCalledOnce();
    expect(outerClose).not.toHaveBeenCalled();
  });
});

describe.each(['horizontal', 'vertical', 'panels'] as const)('%s 页签', (kind) => {
  const items = [
    { id: 'blocked-first', label: '禁用首项', disabled: true, panel: null },
    { id: 'one', label: '第一项', panel: '第一面板' },
    { id: 'blocked-middle', label: '禁用中项', disabled: true, panel: null },
    { id: 'two', label: '第二项', panel: '第二面板' },
    { id: 'blocked-last', label: '禁用末项', disabled: true, panel: null },
  ];
  const Component = kind === 'panels' ? Tabs : kind === 'vertical' ? VerticalTabs : HorizontalTabs;

  it('跳过禁用项并支持首尾和反向循环', async () => {
    function Example() {
      const [value, setValue] = useState('one');
      return <Component ariaLabel="导航" items={items} value={value} onChange={setValue} />;
    }
    render(<Example />);
    const first = screen.getByRole('tab', { name: '第一项' });
    const last = screen.getByRole('tab', { name: '第二项' });
    first.focus();
    fireEvent.keyDown(first, { key: kind === 'vertical' ? 'ArrowDown' : 'ArrowRight' });
    await waitFor(() => expect(last).toHaveFocus());
    expect(last).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(last, { key: 'Home' });
    await waitFor(() => expect(first).toHaveFocus());
    fireEvent.keyDown(first, { key: kind === 'vertical' ? 'ArrowUp' : 'ArrowLeft' });
    await waitFor(() => expect(last).toHaveFocus());
    fireEvent.keyDown(last, { key: kind === 'vertical' ? 'ArrowDown' : 'ArrowRight' });
    await waitFor(() => expect(first).toHaveFocus());
    fireEvent.keyDown(first, { key: 'End' });
    await waitFor(() => expect(last).toHaveFocus());
  });

  it('无效 value 保留可用入口，全部禁用或空集合不触发', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Component ariaLabel="导航" items={items} value="missing" onChange={onChange} />,
    );
    expect(screen.getByRole('tab', { name: '第一项' })).toHaveAttribute('tabindex', '0');
    expect(onChange).not.toHaveBeenCalled();
    rerender(
      <Component
        ariaLabel="导航"
        items={items.map((item) => ({ ...item, disabled: true }))}
        value="one"
        onChange={onChange}
      />,
    );
    expect(screen.getAllByRole('tab').every((tab) => tab.tabIndex === -1)).toBe(true);
    fireEvent.click(screen.getByRole('tab', { name: '第一项' }));
    expect(onChange).not.toHaveBeenCalled();
    rerender(<Component ariaLabel="导航" items={[]} value="one" onChange={onChange} />);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});

describe('步进输入草稿', () => {
  it('清空不提交，空值失焦恢复；合法草稿 Enter 提交，越界失焦限制范围', () => {
    const onChange = vi.fn();
    render(<StepperField label="数量" value={3} min={1} max={20} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveDisplayValue('');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue(3);
    fireEvent.change(input, { target: { value: '12' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(12);
    fireEvent.change(input, { target: { value: '99' } });
    expect(input).toHaveValue(99);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(20);
  });

  it('外部数值与禁用状态更新清理草稿，增减立即提交且支持小数', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <StepperField label="数量" value={0.1} step={0.2} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: '增加数量' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.closeTo(0.3, 14));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '9' } });
    rerender(<StepperField label="数量" value={5} onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(5);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    rerender(<StepperField label="数量" value={5} disabled onChange={onChange} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(5);
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('增减按钮的边界跟随正在编辑的草稿', () => {
    const onChange = vi.fn();
    render(<StepperField label="数量" value={1} min={1} max={9} onChange={onChange} />);
    const decrement = screen.getByRole('button', { name: '减少数量' });
    expect(decrement).toBeDisabled();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } });
    expect(decrement).toBeEnabled();
    fireEvent.click(decrement);
    expect(onChange).toHaveBeenLastCalledWith(4);
  });
});

it('加载与禁用命令保留名称且不能再次执行', () => {
  const onClick = vi.fn();
  render(
    <>
      <Button loading onClick={onClick}>
        保存
      </Button>
      <Button disabled onClick={onClick}>
        删除
      </Button>
    </>,
  );
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  fireEvent.click(screen.getByRole('button', { name: '删除' }));
  expect(onClick).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: '保存' })).toHaveAttribute('aria-busy', 'true');
});
