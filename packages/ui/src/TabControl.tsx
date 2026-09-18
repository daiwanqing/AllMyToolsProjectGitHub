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
  const enabledItems = items.filter((item) => !item.disabled);
  const tabStop = enabledItems.find((item) => item.id === value)?.id ?? enabledItems[0]?.id;

  function move(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const forward = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const backward = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const activeIndex = enabledItems.findIndex((item) => item.id === id);
    let nextIndex = activeIndex;
    if (enabledItems.length === 0) {
      return;
    }
    if (event.key === forward) {
      nextIndex = (activeIndex + 1) % enabledItems.length;
    } else if (event.key === backward) {
      nextIndex = (activeIndex - 1 + enabledItems.length) % enabledItems.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = enabledItems.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const next = enabledItems[nextIndex];
    onChange(next.id);
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
          tabIndex={tabStop === item.id ? 0 : -1}
          disabled={item.disabled}
          onClick={() => onChange(item.id)}
          onKeyDown={(event) => move(event, item.id)}
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
