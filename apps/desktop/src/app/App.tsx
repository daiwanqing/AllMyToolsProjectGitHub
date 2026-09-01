import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ToolCategory } from '@allmytools/platform-contracts';
import {
  primitiveColorTokenNames,
  semanticColorTokenNames,
  type ColorTokenName,
  type ThemeColorOverrides,
  type ThemeName,
} from '@allmytools/design-tokens';
import {
  Button,
  FloatingNotice,
  HorizontalTabs,
  VerticalTabs,
  EmptyState,
  IconButton,
  InlineMessage,
  Modal,
  SettingRow,
  Tabs,
  TextField,
  ToggleField,
  ToggleButton,
  type TabsItem,
} from '@allmytools/ui';
import {
  ArrowLeft,
  Bug,
  Code2,
  Clock3,
  Grid2X2,
  Keyboard,
  Palette,
  Search,
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
import { DebugOverlay } from '../features/DebugOverlay';
import {
  debugShortcutEventName,
  defaultDebugShortcut,
  disableQuickToggleShortcut,
  disableDebugShortcut,
  enableDebugShortcut,
  enableQuickToggleShortcut,
  quickToggleShortcut,
  supportsGlobalShortcuts,
} from '../native/globalShortcut';

type WorkspaceView = 'home' | 'settings';
type SettingsTab = 'appearance' | 'shortcuts' | 'developer';

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

type WorkspaceNavigationId = ToolCategory | 'all';

const workspaceNavigation: ReadonlyArray<
  Readonly<{ id: WorkspaceNavigationId; label: string; icon: LucideIcon }>
> = [
  { id: 'all', label: '全部工具', icon: Grid2X2 },
  { id: 'learning', label: categoryLabels.learning, icon: Sparkles },
  { id: 'entertainment', label: categoryLabels.entertainment, icon: Grid2X2 },
  { id: 'tools', label: categoryLabels.tools, icon: Wrench },
];

const themes: ReadonlyArray<Readonly<{ id: ThemeName; label: string }>> = [
  { id: 'light', label: '浅色' },
  { id: 'dark', label: '深色' },
];

const settingsTabs: ReadonlyArray<Readonly<{ id: SettingsTab; label: string; icon: LucideIcon }>> =
  [
    { id: 'appearance', label: '外观', icon: Palette },
    { id: 'shortcuts', label: '快捷键', icon: Keyboard },
    { id: 'developer', label: '开发者', icon: Code2 },
  ];

const workspaceStorageKey = 'shell.workspace-state';
const themeColorOverridesStorageKey = 'shell.theme-color-overrides';
const debugShortcutStorageKey = 'shell.debug-shortcut';
const debugShortcutEnabledStorageKey = 'shell.debug-shortcut-enabled';

type PersistedWorkspaceState = Readonly<{
  category: ToolCategory | 'all';
  query: string;
  settingsTab: SettingsTab;
  theme: ThemeName;
  view: WorkspaceView;
}>;

type PersistedThemeColorOverrides = Readonly<Record<ThemeName, ThemeColorOverrides>>;
type RuntimeLog = Readonly<{ id: number; message: string }>;

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

type ShortcutKeyboardEvent = Readonly<{
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}>;

function shortcutForKeyboardEvent(event: ShortcutKeyboardEvent): string | undefined {
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  if (!key || ['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return undefined;
  const modifiers: string[] = [];
  if (event.ctrlKey || event.metaKey) modifiers.push('CommandOrControl');
  if (event.altKey) modifiers.push('Alt');
  if (event.shiftKey) modifiers.push('Shift');
  return modifiers.length ? [...modifiers, key].join('+') : key;
}

function shortcutMatches(event: ShortcutKeyboardEvent, shortcut: string): boolean {
  const actual = shortcutForKeyboardEvent(event);
  return (
    actual === shortcut ||
    (shortcut.startsWith('CommandOrControl+') &&
      actual === shortcut.replace('CommandOrControl', 'Control'))
  );
}

function readThemeColorOverrides(storage: Storage): PersistedThemeColorOverrides {
  const fallback: PersistedThemeColorOverrides = { light: {}, dark: {} };
  const stored = storage.getItem(themeColorOverridesStorageKey);
  if (!stored) {
    return fallback;
  }

  try {
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== 'object') {
      return fallback;
    }

    const parsed = value as Record<string, unknown>;
    return {
      light: readThemeColorOverrideLayer(parsed.light),
      dark: readThemeColorOverrideLayer(parsed.dark),
    };
  } catch {
    return fallback;
  }
}

function readThemeColorOverrideLayer(value: unknown): ThemeColorOverrides {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const source = value as Record<string, unknown>;
  const result: Partial<ThemeColorOverrides> = {};
  for (const name of [...primitiveColorTokenNames, ...semanticColorTokenNames]) {
    if (isHexColor(source[name])) {
      result[name] = source[name].toLowerCase();
    }
  }
  return result;
}

function colorTokenVariable(name: ColorTokenName): string {
  return (primitiveColorTokenNames as readonly string[]).includes(name)
    ? `--amt-primitive-${name.replaceAll('.', '-').toLowerCase()}`
    : `--amt-${name.replaceAll('.', '-').toLowerCase()}`;
}

function isWorkspaceView(value: unknown): value is WorkspaceView {
  return value === 'home' || value === 'settings';
}

function isThemeName(value: unknown): value is ThemeName {
  return value === 'light' || value === 'dark';
}

function isSettingsTab(value: unknown): value is SettingsTab {
  return value === 'appearance' || value === 'shortcuts' || value === 'developer';
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
      typeof state.query !== 'string' ||
      (state.settingsTab !== undefined && !isSettingsTab(state.settingsTab))
    ) {
      return undefined;
    }

    return {
      view: state.view,
      category: state.category,
      query: state.query,
      settingsTab: isSettingsTab(state.settingsTab) ? state.settingsTab : 'appearance',
      theme: state.theme,
    };
  } catch {
    return undefined;
  }
}

