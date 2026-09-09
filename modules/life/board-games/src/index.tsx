import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Button,
  FloatingNotice,
  HorizontalTabs,
  IconButton,
  InlineMessage,
  Modal,
  SelectField,
  TextAreaField,
  TextField,
  StatusBadge,
} from '@allmytools/ui';
import { Clock3, Image, Pencil, Plus, Star, Trash2, Users } from 'lucide-react';
import { manifest } from './manifest';
import {
  loadBoardGameCollection,
  saveBoardGameCollection,
  type BoardGameCategory as StoredBoardGameCategory,
  type BoardGameDifficulty,
  type StoredBoardGame,
} from './storage';

export { manifest };

type BoardGameCategory = '全部' | '策略' | '聚会' | '双人';

type BoardGame = StoredBoardGame;

type BoardGameDraft = Omit<BoardGame, 'id'>;

const emptyDraft: BoardGameDraft = {
  category: '策略',
  description: '',
  difficulty: '轻松入门',
  duration: '',
  name: '',
  players: '',
  tagline: '',
};

const boardGames: readonly BoardGame[] = [
  {
    id: 'catan',
    name: '卡坦岛',
    tagline: '在麦田、牧场和港口之间交换资源。',
    description: '一局一局铺开道路，也把谈判和运气留在桌面上。',
    category: '策略',
    players: '3–4 人',
    duration: '60–90 分钟',
    difficulty: '需要规划',
  },
  {
    id: 'splendor',
    name: '璀璨宝石',
    tagline: '收集宝石，吸引贵族，建立你的宝石帝国。',
    description: '规则轻巧、节奏明快，适合第一次坐到同一张桌边。',
    category: '策略',
    players: '2–4 人',
    duration: '30 分钟',
    difficulty: '轻松入门',
  },
  {
    id: 'codenames',
    name: '行动代号',
    tagline: '只用一个词，让队友找到正确的线索。',
    description: '语言、默契和一点点冒险，适合热闹的多人聚会。',
    category: '聚会',
    players: '4–8 人',
    duration: '15–30 分钟',
    difficulty: '轻松入门',
  },
  {
    id: 'patchwork',
    name: '拼布艺术',
    tagline: '一针一线，把零碎布片缝成自己的作品。',
    description: '双人对弈的安静时刻，每一块拼布都要算得刚刚好。',
    category: '双人',
    players: '2 人',
    duration: '30 分钟',
    difficulty: '需要规划',
  },
  {
    id: 'wingspan',
    name: '展翅翱翔',
    tagline: '把鸟儿带进栖息地，让生态慢慢生长。',
    description: '卡牌画面细腻，策略线索丰富，适合慢慢展开的一晚。',
    category: '策略',
    players: '1–5 人',
    duration: '40–70 分钟',
    difficulty: '深度策略',
  },
  {
    id: 'dixit',
    name: '妙不可言',
    tagline: '用一句刚刚好的话，打开一张图的想象。',
    description: '没有标准答案的联想游戏，每个人都能带来自己的故事。',
    category: '聚会',
    players: '3–6 人',
    duration: '30 分钟',
    difficulty: '轻松入门',
  },
];

const categoryTabs = (['全部', '策略', '聚会', '双人'] as const).map((label) => ({
  id: label,
  label,
}));

function GameCard({
  game,
  favorite,
  onDelete,
  onEdit,
  onToggleFavorite,
}: Readonly<{
  game: BoardGame;
  favorite: boolean;
  onDelete: (game: BoardGame) => void;
  onEdit: (game: BoardGame) => void;
  onToggleFavorite: (name: string) => void;
}>) {
  return (
    <article className="board-game-card" aria-labelledby={`board-game-${game.id}`}>
      <div
        className={`board-game-card-media board-game-card-media-${game.category}`}
        role="img"
        aria-label={`${game.name} 图片展示区`}
      >
        {game.imageData ? <img src={game.imageData} alt="" /> : <Image aria-hidden="true" />}
        <span>{game.category}</span>
      </div>
      <div className="board-game-card-body">
        <div className="board-game-card-heading">
          <div>
            <h3 id={`board-game-${game.id}`}>{game.name}</h3>
            <p className="board-game-card-kicker">{game.tagline}</p>
          </div>
          <div className="board-game-card-actions">
            <IconButton
              label={favorite ? `取消收藏 ${game.name}` : `收藏 ${game.name}`}
              pressed={favorite}
              onClick={() => onToggleFavorite(game.name)}
            >
              <Star aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} />
            </IconButton>
            <IconButton label={`编辑 ${game.name}`} onClick={() => onEdit(game)}>
              <Pencil aria-hidden="true" />
            </IconButton>
            <IconButton
              className="board-game-delete-button"
              label={`删除 ${game.name}`}
              onClick={() => onDelete(game)}
            >
              <Trash2 aria-hidden="true" />
            </IconButton>
          </div>
        </div>
        <p className="board-game-card-description">{game.description}</p>
        <div className="board-game-card-meta" aria-label={`${game.name} 游玩信息`}>
          <span>
            <Users aria-hidden="true" />
            {game.players}
          </span>
          <span>
            <Clock3 aria-hidden="true" />
            {game.duration}
          </span>
        </div>
        <StatusBadge tone={game.difficulty === '深度策略' ? 'warning' : 'neutral'}>
          {game.difficulty}
        </StatusBadge>
      </div>
    </article>
  );
}

