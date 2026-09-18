import { useEffect, useId, useState } from 'react';
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
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [value, min, max, disabled]);

  function draftValue() {
    const parsed = draft === null || draft.trim() === '' ? NaN : Number(draft);
    return Number.isFinite(parsed) ? parsed : value;
  }
  const currentValue = clamp(draftValue(), min, max);

  function commit() {
    const nextValue = currentValue;
    setDraft(null);
    if (nextValue !== value) onChange(nextValue);
  }

  function updateFromInput(event: ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value);
  }

  function updateBy(delta: number) {
    const nextValue = clamp(currentValue + delta, min, max);
    setDraft(null);
    if (nextValue !== value) onChange(nextValue);
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
          disabled={disabled || (min !== undefined && currentValue <= min)}
          onClick={() => updateBy(-step)}
        >
          −
        </button>
        <input
          id={id}
          className="amt-field-input amt-stepper-input"
          type="number"
          value={draft ?? value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={updateFromInput}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              setDraft(null);
            }
          }}
          aria-describedby={descriptionId}
        />
        <button
          className="amt-stepper-button"
          type="button"
          aria-label={`增加${label}`}
          disabled={disabled || (max !== undefined && currentValue >= max)}
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
