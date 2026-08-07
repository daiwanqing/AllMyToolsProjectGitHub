import { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Command, Gamepad2, Moon, Palette, PanelsTopLeft, Search, Sparkles, Sun, Wrench } from 'lucide-react';
import { moduleRegistry, type ModuleCategory } from './moduleRegistry';
import { Badge, Button, CommandMenu, IconButton, Input, Surface, Tabs, Toast, useToast } from '../design-system';
import { FigmaWorkbench } from '../design-system/figma-workbench/FigmaWorkbench';

type View = 'welcome' | 'explore';
const categories: { id: ModuleCategory; label: string; note: string; icon: typeof BookOpen }[] = [
  { id: 'learning', label: '\u5b66\u4e60', note: '\u628a\u597d\u5947\u5fc3\u53d8\u6210\u957f\u4e45\u80fd\u529b', icon: BookOpen },
  { id: 'entertainment', label: '\u5a31\u4e50', note: '\u7559\u4e00\u70b9\u7a7a\u95f4\u7ed9\u8f7b\u677e\u548c\u7075\u611f', icon: Gamepad2 },
  { id: 'tools', label: '\u5de5\u5177', note: '\u628a\u91cd\u590d\u5de5\u4f5c\u4ea4\u7ed9\u5de5\u5177', icon: Wrench },
];
const themes = ['paper', 'warm', 'violet', 'ocean', 'amber', 'rose', 'forest', 'mono', 'graphite', 'midnight', 'plum', 'sunset', 'mono-night', 'dopamine', 'citrus', 'candy', 'lavender', 'coastal', 'copper', 'jade', 'ultramarine', 'ember', 'arctic', 'motionora'];

