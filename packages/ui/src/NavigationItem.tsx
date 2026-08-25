import type { ReactNode } from 'react';
import { Button, type ButtonProps } from './Button';

export type NavigationItemProps = Readonly<
  Omit<ButtonProps, 'aria-current' | 'children' | 'variant'> & {
    active?: boolean;
    icon: ReactNode;
    label: string;
  }
>;

/** 提供紧凑导航尺寸、图标标签布局和当前页面语义的公共导航项。 */
export function NavigationItem({
  active = false,
  className,
  icon,
  label,
  ...props
}: NavigationItemProps) {
  return (
    <Button
      {...props}
      className={['amt-navigation-item', className].filter(Boolean).join(' ')}
      variant="ghost"
      aria-current={active ? 'page' : undefined}
    >
      <span className="amt-navigation-item-icon">{icon}</span>
      <span>{label}</span>
    </Button>
  );
}
