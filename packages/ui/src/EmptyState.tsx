import { useId, type ReactNode } from 'react';

export type EmptyStateProps = Readonly<{
  action?: ReactNode;
  description: string;
  framed?: boolean;
  icon?: ReactNode;
  title: string;
}>;

/** 为尚无数据的工作区提供明确下一步。 */
export function EmptyState({ action, description, framed = false, icon, title }: EmptyStateProps) {
  const titleId = useId();

  return (
    <section
      className={['amt-empty-state', framed ? 'amt-empty-state-framed' : '']
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={titleId}
    >
      {icon ? (
        <span className="amt-empty-state-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h2 id={titleId}>{title}</h2>
      <p>{description}</p>
      {action ? <div className="amt-empty-state-action">{action}</div> : null}
    </section>
  );
}
