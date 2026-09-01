import { useState } from 'react';
import { Button, FloatingNotice, HorizontalTabs, StatusBadge } from '@allmytools/ui';
import { manifest } from './manifest';
import { loadSelectedSession, saveSelectedSession } from './storage';

export const sessionOptions = ['看一部电影', '玩一局游戏', '听一张专辑'] as const;

export { manifest };

export function ToolView() {
  const [selected, setSelected] = useState(() => loadSelectedSession(window.localStorage));
  const [saved, setSaved] = useState(() => Boolean(loadSelectedSession(window.localStorage)));

  return (
    <section
      aria-label="活动选择器工具"
      data-debug-target="true"
      data-debug-kind="区域"
      data-debug-label="活动选择器工具"
      data-debug-source="modules/entertainment/session-picker/src/index.tsx:12"
      data-debug-code={
        'export function ToolView() { return <section aria-label="活动选择器工具">...'
      }
    >
      <HorizontalTabs
        ariaLabel="候选活动"
        items={sessionOptions.map((option) => ({ id: option, label: option }))}
        value={selected}
        onChange={(option) => {
          setSelected(option);
          setSaved(false);
        }}
      />
      <Button
        disabled={!selected}
        onClick={() => {
          saveSelectedSession(window.localStorage, selected);
          setSaved(true);
        }}
      >
        保存选择
      </Button>
      {selected ? <StatusBadge tone="info">当前选择：{selected}</StatusBadge> : null}
      {saved ? (
        <FloatingNotice title="保存状态" onDismiss={() => setSaved(false)}>
          选择已保存
        </FloatingNotice>
      ) : null}
    </section>
  );
}
