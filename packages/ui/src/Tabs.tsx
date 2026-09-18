import { type KeyboardEvent, type ReactNode, useId } from 'react';

export type TabsItem = Readonly<{
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
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
  const enabledItems = items.filter((item) => !item.disabled);
  const tabStop = enabledItems.find((item) => item.id === value)?.id ?? enabledItems[0]?.id;

  function focusTab(id: string) {
    window.setTimeout(() => document.getElementById(`${baseId}-tab-${id}`)?.focus(), 0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const activeIndex = enabledItems.findIndex((item) => item.id === id);
    if (activeIndex < 0 || enabledItems.length === 0) {
      return;
    }

    let nextIndex = activeIndex;
    if (event.key === 'ArrowRight') {
      nextIndex = (activeIndex + 1) % enabledItems.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (activeIndex - 1 + enabledItems.length) % enabledItems.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = enabledItems.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextItem = enabledItems[nextIndex];
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
            tabIndex={tabStop === item.id ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, item.id)}
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
