import { useState } from 'react';
import { Button, TextField } from '@allmytools/ui';
import { manifest } from './manifest';
import { loadReviewDraft, saveReviewDraft } from './storage';

export { manifest };

export function ToolView() {
  const [note, setNote] = useState(() => loadReviewDraft(window.localStorage));
  const [saved, setSaved] = useState(false);

  return (
    <section aria-labelledby="note-review-heading">
      <p className="eyebrow">学习工具</p>
      <h2 id="note-review-heading">复习笔记工作区</h2>
      <p className="tool-workspace-description">记录下一次复习前需要整理的内容。</p>
      <TextField
        label="待复习内容"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setSaved(false);
        }}
      />
      <Button
        onClick={() => {
          saveReviewDraft(window.localStorage, note);
          setSaved(true);
        }}
      >
        保存草稿
      </Button>
      {saved ? <p role="status">草稿已保存。</p> : null}
    </section>
  );
}
