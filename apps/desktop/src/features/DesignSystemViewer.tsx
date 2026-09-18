import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  resolveThemeTokens,
  primitiveColorTokenNames,
  semanticColorTokenNames,
  themeNames,
  themeLabels,
  type ColorTokenName,
  type ThemeColorOverrides,
  type ThemeName,
} from '@allmytools/design-tokens';
import {
  Button,
  ChoiceGroup,
  VerticalTabs,
  Disclosure,
  EmptyState,
  FloatingNotice,
  IconButton,
  InlineMessage,
  ProgressBar,
  SettingRow,
  SelectField,
  StatusBadge,
  StepperField,
  Tabs,
  TextField,
  ToggleButton,
  ToggleField,
  uiComponentCatalog,
  uiGuidelineGroups,
  type TabsItem,
} from '@allmytools/ui';
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Gauge,
  Plus,
  Palette,
  Search,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

type TokenLayer = 'primitive' | 'semantic' | 'component';
type DeveloperView = 'tokens' | 'themes' | 'components' | 'motion' | 'guidelines';

type TokenRow = Readonly<{
  layer: TokenLayer;
  name: string;
  value: string;
}>;

const semanticTokenDescriptions: Readonly<Record<string, string>> = {
  'color.background.canvas': '页面最底层画布背景。',
  'color.background.surface': '卡片、面板和输入区域的表面背景。',
  'color.background.selected': '输入区、内容占位和工具内部使用的中性浅层表面。',
  'color.background.control-selected': '选项、页签和状态按钮的中性持久选中底。',
  'color.background.hover': '鼠标悬停反馈，与持久选中态分开。',
  'color.background.pressed': '指针按下期间的反馈，松开后恢复。',
  'color.background.navigation-selected': '一级导航悬停和选中状态的中性表面。',
  'color.background.navigation-hover': '导航悬停底色，适配黑白分区的导航表面。',
  'color.background.navigation-pressed': '导航按下底色，适配黑白分区的导航表面。',
  'color.focus.navigation': '导航键盘焦点环，多巴胺黑色导航使用白色。',
  'color.background.navigation': '桌面导航轨道与手机底栏共用的背景。',
  'color.text.primary': '标题、正文和主要内容文字。',
  'color.text.secondary': '辅助说明、元数据和次要文字。',
  'color.text.navigation': '深色主导航轨道上的高对比文字。',
  'color.border.default': '页面分区和网格的轻结构线，不用于普通控件描边。',
  'color.border.strong': '需要更高对比度的边界和分隔线。',
  'color.action.primary': '主要操作控件的前景或填充颜色。',
  'color.action.primary-text': '主要操作控件上的反色文字。',
  'color.action.button-background': '主命令背景；浅深主题为中性表面，多巴胺为炭黑。',
  'color.action.button-text': '主命令文字，与主命令背景保持可读对比度。',
  'color.focus.ring': '键盘焦点可见环。',
  'color.accent.calendar': '日历今天、选中日期和笔记圆点；多巴胺为深粉，浅深主题为珊瑚橙。',
  'color.status.info': '信息提示和中性进展状态。',
  'color.status.success': '成功、完成和正向结果状态。',
  'color.status.warning': '需要留意但可以继续的状态。',
  'color.status.error': '错误、失败和破坏性操作状态。',
  'color.business.lime': '业务身份色：荧光绿，多巴胺为鲜绿。不可用于错误或危险操作。',
  'color.business.blue': '业务身份色：珊瑚橙，多巴胺为电光蓝。不可用于错误或危险操作。',
  'color.business.amber': '业务身份色：琥珀黄，多巴胺为明黄。不可用于错误或危险操作。',
  'color.business.violet': '业务身份色：紫色，多巴胺为亮粉。不可用于错误或危险操作。',
};

