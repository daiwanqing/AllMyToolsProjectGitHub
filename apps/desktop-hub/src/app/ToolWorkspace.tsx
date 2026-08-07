import { useState } from 'react';
import { FileText, Folder, Home, Plus, Search, Star, X } from 'lucide-react';
import type { ModuleDefinition } from './moduleRegistry';
import { Button, IconButton } from '../design-system';

const workspaceItems = ['\u5f00\u59cb\u4f7f\u7528', '\u8bbe\u8ba1\u7cfb\u7edf', '\u5de5\u7a0b\u89c4\u8303'];
const documentItems = ['\u8bbe\u8ba1 Token \u547d\u540d\u89c4\u8303', '\u7ec4\u4ef6\u53d1\u5e03\u6d41\u7a0b', 'Motion \u4f7f\u7528\u51c6\u5219'];

export function ToolWorkspace({ module, onClose }: { module: ModuleDefinition; onClose: () => void }) {
  const [document, setDocument] = useState(documentItems[0]);
  const [starred, setStarred] = useState(false);
  const Icon = module.icon;
  const workspaceName = module.id === 'knowledge' ? '\u77e5\u8bc6\u5e93' : module.title;

  return <div className="tool-workspace-backdrop">
    <section className="tool-workspace-shell" aria-label={workspaceName}>
      <header className="tool-workspace-topbar">
        <div className="tool-workspace-brand"><span className="tool-workspace-brand-mark"><Icon size={16} /></span><strong>DaiDai {workspaceName}</strong></div>
        <div className="tool-workspace-actions"><Button tone="primary"><Plus size={15} /> {'\u65b0\u5efa'}</Button><IconButton title="\u641c\u7d22"><Search size={16} /></IconButton><IconButton title="\u5173\u95ed\u5de5\u4f5c\u533a" onClick={onClose}><X size={16} /></IconButton></div>
      </header>
      <div className="tool-workspace-body">
        <aside className="tool-workspace-sidebar">
          <p className="tool-workspace-label">WORKSPACE</p>
          <nav className="tool-workspace-nav">{workspaceItems.map((item, index) => <button key={item} className={index === 1 ? 'is-active' : ''} type="button"><Folder size={14} /><span>{item}</span></button>)}</nav>
          <p className="tool-workspace-label tool-workspace-documents-label">DOCUMENTS</p>
          <nav className="tool-workspace-nav">{documentItems.map((item) => <button key={item} className={document === item ? 'is-current' : ''} type="button" onClick={() => setDocument(item)}><FileText size={14} /><span>{item}</span></button>)}</nav>
        </aside>
        <main className="tool-workspace-content">
          <div className="tool-workspace-breadcrumb"><Home size={12} /><span>{'\u8bbe\u8ba1\u7cfb\u7edf'}</span><span>/</span><span>{document}</span></div>
          <div className="tool-workspace-content-actions"><IconButton title={starred ? '\u53d6\u6d88\u6536\u85cf' : '\u6536\u85cf'} onClick={() => setStarred((value) => !value)}><Star size={16} fill={starred ? 'currentColor' : 'none'} /></IconButton><Button>{'\u4fdd\u5b58'}</Button></div>
          <div className="tool-workspace-article">
            <p className="eyebrow">DAIDAI / FOUNDATIONS</p>
            <h1>{document}</h1>
            <p className="tool-workspace-description">{'\u7ec4\u4ef6\u901a\u8fc7\u8bed\u4e49 token \u5efa\u7acb\u5c42\u7ea7\u3002\u540d\u79f0\u63cf\u8ff0\u7528\u9014\uff0c\u800c\u4e0d\u662f\u989c\u8272\u6216\u5177\u4f53\u5b9e\u73b0\uff0c\u4f7f\u4e3b\u9898\u5207\u6362\u3001\u7ef4\u62a4\u4e0e\u534f\u4f5c\u4fdd\u6301\u7a33\u5b9a\u3002'}</p>
            <div className="tool-workspace-token"><code>color/action/primary</code><span>{'\u2192 button.primary.background'}</span></div>
            <div className="tool-workspace-meta"><span><FileText size={13} /> {'\u7f16\u8f91\u4e8e\u4eca\u5929 10:42'}</span><span>{'\u6797\u6eaa'} 路 5 min read</span></div>
          </div>
        </main>
      </div>
    </section>
  </div>;
}

