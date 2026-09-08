import { useState, type FormEvent } from 'react';
import { Button, EmptyState, FloatingNotice, InlineMessage, TextField } from '@allmytools/ui';
import { manifest } from './manifest';
import { loadBoardGames, saveBoardGames } from './storage';

export { manifest };

export function ToolView() {
  const [games, setGames] = useState(() => loadBoardGames(window.localStorage));
  const [draftName, setDraftName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveNoticeVisible, setSaveNoticeVisible] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  function addGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim();
    if (!name || games.includes(name)) return;
    setGames((current) => [...current, name]);
    setDraftName('');
    setHasUnsavedChanges(true);
    setSaveNoticeVisible(false);
    setSaveError(undefined);
  }

  return (
    <section
      aria-label="桌游工具"
      className="board-games-workspace"
      data-debug-target="true"
      data-debug-kind="区域"
      data-debug-label="桌游工具"
      data-debug-source="modules/life/board-games/src/index.tsx:10"
      data-debug-code={'export function ToolView() { return <section aria-label="桌游工具">...'}
    >
      <header>
        <p className="eyebrow">收藏</p>
        <h2>我的桌游收藏</h2>
      </header>
      <form className="board-games-add-form" onSubmit={addGame}>
        <TextField
          label="桌游名称"
          value={draftName}
          data-debug-source="modules/life/board-games/src/index.tsx:29"
          data-debug-code={'<TextField label="桌游名称" ... />'}
          onChange={(event) => setDraftName(event.target.value)}
        />
        <Button type="submit" disabled={!draftName.trim()}>
          加入收藏
        </Button>
      </form>
      {games.length ? (
        <ul className="board-games-list" aria-label="已收藏桌游">
          {games.map((game) => (
            <li className="board-games-list-item" key={game}>
              <span>{game}</span>
              <Button
                variant="danger"
                onClick={() => {
                  setGames((current) => current.filter((item) => item !== game));
                  setHasUnsavedChanges(true);
                  setSaveNoticeVisible(false);
                  setSaveError(undefined);
                }}
              >
                移除
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="还没有收藏桌游" description="添加第一款桌游，建立自己的收藏清单。" />
      )}
      <Button
        disabled={!hasUnsavedChanges}
        data-debug-source="modules/life/board-games/src/index.tsx:62"
        data-debug-code={'<Button>保存收藏</Button>'}
        onClick={() => {
          const result = saveBoardGames(window.localStorage, games);
          setHasUnsavedChanges(!result.ok);
          setSaveNoticeVisible(result.ok);
          setSaveError(result.ok ? undefined : result.message);
        }}
      >
        保存收藏
      </Button>
      {saveNoticeVisible ? (
        <FloatingNotice
          title="保存状态"
          tone="success"
          onDismiss={() => setSaveNoticeVisible(false)}
        >
          收藏已保存
        </FloatingNotice>
      ) : null}
      {saveError ? (
        <InlineMessage title="保存失败" tone="error">
          {saveError}
        </InlineMessage>
      ) : null}
    </section>
  );
}
