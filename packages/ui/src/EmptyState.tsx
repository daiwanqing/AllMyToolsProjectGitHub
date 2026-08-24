import { useId, type ReactNode } from 'react';

export type EmptyStateProps = Readonly<{
  action?: ReactNode;
  description: string;
  title: string;
}>;

/** 为尚无数据的工作区提供明确下一步。 */
export function EmptyState({ action, description, title }: EmptyStateProps) {
  const titleId = useId();

  return (
    <section className="amt-empty-state" aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <p>{description}</p>
      {action ? <div className="amt-empty-state-action">{action}</div> : null}
    </section>
  );
}