function ToolTile({
  entry,
  favorite,
  onOpen,
  onToggleFavorite,
  showCategory = false,
  loading = false,
}: Readonly<{
  entry: ToolCatalogEntry;
  favorite: boolean;
  onOpen: (entry: ToolCatalogEntry) => void;
  onToggleFavorite: (id: string) => void;
  showCategory?: boolean;
  loading?: boolean;
}>) {
  return (
    <article className="tool-tile" aria-labelledby={`tool-${entry.id}`}>
      <div className="tool-tile-content">
        {showCategory ? (
          <p className="tool-tile-category">{categoryLabels[entry.category]}</p>
        ) : null}
        <h3 id={`tool-${entry.id}`}>{entry.name}</h3>
        <p>{entry.description}</p>
      </div>
      <div className="tool-tile-actions">
        <IconButton
          label={favorite ? `取消收藏 ${entry.name}` : `收藏 ${entry.name}`}
          pressed={favorite}
          onClick={() => onToggleFavorite(entry.id)}
        >
          <Star aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} />
        </IconButton>
        <Button variant="secondary" loading={loading} onClick={() => onOpen(entry)}>
          打开
        </Button>
      </div>
    </article>
  );
}

function RuntimeConsole({
  logs,
  onClear,
}: Readonly<{ logs: readonly RuntimeLog[]; onClear: () => void }>) {
  return (
    <section className="runtime-console" aria-label="运行输出台">
      <header>
        <h2>运行输出台</h2>
        <Button variant="secondary" onClick={onClear} disabled={!logs.length}>
          清空
        </Button>
      </header>
      {logs.length ? (
        <pre>
          {logs.map((entry) => (
            <span key={entry.id}>
              {entry.message}
              {'\n'}
            </span>
          ))}
        </pre>
      ) : (
        <p>暂无运行输出。</p>
      )}
    </section>
  );
}

