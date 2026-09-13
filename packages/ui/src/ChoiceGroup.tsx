import type { ReactNode } from 'react';
import { Button } from './Button';

export type ChoiceOption = Readonly<{
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}>;

export type ChoiceGroupProps = Readonly<{
  ariaLabel: string;
  options: readonly ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}>;

/** 组合选项按钮、选中状态与可选说明的单选控件。 */
export function ChoiceGroup({ ariaLabel, className, onChange, options, value }: ChoiceGroupProps) {
  return (
    <div
      className={['amt-choice-group', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <Button
          key={option.id}
          className="amt-choice-option"
          variant="secondary"
          aria-pressed={value === option.id}
          disabled={option.disabled}
          onClick={() => onChange(option.id)}
        >
          {option.icon ? <span className="amt-choice-option-icon">{option.icon}</span> : null}
          <span className="amt-choice-option-copy">
            <span className="amt-choice-option-label">{option.label}</span>
            {option.description ? (
              <span className="amt-choice-option-description">{option.description}</span>
            ) : null}
          </span>
        </Button>
      ))}
    </div>
  );
}
