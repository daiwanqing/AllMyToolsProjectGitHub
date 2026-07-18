import { useState } from 'react';
import { ArrowLeft, ChevronRight, Command, Moon, Palette, PanelsTopLeft, Search, Sparkles, Sun } from 'lucide-react';
import { moduleRegistry, type ModuleCategory } from './moduleRegistry';
import { Badge, Button, Card, CommandMenu, IconButton, Input, Surface, Tabs, Toast, useToast } from '../design-system';
import { FigmaWorkbench } from '../design-system/figma-workbench/FigmaWorkbench';

type View = 'welcome' | 'explore';
const categories: { id: ModuleCategory; label: string; note: string }[] = [
  { id: 'learning', label: '学习', note: '让好奇心变成长久能力' },
  { id: 'entertainment', label: '娱乐', note: '留一点空间给轻松和灵感' },
  { id: 'tools', label: '工具', note: '把重复工作交给工具' },
];
const themes = ['paper', 'warm', 'violet', 'ocean', 'amber', 'rose', 'forest', 'mono', 'graphite', 'midnight', 'plum', 'sunset', 'mono-night', 'dopamine', 'citrus', 'candy', 'lavender', 'coastal', 'copper', 'jade', 'ultramarine', 'ember', 'arctic', 'motionora'];

export function HubApp() {
  const [view, setView] = useState<View>('welcome');
  const [category, setCategory] = useState<ModuleCategory>('learning');
  const [theme, setTheme] = useState(() => localStorage.getItem('daidai-theme') ?? 'paper');
  const [search, setSearch] = useState('');
  const [showThemes, setShowThemes] = useState(false);
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const toast = useToast();
  const modules = moduleRegistry.filter((m) => m.category === category && m.title.includes(search));
  const changeTheme = (next: string) => { setTheme(next); localStorage.setItem('daidai-theme', next); };

  return <div className={`hub theme-${theme}`}>
    <header className="topbar"><div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>DaiDai Hub</span></div><div className="top-actions">
      <Button tone="quiet" className="system-button" onClick={() => setShowWorkbench(true)} title="查看当前产品 UI 体系"><PanelsTopLeft size={15} /> UI 体系</Button>
      <IconButton title="切换主题" onClick={() => setShowThemes(!showThemes)}><Palette size={17} /></IconButton>
      <IconButton title="切换明暗显示" onClick={() => changeTheme(theme === 'midnight' ? 'paper' : 'midnight')}>{theme === 'midnight' ? <Sun size={17} /> : <Moon size={17} />}</IconButton>
      <Button tone="quiet" className="command-button" onClick={() => setShowCommand(true)}><Command size={15} /> 快速打开 <kbd>⌘ K</kbd></Button>
    </div></header>
    {showThemes && <Surface className="theme-menu">{themes.map((item) => <button key={item} className={`theme-dot ${item}`} aria-label={item} onClick={() => { changeTheme(item); setShowThemes(false); }} />)}</Surface>}
    <main className="main">{view === 'welcome' ? <section className="welcome fade-in"><div className="eyebrow">YOUR PERSONAL TOOL UNIVERSE</div><h1>从这里开始探索<br /><em>属于你的工具世界</em></h1><p className="lead">学习、娱乐、工具，所有想做的事都从一个入口开始。</p><Button tone="primary" className="start-button" onClick={() => setView('explore')}>开始探索<ChevronRight size={19} /></Button><div className="welcome-hint"><span className="hint-line" /> 已为你准备好 {moduleRegistry.length} 个空间<span className="hint-line" /></div></section> : <section className="explore fade-in"><div className="explore-head"><Button className="back-button" onClick={() => setView('welcome')}><ArrowLeft size={16} /> 返回首页</Button><div><div className="eyebrow">EXPLORE</div><h2>你想去哪里？</h2></div><div className="search"><Search size={16} /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索空间" /></div></div><Tabs items={categories.map((item) => ({ value: item.id, label: <><span>{item.label}</span><small>{item.note}</small></> }))} value={category} onChange={(value) => { setCategory(value as ModuleCategory); setSearch(''); }} /><div className="module-grid">{modules.map((item) => { const Icon = item.icon; return <Card key={item.id} className={`module-card ${item.status === 'planned' ? 'is-disabled' : ''}`}><span className={`module-icon ${item.color}`}><Icon size={22} /></span><span className="module-copy"><strong>{item.title}</strong><small>{item.description}</small></span><ChevronRight className="module-arrow" size={18} />{item.status === 'planned' ? <Badge>即将加入</Badge> : <Badge tone="success">可用</Badge>}</Card>; })}</div></section>}</main>
    <Toast message={toast.message} onClose={toast.clear} />
    <CommandMenu open={showCommand} query={commandQuery} onQueryChange={setCommandQuery} onClose={() => { setShowCommand(false); setCommandQuery(''); }} items={['进入探索', '切换主题', '查看 UI 体系', '打开知识空间', '打开图像工作室', '打开计算工具']} onSelect={(item) => { if (item === '进入探索') setView('explore'); if (item === '切换主题') setShowThemes(true); if (item === '查看 UI 体系') setShowWorkbench(true); toast.notify(`已执行：${item}`); setShowCommand(false); setCommandQuery(''); }} />
    {showWorkbench && <FigmaWorkbench initialTheme={theme as Parameters<typeof FigmaWorkbench>[0]['initialTheme']} onClose={() => setShowWorkbench(false)} />}
    <footer><span>DAIDAI DESIGN SYSTEM</span><span>Theme · Motion · Clarity</span></footer>
  </div>;
}
