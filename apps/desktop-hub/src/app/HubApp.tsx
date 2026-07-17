import { useState } from 'react';
import { ArrowLeft, ChevronRight, Command, Moon, Palette, Search, Sparkles, Sun } from 'lucide-react';
import { moduleRegistry, type ModuleCategory } from './moduleRegistry';

type View = 'welcome' | 'explore';
const categories: { id: ModuleCategory; label: string; note: string }[] = [
  { id: 'learning', label: '学习', note: '让好奇心变成长期能力' },
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
  const modules = moduleRegistry.filter((m) => m.category === category && m.title.includes(search));

  const changeTheme = (next: string) => { setTheme(next); localStorage.setItem('daidai-theme', next); };
  return <div className={`hub theme-${theme}`}>
    <header className="topbar"><div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>DaiDai Hub</span></div><div className="top-actions"><button className="icon-button" title="切换主题" onClick={() => setShowThemes(!showThemes)}><Palette size={17} /></button><button className="icon-button" title="切换明暗显示" onClick={() => changeTheme(theme === 'midnight' ? 'paper' : 'midnight')}>{theme === 'midnight' ? <Sun size={17} /> : <Moon size={17} />}</button><button className="command-button" onClick={() => setView('explore')}><Command size={15} /> 快速打开 <kbd>⌘ K</kbd></button></div></header>
    {showThemes && <div className="theme-menu">{themes.map((item) => <button key={item} className={`theme-dot ${item}`} aria-label={item} onClick={() => { changeTheme(item); setShowThemes(false); }} />)}</div>}
    <main className="main">{view === 'welcome' ? <section className="welcome fade-in"><div className="eyebrow">YOUR PERSONAL TOOL UNIVERSE</div><h1>从这里开始探索<br /><em>属于你的工具世界</em></h1><p className="lead">学习、娱乐、工具，所有想做的事都从一个入口开始。</p><button className="start-button" onClick={() => setView('explore')}>开始探索 <ChevronRight size={19} /></button><div className="welcome-hint"><span className="hint-line" /> 已为你准备好 {moduleRegistry.length} 个空间 <span className="hint-line" /></div></section> : <section className="explore fade-in"><div className="explore-head"><button className="back-button" onClick={() => setView('welcome')}><ArrowLeft size={16} /> 返回首页</button><div><div className="eyebrow">EXPLORE</div><h2>你想去哪里？</h2></div><div className="search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索空间" /></div></div><div className="category-tabs">{categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => { setCategory(item.id); setSearch(''); }}><span>{item.label}</span><small>{item.note}</small></button>)}</div><div className="module-grid">{modules.map((item) => { const Icon = item.icon; return <button className="module-card" key={item.id} disabled={item.status === 'planned'}><span className={`module-icon ${item.color}`}><Icon size={22} /></span><span className="module-copy"><strong>{item.title}</strong><small>{item.description}</small></span><ChevronRight className="module-arrow" size={18} />{item.status === 'planned' && <span className="planned">即将加入</span>}</button>; })}</div></section>}</main>
    <footer><span>DAIDAI DESIGN SYSTEM</span><span>Theme · Motion · Clarity</span></footer>
  </div>;
}
