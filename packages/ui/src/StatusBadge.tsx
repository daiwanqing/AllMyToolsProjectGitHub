import type { HTMLAttributes, ReactNode } from 'react';

export type StatusBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type StatusBadgeProps = Readonly<
  Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    children: ReactNode;
    marker?: boolean;
    tone?: StatusBadgeTone;
  }
>;

/** 用统一语义色表达可扫描状态的标签。 */
export function StatusBadge({
  children,
  className,
  marker = true,
  tone = 'neutral',
  ...props
}: StatusBadgeProps) {
  return (
    <span
      {...props}
      className={[
        'amt-status-badge',
        `amt-status-badge-${tone}`,
        marker ? 'amt-status-badge-marker' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {marker ? <span className="amt-status-badge-mark" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
