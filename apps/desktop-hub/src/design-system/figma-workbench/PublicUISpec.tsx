import { useMemo, useState, type ReactNode } from 'react';
import { Box, Copy, Layers3, MoreHorizontal, Plus, Search } from 'lucide-react';
import { Badge, Button, Card, CommandMenu, Dialog, Drawer, IconButton, Input, Select, Separator, Sidebar, Table, Tabs, Toast } from '..';
import { primitiveManifest } from '../primitiveManifest';

type Token = {
  name: string;
  value: string;
  use: string;
  swatch?: boolean;
};

type TokenGroup = {
  label: string;
  detail: string;
  tokens: Token[];
};

const tokenGroups: TokenGroup[] = [
  {
    label: '语义色与表面',
    detail: '界面只能消费语义名称。主题可以替换具体色值，组件和业务页面不直接写色值。',
    tokens: [
      { name: '--background', value: '#f7f8fa', use: '应用画布', swatch: true },
      { name: '--foreground', value: '#172033', use: '主文字与图标', swatch: true },
      { name: '--surface', value: '#ffffff', use: '浮层与容器表面', swatch: true },
      { name: '--surface-foreground', value: 'var(--foreground)', use: '表面上的主文字' },
      { name: '--primary', value: '#5255d8', use: '主操作与焦点', swatch: true },
      { name: '--primary-foreground', value: '#ffffff', use: '主操作上的文字与图标', swatch: true },
      { name: '--muted', value: '#f4f5f7', use: '次级背景', swatch: true },
      { name: '--muted-foreground', value: '#737e93', use: '辅助文字', swatch: true },
      { name: '--accent', value: '#eef0ff', use: '选中和轻强调背景', swatch: true },
      { name: '--accent-foreground', value: '#373ac3', use: '强调内容', swatch: true },
      { name: '--border', value: '#e5e8ee', use: '默认分隔线与控件边框', swatch: true },
      { name: '--ring', value: '#8184ee', use: '键盘焦点环', swatch: true },
      { name: '--card', value: 'var(--surface)', use: '卡片语义别名' },
      { name: '--card-foreground', value: 'var(--surface-foreground)', use: '卡片内容语义别名' },
      { name: '--popover', value: 'var(--surface)', use: '弹出层语义别名' },
      { name: '--popover-foreground', value: 'var(--surface-foreground)', use: '弹出层内容语义别名' },
      { name: '--secondary', value: 'var(--muted)', use: '次级操作语义别名' },
      { name: '--secondary-foreground', value: 'var(--foreground)', use: '次级操作内容语义别名' },
      { name: '--input', value: 'var(--border)', use: '输入控件边框语义别名' },
      { name: '--input-background', value: 'var(--surface)', use: '输入控件表面语义别名' },
    ],
  },
  {
    label: '字体与间距',
    detail: '使用三套指定字体和 4px 的间距刻度。界面正文不用展示字体，代码与 token 名称使用等宽字体。',
    tokens: [
      { name: '--font-body', value: 'Manrope, Microsoft YaHei', use: '产品界面正文与控件' },
      { name: '--font-mono', value: 'DM Mono', use: 'Token、代码与技术标签' },
      { name: '--font-display', value: 'Playfair Display', use: '仅品牌或展示型标题' },
      { name: '--dd-space-1', value: '4px', use: '图标内距与紧凑分隔' },
      { name: '--dd-space-2', value: '8px', use: '控件内距与相邻元素' },
      { name: '--dd-space-3', value: '12px', use: '紧凑信息组' },
      { name: '--dd-space-4', value: '16px', use: '卡片内容与常规间距' },
      { name: '--dd-space-6', value: '24px', use: '区块内的主要间距' },
      { name: '--dd-space-8', value: '32px', use: '页面区块间距' },
    ],
  },
  {
    label: '桌面布局',
    detail: '桌面产品使用受控内容宽度和固定导航尺度，避免把移动端留白模式直接带到宽屏工具页面。',
    tokens: [
      { name: '--dd-layout-sidebar', value: '216px', use: 'UI 体系主侧栏' },
      { name: '--dd-layout-workspace-sidebar', value: '150px', use: '工具工作区文档侧栏' },
      { name: '--dd-layout-workspace-topbar', value: '48px', use: '工作区顶栏' },
      { name: '--dd-layout-workspace-content-padding', value: '20px', use: '工作区正文内距' },
      { name: '--dd-layout-content-max', value: '1220px', use: '标准内容最大宽度' },
      { name: '--dd-layout-content-wide', value: '1600px', use: '宽屏工具内容最大宽度' },
      { name: '--dd-layout-explore-nav', value: '216px', use: '工具浏览左侧导航' },
      { name: '--dd-layout-explore-toolbar', value: '84px', use: '工具浏览工具栏' },
      { name: '--dd-layout-module-card-min', value: '152px', use: '工具模块最小宽度' },
      { name: '--dd-layout-search-wide', value: '264px', use: '宽屏搜索框' },
      { name: '--dd-layout-gutter', value: '32px', use: '桌面页左右留白' },
      { name: '--dd-layout-section-gap', value: '40px', use: '页面主要段落间距' },
    ],
  },
  {
    label: '形状与控件',
    detail: '常规桌面控件以 36px 高度和 6px 圆角为基准，强调型容器可使用 12px 圆角。',
    tokens: [
      { name: '--dd-radius-control', value: '6px', use: '按钮、输入框、菜单项' },
      { name: '--dd-radius-emphasis', value: '12px', use: '强调型容器与预览' },
      { name: '--dd-control-compact', value: '32px', use: '紧凑控件' },
      { name: '--dd-control-default', value: '36px', use: '默认控件' },
      { name: '--dd-control-large', value: '44px', use: '主要操作控件' },
    ],
  },
  {
    label: '动效与层级',
    detail: '动效只用于解释状态变化。不要以持续、装饰性的动画取代信息层级或操作反馈。',
    tokens: [
      { name: '--dd-duration-fast', value: '120ms', use: '悬停、图标与微反馈' },
      { name: '--dd-duration-standard', value: '180ms', use: '控件状态切换' },
      { name: '--dd-duration-layout', value: '220ms', use: '侧栏与布局变化' },
      { name: '--dd-duration-expressive', value: '280ms', use: '需要被注意的转场' },
      { name: '--dd-ease-standard', value: 'cubic-bezier(0.16, 1, 0.3, 1)', use: '常规进入与退出' },
      { name: '--dd-ease-emphasized', value: 'cubic-bezier(0.2, 0, 0, 1)', use: '强调型布局变化' },
      { name: '--dd-ease-linear', value: 'linear', use: '进度与持续性状态' },
      { name: '--dd-shadow-sm', value: '0 1px 2px rgba(20, 25, 40, .08)', use: '轻微浮起' },
      { name: '--dd-shadow-md', value: '0 8px 24px rgba(20, 25, 40, .12)', use: '弹出层和菜单' },
      { name: '--dd-shadow-lg', value: '0 20px 48px rgba(20, 25, 40, .18)', use: '模态层级' },
    ],
  },
  {
    label: '状态反馈',
    detail: '状态必须同时使用文案或图标，不能只依赖颜色传达含义。',
    tokens: [
      { name: '--dd-status-success', value: '#287a57', use: '成功文字与图标', swatch: true },
      { name: '--dd-status-success-surface', value: '#e8f6ef', use: '成功背景', swatch: true },
      { name: '--dd-status-warning', value: '#9a580d', use: '警告文字与图标', swatch: true },
      { name: '--dd-status-warning-surface', value: '#fff0d9', use: '警告背景', swatch: true },
      { name: '--dd-status-danger', value: '#b4263c', use: '危险文字与图标', swatch: true },
      { name: '--dd-status-danger-surface', value: '#fdebed', use: '危险背景', swatch: true },
      { name: '--dd-status-info', value: '#285da8', use: '信息文字与图标', swatch: true },
      { name: '--dd-status-info-surface', value: '#e8f0ff', use: '信息背景', swatch: true },
    ],
  },
];

