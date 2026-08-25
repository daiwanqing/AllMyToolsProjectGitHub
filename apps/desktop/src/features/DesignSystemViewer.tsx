import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { resolveThemeTokens, type ThemeName } from '@allmytools/design-tokens';
import {
  Button,
  ChoiceGroup,
  Disclosure,
  EmptyState,
  IconButton,
  InlineMessage,
  NavigationItem,
  ProgressBar,
  SettingRow,
  SelectField,
  StatusBadge,
  StepperField,
  Tabs,
  TextField,
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
  Palette,
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

function tokenRows(theme: ThemeName): readonly TokenRow[] {
  const tokens = resolveThemeTokens(theme);
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

export function DesignSystemViewer({ theme }: Readonly<{ theme: ThemeName }>) {
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState<string>();
  const [activeView, setActiveView] = useState<DeveloperView>('tokens');
  const [previewTab, setPreviewTab] = useState('overview');
  const [previewNavigation, setPreviewNavigation] = useState('home');
  const [previewDensity, setPreviewDensity] = useState('comfortable');
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewNotifications, setPreviewNotifications] = useState(false);
  const [previewMode, setPreviewMode] = useState('system');
  const [previewCount, setPreviewCount] = useState(3);
  const [motionPreviewVersion, setMotionPreviewVersion] = useState(0);
  const [motionPreviewProgress, setMotionPreviewProgress] = useState(0);
  const [motionPreviewStep, setMotionPreviewStep] = useState(0);
  const [isMotionPreviewRunning, setIsMotionPreviewRunning] = useState(false);
  const currentRows = useMemo(() => tokenRows(theme), [theme]);
  const lightSemantic = useMemo(() => resolveThemeTokens('light').semantic, []);
  const darkSemantic = useMemo(() => resolveThemeTokens('dark').semantic, []);
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

        <div className="token-table-wrap" tabIndex={0} aria-label="当前主题 Token 列表">
          <table className="token-table">
            <thead>
              <tr>
                <th scope="col">层级</th>
                <th scope="col">Token</th>
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
                    <TokenValue value={row.value} />
                  </td>
                  <td>
                    <IconButton
                      className="token-copy-button"
                      label={`复制 ${row.name}`}
                      onClick={() => void copyToken(row.name, row.value)}
                    >
                      <Copy aria-hidden="true" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {copied ? (
          <InlineMessage title="复制状态">
            {copied === '复制失败，请手动选择 Token 名称。' ? copied : `已复制 ${copied}。`}
          </InlineMessage>
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
                <th scope="col">浅色</th>
                <th scope="col">深色</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(lightSemantic).map((name) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>
                    <TokenValue value={lightSemantic[name as keyof typeof lightSemantic]} />
                  </td>
                  <td>
                    <TokenValue value={darkSemantic[name as keyof typeof darkSemantic]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    components: (
      <div className="component-preview" aria-labelledby="component-preview-heading">
        <div className="component-catalog" aria-labelledby="component-catalog-heading">
          <h3 id="component-catalog-heading">公共组件</h3>
          <div className="component-catalog-list">
            {uiComponentCatalog.map((component) => (
              <div className="component-catalog-item" key={component.name}>
                <div className="component-catalog-name">
                  <code>{component.name}</code>
                  <span>{component.category}</span>
                </div>
                <p>{component.contract}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="component-showcase" aria-labelledby="component-showcase-heading">
          <h3 id="component-showcase-heading">组件展厅</h3>
          <p className="component-showcase-intro">
            通过真实控件组合检查统一布局、交互状态和可访问性契约。
          </p>
          <div className="component-showcase-grid">
            <section className="component-showcase-group" aria-labelledby="showcase-tabs-heading">
              <h4 id="showcase-tabs-heading">Tabs 页签</h4>
              <Tabs
                ariaLabel="组件展厅页签"
                className="showcase-tabs"
                idPrefix="component-showcase"
                value={previewTab}
                onChange={setPreviewTab}
                items={[
                  { id: 'overview', label: '概览', panel: <p>保持当前工作上下文。</p> },
                  { id: 'details', label: '详情', panel: <p>在同一工作区查看补充信息。</p> },
                ]}
              />
            </section>
            <section
              className="component-showcase-group"
              aria-labelledby="showcase-navigation-heading"
            >
              <h4 id="showcase-navigation-heading">NavigationItem 导航项</h4>
              <div className="showcase-navigation-list">
                <NavigationItem
                  active={previewNavigation === 'home'}
                  icon={<Code2 aria-hidden="true" />}
                  label="工具首页"
                  onClick={() => setPreviewNavigation('home')}
                />
                <NavigationItem
                  active={previewNavigation === 'settings'}
                  icon={<Settings2 aria-hidden="true" />}
                  label="设置"
                  onClick={() => setPreviewNavigation('settings')}
                />
              </div>
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-choice-heading">
              <h4 id="showcase-choice-heading">ChoiceGroup 选项组</h4>
              <ChoiceGroup
                ariaLabel="密度选择"
                options={[
                  { id: 'compact', label: '紧凑' },
                  { id: 'comfortable', label: '舒适' },
                  { id: 'auto', label: '自动' },
                ]}
                value={previewDensity}
                onChange={setPreviewDensity}
              />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-toggle-heading">
              <h4 id="showcase-toggle-heading">ToggleField 开关</h4>
              <ToggleField
                label="启用同步"
                description="允许在设备之间同步设置。"
                checked={previewEnabled}
                onChange={(event) => setPreviewEnabled(event.target.checked)}
              />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-row-heading">
              <h4 id="showcase-row-heading">SettingRow 设置行</h4>
              <SettingRow label="桌面通知" description="在重要状态变化时显示提示。">
                <ToggleField
                  label="启用通知"
                  checked={previewNotifications}
                  onChange={(event) => setPreviewNotifications(event.target.checked)}
                />
              </SettingRow>
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-empty-heading">
              <h4 id="showcase-empty-heading">EmptyState 空内容</h4>
              <EmptyState
                title="暂无保存的视图"
                description="创建一个视图后，它会显示在这里。"
                action={<Button variant="secondary">创建视图</Button>}
              />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-select-heading">
              <h4 id="showcase-select-heading">SelectField 下拉选择</h4>
              <SelectField
                label="启动模式"
                description="选择应用启动时打开的工作区。"
                options={[
                  { value: 'system', label: '跟随系统' },
                  { value: 'home', label: '工具首页' },
                  { value: 'settings', label: '设置页' },
                ]}
                value={previewMode}
                onChange={(event) => setPreviewMode(event.target.value)}
              />
            </section>
            <section
              className="component-showcase-group"
              aria-labelledby="showcase-stepper-heading"
            >
              <h4 id="showcase-stepper-heading">StepperField 步进输入</h4>
              <StepperField
                label="保留最近工具数"
                description="使用按钮或键盘输入调整数量。"
                min={1}
                max={9}
                value={previewCount}
                onChange={setPreviewCount}
              />
            </section>
            <section className="component-showcase-group" aria-labelledby="showcase-status-heading">
              <h4 id="showcase-status-heading">StatusBadge 与 ProgressBar</h4>
              <div className="showcase-status-row">
                <StatusBadge tone="success">已同步</StatusBadge>
                <StatusBadge tone="warning">等待处理</StatusBadge>
                <StatusBadge tone="error">需要关注</StatusBadge>
              </div>
              <ProgressBar label="同步进度" value={64} />
            </section>
            <section
              className="component-showcase-group"
              aria-labelledby="showcase-disclosure-heading"
            >
              <h4 id="showcase-disclosure-heading">Disclosure 折叠面板</h4>
              <Disclosure title="显示高级选项" defaultOpen>
                可将不常用的设置收纳在面板中，同时保留明确的展开状态。
              </Disclosure>
            </section>
          </div>
        </div>
        <div className="component-state-preview">
          <h3 id="component-preview-heading">公共组件状态</h3>
          <div className="component-preview-row">
            <Button variant="primary">主要操作</Button>
            <Button variant="secondary">次要操作</Button>
            <Button variant="ghost">无边框操作</Button>
            <Button loading>加载中</Button>
            <Button disabled>不可用</Button>
          </div>
          <div className="component-preview-fields">
            <TextField label="默认输入" placeholder="输入内容" />
            <TextField label="错误输入" error="请输入有效内容。" value="无效示例" readOnly />
            <TextField label="禁用输入" value="不可编辑" disabled readOnly />
          </div>
          <InlineMessage title="信息状态">这是来自公共组件的原位提示。</InlineMessage>
          <InlineMessage title="错误状态" tone="error">
            这是来自公共组件的可恢复错误提示。
          </InlineMessage>
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
    <section
      className="settings-section design-system-viewer"
      aria-labelledby="design-system-heading"
    >
      <p className="eyebrow">开发者</p>
      <h2 id="design-system-heading">设计系统查看器</h2>
      <p>当前主题为{theme === 'light' ? '浅色' : '深色'}，下方数据直接来自设计 Token 包。</p>

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
