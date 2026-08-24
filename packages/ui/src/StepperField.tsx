import { useId } from 'react';
import type { ChangeEvent } from 'react';

export type StepperFieldProps = Readonly<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  disabled?: boolean;
  id?: string;
}>;

function clamp(value: number, min: number | undefined, max: number | undefined) {
  const withMin = min === undefined ? value : Math.max(value, min);
  return max === undefined ? withMin : Math.min(withMin, max);
}

/** 组合数值输入和增减按钮的统一步进控件。 */
export function StepperField({
  description,
  disabled = false,
  id: suppliedId,
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
}: StepperFieldProps) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;

  function updateFromInput(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = Number(event.target.value);
    if (Number.isFinite(nextValue)) {
      onChange(clamp(nextValue, min, max));
    }
  }

  function updateBy(delta: number) {
    onChange(clamp(value + delta, min, max));
  }

  return (
    <div className="amt-field amt-stepper-field">
      <label className="amt-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="amt-stepper-control">
        <button
          className="amt-stepper-button"
          type="button"
          aria-label={`减少${label}`}
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={() => updateBy(-step)}
        >
          −
        </button>
        <input
          id={id}
          className="amt-field-input amt-stepper-input"
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={updateFromInput}
          aria-describedby={descriptionId}
        />
        <button
          className="amt-stepper-button"
          type="button"
          aria-label={`增加${label}`}
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => updateBy(step)}
        >
          +
        </button>
      </div>
      {description ? (
        <span className="amt-field-description" id={descriptionId}>
          {description}
        </span>
      ) : null}
    </div>
  );
}
