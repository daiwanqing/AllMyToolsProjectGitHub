import { useId, useState, type ReactNode } from 'react';

export type DisclosureProps = Readonly<{
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}>;

/** 组合可展开标题和内容面板的统一折叠控件。 */
export function Disclosure({
  children,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
  open: suppliedOpen,
  title,
}: DisclosureProps) {
  const generatedId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = suppliedOpen ?? uncontrolledOpen;
  const panelId = `${generatedId}-panel`;

  function toggle() {
    const nextOpen = !open;
    if (suppliedOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }

  return (
    <div className="amt-disclosure">
      <button
        className="amt-disclosure-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={toggle}
      >
        <span>{title}</span>
        <span className="amt-disclosure-icon" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      <div id={panelId} className="amt-disclosure-panel" hidden={!open}>
        {children}
      </div>
    </div>
  );
}
