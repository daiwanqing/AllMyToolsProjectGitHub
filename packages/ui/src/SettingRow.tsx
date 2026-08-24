import type { ReactNode } from 'react';

export type SettingRowProps = Readonly<{
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}>;

/** 组合设置项说明与右侧控件，保持跨页面的对齐和响应式布局。 */
export function SettingRow({ children, description, label }: SettingRowProps) {
  return (
    <div className="amt-setting-row">
      <div className="amt-setting-row-copy">
        <div className="amt-setting-row-label">{label}</div>
        {description ? <div className="amt-setting-row-description">{description}</div> : null}
      </div>
      <div className="amt-setting-row-control">{children}</div>
    </div>
  );
}
