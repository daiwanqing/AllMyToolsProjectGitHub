import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useState } from 'react';
import type { ToolCategory } from '@allmytools/platform-contracts';
import type { ThemeName } from '@allmytools/design-tokens';
import { Button, EmptyState, InlineMessage, TextField } from '@allmytools/ui';
import {
  Clock3,
  Grid2X2,
  Search,
  Settings,
  Sparkles,
  Star,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  categoryLabels,
  matchesToolSearch,
  toolCatalog,
  type ToolCatalogEntry,
} from '../features/catalog';
import { toolRegistry, type ActiveToolSession } from '../features/registeredTools';
import { DesignSystemViewer } from '../features/DesignSystemViewer';
import {
  disableQuickToggleShortcut,
  enableQuickToggleShortcut,
  quickToggleShortcut,
  supportsGlobalShortcuts,
} from '../native/globalShortcut';

type WorkspaceView = 'home' | 'settings';

type ToolErrorBoundaryProps = Readonly<{
  children: ReactNode;
  onClose: () => void;
}>;

type ToolErrorBoundaryState = Readonly<{
  failed: boolean;
}>;

class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  public state: ToolErrorBoundaryState = { failed: false };

  public static getDerivedStateFromError(): ToolErrorBoundaryState {
    return { failed: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Tool render failures are intentionally contained inside the active workspace.
    void error;
    void errorInfo;
  }

  public render() {
    if (this.state.failed) {
      return (
        <EmptyState
          title="工具运行异常"
          description="该工具已被隔离，平台导航和其他工具仍可继续使用。"
          action={<Button onClick={this.props.onClose}>关闭工具</Button>}
        />
      );
    }

    return this.props.children;
  }
}

const categoryNavigation: ReadonlyArray<Readonly<{ category: ToolCategory; icon: LucideIcon }>> = [
  { category: 'learning', icon: Sparkles },
  { category: 'entertainment', icon: Grid2X2 },
  { category: 'tools', icon: Wrench },
];

const themes: ReadonlyArray<Readonly<{ id: ThemeName; label: string }>> = [
  { id: 'light', label: '浅色' },
  { id: 'dark', label: '深色' },
];

const workspaceStorageKey = 'shell.workspace-state';

type PersistedWorkspaceState = Readonly<{
  category: ToolCategory | 'all';
  query: string;
  theme: ThemeName;
  view: WorkspaceView;
}>;

function isWorkspaceView(value: unknown): value is WorkspaceView {
  return value === 'home' || value === 'settings';
}

function isThemeName(value: unknown): value is ThemeName {
  return value === 'light' || value === 'dark';
}

function isToolCategory(value: unknown): value is ToolCategory | 'all' {
  return value === 'all' || value === 'learning' || value === 'entertainment' || value === 'tools';
}

function readWorkspaceState(storage: Storage): PersistedWorkspaceState | undefined {
  const stored = storage.getItem(workspaceStorageKey);
  if (!stored) {
    return undefined;
  }

  try {
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const state = value as Record<string, unknown>;
    if (
      !isWorkspaceView(state.view) ||
      !isToolCategory(state.category) ||
      !isThemeName(state.theme) ||
      typeof state.query !== 'string'
    ) {
      return undefined;
    }

    return {
      view: state.view,
      category: state.category,
      query: state.query,
      theme: state.theme,
    };
  } catch {
    return undefined;
  }
}

function ToolRow({
  entry,
  favorite,
  onOpen,
  onToggleFavorite,
}: Readonly<{
  entry: ToolCatalogEntry;
  favorite: boolean;
  onOpen: (entry: ToolCatalogEntry) => void;
  onToggleFavorite: (id: string) => void;
}>) {
  return (
    <article className="tool-row">
      <div className="tool-row-main">
        <p className="tool-row-category">{categoryLabels[entry.category]}</p>
        <h3>{entry.name}</h3>
        <p>{entry.description}</p>
      </div>
      <div className="tool-row-actions">
        <button
          className="icon-button"
          type="button"
          title={favorite ? `取消收藏 ${entry.name}` : `收藏 ${entry.name}`}
          aria-label={favorite ? `取消收藏 ${entry.name}` : `收藏 ${entry.name}`}
          aria-pressed={favorite}
          onClick={() => onToggleFavorite(entry.id)}
        >
          <Star aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <Button variant="secondary" onClick={() => onOpen(entry)}>
          打开
        </Button>
      </div>
    </article>
  );
}

