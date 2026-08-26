import { useEffect, type ReactNode } from 'react';

export type FloatingNoticeTone = 'info' | 'success' | 'error';
export const floatingNoticeAutoDismissMs = 1800;

export type FloatingNoticeProps = Readonly<{
  children: ReactNode;
  title: string;
  tone?: FloatingNoticeTone;
  autoDismissMs?: number;
  onDismiss?: () => void;
}>;

/** 用于确认已完成或可逆操作的短暂悬浮反馈。 */
export function FloatingNotice({
  children,
  title,
  tone = 'info',
  autoDismissMs = floatingNoticeAutoDismissMs,
  onDismiss,
}: FloatingNoticeProps) {
  useEffect(() => {
    if (!autoDismissMs || !onDismiss) {
      return;
    }

    const timer = globalThis.setTimeout(onDismiss, autoDismissMs);
    return () => globalThis.clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  return (
    <section
      className={`amt-floating-notice amt-floating-notice-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <strong>{title}</strong>
      <p>{children}</p>
    </section>
  );
}
