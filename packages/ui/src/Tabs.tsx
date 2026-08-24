import { type KeyboardEvent, type ReactNode, useId } from 'react';

export type TabsItem = Readonly<{
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  panel: ReactNode;
}>;

export type TabsProps = Readonly<{
  ariaLabel: string;
  items: readonly TabsItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  idPrefix?: string;
}>;

function createBaseId(idPrefix: string | undefined, generatedId: string) {
  const namespace = idPrefix ?? 'amt-tabs';
  return `${namespace}-${generatedId.replaceAll(':', '')}`;
}

/** 提供可受控、可键盘导航并带 ARIA 关联的页签与面板。 */
export function Tabs({ ariaLabel, className, idPrefix, items, onChange, value }: TabsProps) {
  const generatedId = useId();
  const baseId = createBaseId(idPrefix, generatedId);
  const classes = ['amt-tabs', className].filter(Boolean).join(' ');
  const activeIndex = items.findIndex((item) => item.id === value);

  function focusTab(id: string) {
    window.setTimeout(() => document.getElementById(`${baseId}-tab-${id}`)?.focus(), 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (activeIndex < 0 || items.length === 0) {
      return;
    }

    let nextIndex = activeIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (activeIndex + 1) % items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextItem = items[nextIndex];
    onChange(nextItem.id);
    focusTab(nextItem.id);
  }

  return (
    <div className={classes}>
      <div className="amt-tabs-list" role="tablist" aria-label={ariaLabel}>
        {items.map((item) => (
          <button
            key={item.id}
            id={`${baseId}-tab-${item.id}`}
            className="amt-tab"
            type="button"
            role="tab"
            aria-selected={value === item.id}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={value === item.id ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={handleKeyDown}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${baseId}-panel-${item.id}`}
          className="amt-tabpanel"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${item.id}`}
          tabIndex={0}
          hidden={value !== item.id}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