export function App() {
  const [initialWorkspaceState] = useState(() => readWorkspaceState(window.localStorage));
  const [theme, setTheme] = useState<ThemeName>(initialWorkspaceState?.theme ?? 'light');
  const [view, setView] = useState<WorkspaceView>(initialWorkspaceState?.view ?? 'home');
  const [category, setCategory] = useState<ToolCategory | 'all'>(
    initialWorkspaceState?.category ?? 'all',
  );
  const [query, setQuery] = useState(initialWorkspaceState?.query ?? '');
  const [favoriteIds, setFavoriteIds] = useState<readonly string[]>(['tools.text-workbench']);
  const [recentIds, setRecentIds] = useState<readonly string[]>(['tools.text-workbench']);
  const [shortcutEnabled, setShortcutEnabled] = useState(
    () => window.localStorage.getItem('shell.quick-toggle-shortcut') === 'enabled',
  );
  const [shortcutMessage, setShortcutMessage] = useState<string>();
  const [activeTool, setActiveTool] = useState<ActiveToolSession>();
  const [toolLoadMessage, setToolLoadMessage] = useState<string>();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const workspaceState: PersistedWorkspaceState = { theme, view, category, query };
    window.localStorage.setItem(workspaceStorageKey, JSON.stringify(workspaceState));
  }, [category, query, theme, view]);

  useEffect(() => {
    if (!shortcutEnabled || !supportsGlobalShortcuts()) {
      return;
    }

    void enableQuickToggleShortcut().catch(() => {
      setShortcutEnabled(false);
      window.localStorage.removeItem('shell.quick-toggle-shortcut');
      setShortcutMessage('快捷键已被其他应用占用，未能恢复注册。');
    });
  }, []);

  useEffect(
    () => () => {
      if (supportsGlobalShortcuts()) {
        void disableQuickToggleShortcut();
      }
    },
    [],
  );

  const visibleTools = useMemo(
    () =>
      toolCatalog.filter(
        (entry) =>
          (category === 'all' || entry.category === category) && matchesToolSearch(entry, query),
      ),
    [category, query],
  );

  const favorites = toolCatalog.filter((entry) => favoriteIds.includes(entry.id));
  const recentTools = recentIds
    .map((id) => toolCatalog.find((entry) => entry.id === id))
    .filter((entry): entry is ToolCatalogEntry => entry !== undefined);

  function toggleFavorite(id: string) {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
    );
  }

  async function openTool(entry: ToolCatalogEntry) {
    setRecentIds((current) =>
      [entry.id, ...current.filter((currentId) => currentId !== entry.id)].slice(0, 4),
    );

    setToolLoadMessage(undefined);
    const activation = await toolRegistry.activate(entry.id);
    if (!activation.ok) {
      setToolLoadMessage(activation.failure.message);
      return;
    }

    setActiveTool(activation.session);
  }

  function closeActiveTool() {
    if (activeTool) {
      toolRegistry.dispose(activeTool);
    }

    setActiveTool(undefined);
  }

  async function toggleQuickToggleShortcut() {
    if (!supportsGlobalShortcuts()) {
      setShortcutMessage('全局快捷键仅在桌面应用中可用。');
      return;
    }

    if (shortcutEnabled) {
      await disableQuickToggleShortcut();
      setShortcutEnabled(false);
      window.localStorage.removeItem('shell.quick-toggle-shortcut');
      setShortcutMessage('已关闭全局快捷键。');
      return;
    }

    try {
      await enableQuickToggleShortcut();
      setShortcutEnabled(true);
      window.localStorage.setItem('shell.quick-toggle-shortcut', 'enabled');
      setShortcutMessage(`已注册 ${quickToggleShortcut}。`);
    } catch {
      setShortcutMessage('快捷键已被其他应用占用，请关闭冲突应用后重试。');
    }
  }

  return (
    <main className="desktop-shell" aria-labelledby="application-title">
      <aside className="navigation-rail">
        <div className="application-mark" aria-hidden="true">
          AT
        </div>
        <nav aria-label="主导航" className="navigation-groups">
          <div className="navigation-group">
            <button
              className={`navigation-item ${view === 'home' && category === 'all' ? 'navigation-item-current' : ''}`}
              type="button"
              onClick={() => {
                setView('home');
                setCategory('all');
              }}
            >
              <Grid2X2 aria-hidden="true" />
              <span>全部工具</span>
            </button>
            {categoryNavigation.map(({ category: itemCategory, icon: Icon }) => (
              <button
                key={itemCategory}
                className={`navigation-item ${view === 'home' && category === itemCategory ? 'navigation-item-current' : ''}`}
                type="button"
                onClick={() => {
                  setView('home');
                  setCategory(itemCategory);
                }}
              >
                <Icon aria-hidden="true" />
                <span>{categoryLabels[itemCategory]}</span>
              </button>
            ))}
          </div>
          <div className="navigation-group navigation-group-bottom">
            <button
              className={`navigation-item ${view === 'settings' ? 'navigation-item-current' : ''}`}
              type="button"
              onClick={() => {
                closeActiveTool();
                setView('settings');
              }}
            >
              <Settings aria-hidden="true" />
              <span>设置</span>
            </button>
          </div>
        </nav>
      </aside>
      <section className="workspace">
        <header className="context-toolbar">
          <div>
            <p className="eyebrow">AllMyTools</p>
            <h1 id="application-title">{view === 'settings' ? '设置' : '工具工作台'}</h1>
          </div>
          <div className="toolbar-actions">
            <Button
              className="toolbar-settings-button"
              variant="ghost"
              aria-label="打开设置"
              onClick={() => {
                closeActiveTool();
                setView('settings');
              }}
            >
              <Settings aria-hidden="true" />
              设置
            </Button>
            <div className="theme-switcher" role="group" aria-label="界面主题">
              {themes.map(({ id, label }) => (
                <Button
                  key={id}
                  className="theme-option"
                  variant="ghost"
                  aria-pressed={theme === id}
                  onClick={() => setTheme(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </header>
        {activeTool?.module ? (
          <section className="tool-workspace" aria-label="工具工作区">
            <div className="tool-workspace-header">
              <div>
                <p className="eyebrow">已启动工具</p>
                <h2>{toolCatalog.find((entry) => entry.id === activeTool.id)?.name}</h2>
              </div>
              <Button variant="secondary" onClick={closeActiveTool}>
                关闭工具
              </Button>
            </div>
            <ToolErrorBoundary onClose={closeActiveTool}>
              <activeTool.module.ToolView />
            </ToolErrorBoundary>
          </section>
        ) : view === 'settings' ? (
          <section className="settings-workspace" aria-labelledby="settings-heading">
            <div className="settings-section">
              <p className="eyebrow">界面</p>
              <h2 id="settings-heading">主题</h2>
              <p>选择适合当前工作环境的界面主题。</p>
              <div className="settings-theme-options" role="group" aria-label="主题设置">
                {themes.map(({ id, label }) => (
                  <Button
                    key={id}
                    variant={theme === id ? 'primary' : 'secondary'}
                    aria-pressed={theme === id}
                    onClick={() => setTheme(id)}
                  >
                    使用{label}主题
                  </Button>
                ))}
              </div>
            </div>
            <div className="settings-section" aria-labelledby="shortcut-heading">
              <p className="eyebrow">桌面</p>
              <h2 id="shortcut-heading">快捷键</h2>
              <p>启用后可使用 {quickToggleShortcut} 显示或隐藏主窗口。</p>
              <label className="shortcut-control">
                <input
                  type="checkbox"
                  checked={shortcutEnabled}
                  onChange={() => void toggleQuickToggleShortcut()}
                />
                启用全局快捷键
              </label>
              {shortcutMessage ? (
                <InlineMessage title="快捷键状态">{shortcutMessage}</InlineMessage>
              ) : null}
            </div>
            <DesignSystemViewer theme={theme} />
          </section>
        ) : (
          <section className="catalog-workspace" aria-label="工具目录">
            <div className="catalog-heading">
              <div>
                <p className="eyebrow">目录</p>
                <h2>{category === 'all' ? '浏览工具' : categoryLabels[category]}</h2>
              </div>
              <div className="search-field">
                <Search aria-hidden="true" />
                <TextField
                  label="搜索工具"
                  placeholder="按名称或关键词搜索"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="catalog-sections">
              {toolLoadMessage ? (
                <InlineMessage title="工具启动失败" tone="error">
                  {toolLoadMessage}
                </InlineMessage>
              ) : null}
              <section aria-labelledby="recent-heading">
                <div className="section-heading">
                  <Clock3 aria-hidden="true" />
                  <h2 id="recent-heading">最近使用</h2>
                </div>
                {recentTools.length ? (
                  <div className="tool-list">
                    {recentTools.map((entry) => (
                      <ToolRow
                        key={entry.id}
                        entry={entry}
                        favorite={favoriteIds.includes(entry.id)}
                        onOpen={openTool}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="尚无最近使用记录"
                    description="打开一个工具后，它会显示在这里。"
                  />
                )}
              </section>
              <section aria-labelledby="favorites-heading">
                <div className="section-heading">
                  <Star aria-hidden="true" />
                  <h2 id="favorites-heading">收藏</h2>
                </div>
                {favorites.length ? (
                  <div className="tool-list">
                    {favorites.map((entry) => (
                      <ToolRow
                        key={entry.id}
                        entry={entry}
                        favorite
                        onOpen={openTool}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="尚未收藏工具"
                    description="使用工具行右侧的收藏按钮固定常用工具。"
                  />
                )}
              </section>
              <section aria-labelledby="catalog-heading">
                <div className="section-heading">
                  <Wrench aria-hidden="true" />
                  <h2 id="catalog-heading">工具列表</h2>
                </div>
                {visibleTools.length ? (
                  <div className="tool-list">
                    {visibleTools.map((entry) => (
                      <ToolRow
                        key={entry.id}
                        entry={entry}
                        favorite={favoriteIds.includes(entry.id)}
                        onOpen={openTool}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="没有匹配的工具"
                    description="尝试使用其他名称、分类或关键词。"
                  />
                )}
              </section>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
