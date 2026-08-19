import { useState } from 'react';
import { Button } from '@allmytools/ui';
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
      <div className="tool-option-list" role="list">
        {sessionOptions.map((option) => (
          <Button
            key={option}
            variant={selected === option ? 'primary' : 'secondary'}
            aria-pressed={selected === option}
            onClick={() => {
              setSelected(option);
              setSaved(false);
            }}
          >
            {option}
          </Button>
        ))}
      </div>
      <Button
        disabled={!selected}
        onClick={() => {
          saveSelectedSession(window.localStorage, selected);
          setSaved(true);
        }}
      >
        保存选择
      </Button>
      {selected ? <p role="status">当前选择：{selected}</p> : null}
      {saved ? <p role="status">选择已保存</p> : null}
    </section>
  );
}
