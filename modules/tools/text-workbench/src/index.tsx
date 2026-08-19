import { useState } from 'react';
import { Button, TextField } from '@allmytools/ui';
import { manifest } from './manifest';
import { loadTextDraft, saveTextDraft } from './storage';

export { manifest };

export function ToolView() {
  const [text, setText] = useState(() => loadTextDraft(window.localStorage));
  const [saved, setSaved] = useState(() => Boolean(loadTextDraft(window.localStorage)));

  return (
    <section aria-labelledby="text-workbench-heading">
      <p className="eyebrow">工具</p>
      <h2 id="text-workbench-heading">文本工作台</h2>
      <p className="tool-workspace-description">先清理文本两端的空白字符，再确认保存处理结果。</p>
      <TextField
        label="临时文本"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setSaved(false);
        }}
      />
      <Button
        variant="secondary"
        onClick={() => {
          setText((current) => current.trim());
          setSaved(false);
        }}
      >
        清理空白
      </Button>
      <Button
        disabled={!text.trim()}
        onClick={() => {
          saveTextDraft(window.localStorage, text);
          setSaved(true);
        }}
      >
        保存文本
      </Button>
      {saved ? <p role="status">文本已保存</p> : null}
    </section>
  );
}
