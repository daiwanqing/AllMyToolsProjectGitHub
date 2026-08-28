import { type KeyboardEvent, type ReactNode, useId } from 'react';

export type TabControlItem = Readonly<{
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}>;

export type TabControlProps = Readonly<{
  ariaLabel: string;
  items: readonly TabControlItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}>;

function TabControl({
  ariaLabel,
  className,
  items,
  onChange,
  orientation,
  value,
}: TabControlProps & { orientation: 'horizontal' | 'vertical' }) {
  const instanceId = useId().replaceAll(':', '');
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === value),
  );

  function move(event: KeyboardEvent<HTMLButtonElement>) {
    const forward = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const backward = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    let nextIndex = activeIndex;
    if (items.length === 0) {
      return;
    }
    if (event.key === forward) {
      nextIndex = (activeIndex + 1) % items.length;
    } else if (event.key === backward) {
      nextIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = items[nextIndex];
    if (!next.disabled) {
      onChange(next.id);
    }
    window.setTimeout(
      () => document.getElementById(`amt-tab-control-${instanceId}-${next.id}`)?.focus(),
      0,
    );
  }

  return (
    <div
      className={['amt-tab-control', `amt-tab-control-${orientation}`, className]
        .filter(Boolean)
        .join(' ')}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
    >
      {items.map((item) => (
        <button
          key={item.id}
          id={`amt-tab-control-${instanceId}-${item.id}`}
          className="amt-tab-control-item"
          type="button"
          role="tab"
          aria-selected={value === item.id}
          tabIndex={value === item.id ? 0 : -1}
          disabled={item.disabled}
          onClick={() => onChange(item.id)}
          onKeyDown={move}
        >
          {item.icon ? (
            <span className="amt-tab-control-item-icon" aria-hidden="true">
              {item.icon}
            </span>
          ) : null}
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function HorizontalTabs(props: TabControlProps) {
  return <TabControl {...props} orientation="horizontal" />;
}

export function VerticalTabs(props: TabControlProps) {
  return <TabControl {...props} orientation="vertical" />;
}