export function HubApp() {
  const [view, setView] = useState<View>('welcome');
  const [category, setCategory] = useState<ModuleCategory>('tools');
  const [theme, setTheme] = useState(() => localStorage.getItem('daidai-theme') ?? 'paper');
  const [search, setSearch] = useState('');
  const [showThemes, setShowThemes] = useState(false);
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const toast = useToast();
  const activeCategory = categories.find((item) => item.id === category)!;
  const modules = moduleRegistry.filter((m) => m.category === category && m.title.includes(search));
  const changeTheme = (next: string) => { setTheme(next); localStorage.setItem('daidai-theme', next); };

  return <div className={`hub theme-${theme}`}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>DaiDai Hub</span></div>
      <div className="top-actions">
        <Button tone="quiet" className="system-button" onClick={() => setShowWorkbench(true)} title="\u67e5\u770b\u5f53\u524d\u4ea7\u54c1 UI \u4f53\u7cfb"><PanelsTopLeft size={15} /> {'UI \u4f53\u7cfb'}</Button>
        <IconButton title="\u5207\u6362\u4e3b\u9898" onClick={() => setShowThemes(!showThemes)}><Palette size={17} /></IconButton>
        <IconButton title="\u5207\u6362\u660e\u6697\u663e\u793a" onClick={() => changeTheme(theme === 'midnight' ? 'paper' : 'midnight')}>{theme === 'midnight' ? <Sun size={17} /> : <Moon size={17} />}</IconButton>
        <Button tone="quiet" className="command-button" onClick={() => setShowCommand(true)}><Command size={15} /> {'\u5feb\u901f\u6253\u5f00'} <kbd>\u2318K</kbd></Button>
      </div>
    </header>
    {showThemes && <Surface className="theme-menu">{themes.map((item) => <button key={item} className={`theme-dot ${item}`} aria-label={item} onClick={() => { changeTheme(item); setShowThemes(false); }} />)}</Surface>}
    <main className="main">
      {view === 'welcome' ? <section className="welcome fade-in">
        <div className="eyebrow">YOUR PERSONAL TOOL UNIVERSE</div>
        <h1>{'\u4ece\u8fd9\u91cc\u5f00\u59cb\u63a2\u7d22'}<br /><em>{'\u5c5e\u4e8e\u4f60\u7684\u5de5\u5177\u4e16\u754c'}</em></h1>
        <p className="lead">{'\u5b66\u4e60\u3001\u5a31\u4e50\u3001\u5de5\u5177\uff0c\u6240\u6709\u60f3\u505a\u7684\u4e8b\u90fd\u4ece\u4e00\u4e2a\u5165\u53e3\u5f00\u59cb\u3002'}</p>
        <Button tone="primary" className="start-button" onClick={() => setView('explore')}>{'\u5f00\u59cb\u63a2\u7d22'} <ChevronRight size={19} /></Button>
        <div className="welcome-hint"><span className="hint-line" /> {'\u5df2\u4e3a\u4f60\u51c6\u5907\u597d'} {moduleRegistry.length} {'\u4e2a\u7a7a\u95f4'} <span className="hint-line" /></div>
      </section> : <section className="explore fade-in">
        <header className="explore-head">
          <div className="explore-heading"><IconButton className="back-button" title="\u8fd4\u56de\u9996\u9875" onClick={() => setView('welcome')}><ArrowLeft size={16} /></IconButton><div className="explore-title"><div className="eyebrow">DAIDAI HUB / SPACES</div><h2>{'\u5de5\u5177\u7a7a\u95f4'}</h2><p>{'\u9009\u62e9\u4e00\u4e2a\u5de5\u4f5c\u533a\uff0c\u7ee7\u7eed\u4f60\u7684\u4efb\u52a1\u3002'}</p></div></div>
          <label className="search"><Search size={16} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="\u641c\u7d22\u7a7a\u95f4" /></label>
        </header>
        <div className="explore-workspace">
          <aside className="explore-nav"><p className="explore-nav-label">SPACES</p><Tabs className="category-tabs" items={categories.map((item) => { const Icon = item.icon; const count = moduleRegistry.filter((module) => module.category === item.id).length; return { value: item.id, label: <><span className="category-tab-name"><Icon size={15} /><span>{item.label}</span></span><small>{count}</small></> }; })} value={category} onChange={(value) => { setCategory(value as ModuleCategory); setSearch(''); }} /></aside>
          <section className="explore-results" aria-label={activeCategory.label}>
            <div className="results-head"><div><p className="eyebrow">{activeCategory.label.toUpperCase()}</p><h3>{activeCategory.label}</h3><p>{activeCategory.note}</p></div><span>{modules.length} {'\u4e2a\u7a7a\u95f4'}</span></div>
            {modules.length > 0 ? <div className="module-grid">{modules.map((item) => { const Icon = item.icon; const ready = item.status === 'ready'; return <Button key={item.id} className={`module-card ${!ready ? 'is-disabled' : ''}`} disabled={!ready} onClick={() => ready && toast.notify(`\u5df2\u6253\u5f00 ${item.title}`)}><span className={`module-icon ${item.color}`}><Icon size={22} /></span><span className="module-copy"><strong>{item.title}</strong><small>{item.description}</small></span><ChevronRight className="module-arrow" size={18} />{ready ? <Badge tone="success">{'\u53ef\u7528'}</Badge> : <Badge>{'\u5373\u5c06\u52a0\u5165'}</Badge>}</Button>; })}</div> : <div className="module-empty">{'\u6ca1\u6709\u5339\u914d\u7684\u7a7a\u95f4'}</div>}
          </section>
        </div>
      </section>}
    </main>
    <Toast message={toast.message} onClose={toast.clear} />
    <CommandMenu open={showCommand} query={commandQuery} onQueryChange={setCommandQuery} onClose={() => { setShowCommand(false); setCommandQuery(''); }} items={['\u8fdb\u5165\u63a2\u7d22', '\u5207\u6362\u4e3b\u9898', '\u67e5\u770b UI \u4f53\u7cfb', '\u6253\u5f00\u77e5\u8bc6\u7a7a\u95f4', '\u6253\u5f00\u56fe\u50cf\u5de5\u4f5c\u5ba4', '\u6253\u5f00\u8ba1\u7b97\u5de5\u5177']} onSelect={(item) => { if (item === '\u8fdb\u5165\u63a2\u7d22') setView('explore'); if (item === '\u5207\u6362\u4e3b\u9898') setShowThemes(true); if (item === '\u67e5\u770b UI \u4f53\u7cfb') setShowWorkbench(true); toast.notify(`\u5df2\u6267\u884c\uff1a${item}`); setShowCommand(false); setCommandQuery(''); }} />
    {showWorkbench && <FigmaWorkbench initialTheme={theme as Parameters<typeof FigmaWorkbench>[0]['initialTheme']} onClose={() => setShowWorkbench(false)} />}
    <footer><span>DAIDAI DESIGN SYSTEM</span><span>Theme · Motion · Clarity</span></footer>
  </div>;
}
