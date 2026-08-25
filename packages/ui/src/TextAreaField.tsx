import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export type TextAreaFieldProps = Readonly<
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
    description?: string;
    error?: string;
    id?: string;
    label: string;
  }
>;

/** 带标签、说明与错误关联的多行文本输入。 */
export function TextAreaField({
  className,
  description,
  error,
  id: suppliedId,
  label,
  ...textareaProps
}: TextAreaFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="amt-field">
      <label className="amt-field-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        {...textareaProps}
        id={id}
        className={['amt-field-input', 'amt-textarea-field-input', className]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
      />
      {description ? (
        <span className="amt-field-description" id={descriptionId}>
          {description}
        </span>
      ) : null}
      {error ? (
        <span className="amt-field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
