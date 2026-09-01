import { useState } from 'react';
import { Button, FloatingNotice, TextField } from '@allmytools/ui';
import { manifest } from './manifest';
import { loadReviewDraft, saveReviewDraft } from './storage';

export { manifest };

export function ToolView() {
  const [note, setNote] = useState(() => loadReviewDraft(window.localStorage));
  const [saved, setSaved] = useState(false);

  return (
    <section aria-label="复习笔记工具">
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
      {saved ? (
        <FloatingNotice title="保存状态" onDismiss={() => setSaved(false)}>
          草稿已保存。
        </FloatingNotice>
      ) : null}
    </section>
  );
}
