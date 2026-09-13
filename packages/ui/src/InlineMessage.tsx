import type { ReactNode } from 'react';

export type InlineMessageTone = 'info' | 'error';

export type InlineMessageProps = Readonly<{
  children: ReactNode;
  title: string;
  tone?: InlineMessageTone;
}>;

/** 在当前上下文内提供信息或需要立即处理的错误。 */
export function InlineMessage({ children, title, tone = 'info' }: InlineMessageProps) {
  return (
    <section
      className={`amt-inline-message amt-inline-message-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span className="amt-inline-message-mark" aria-hidden="true" />
      <strong>{title}</strong>
      <p>{children}</p>
    </section>
  );
}
