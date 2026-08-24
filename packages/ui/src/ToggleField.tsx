import { useId } from 'react';
import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from 'react';

export type ToggleFieldProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'id' | 'onChange' | 'type'> & {
    checked: boolean;
    id?: string;
    label: ReactNode;
    description?: ReactNode;
    onChange: ChangeEventHandler<HTMLInputElement>;
  }
>;

/** 组合复选框、可见标签和说明的二元设置控件。 */
export function ToggleField({
  checked,
  className,
  description,
  disabled,
  id: suppliedId,
  label,
  onChange,
  ...inputProps
}: ToggleFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <label className={['amt-toggle-field', className].filter(Boolean).join(' ')} htmlFor={id}>
      <input
        {...inputProps}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
      />
      <span className="amt-toggle-field-copy">
        <span className="amt-toggle-field-label" id={labelId}>
          {label}
        </span>
        {description ? (
          <span className="amt-toggle-field-description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