export function ToolView() {
  const [initialCollection] = useState(() => loadBoardGameCollection(window.localStorage));
  const [games, setGames] = useState<readonly BoardGame[]>(
    () => initialCollection.games ?? boardGames,
  );
  const [savedNames, setSavedNames] = useState(() => initialCollection.favorites);
  const [category, setCategory] = useState<BoardGameCategory>('全部');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveNoticeVisible, setSaveNoticeVisible] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [editorMode, setEditorMode] = useState<'new' | string>();
  const [draft, setDraft] = useState<BoardGameDraft>(emptyDraft);
  const [imageError, setImageError] = useState<string>();
  const filteredGames = useMemo(
    () => (category === '全部' ? games : games.filter((game) => game.category === category)),
    [category, games],
  );
  const savedSet = new Set(savedNames);

  function openEditor(game?: BoardGame) {
    setEditorMode(game?.id ?? 'new');
    if (game) {
      setDraft({
        category: game.category,
        description: game.description,
        difficulty: game.difficulty,
        duration: game.duration,
        imageData: game.imageData,
        name: game.name,
        players: game.players,
        tagline: game.tagline,
      });
    } else {
      setDraft({ ...emptyDraft });
    }
    setSaveError(undefined);
    setImageError(undefined);
  }

  function closeEditor() {
    setEditorMode(undefined);
  }

  function submitGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = {
      ...draft,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      players: draft.players.trim(),
      duration: draft.duration.trim(),
    };
    if (
      !normalized.name ||
      !normalized.description ||
      !normalized.players ||
      !normalized.duration
    ) {
      return;
    }

    if (editorMode === 'new') {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setGames((current) => [...current, { ...normalized, id }]);
    } else if (editorMode) {
      const currentGame = games.find((game) => game.id === editorMode);
      setGames((current) =>
        current.map((game) => (game.id === editorMode ? { ...normalized, id: editorMode } : game)),
      );
      if (currentGame && currentGame.name !== normalized.name) {
        setSavedNames((current) =>
          current.map((name) => (name === currentGame.name ? normalized.name : name)),
        );
      }
    }
    setHasUnsavedChanges(true);
    setSaveNoticeVisible(false);
    closeEditor();
  }

  function deleteGame(game: BoardGame) {
    setGames((current) => current.filter((item) => item.id !== game.id));
    setSavedNames((current) => current.filter((name) => name !== game.name));
    setHasUnsavedChanges(true);
    setSaveNoticeVisible(false);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('请选择图片文件。');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('图片不能超过 2MB。');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setDraft((current) => ({ ...current, imageData: result }));
        setImageError(undefined);
      } else {
        setImageError('图片读取失败，请重试。');
      }
    };
    reader.onerror = () => setImageError('图片读取失败，请重试。');
    reader.readAsDataURL(file);
  }

  function toggleFavorite(name: string) {
    setSavedNames((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
    setHasUnsavedChanges(true);
    setSaveNoticeVisible(false);
    setSaveError(undefined);
  }

  function saveCollection() {
    const result = saveBoardGameCollection(window.localStorage, {
      games: [...games],
      favorites: savedNames,
    });
    setHasUnsavedChanges(!result.ok);
    setSaveError(result.ok ? undefined : result.message);
    setSaveNoticeVisible(result.ok);
  }

  return (
    <section
      className="board-games-gallery"
      aria-label="代代桌游馆"
      data-debug-target="true"
      data-debug-kind="区域"
      data-debug-label="代代桌游馆"
      data-debug-source="modules/life/board-games/src/index.tsx:116"
      data-debug-code={'export function ToolView() { return <section aria-label="代代桌游馆">...'}
    >
      <header className="board-games-hero">
        <div className="board-games-hero-copy">
          <h2>代代桌游馆</h2>
          <div className="board-games-hero-stats" aria-label="馆藏统计">
            <span>
              <strong>{games.length}</strong>
              <small>款馆藏</small>
            </span>
            <span>
              <strong>{new Set(games.map((game) => game.category)).size}</strong>
              <small>种玩法</small>
            </span>
            <span>
              <strong>{savedNames.length}</strong>
              <small>已收藏</small>
            </span>
          </div>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus aria-hidden="true" />
          添加桌游
        </Button>
      </header>

      <section className="board-games-shelf" aria-labelledby="board-games-shelf-title">
        <div className="board-games-shelf-heading">
          <h3 id="board-games-shelf-title">馆藏</h3>
        </div>
        <div className="board-games-shelf-controls">
          <HorizontalTabs
            ariaLabel="馆藏分类"
            items={categoryTabs}
            value={category}
            onChange={(value) => {
              if (value === '全部' || value === '策略' || value === '聚会' || value === '双人') {
                setCategory(value);
              }
            }}
          />
          <Button
            variant="secondary"
            onClick={saveCollection}
            disabled={!hasUnsavedChanges || saveNoticeVisible}
          >
            保存收藏
          </Button>
        </div>
        {filteredGames.length ? (
          <div className="board-games-card-grid">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                favorite={savedSet.has(game.name)}
                onDelete={deleteGame}
                onEdit={openEditor}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <InlineMessage title="这个展架还没有藏品">
            换一个分类，继续看看馆里的其他桌游。
          </InlineMessage>
        )}
      </section>

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
      {editorMode ? (
        <BoardGameEditor
          draft={draft}
          mode={editorMode === 'new' ? 'new' : 'edit'}
          onChange={setDraft}
          onClose={closeEditor}
          onImageChange={handleImageChange}
          onSubmit={submitGame}
          imageError={imageError}
        />
      ) : null}
    </section>
  );
}

function BoardGameEditor({
  draft,
  mode,
  onChange,
  onClose,
  onImageChange,
  onSubmit,
  imageError,
}: Readonly<{
  draft: BoardGameDraft;
  mode: 'new' | 'edit';
  onChange: (draft: BoardGameDraft) => void;
  onClose: () => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  imageError?: string;
}>) {
  return (
    <Modal
      className="board-game-editor-modal"
      labelledBy="board-game-editor-title"
      open
      onClose={onClose}
    >
      <div className="board-game-editor-panel">
        <form className="board-game-editor" onSubmit={onSubmit}>
          <h2 id="board-game-editor-title">{mode === 'new' ? '添加桌游' : '编辑桌游'}</h2>
          <div className="board-game-editor-grid">
            <TextField
              label="名称"
              required
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.target.value })}
            />
            <SelectField
              label="分类"
              options={[
                { value: '策略', label: '策略' },
                { value: '聚会', label: '聚会' },
                { value: '双人', label: '双人' },
              ]}
              value={draft.category}
              onChange={(event) =>
                onChange({ ...draft, category: event.target.value as StoredBoardGameCategory })
              }
            />
            <TextField
              label="人数"
              placeholder="例如：2–4 人"
              required
              value={draft.players}
              onChange={(event) => onChange({ ...draft, players: event.target.value })}
            />
            <TextField
              label="时长"
              placeholder="例如：30 分钟"
              required
              value={draft.duration}
              onChange={(event) => onChange({ ...draft, duration: event.target.value })}
            />
            <SelectField
              label="难度"
              options={[
                { value: '轻松入门', label: '轻松入门' },
                { value: '需要规划', label: '需要规划' },
                { value: '深度策略', label: '深度策略' },
              ]}
              value={draft.difficulty}
              onChange={(event) =>
                onChange({ ...draft, difficulty: event.target.value as BoardGameDifficulty })
              }
            />
          </div>
          <TextField
            label="一句话介绍"
            value={draft.tagline}
            onChange={(event) => onChange({ ...draft, tagline: event.target.value })}
          />
          <TextAreaField
            label="详细介绍"
            required
            rows={4}
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
          />
          <div className="board-game-image-field">
            <label htmlFor="board-game-image">桌游图片</label>
            <input id="board-game-image" type="file" accept="image/*" onChange={onImageChange} />
            <span className="amt-field-description">支持 JPG、PNG 或 WebP，最大 2MB。</span>
            {imageError ? (
              <span className="amt-field-error" role="alert">
                {imageError}
              </span>
            ) : null}
            {draft.imageData ? (
              <img className="board-game-image-preview" src={draft.imageData} alt="桌游封面预览" />
            ) : null}
          </div>
          <div className="board-game-editor-actions">
            <Button variant="secondary" type="button" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">保存桌游</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
