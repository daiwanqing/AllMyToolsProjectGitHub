export type ProgressBarProps = Readonly<{
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
}>;

/** 带可访问进度语义和数值反馈的统一进度条。 */
export function ProgressBar({ label, max = 100, showValue = true, value }: ProgressBarProps) {
  const boundedValue = Math.min(Math.max(value, 0), max);
  const percentage = max === 0 ? 0 : Math.round((boundedValue / max) * 100);

  return (
    <div className="amt-progress-field">
      <div className="amt-progress-header">
        <span>{label}</span>
        {showValue ? <span>{percentage}%</span> : null}
      </div>
      <div
        className="amt-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={boundedValue}
      >
        <span className="amt-progress-value" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