function describeToken(name: string): string {
  if (
    name === 'control.hover.mix' ||
    name === 'control.pressed.mix' ||
    name.startsWith('interaction.')
  ) {
    return '危险按钮交互反馈的共享混色比例，不改变红色语义。';
  }
  const semanticDescription = semanticTokenDescriptions[name];
  if (semanticDescription) {
    return semanticDescription;
  }

  if (name.startsWith('color.neutral.') || name.startsWith('color.gray.')) {
    return '黑白灰基础色阶，供主题语义颜色引用。';
  }
  if (name.startsWith('color.electric.')) {
    return '多巴胺电光蓝，仅用于信息和小面积业务色标。';
  }
  if (name.startsWith('color.pink.')) {
    return '多巴胺粉色阶：亮粉业务色标、深粉日历强调，不用于错误。';
  }
  if (name.startsWith('color.green.')) {
    return '多巴胺鲜绿，仅用于小面积业务色标。';
  }
  if (name.startsWith('color.yellow.')) {
    return '多巴胺明黄，仅用于小面积业务色标。';
  }
  if (name.startsWith('color.lime.')) {
    return '荧光绿多巴胺色阶，用于业务身份和成功状态。';
  }
  if (name.startsWith('color.blue.')) {
    return '珊瑚橙多巴胺色阶，用于业务身份、信息和日历强调。';
  }
  if (name.startsWith('color.amber.')) {
    return '琥珀黄多巴胺色阶，用于业务身份和待留意状态。';
  }
  if (name.startsWith('color.violet.')) {
    return '紫色多巴胺色阶，用于可扩展的业务身份。';
  }
  if (name.startsWith('color.red.')) {
    return '红色色阶，仅用于错误和危险操作。';
  }
  if (name.startsWith('space.')) {
    return '全局间距刻度，用于组件间隙和内边距。';
  }
  if (name.startsWith('radius.')) {
    return '受控圆角刻度，用于表面和控件边界。';
  }
  if (name.startsWith('border.')) {
    return '全局边框宽度，保持边界视觉一致。';
  }
  if (name.startsWith('focus.')) {
    return '焦点环尺寸，保证键盘导航可见。';
  }
  if (name.startsWith('opacity.')) {
    return '状态透明度刻度，用于禁用控件的统一弱化。';
  }
  if (name.startsWith('dimension.')) {
    return '稳定尺寸刻度，用于控件、图标或工作区布局。';
  }
  if (name.startsWith('typography.')) {
    return '排版层级参数，用于统一字号、行高、字重和字体。';
  }
  if (name.startsWith('duration.')) {
    return '动效时长刻度，用于统一反馈和内容切换速度。';
  }
  if (name.startsWith('easing.')) {
    return '动效缓动曲线，用于统一过渡节奏。';
  }
  if (name.startsWith('z-index.')) {
    return '界面层级刻度，用于内容、菜单、对话框和提示的叠放顺序。';
  }
  if (name.startsWith('button.')) {
    return '按钮尺寸和内边距，保证操作控件稳定。';
  }
  if (name.startsWith('field.')) {
    return '输入控件尺寸和内边距，保持表单布局一致。';
  }
  if (name.startsWith('message.')) {
    return '消息组件的圆角和内边距。';
  }
  if (name.startsWith('control.')) {
    return '控件状态参数，用于统一禁用表现。';
  }
  if (name.startsWith('navigation.')) {
    if (name === 'navigation.back-top-spacing') {
      return '返回操作顶部留白，统一不同层级的返回入口间距。';
    }
    return '导航项尺寸和内边距，保持导航密度一致。';
  }
  if (name.startsWith('motion.')) {
    return '组件动效参数，统一过渡时长和缓动。';
  }

  return '共享设计系统值，用于保持界面表现一致。';
}

const layerLabels: Readonly<Record<TokenLayer, string>> = {
  primitive: '原始',
  semantic: '语义',
  component: '组件',
};

const developerTabs: ReadonlyArray<
  Readonly<{ id: DeveloperView; label: string; icon: LucideIcon }>
