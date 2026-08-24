import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconButtonProps = Readonly<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'title'> & {
    children: ReactNode;
    label: string;
    pressed?: boolean;
    title?: string;
  }
>;

/** 统一尺寸、焦点、提示和可访问名称的图标按钮。 */
export function IconButton({
  children,
  className,
  label,
  pressed,
  title,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={['amt-icon-button', className].filter(Boolean).join(' ')}
      type={type}
      title={title ?? label}
      aria-label={label}
      aria-pressed={pressed}
    >
      {children}
    </button>
  );
}