export function App() {
  const [initialWorkspaceState] = useState(() => readWorkspaceState(window.localStorage));
  const [initialThemeColorOverrides] = useState(() => readThemeColorOverrides(window.localStorage));
  const [theme, setTheme] = useState<ThemeName>(initialWorkspaceState?.theme ?? 'light');
  const [themeColorOverrides, setThemeColorOverrides] = useState<PersistedThemeColorOverrides>(
    initialThemeColorOverrides,
  );
  const themeRef = useRef(theme);
  const [view, setView] = useState<WorkspaceView>(initialWorkspaceState?.view ?? 'home');
  const [category, setCategory] = useState<ToolCategory | 'all'>(
    initialWorkspaceState?.category ?? 'all',
  );
  const [query, setQuery] = useState(initialWorkspaceState?.query ?? '');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>(
    initialWorkspaceState?.settingsTab ?? 'appearance',
  );
  const [favoriteIds, setFavoriteIds] = useState<readonly string[]>(['tools.calendar-todos']);
  const [recentIds, setRecentIds] = useState<readonly string[]>(['tools.calendar-todos']);
  const [shortcutEnabled, setShortcutEnabled] = useState(
    () => window.localStorage.getItem('shell.quick-toggle-shortcut') === 'enabled',
  );
  const [shortcutMessage, setShortcutMessage] = useState<string>();
  const [shortcutNoticeVisible, setShortcutNoticeVisible] = useState(false);
  const [debugShortcut, setDebugShortcut] = useState(
    () => window.localStorage.getItem(debugShortcutStorageKey) ?? defaultDebugShortcut,
  );
  const [debugShortcutEnabled, setDebugShortcutEnabled] = useState(
    () => window.localStorage.getItem(debugShortcutEnabledStorageKey) !== 'disabled',
  );
  const [debugMode, setDebugMode] = useState(false);
  const debugModeRef = useRef(false);
  const debugRegistrationLoggedRef = useRef<string | undefined>(undefined);
  const [debugLogs, setDebugLogs] = useState<readonly RuntimeLog[]>([]);
  const toolContentRef = useRef<HTMLElement>(null);
  const [toolContentElement, setToolContentElement] = useState<HTMLElement | null>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const [workspaceElement, setWorkspaceElement] = useState<HTMLElement | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveToolSession>();
  const [toolLoadMessage, setToolLoadMessage] = useState<string>();
  const [loadingToolId, setLoadingToolId] = useState<string>();
  const activationRequestRef = useRef(0);

  const appendDebugLog = useCallback((message: string) => {
    setDebugLogs((current) =>
      [...current, { id: Date.now() + current.length, message }].slice(-100),
    );
  }, []);

  const toggleDebugMode = useCallback(() => {
    const next = !debugModeRef.current;
    debugModeRef.current = next;
    setDebugMode(next);
    appendDebugLog(next ? '调试模式已开启。' : '调试模式已关闭。');
  }, [appendDebugLog]);

  const exitDebugMode = useCallback(() => {
    debugModeRef.current = false;
    setDebugMode(false);
    appendDebugLog('已退出调试模式。');
  }, [appendDebugLog]);

  const handleNativeDebugShortcut = useCallback(() => {
    appendDebugLog('收到 Tauri 全局调试快捷键事件。');
    toggleDebugMode();
  }, [appendDebugLog, toggleDebugMode]);

  useEffect(() => {
    if (shortcutMessage) {
      setShortcutNoticeVisible(true);
    }
  }, [shortcutMessage]);

  useEffect(() => {
    themeRef.current = theme;
    document.documentElement.dataset.theme = theme;
    for (const tokenName of [...primitiveColorTokenNames, ...semanticColorTokenNames]) {
      document.documentElement.style.removeProperty(colorTokenVariable(tokenName));
    }
    for (const [tokenName, value] of Object.entries(themeColorOverrides[theme])) {
      document.documentElement.style.setProperty(
        colorTokenVariable(tokenName as ColorTokenName),
        value,
      );
    }
  }, [theme, themeColorOverrides]);

  useEffect(() => {
    window.localStorage.setItem(themeColorOverridesStorageKey, JSON.stringify(themeColorOverrides));
  }, [themeColorOverrides]);

  useEffect(() => {
    const workspaceState: PersistedWorkspaceState = {
      theme,
      view,
      category,
      query,
      settingsTab,
    };
    window.localStorage.setItem(workspaceStorageKey, JSON.stringify(workspaceState));
  }, [category, query, settingsTab, theme, view]);

  useEffect(() => {
    setToolContentElement(toolContentRef.current);
    setWorkspaceElement(workspaceRef.current);
  }, [activeTool, view]);

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

  useEffect(() => {
    window.addEventListener(debugShortcutEventName, handleNativeDebugShortcut);
    return () => window.removeEventListener(debugShortcutEventName, handleNativeDebugShortcut);
  }, [handleNativeDebugShortcut]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey || event.altKey) && event.key !== 'Control') {
        appendDebugLog(
          `收到按键 ${event.key}（Ctrl=${event.ctrlKey} Alt=${event.altKey} Meta=${event.metaKey}）`,
        );
      }
      if (debugShortcutEnabled && shortcutMatches(event, debugShortcut)) {
        event.preventDefault();
        appendDebugLog(`匹配调试快捷键 ${debugShortcut}`);
        toggleDebugMode();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [appendDebugLog, debugShortcut, debugShortcutEnabled, toggleDebugMode]);

  useEffect(() => {
    window.localStorage.setItem(debugShortcutStorageKey, debugShortcut);
    window.localStorage.setItem(
      debugShortcutEnabledStorageKey,
      debugShortcutEnabled ? 'enabled' : 'disabled',
    );
    if (!debugShortcutEnabled || !supportsGlobalShortcuts()) {
      if (debugRegistrationLoggedRef.current !== 'fallback') {
        debugRegistrationLoggedRef.current = 'fallback';
        appendDebugLog('窗口内快捷键监听已启用（当前宿主不支持全局注册）。');
      }
      return undefined;
    }
    void enableDebugShortcut(debugShortcut).catch(() => {
      setDebugShortcutEnabled(false);
      setShortcutMessage('调试模式快捷键注册失败，请修改快捷键后重试。');
      appendDebugLog(`全局快捷键注册失败：${debugShortcut}`);
    });
    if (debugRegistrationLoggedRef.current !== debugShortcut) {
      debugRegistrationLoggedRef.current = debugShortcut;
      appendDebugLog(`正在注册全局调试快捷键：${debugShortcut}`);
    }
    return () => {
      void disableDebugShortcut(debugShortcut);
    };
  }, [appendDebugLog, debugShortcut, debugShortcutEnabled]);

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
  const frequentTools = [...recentTools, ...favorites].filter(
    (entry, index, entries) =>
      entries.findIndex((candidate) => candidate.id === entry.id) === index,
  );
  const isSearchActive = query.trim().length > 0;
  const catalogTools =
    category === 'all' && !isSearchActive
      ? visibleTools.filter((entry) => !frequentTools.some((frequent) => frequent.id === entry.id))
      : visibleTools;

  function toggleFavorite(id: string) {
    setFavoriteIds((current) =>
      current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
    );
  }

  async function openTool(entry: ToolCatalogEntry) {
    const requestId = ++activationRequestRef.current;
    setLoadingToolId(entry.id);
    setRecentIds((current) =>
      [entry.id, ...current.filter((currentId) => currentId !== entry.id)].slice(0, 4),
    );

    setToolLoadMessage(undefined);
    try {
      const activation = await toolRegistry.activate(entry.id);
      if (requestId !== activationRequestRef.current) {
        if (activation.ok) void toolRegistry.dispose(activation.session);
        return;
      }
      if (!activation.ok) {
        setToolLoadMessage(activation.failure.message);
        return;
      }

      setActiveTool(activation.session);
    } finally {
      if (requestId === activationRequestRef.current) setLoadingToolId(undefined);
    }
  }

  function closeActiveTool() {
    activationRequestRef.current += 1;
    if (activeTool) {
      void toolRegistry.dispose(activeTool);
    }

    setActiveTool(undefined);
    debugModeRef.current = false;
    setDebugMode(false);
    setDebugLogs([]);
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

  function updateThemeColor(name: ColorTokenName, value: string) {
    document.documentElement.style.setProperty(colorTokenVariable(name), value);
    setThemeColorOverrides((current) => ({
      ...current,
      [themeRef.current]: { ...current[themeRef.current], [name]: value },
    }));
  }

  function previewThemeColor(name: ColorTokenName, value: string) {
    document.documentElement.style.setProperty(colorTokenVariable(name), value);
  }

  function resetThemeColors() {
    setThemeColorOverrides((current) => ({ ...current, [theme]: {} }));
  }

  const settingsPanels: Readonly<Record<SettingsTab, ReactNode>> = {
    appearance: (
      <div className="settings-section">
        <SettingRow label="主题">
          <HorizontalTabs
            ariaLabel="主题设置"
            items={themes.map(({ id, label }) => ({ id, label: `使用${label}主题` }))}
            value={theme}
            onChange={(value) => {
              if (value === 'light' || value === 'dark') {
                setTheme(value);
              }
            }}
          />
        </SettingRow>
      </div>
    ),
    shortcuts: (
      <div className="settings-section">
        <SettingRow label="全局快捷键">
          <ToggleField
            label="启用全局快捷键"
            checked={shortcutEnabled}
            onChange={() => void toggleQuickToggleShortcut()}
          />
        </SettingRow>
        <SettingRow label="调试模式快捷键">
          <TextField
            label="按键组合"
            value={debugShortcut}
            readOnly
            aria-keyshortcuts={debugShortcut}
            onKeyDown={(event) => {
              const next = shortcutForKeyboardEvent(event);
              if (!next) return;
              event.preventDefault();
              setDebugShortcut(next);
              setShortcutMessage(`调试模式快捷键已设为 ${next}。`);
            }}
          />
        </SettingRow>
        <SettingRow label="调试模式">
          <ToggleField
            label="启用调试模式快捷键"
            checked={debugShortcutEnabled}
            onChange={() => setDebugShortcutEnabled((current) => !current)}
          />
        </SettingRow>
        {shortcutMessage && shortcutNoticeVisible ? (
          <FloatingNotice title="快捷键状态" onDismiss={() => setShortcutNoticeVisible(false)}>
            {shortcutMessage}
          </FloatingNotice>
        ) : null}
      </div>
    ),
    developer: (
      <DesignSystemViewer
        theme={theme}
        colorOverrides={themeColorOverrides}
        onColorChange={updateThemeColor}
        onColorPreview={previewThemeColor}
        onResetColors={resetThemeColors}
      />
    ),
  };

  const settingsItems: readonly TabsItem[] = settingsTabs.map(({ id, label, icon: Icon }) => ({
    id,
    label,
    icon: <Icon aria-hidden="true" />,
    panel: settingsPanels[id],
  }));

  if (activeTool?.module) {
    const activeToolName = toolCatalog.find((entry) => entry.id === activeTool.id)?.name;

    return (
      <main className="tool-focus-shell" aria-labelledby="application-title">
        <header className="tool-focus-toolbar">
          <div className="tool-focus-title">
            <p className="eyebrow">AllMyTools</p>
            <h1 id="application-title">{activeToolName}</h1>
          </div>
          <div className="tool-focus-actions">
            <div className="theme-switcher">
              <HorizontalTabs
                ariaLabel="界面主题"
                items={themes}
                value={theme}
                onChange={(value) => {
                  if (value === 'light' || value === 'dark') setTheme(value);
                }}
              />
            </div>
            <ToggleButton
              variant="secondary"
              className="debug-toggle-button"
              pressed={debugMode}
              onClick={toggleDebugMode}
            >
              <Bug aria-hidden="true" />
              调试
            </ToggleButton>
            <Button
              variant="secondary"
              aria-label="打开设置"
              aria-haspopup="dialog"
              onClick={() => {
                closeActiveTool();
                setView('settings');
              }}
            >
              设置
            </Button>
            <Button variant="secondary" onClick={closeActiveTool}>
              <ArrowLeft aria-hidden="true" />
              返回工具台
            </Button>
          </div>
        </header>
        <section className="tool-focus-content" aria-label="工具工作区" ref={toolContentRef}>
          <ToolErrorBoundary onClose={closeActiveTool}>
            <activeTool.module.ToolView />
          </ToolErrorBoundary>
          <DebugOverlay enabled={debugMode} root={toolContentElement} onExit={exitDebugMode} />
        </section>
        <RuntimeConsole logs={debugLogs} onClear={() => setDebugLogs([])} />
      </main>
    );
  }

  return (
    <main
      className="desktop-shell"
      aria-labelledby="application-title"
      data-debug-target="true"
      data-debug-kind="区域"
      data-debug-label="AllMyTools 主界面"
      data-debug-source="apps/desktop/src/app/App.tsx:750"
      data-debug-code={'return <main className="desktop-shell">...'}
    >
      <aside
        className="navigation-rail"
        data-debug-target="true"
        data-debug-kind="区域"
        data-debug-label="主导航"
        data-debug-source="apps/desktop/src/app/App.tsx:758"
        data-debug-code={'<aside className="navigation-rail">...'}
      >
        <div className="application-mark" aria-hidden="true">
          AT
        </div>
        <nav aria-label="主导航" className="navigation-groups">
          <VerticalTabs
            ariaLabel="工作区导航"
            className="workspace-navigation-tabs"
            items={workspaceNavigation.map(({ id, label, icon: Icon }) => ({
              id,
              label,
              icon: <Icon />,
            }))}
            value={category}
            onChange={(value) => {
              if (isToolCategory(value)) {
                setView('home');
                setCategory(value);
              }
            }}
          />
        </nav>
      </aside>
      <section
        className="workspace"
        ref={workspaceRef}
        data-debug-target="true"
        data-debug-kind="区域"
        data-debug-label="主工作区"
        data-debug-source="apps/desktop/src/app/App.tsx:782"
        data-debug-code={'<section className="workspace">...'}
      >
        <header
          className="context-toolbar"
          data-debug-target="true"
          data-debug-kind="区域"
          data-debug-label="主界面工具栏"
          data-debug-source="apps/desktop/src/app/App.tsx:783"
          data-debug-code={'<header className="context-toolbar">...'}
        >
          <div>
            <p className="eyebrow">AllMyTools</p>
            <h1 id="application-title">工具工作台</h1>
          </div>
          <div className="toolbar-actions">
            <div className="theme-switcher">
              <HorizontalTabs
                ariaLabel="界面主题"
                items={themes}
                value={theme}
                onChange={(value) => {
                  if (value === 'light' || value === 'dark') setTheme(value);
                }}
              />
            </div>
            <ToggleButton
              variant="secondary"
              className="debug-toggle-button"
              pressed={debugMode}
              onClick={toggleDebugMode}
            >
              <Bug aria-hidden="true" />
              调试
            </ToggleButton>
            <Button
              variant="secondary"
              aria-label="打开设置"
              aria-haspopup="dialog"
              onClick={() => setView('settings')}
            >
              设置
            </Button>
          </div>
        </header>
        <section
          className="catalog-workspace"
          aria-label="工具目录"
          data-debug-target="true"
          data-debug-kind="区域"
          data-debug-label="工具目录"
          data-debug-source="apps/desktop/src/app/App.tsx:819"
          data-debug-code={'<section className="catalog-workspace">...'}
        >
          <div className="catalog-heading">
            <div className="search-field">
              <div className="search-input-shell">
                <Search aria-hidden="true" />
                <TextField
                  label="搜索工具"
                  placeholder="按名称或关键词搜索"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="catalog-sections">
            {toolLoadMessage ? (
              <InlineMessage title="工具启动失败" tone="error">
                {toolLoadMessage}
              </InlineMessage>
            ) : null}
            {category === 'all' && !isSearchActive && frequentTools.length ? (
              <section aria-labelledby="frequent-heading">
                <div className="section-heading">
                  <Clock3 aria-hidden="true" />
                  <h2 id="frequent-heading">常用</h2>
                </div>
                <div className="tool-tile-grid">
                  {frequentTools.map((entry) => (
                    <ToolTile
                      key={entry.id}
                      entry={entry}
                      favorite={favoriteIds.includes(entry.id)}
                      onOpen={openTool}
                      onToggleFavorite={toggleFavorite}
                      loading={loadingToolId === entry.id}
                      showCategory
                    />
                  ))}
                </div>
              </section>
            ) : null}
            <section aria-labelledby="catalog-heading">
              <div className="section-heading">
                <Wrench aria-hidden="true" />
                <h2 id="catalog-heading">
                  {isSearchActive
                    ? '匹配工具'
                    : category === 'all'
                      ? '其他工具'
                      : `${categoryLabels[category]}工具`}
                </h2>
              </div>
              {catalogTools.length ? (
                <div className="tool-tile-grid">
                  {catalogTools.map((entry) => (
                    <ToolTile
                      key={entry.id}
                      entry={entry}
                      favorite={favoriteIds.includes(entry.id)}
                      onOpen={openTool}
                      onToggleFavorite={toggleFavorite}
                      loading={loadingToolId === entry.id}
                      showCategory={category === 'all'}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title="没有匹配的工具" description="尝试使用其他名称、分类或关键词。" />
              )}
            </section>
          </div>
        </section>
        {view === 'settings' ? (
          <Modal
            className="settings-dialog"
            labelledBy="settings-dialog-title"
            open
            onClose={() => setView('home')}
            debugAttributes={{
              'data-debug-target': 'true',
              'data-debug-kind': '区域',
              'data-debug-label': '设置弹窗',
              'data-debug-source': 'apps/desktop/src/app/App.tsx:884',
              'data-debug-code': '<dialog className="settings-dialog">...',
            }}
          >
            <div className="settings-dialog-content">
              <header className="settings-dialog-header">
                <h1 id="settings-dialog-title">设置</h1>
                <Button variant="secondary" onClick={() => setView('home')}>
                  关闭
                </Button>
              </header>
              <Tabs
                ariaLabel="设置页签"
                idPrefix="settings"
                items={settingsItems}
                value={settingsTab}
                onChange={(value) => {
                  if (isSettingsTab(value)) {
                    setSettingsTab(value);
                  }
                }}
              />
            </div>
          </Modal>
        ) : null}
        <DebugOverlay
          enabled={debugMode}
          root={workspaceElement}
          onExit={exitDebugMode}
          onLog={appendDebugLog}
        />
        <RuntimeConsole logs={debugLogs} onClear={() => setDebugLogs([])} />
      </section>
    </main>
  );
}