> = [
  { id: 'tokens', label: 'Token', icon: Code2 },
  { id: 'themes', label: '主题对比', icon: Palette },
  { id: 'components', label: '组件状态', icon: Settings2 },
  { id: 'motion', label: '动效', icon: Gauge },
  { id: 'guidelines', label: 'UI规范', icon: BookOpen },
];

function tokenRows(theme: ThemeName, colorOverrides: ThemeColorOverrides): readonly TokenRow[] {
  const tokens = resolveThemeTokens(theme, colorOverrides);
  const groups: ReadonlyArray<Readonly<{ layer: TokenLayer; values: Record<string, string> }>> = [
    { layer: 'primitive', values: tokens.primitive },
    { layer: 'semantic', values: tokens.semantic },
    { layer: 'component', values: tokens.component },
  ];

  return groups.flatMap(({ layer, values }) =>
    Object.entries(values).map(([name, value]) => ({ layer, name, value })),
  );
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function TokenValue({ value }: Readonly<{ value: string }>) {
  const isColor = value.startsWith('#');

  return (
    <span className="token-value">
      {isColor ? (
        <span className="token-swatch" style={{ backgroundColor: value }} aria-hidden="true" />
      ) : null}
      <code>{value}</code>
    </span>
  );
}

function ColorTokenEditor({
  name,
  value,
  onChange,
  onPreview,
}: Readonly<{
  name: ColorTokenName;
  value: string;
  onChange: (name: ColorTokenName, value: string) => void;
  onPreview: (name: ColorTokenName, value: string) => void;
}>) {
  const [draft, setDraft] = useState(value);
  const commitTimer = useRef<number | undefined>(undefined);
  const valid = /^#[0-9a-fA-F]{6}$/.test(draft);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(
    () => () => {
      if (commitTimer.current !== undefined) {
        window.clearTimeout(commitTimer.current);
      }
    },
    [],
  );

  function previewAndCommit(nextValue: string) {
    setDraft(nextValue);
    onPreview(name, nextValue);
    if (commitTimer.current !== undefined) {
      window.clearTimeout(commitTimer.current);
    }
    commitTimer.current = window.setTimeout(() => {
      onChange(name, nextValue.toLowerCase());
      commitTimer.current = undefined;
    }, 180);
  }

  return (
    <div className="token-color-editor">
      <input
        className="token-color-picker"
        type="color"
        aria-label={`选择 ${name}`}
        value={valid ? draft : value}
        onChange={(event) => {
          previewAndCommit(event.target.value);
        }}
      />
      <TextField
        label="颜色值"
        aria-label={`编辑 ${name}`}
        value={draft}
        spellCheck={false}
        inputMode="text"
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);
          if (/^#[0-9a-fA-F]{6}$/.test(nextValue)) {
            onPreview(name, nextValue.toLowerCase());
            if (commitTimer.current !== undefined) {
              window.clearTimeout(commitTimer.current);
            }
            commitTimer.current = window.setTimeout(() => {
              onChange(name, nextValue.toLowerCase());
              commitTimer.current = undefined;
            }, 180);
          }
        }}
        error={draft.length > 0 && !valid ? '请输入 6 位十六进制颜色值。' : undefined}
      />
    </div>
  );
}

