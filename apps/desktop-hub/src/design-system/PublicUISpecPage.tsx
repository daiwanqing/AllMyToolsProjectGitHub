import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { PublicUISpec } from './figma-workbench/PublicUISpec';

export function PublicUISpecPage({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState('');

  return <div className="fixed inset-0 z-[110] flex min-h-screen flex-col bg-background font-[Manrope] text-foreground">
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-8 max-[700px]:px-5">
      <div className="flex min-w-0 items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-[var(--dd-radius-control)] bg-primary text-primary-foreground"><BookOpen size={16}/></span><div className="min-w-0"><p className="truncate text-sm font-extrabold">公共UI规范</p><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">DaiDai shared foundation</p></div></div>
      <button type="button" onClick={onClose} aria-label="关闭公共UI规范" className="grid size-8 shrink-0 place-items-center rounded-[var(--dd-radius-control)] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><X size={16}/></button>
    </header>
    <main className="min-h-0 flex-1 overflow-y-auto px-8 py-8 max-[700px]:px-4 max-[700px]:py-5"><div className="mx-auto max-w-[var(--dd-layout-content-wide)]"><PublicUISpec onFeedback={setMessage}/></div></main>
    {message && <div role="status" className="fixed bottom-5 right-5 z-[120] flex max-w-sm items-center gap-3 rounded-[var(--dd-radius-control)] border border-border bg-popover px-3 py-2.5 text-[11px] font-bold shadow-[var(--dd-shadow-lg)]"><span className="flex-1">{message}</span><button type="button" onClick={() => setMessage('')} aria-label="关闭提示" className="text-muted-foreground"><X size={14}/></button></div>}
  </div>;
}