function copy(value: string, onFeedback: (message: string) => void) {
  if (!navigator.clipboard) {
    onFeedback(`请手动复制：${value}`);
    return;
  }

  void navigator.clipboard.writeText(value)
    .then(() => onFeedback(`已复制 ${value}`))
    .catch(() => onFeedback(`请手动复制：${value}`));
}

function ShowcaseItem({ name, children }: { name: string; children: ReactNode }) {
  return <section className="min-w-0 border-b border-border py-4 last:border-b-0">
    <p className="mb-3 font-mono text-[10px] font-bold text-foreground">{name}</p>
    {children}
  </section>;
}

function ComponentShowcase({ onFeedback }: { onFeedback: (message: string) => void }) {
  const [tab, setTab] = useState('details');
  const [selectValue, setSelectValue] = useState('最近更新');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string>();

  return <>
    <div className="grid gap-x-6 lg:grid-cols-2">
      <div>
        <ShowcaseItem name="Button / IconButton">
          <div className="flex flex-wrap items-center gap-2"><Button tone="primary" onClick={() => onFeedback('已触发主操作')}><Plus size={14}/>新建</Button><Button onClick={() => onFeedback('已触发次级操作')}>取消</Button><Button tone="quiet" onClick={() => onFeedback('已打开帮助')}>查看说明</Button><IconButton title="更多操作" onClick={() => onFeedback('已打开更多操作')}><MoreHorizontal size={16}/></IconButton></div>
        </ShowcaseItem>
        <ShowcaseItem name="Input / Select">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]"><label className="flex h-[var(--dd-control-default)] min-w-0 items-center gap-2 rounded-[var(--dd-radius-control)] border border-border bg-card px-3"><Search size={14} className="shrink-0 text-muted-foreground"/><Input placeholder="搜索工具或文件" /></label><Select value={selectValue} options={['最近更新', '名称排序', '创建时间']} onChange={setSelectValue}/></div>
        </ShowcaseItem>
        <ShowcaseItem name="Badge / Separator">
          <div className="flex flex-wrap items-center gap-2"><Badge>草稿</Badge><Badge tone="success">已发布</Badge><Badge tone="warning">待处理</Badge><Badge tone="danger">失败</Badge><Badge tone="info">同步中</Badge></div><Separator /><p className="text-[10px] text-muted-foreground">使用状态文案与语义色共同表达结果。</p>
        </ShowcaseItem>
        <ShowcaseItem name="Tabs">
          <Tabs value={tab} onChange={setTab} items={[{ value: 'details', label: '详情' }, { value: 'activity', label: '活动' }, { value: 'files', label: '文件' }]} /><p className="mt-3 text-[11px] text-muted-foreground">当前视图：{tab}</p>
        </ShowcaseItem>
        <ShowcaseItem name="Card">
          <Card className="p-3"><p className="text-xs font-bold">项目摘要</p><p className="mt-1 text-[10px] text-muted-foreground">使用 Card 承载独立、可扫描的信息单元。</p></Card>
        </ShowcaseItem>
      </div>
      <div>
        <ShowcaseItem name="Table">
          <Table headers={['名称', '状态']} rows={[['图像工作室', '可用'], ['计算工具', '准备中']]} />
        </ShowcaseItem>
        <ShowcaseItem name="Sidebar">
          <div className="flex min-h-32 overflow-hidden rounded-[var(--dd-radius-control)] border border-border"><Sidebar><div className="w-36 border-r border-border bg-muted/35 p-2"><p className="px-2 py-1 font-mono text-[9px] text-muted-foreground">WORKSPACE</p><button type="button" className="mt-1 w-full rounded px-2 py-1.5 text-left text-[10px] font-bold text-accent-foreground bg-accent">项目</button><button type="button" className="mt-1 w-full rounded px-2 py-1.5 text-left text-[10px] text-muted-foreground hover:bg-muted">文件</button></div></Sidebar><div className="flex flex-1 items-center p-3 text-[10px] text-muted-foreground">纵向导航用于工具和工作区。</div></div>
        </ShowcaseItem>
        <ShowcaseItem name="Dialog / Drawer / CommandMenu / Toast">
          <div className="flex flex-wrap gap-2"><Button onClick={() => setDialogOpen(true)}>打开对话框</Button><Button onClick={() => setDrawerOpen(true)}>打开抽屉</Button><Button onClick={() => setCommandOpen(true)}>打开命令菜单</Button><Button tone="quiet" onClick={() => setToastMessage('组件已保存')}>触发 Toast</Button></div>
        </ShowcaseItem>
      </div>
    </div>
    <Dialog open={dialogOpen} title="确认发布" onClose={() => setDialogOpen(false)}><div className="px-6 pb-6"><p className="text-sm text-muted-foreground">发布后，团队成员将看到最新版本。</p><div className="mt-5 flex justify-end gap-2"><Button onClick={() => setDialogOpen(false)}>取消</Button><Button tone="primary" onClick={() => { setDialogOpen(false); onFeedback('已发布组件'); }}>发布</Button></div></div></Dialog>
    <Drawer open={drawerOpen} title="工作区设置" onClose={() => setDrawerOpen(false)}><div className="px-6 pb-6"><label className="block text-xs font-bold">显示密度</label><Select value="标准" options={['紧凑', '标准', '宽松']} onChange={() => undefined}/></div></Drawer>
    <CommandMenu open={commandOpen} query={commandQuery} onQueryChange={setCommandQuery} onClose={() => { setCommandOpen(false); setCommandQuery(''); }} items={['新建工作区', '打开图像工作室', '切换主题']} onSelect={(item) => { onFeedback(`已执行：${item}`); setCommandOpen(false); setCommandQuery(''); }} />
    <Toast message={toastMessage} onClose={() => setToastMessage(undefined)} />
  </>;
}

