import { useId } from 'react';
import type { ChangeEventHandler, SelectHTMLAttributes } from 'react';

export type SelectOption = Readonly<{
  value: string;
  label: string;
  disabled?: boolean;
}>;

export type SelectFieldProps = Readonly<
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'onChange' | 'value'> & {
    description?: string;
    error?: string;
    id?: string;
    label: string;
    options: readonly SelectOption[];
    onChange: ChangeEventHandler<HTMLSelectElement>;
    value: string;
  }
>;

/** 带标签、说明和错误关联的统一下拉选择控件。 */
export function SelectField({
  className,
  description,
  error,
  id: suppliedId,
  label,
  onChange,
  options,
  value,
  ...selectProps
}: SelectFieldProps) {
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
      <select
        {...selectProps}
        id={id}
        className={['amt-field-input', 'amt-select-field-input', className]
          .filter(Boolean)
          .join(' ')}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
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
