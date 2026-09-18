import { useEffect, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';

export type ModalProps = Readonly<{
  children: ReactNode;
  className?: string;
  debugAttributes?: HTMLAttributes<HTMLDialogElement> & Record<`data-${string}`, string>;
  labelledBy: string;
  onClose: () => void;
  open: boolean;
}>;

function tabbableElements(dialog: HTMLDialogElement) {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]'),
  ).filter((element) => {
    if (
      element.tabIndex < 0 ||
      element.matches(':disabled') ||
      element.closest('[hidden], [inert]')
    )
      return false;
    // Inspect ancestors as hidden tab panels still contain otherwise focusable controls.
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse'
      )
        return false;
      if (ancestor === dialog) break;
    }
    return element.getAttribute('type') !== 'hidden';
  });
}

/** 统一模态对话框：原生 modal 优先，并为测试/非原生宿主提供焦点回退。 */
export function Modal({
  children,
  className,
  debugAttributes,
  labelledBy,
  onClose,
  open,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    const dialog = event.currentTarget;
    if (event.target instanceof Element && event.target.closest('dialog') !== dialog) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = tabbableElements(dialog);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const current = focusable.indexOf(document.activeElement as HTMLElement);
    if (current < 0 || (event.shiftKey ? current === 0 : current === focusable.length - 1)) {
      event.preventDefault();
      focusable[event.shiftKey ? focusable.length - 1 : 0].focus();
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return undefined;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (typeof dialog.showModal === 'function') {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute('open', '');
      }
    } else {
      dialog.setAttribute('open', '');
    }
    (tabbableElements(dialog)[0] ?? dialog).focus();

    return () => {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      if (restoreFocusRef.current?.isConnected) restoreFocusRef.current.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <dialog
      ref={dialogRef}
      className={['amt-modal', className].filter(Boolean).join(' ')}
      {...debugAttributes}
      aria-labelledby={labelledBy}
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        onCloseRef.current();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      {children}
    </dialog>
  );
}