export function PublicUISpec({ onFeedback }: { onFeedback: (message: string) => void }) {
  const [componentQuery, setComponentQuery] = useState('');
  const primitiveComponents = useMemo(() => {
    const query = componentQuery.trim().toLowerCase();
    return primitiveManifest.filter((item) => !query || item.name.toLowerCase().includes(query) || item.file.includes(query));
  }, [componentQuery]);

  const tokenCount = tokenGroups.reduce((count, group) => count + group.tokens.length, 0);

  return <section className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(24,32,51,0.03)]">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-primary">DaiDai / Shared UI specification</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em]">公共UI规范</h2>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">工具设计的唯一公共依据。优先调用语义 Token 和已有组件，不在业务页面写颜色、尺寸、圆角、阴影或控件状态的硬编码实现。</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-[var(--dd-radius-control)] border border-border bg-muted/45 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground"><Layers3 size={12}/>{tokenCount} tokens</span>
        <span className="inline-flex items-center gap-1.5 rounded-[var(--dd-radius-control)] border border-border bg-muted/45 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground"><Box size={12}/>{primitiveManifest.length} primitives</span>
      </div>
    </header>

    <div className="p-5">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-4">
        <div><p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">01 / Design tokens</p><h3 className="mt-1 text-lg font-extrabold">设计 Token</h3></div>
        <p className="max-w-md text-right text-[11px] leading-5 text-muted-foreground">引用 <code className="font-mono text-primary">var(--token-name)</code>，主题切换时由 token 层统一改变。</p>
      </div>

      <div className="space-y-7">
        {tokenGroups.map((group) => <section key={group.label}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-[13px] font-bold">{group.label}</h4><p className="max-w-2xl text-[10px] leading-4 text-muted-foreground">{group.detail}</p></div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {group.tokens.map((token) => <button key={token.name} type="button" onClick={() => copy(`var(${token.name})`, onFeedback)} className="group flex min-h-[68px] items-center gap-3 rounded-[var(--dd-radius-control)] border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/55">
              <span className={`grid size-8 shrink-0 place-items-center rounded-[var(--dd-radius-control)] border border-border bg-muted ${token.swatch ? '' : 'font-mono text-[10px] text-primary'}`} style={token.swatch ? { backgroundColor: `var(${token.name})` } : undefined}>{token.swatch ? <span className="size-2 rounded-full border border-black/10 bg-white/50" /> : '{}'}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-mono text-[10px] font-medium text-foreground">{token.name}</span><span className="mt-1 block truncate font-mono text-[9px] text-primary">{token.value}</span><span className="mt-1 block truncate text-[10px] text-muted-foreground">{token.use}</span></span>
              <Copy size={12} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>)}
          </div>
        </section>)}
      </div>

      <div className="mb-8 mt-11 flex items-end justify-between gap-4 border-b border-border pb-4">
        <div><p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">02 / Components</p><h3 className="mt-1 text-lg font-extrabold">公共组件</h3></div>
        <p className="max-w-md text-right text-[11px] leading-5 text-muted-foreground">产品封装优先从 <code className="font-mono text-primary">design-system</code> 调用；需要更细粒度能力时使用原子组件库。</p>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3"><div><h4 className="text-[13px] font-bold">产品默认封装</h4><p className="mt-1 text-[10px] text-muted-foreground">以下为实际组件，不是样式示意图；可直接操作查看状态。</p></div><span className="rounded-full bg-accent px-2 py-1 font-mono text-[9px] font-bold text-accent-foreground">LIVE COMPONENTS</span></div>
        <ComponentShowcase onFeedback={onFeedback}/>
      </section>

      <section className="mt-7 border-t border-border pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h4 className="text-[13px] font-bold">完整原子组件库</h4><p className="mt-1 text-[10px] text-muted-foreground">从 <code className="font-mono text-primary">design-system/figma-primitives</code> 的公共出口导入；用于默认封装尚未覆盖的交互。</p></div><label className="relative block w-full sm:w-56"><Search size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-muted-foreground"/><input value={componentQuery} onChange={(event) => setComponentQuery(event.target.value)} placeholder="查找原子组件" className="h-8 w-full rounded-[var(--dd-radius-control)] border border-border bg-card pl-8 pr-3 text-[11px] outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" /></label></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {primitiveComponents.map((item) => <button key={item.file} type="button" onClick={() => copy(`design-system/figma-primitives/${item.file}`, onFeedback)} className="group flex min-h-[52px] items-center gap-2 rounded-[var(--dd-radius-control)] border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-muted/55"><span className="grid size-6 shrink-0 place-items-center rounded bg-muted text-primary"><Box size={12}/></span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-bold">{item.name}</span><code className="mt-0.5 block truncate font-mono text-[9px] text-muted-foreground">{item.file}.tsx</code></span><Copy size={11} className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"/></button>)}
        </div>
        {primitiveComponents.length === 0 && <p className="py-8 text-center text-xs text-muted-foreground">没有匹配的原子组件。</p>}
      </section>
    </div>
  </section>;
}
