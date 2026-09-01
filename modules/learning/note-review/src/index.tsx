import { useState } from 'react';
import { Button, FloatingNotice, TextField } from '@allmytools/ui';
import { manifest } from './manifest';
import { loadReviewDraft, saveReviewDraft } from './storage';

export { manifest };

export function ToolView() {
  const [note, setNote] = useState(() => loadReviewDraft(window.localStorage));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  return (
    <section
      aria-label="复习笔记工具"
      data-debug-target="true"
      data-debug-kind="区域"
      data-debug-label="复习笔记工具"
      data-debug-source="modules/learning/note-review/src/index.tsx:12"
      data-debug-code={'export function ToolView() { return <section aria-label="复习笔记工具">...'}
    >
      <TextField
        label="待复习内容"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setSaved(false);
          setSaveError(undefined);
        }}
      />
      <Button
        onClick={() => {
          const result = saveReviewDraft(window.localStorage, note);
          setSaved(result.ok);
          setSaveError(result.ok ? undefined : result.message);
        }}
      >
        保存草稿
      </Button>
      {saved ? (
        <FloatingNotice title="保存状态" onDismiss={() => setSaved(false)}>
          草稿已保存。
        </FloatingNotice>
      ) : null}
      {saveError ? (
        <FloatingNotice title="保存失败" tone="error" onDismiss={() => setSaveError(undefined)}>
          {saveError}
        </FloatingNotice>
      ) : null}
    </section>
  );
}
