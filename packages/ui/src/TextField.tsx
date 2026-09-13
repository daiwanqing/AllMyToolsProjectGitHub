import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export type TextFieldProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
    description?: string;
    error?: string;
    id?: string;
    label: string;
    leadingIcon?: ReactNode;
  }
>;

/** 带标签、说明与错误关联的单行文本输入。 */
export function TextField({
  className,
  description,
  error,
  id: suppliedId,
  label,
  leadingIcon,
  ...inputProps
}: TextFieldProps) {
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
      <span
        className={['amt-field-control', leadingIcon ? 'amt-field-control-with-icon' : '']
          .filter(Boolean)
          .join(' ')}
      >
        {leadingIcon ? (
          <span className="amt-field-leading-icon" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <input
          {...inputProps}
          id={id}
          className={['amt-field-input', className].filter(Boolean).join(' ')}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
        />
      </span>
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
