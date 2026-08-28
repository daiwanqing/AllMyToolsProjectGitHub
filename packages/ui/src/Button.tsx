import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    loading?: boolean;
    variant?: ButtonVariant;
  }
>;

/** 提供稳定尺寸与加载状态的共享命令按钮。 */
export function Button({
  children,
  className,
  disabled = false,
  loading = false,
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  const classes = ['amt-button', `amt-button-${variant}`, className].filter(Boolean).join(' ');

  return (
    <button
      {...props}
      className={classes}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      <span className="amt-button-label">{children}</span>
      {loading ? <span className="amt-button-spinner" aria-hidden="true" /> : null}
    </button>
  );
}