export function DesignSystemViewer({
  theme,
  colorOverrides,
  onColorChange,
  onColorPreview,
  onResetColors,
}: Readonly<{
  theme: ThemeName;
  colorOverrides: Readonly<Record<ThemeName, ThemeColorOverrides>>;
  onColorChange: (name: ColorTokenName, value: string) => void;
  onColorPreview: (name: ColorTokenName, value: string) => void;
  onResetColors: () => void;
}>) {
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState<string>();
  const [activeView, setActiveView] = useState<DeveloperView>('tokens');
  const [previewTab, setPreviewTab] = useState('overview');
  const [previewDirection, setPreviewDirection] = useState('overview');
  const [previewDensity, setPreviewDensity] = useState('comfortable');
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewNotifications, setPreviewNotifications] = useState(false);
  const [previewDebug, setPreviewDebug] = useState(false);
  const [previewToggle, setPreviewToggle] = useState(false);
  const [previewMode, setPreviewMode] = useState('system');
  const [previewCount, setPreviewCount] = useState(3);
  const [previewCommand, setPreviewCommand] = useState('');
  const [previewLoading, setPreviewLoading] = useState(true);
  const [motionPreviewVersion, setMotionPreviewVersion] = useState(0);
  const [motionPreviewProgress, setMotionPreviewProgress] = useState(0);
  const [motionPreviewStep, setMotionPreviewStep] = useState(0);
  const [isMotionPreviewRunning, setIsMotionPreviewRunning] = useState(false);
  const [floatingNoticePreviewVersion, setFloatingNoticePreviewVersion] = useState(0);
  const currentRows = useMemo(
    () => tokenRows(theme, colorOverrides[theme]),
    [colorOverrides, theme],
  );
  const themeComparisons = useMemo(
    () =>
      themeNames.map((id) => ({
        id,
        semantic: resolveThemeTokens(id, colorOverrides[id]).semantic,
      })),
    [colorOverrides],
  );
  const motionTokens = useMemo(() => resolveThemeTokens(theme).component, [theme]);
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const normalizedFilter = filter.trim().toLocaleLowerCase('zh-CN');
  const filteredRows = currentRows.filter((row) =>
    `${row.layer} ${row.name} ${row.value}`.toLocaleLowerCase('zh-CN').includes(normalizedFilter),
  );

  useEffect(() => {
    if (motionPreviewVersion === 0) {
      return;
    }

    setMotionPreviewProgress(0);
    setMotionPreviewStep(0);

    if (prefersReducedMotion) {
      setMotionPreviewProgress(100);
      setMotionPreviewStep(5);
      setIsMotionPreviewRunning(false);
      return;
    }

    setIsMotionPreviewRunning(true);
    let timeoutId: number | undefined;
    const playStep = (step: number) => {
      timeoutId = window.setTimeout(
        () => {
          const nextStep = step + 1;
          setMotionPreviewProgress(nextStep * 20);
          setMotionPreviewStep(nextStep);

          if (nextStep === 5) {
            setIsMotionPreviewRunning(false);
            return;
          }

          playStep(nextStep);
        },
        step === 0 ? 32 : 180,
      );
    };

    playStep(0);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [motionPreviewVersion, prefersReducedMotion]);

  async function copyToken(name: string, value: string) {
    try {
      await copyText(`${name}: ${value}`);
      setCopied(name);
    } catch {
      setCopied('复制失败，请手动选择 Token 名称。');
    }
  }

  const developerPanels: Readonly<Record<DeveloperView, ReactNode>> = {
    tokens: (
      <>
        <div className="token-viewer-toolbar">
          <TextField
            label="筛选 Token"
            placeholder="按层级、名称或值筛选"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <span>{filteredRows.length} 个 Token</span>
        </div>

        <div className="token-color-settings">
          <div>
            <h3>公用 UI 颜色</h3>
            <p>修改当前主题的原始或语义颜色后，使用该 Token 的组件会立即同步更新。</p>
          </div>
          <Button variant="secondary" onClick={onResetColors}>
            恢复默认颜色
          </Button>
        </div>

        <div className="token-table-wrap" tabIndex={0} aria-label="当前主题 Token 列表">
          <table className="token-table">
            <thead>
              <tr>
                <th scope="col">层级</th>
                <th scope="col">Token</th>
                <th scope="col">用途说明</th>
                <th scope="col">当前解析值</th>
                <th scope="col">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={`${row.layer}-${row.name}`}>
                  <td>{layerLabels[row.layer]}</td>
                  <td>
                    <code>{row.name}</code>
                  </td>
                  <td>
                    <span className="token-description">{describeToken(row.name)}</span>
                  </td>
                  <td>
                    <TokenValue value={row.value} />
                  </td>
                  <td>
                    <div className="token-actions">
                      {(row.layer === 'primitive' || row.layer === 'semantic') &&
                      (
                        [
                          ...primitiveColorTokenNames,
                          ...semanticColorTokenNames,
                        ] as readonly string[]
                      ).includes(row.name) ? (
                        <ColorTokenEditor
                          name={row.name as ColorTokenName}
                          value={row.value}
                          onChange={onColorChange}
                          onPreview={onColorPreview}
                        />
                      ) : null}
                      <IconButton
                        className="token-copy-button"
                        label={`复制 ${row.name}`}
                        onClick={() => void copyToken(row.name, row.value)}
                      >
                        <Copy aria-hidden="true" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {copied ? (
          <FloatingNotice
            title="复制状态"
            tone={copied === '复制失败，请手动选择 Token 名称。' ? 'error' : 'info'}
            onDismiss={() => setCopied(undefined)}
          >
            {copied === '复制失败，请手动选择 Token 名称。' ? copied : `已复制 ${copied}。`}
          </FloatingNotice>
        ) : null}
      </>
    ),
    themes: (
      <div className="theme-comparison" aria-labelledby="theme-comparison-heading">
        <h3 id="theme-comparison-heading">语义 Token 对比</h3>
        <div className="theme-comparison-table-wrap" tabIndex={0}>
          <table className="token-table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">用途说明</th>
                {themeComparisons.map(({ id }) => (
                  <th key={id} scope="col">
                    {themeLabels[id]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {semanticColorTokenNames.map((name) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>
                    <span className="token-description">{describeToken(name)}</span>
                  </td>
                  {themeComparisons.map(({ id, semantic }) => (
                    <td key={id}>
                      <TokenValue value={semantic[name]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    components: (
      <div className="component-preview" aria-labelledby="component-preview-heading">
        <div className="component-preview-heading">
          <h3 id="component-preview-heading">公共组件状态</h3>
          <ToggleButton
            variant="secondary"
            pressed={previewDebug}
            onClick={() => setPreviewDebug((current) => !current)}
          >
            调试状态
          </ToggleButton>
        </div>
        <div className="component-catalog" aria-labelledby="component-catalog-heading">
          <div className="component-catalog-heading">
            <h3 id="component-catalog-heading">公共组件</h3>
            <span>{uiComponentCatalog.length} 个组件</span>
          </div>
          <div className="component-catalog-list" role="list">
            {uiComponentCatalog.map((component) => (
              <div className="component-catalog-item" key={component.name} role="listitem">
                <code>{component.name}</code>
              </div>
            ))}
          </div>
        </div>
        <div className="component-showcase" aria-labelledby="component-showcase-heading">
          <div className="component-showcase-heading">
            <h3 id="component-showcase-heading">组件展厅</h3>
            <span>13 个示例</span>
          </div>
          <div className="component-showcase-grid component-board">
            <section className="component-showcase-group" aria-labelledby="showcase-button-heading">
              <h4 id="showcase-button-heading">BUTTON / ACTION</h4>
              <div className="component-button-row">
                <Button variant="primary" onClick={() => setPreviewCommand('命令已执行')}>
                  新建任务
                </Button>
                <Button variant="secondary" onClick={() => setPreviewCommand('已取消')}>
                  取消
                </Button>
                <IconButton label="添加任务" onClick={() => setPreviewCommand('添加命令已执行')}>
                  <Plus aria-hidden="true" />
                </IconButton>
                <Button variant="danger" onClick={() => setPreviewCommand('删除命令已执行')}>
                  删除示例
                </Button>
                <Button disabled>不可用命令</Button>
                <Button
                  loading={previewLoading}
                  onClick={() => setPreviewCommand('保存命令已执行')}
                >
                  保存示例
                </Button>
                <ToggleButton
                  pressed={previewLoading}
                  onClick={() => setPreviewLoading((current) => !current)}
                >
                  加载状态
                </ToggleButton>
                <IconButton label="不可用图标" disabled>
                  <Plus aria-hidden="true" />
                </IconButton>
              </div>
              <p className="component-showcase-note" role="status">
                {previewCommand}
              </p>
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-input-heading">
              <h4 id="showcase-input-heading">INPUT / SEARCH</h4>
              <TextField label="搜索任务" placeholder="搜索任务" leadingIcon={<Search />} />
              <TextField label="只读名称" value="只读示例" readOnly />
              <TextField label="禁用名称" value="不可编辑" disabled />
              <TextField label="错误名称" error="名称不能为空。" defaultValue="" />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-status-heading">
              <h4 id="showcase-status-heading">TAG / STATUS</h4>
              <div className="showcase-status-row">
                <StatusBadge tone="success">高优先级</StatusBadge>
                <StatusBadge tone="info">进行中</StatusBadge>
                <StatusBadge tone="error">截止今天</StatusBadge>
              </div>
              <p className="component-showcase-note">颜色只落在小色标，文字保持中性可扫描。</p>
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-tabs-heading">
              <h4 id="showcase-tabs-heading">TAB / CONTENT</h4>
              <Tabs
                ariaLabel="组件展厅页签"
                className="showcase-tabs"
                idPrefix="component-showcase"
                value={previewTab}
                onChange={setPreviewTab}
                items={[
                  { id: 'overview', label: '概览', panel: <p>保持当前工作上下文。</p> },
                  { id: 'unavailable', label: '不可用', disabled: true, panel: null },
                  { id: 'details', label: '详情', panel: <p>在同一工作区查看补充信息。</p> },
                ]}
              />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-toggle-heading">
              <h4 id="showcase-toggle-heading">TOGGLE / STATE</h4>
              <ToggleButton
                variant="secondary"
                pressed={previewToggle}
                onClick={() => setPreviewToggle((current) => !current)}
              >
                示例开关
              </ToggleButton>
              <ToggleButton pressed disabled>
                禁用开关
              </ToggleButton>
              <p className="component-showcase-note">
                二态开关只表达独立状态，使用圆点和 aria-pressed 反馈。
              </p>
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-select-heading">
              <h4 id="showcase-select-heading">CONTROL / SELECT</h4>
              <SelectField
                label="视图密度"
                options={[
                  { value: 'system', label: '舒适' },
                  { value: 'home', label: '紧凑' },
                  { value: 'settings', label: '自动' },
                ]}
                value={previewMode}
                onChange={(event) => setPreviewMode(event.target.value)}
              />
              <ToggleField
                label="启用同步"
                checked={previewEnabled}
                onChange={(event) => setPreviewEnabled(event.target.checked)}
              />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-notice-heading">
              <h4 id="showcase-notice-heading">NOTICE / PROGRESS</h4>
              <InlineMessage title="本周还有 03 项待完成">保持当前节奏即可完成计划。</InlineMessage>
              <ProgressBar label="完成进度" value={68} />
              <InlineMessage tone="error" title="访问被拒绝">
                未获得文件访问权限，请授权后重试。
              </InlineMessage>
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-row-heading">
              <h4 id="showcase-row-heading">ROW / TASK</h4>
              <SettingRow label="桌面通知" description="在重要状态变化时显示提示。">
                <ToggleField
                  label="启用通知"
                  checked={previewNotifications}
                  onChange={(event) => setPreviewNotifications(event.target.checked)}
                />
              </SettingRow>
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-choice-heading">
              <h4 id="showcase-choice-heading">FILTER / CHIP</h4>
              <ChoiceGroup
                ariaLabel="密度选择"
                options={[
                  { id: 'compact', label: '紧凑' },
                  { id: 'comfortable', label: '舒适' },
                  { id: 'auto', label: '自动' },
                  { id: 'unavailable', label: '不可选', disabled: true },
                ]}
                value={previewDensity}
                onChange={setPreviewDensity}
              />
              <p className="component-showcase-note">筛选项只改变当前视图，不承担业务状态。</p>
            </section>
            <section
              className="component-showcase-group"
              aria-labelledby="showcase-vertical-tabs-heading"
            >
              <h4 id="showcase-vertical-tabs-heading">NAV / STACK</h4>
              <VerticalTabs
                ariaLabel="查看方向"
                items={[
                  { id: 'overview', label: '概览' },
                  { id: 'unavailable', label: '不可用', disabled: true },
                  { id: 'details', label: '详情' },
                ]}
                value={previewDirection}
                onChange={setPreviewDirection}
              />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-empty-heading">
              <h4 id="showcase-empty-heading">EMPTY / BLANK</h4>
              <EmptyState
                title="暂无安排"
                description="下一步再来看看。"
                framed
                icon={<Plus />}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => setPreviewCommand('创建视图命令已执行')}
                  >
                    创建视图
                  </Button>
                }
              />
            </section>
            <section
              className="component-showcase-group"
              aria-labelledby="showcase-stepper-heading"
            >
              <h4 id="showcase-stepper-heading">FIELD / STEPPER</h4>
              <StepperField
                label="保留最近工具数"
                description="使用按钮或键盘输入调整数量。"
                min={1}
                max={9}
                value={previewCount}
                onChange={setPreviewCount}
              />
            </section>
            <section
              className="component-showcase-group"
              aria-labelledby="showcase-disclosure-heading"
            >
              <h4 id="showcase-disclosure-heading">DISCLOSURE / PANEL</h4>
              <Disclosure title="显示高级选项" defaultOpen>
                可将不常用的设置收纳在面板中，同时保留明确的展开状态。
              </Disclosure>
            </section>
          </div>
        </div>
      </div>
    ),
    motion: (
      <div className="motion-view" aria-labelledby="motion-view-heading">
        <div className="motion-view-heading">
          <h3 id="motion-view-heading">动效</h3>
          <p>查看当前主题的实际动效 Token，以及共享组件在系统偏好下的反馈行为。</p>
        </div>
        <div className="motion-summary">
          <section className="motion-summary-section" aria-labelledby="motion-token-heading">
            <h4 id="motion-token-heading">动效 Token</h4>
            <dl className="motion-token-list">
              <div>
                <dt>快速反馈</dt>
                <dd>
                  <code>{motionTokens['motion.fast.duration']}</code>
                </dd>
              </div>
              <div>
                <dt>内容切换</dt>
                <dd>
                  <code>{motionTokens['motion.normal.duration']}</code>
                </dd>
              </div>
              <div>
                <dt>标准缓动</dt>
                <dd>
                  <code>{motionTokens['motion.easing.standard']}</code>
                </dd>
              </div>
            </dl>
          </section>
          <section className="motion-summary-section" aria-labelledby="motion-preference-heading">
            <h4 id="motion-preference-heading">系统偏好</h4>
            <StatusBadge tone={prefersReducedMotion ? 'warning' : 'success'}>
              {prefersReducedMotion ? '已启用减少动效' : '使用标准动效'}
            </StatusBadge>
            <p>
              {prefersReducedMotion
                ? '当前界面会立即呈现状态，并停止内容进入和加载旋转动画。'
                : '当前界面使用共享时长与标准缓动，不包含位移或装饰性循环。'}
            </p>
          </section>
        </div>
        <section className="motion-timeline" aria-labelledby="motion-timeline-heading">
          <div className="motion-timeline-heading">
            <h4 id="motion-timeline-heading">时长比例</h4>
            <span>0ms - 180ms</span>
          </div>
          <div className="motion-timeline-row">
            <span>快速反馈</span>
            <div className="motion-timeline-track" aria-hidden="true">
              <span className="motion-timeline-segment motion-timeline-segment-fast" />
            </div>
            <code>{motionTokens['motion.fast.duration']}</code>
          </div>
          <div className="motion-timeline-row">
            <span>内容切换</span>
            <div className="motion-timeline-track" aria-hidden="true">
              <span className="motion-timeline-segment motion-timeline-segment-normal" />
            </div>
            <code>{motionTokens['motion.normal.duration']}</code>
          </div>
        </section>
        <section className="motion-showcase" aria-labelledby="motion-showcase-heading">
          <div className="motion-showcase-heading">
            <div>
              <h4 id="motion-showcase-heading">反馈预览</h4>
              <p>一次处理完成时的原位消息、进度变化和结果呈现。</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setMotionPreviewVersion((value) => value + 1)}
            >
              播放动效示例
            </Button>
          </div>
          <div className="motion-preview-surface" key={motionPreviewVersion}>
            <InlineMessage title="处理状态">文本已完成处理，可继续保存或编辑。</InlineMessage>
            <p className="motion-preview-status" aria-live="polite">
              {prefersReducedMotion
                ? '系统已启用减少动效，预览仅展示最终状态。'
                : motionPreviewVersion === 0
                  ? '点击播放；为便于观察，演示由五段 180ms 反馈组成。'
                  : isMotionPreviewRunning
                    ? `正在播放第 ${motionPreviewStep + 1} 段，共 5 段。`
                    : '演示播放完成，可再次播放。'}
            </p>
            <ProgressBar label="动效预览进度" value={motionPreviewProgress} />
          </div>
        </section>
        <section className="motion-showcase" aria-labelledby="floating-notice-preview-heading">
          <div className="motion-showcase-heading">
            <div>
              <h4 id="floating-notice-preview-heading">悬浮提示预览</h4>
              <p>用于确认已完成或可逆操作，不占用工作区的内容位置。</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setFloatingNoticePreviewVersion((value) => value + 1)}
            >
              播放悬浮提示
            </Button>
          </div>
          {floatingNoticePreviewVersion ? (
            <FloatingNotice
              key={floatingNoticePreviewVersion}
              title="待办状态已更新"
              tone="success"
              onDismiss={() => setFloatingNoticePreviewVersion(0)}
            >
              已完成：整理今天的计划
            </FloatingNotice>
          ) : null}
        </section>
      </div>
    ),
    guidelines: (
      <div className="guidelines-view" aria-labelledby="guidelines-heading">
        <div className="guidelines-heading">
          <h3 id="guidelines-heading">UI 规范</h3>
          <p>这里展示与 `docs/用户界面设计规范.md` 同步的当前约束。</p>
        </div>
        <div className="guideline-list">
          {uiGuidelineGroups.map((group) => (
            <section
              className="guideline-group"
              key={group.title}
              aria-labelledby={`guideline-${group.title}`}
            >
              <h4 id={`guideline-${group.title}`}>{group.title}</h4>
              <ul>
                {group.rules.map((rule) => (
                  <li key={rule}>
                    <Check aria-hidden="true" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    ),
  };

  const developerItems: readonly TabsItem[] = developerTabs.map(({ id, label, icon: Icon }) => ({
    id,
    label,
    icon: <Icon aria-hidden="true" />,
    panel: developerPanels[id],
  }));

  return (
    <section className="settings-section design-system-viewer" aria-label="设计系统查看器">
      <Tabs
        ariaLabel="开发者查看器页签"
        className="developer-tabs"
        idPrefix="developer"
        items={developerItems}
        value={activeView}
        onChange={(value) => {
          if (
            value === 'tokens' ||
            value === 'themes' ||
            value === 'components' ||
            value === 'motion' ||
            value === 'guidelines'
          ) {
            setActiveView(value);
          }
        }}
      />
    </section>
  );
}
