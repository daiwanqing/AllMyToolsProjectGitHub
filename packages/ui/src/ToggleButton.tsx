import type { ButtonProps } from './Button';
import { Button } from './Button';

export type ToggleButtonProps = Readonly<
  Omit<ButtonProps, 'aria-pressed'> & {
    pressed: boolean;
  }
>;

/** 用于在两个稳定状态间切换的按钮，向辅助技术暴露 aria-pressed。 */
export function ToggleButton({ className, pressed, ...props }: ToggleButtonProps) {
  return (
    <Button
      {...props}
      className={['amt-toggle-button', className].filter(Boolean).join(' ')}
      aria-pressed={pressed}
    />
  );
}
