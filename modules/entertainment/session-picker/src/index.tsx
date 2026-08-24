import { useState } from 'react';
import { Button, ChoiceGroup, InlineMessage, StatusBadge } from '@allmytools/ui';
import { manifest } from './manifest';
import { loadSelectedSession, saveSelectedSession } from './storage';

export const sessionOptions = ['看一部电影', '玩一局游戏', '听一张专辑'] as const;

export { manifest };

export function ToolView() {
  const [selected, setSelected] = useState(() => loadSelectedSession(window.localStorage));
  const [saved, setSaved] = useState(() => Boolean(loadSelectedSession(window.localStorage)));

  return (
    <section aria-labelledby="session-picker-heading">
      <p className="eyebrow">娱乐工具</p>
      <h2 id="session-picker-heading">活动选择器工作区</h2>
      <p className="tool-workspace-description">从当前候选活动中选择一项，再确认保存本次安排。</p>
      <ChoiceGroup
        ariaLabel="候选活动"
        options={sessionOptions.map((option) => ({ id: option, label: option }))}
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
      {saved ? <InlineMessage title="保存状态">选择已保存</InlineMessage> : null}
    </section>
  );
}
