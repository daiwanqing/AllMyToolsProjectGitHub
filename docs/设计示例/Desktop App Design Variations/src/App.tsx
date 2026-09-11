import { useState } from "react";

type Task = { id: number; time: string; title: string; project: string; color: string; done?: boolean };

const initialTasks: Task[] = [
  { id: 1, time: "09:30", title: "确认首页故事线", project: "新声形象", color: "var(--accent-yellow)" },
  { id: 2, time: "13:00", title: "与摄影团队现场沟通", project: "春夏拍摄", color: "var(--accent-blue)" },
  { id: 3, time: "16:30", title: "整理访谈素材与备注", project: "内容档案", color: "var(--accent-red)" },
  { id: 4, time: "18:00", title: "发送本周进度摘要", project: "内部同步", color: "#b7b7b3", done: true },
];

const weeks = [
  [26, 27, 28, 29, 30, 31, 1],
  [2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22],
  [23, 24, 25, 26, 27, 28, 29],
  [30, 1, 2, 3, 4, 5, 6],
];

const events: Record<number, string[]> = { 3: ["var(--accent-blue)"], 6: ["var(--accent-yellow)", "var(--accent-red)"], 10: ["var(--accent-red)"], 12: ["var(--accent-blue)"], 17: ["var(--accent-yellow)"], 18: ["var(--accent-yellow)", "var(--accent-blue)"], 19: ["var(--accent-red)"], 22: ["var(--accent-blue)"], 24: ["var(--accent-yellow)", "var(--accent-red)", "var(--accent-blue)"], 27: ["var(--accent-red)"], 29: ["var(--accent-blue)"] };

export default function App() {
  const [selectedDay, setSelectedDay] = useState(18);
  const [tasks, setTasks] = useState(initialTasks);
  const [isDark, setIsDark] = useState(false);
  const selectedDate = new Date(2024, 8, selectedDay);
  const weekday = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][selectedDate.getDay()];
  const dayTasks = selectedDay === 18 ? tasks : [];
  const completed = dayTasks.filter((task) => task.done).length;
  const toggleTask = (id: number) => setTasks((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));

  return <main className={`theme-app min-h-full ${isDark ? "theme-dark" : "theme-light"}`}>
    <div className="app-shell grid min-h-screen lg:grid-cols-[238px_minmax(0,1fr)]">
      <aside className="app-sidebar flex flex-col border-b p-5 lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center gap-3"><span className="flex size-8 items-center justify-center bg-[var(--accent-yellow)] font-display text-xl font-black text-[#111]">M</span><div><p className="font-display text-xl font-black tracking-[-.08em]">MONO.DAY</p><p className="app-muted font-mono text-[9px] tracking-[.12em]">PERSONAL SYSTEM</p></div></div>
          <button className="app-outline border px-3 py-2 font-mono text-[10px] lg:hidden">+ 新建</button>
        </div>
        <nav className="app-nav mt-8"><button className="is-active flex w-full items-center px-3 py-3 text-left font-display text-sm font-bold leading-none">日历待办</button></nav>
        <div className="app-projects mt-8 hidden lg:block"><p className="app-muted font-mono text-[9px] tracking-[.16em]">PROJECTS</p><div className="mt-3 space-y-1">{[["新声形象", "var(--accent-yellow)"], ["春夏拍摄", "var(--accent-blue)"], ["内容档案", "var(--accent-red)"]].map(([name, color]) => <button className="flex w-full items-center gap-3 px-3 py-2 text-left font-display text-sm" key={name}><i className="size-2" style={{ backgroundColor: color }} />{name}</button>)}</div></div>
        <div className="app-load mt-auto hidden border-t pt-5 lg:block"><p className="app-muted font-mono text-[9px] tracking-[.15em]">WEEKLY LOAD</p><p className="mt-2 font-display text-4xl font-black tracking-[-.1em]">68<span className="text-base text-[var(--accent-yellow)]">%</span></p><div className="mt-3 flex h-1.5 gap-1"><i className="flex-[7] bg-[var(--accent-yellow)]" /><i className="flex-[2] bg-[var(--accent-blue)]" /><i className="flex-1 bg-[var(--accent-red)]" /></div></div>
      </aside>

      <div className="app-workspace grid min-w-0 grid-rows-[auto_1fr]">
        <header className="app-header flex flex-wrap items-center justify-between gap-4 border-b px-5 py-5 sm:px-8">
          <div><p className="app-muted font-mono text-[10px] tracking-[.14em]">2024 / SEPTEMBER</p><h1 className="font-display mt-1 text-3xl font-black tracking-[-.1em] sm:text-4xl">九月的构造</h1></div>
          <div className="flex items-center gap-2"><button className="app-outline size-10 border font-display text-lg">←</button><button className="app-outline border px-4 py-3 font-mono text-[10px]">TODAY</button><button className="app-outline size-10 border font-display text-lg">→</button><button onClick={() => setIsDark((value) => !value)} className="app-outline flex size-10 items-center justify-center border font-display text-base" aria-label="切换深浅主题">{isDark ? "☀" : "◐"}</button><button className="ml-1 hidden bg-[var(--accent-yellow)] px-4 py-3 font-display text-sm font-black text-[#111] sm:block">+ 新建任务</button></div>
        </header>

        <div className="app-body grid min-h-0 xl:grid-cols-[minmax(0,1fr)_350px]">
          <section className="app-content min-w-0 p-4 sm:p-7">
            <div className="calendar-grid grid grid-cols-7 overflow-hidden rounded border">{["一", "二", "三", "四", "五", "六", "日"].map((day, index) => <div className={`calendar-weekday border-b border-r px-3 py-3 font-mono text-[9px] tracking-[.12em] last:border-r-0 ${index > 4 ? "text-black/35" : "text-black/65"}`} key={day}>周{day}</div>)}
              {weeks.flatMap((week, weekIndex) => week.map((day, dayIndex) => {
                const muted = (weekIndex === 0 && day > 20) || (weekIndex === 5 && day < 10);
                const selected = day === selectedDay && !muted;
                return <button onClick={() => !muted && setSelectedDay(day)} className={`date-cell relative aspect-[1.05/1] min-h-19 rounded-none border-b border-r p-2 text-left transition-colors sm:p-3 ${selected ? "is-selected" : muted ? "is-muted" : ""}`} key={`${weekIndex}-${dayIndex}`}><span className="font-display text-xl font-black tracking-[-.08em] sm:text-2xl">{day}</span>{!muted && events[day] && <span className="absolute bottom-3 left-3 flex gap-1">{events[day].map((color, i) => <i key={i} className="size-2 sm:size-2.5" style={{ backgroundColor: color }} />)}</span>}{selected && <span className="absolute right-2 top-2 font-mono text-[8px] font-bold tracking-[.1em] opacity-55">TODAY</span>}</button>;
              }))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">{[["FOCUS BLOCK", "上午，用来做最难的事。", "var(--accent-yellow)"], ["MEETINGS", "本周已安排 02 场。", "var(--accent-blue)"], ["DUE THIS WEEK", "03 项需要准时交付。", "var(--accent-red)"]].map(([label, copy, color]) => <article className="app-summary border p-5" key={label}><i className="mb-5 block h-1.5 w-12" style={{ backgroundColor: color }} /><p className="app-muted font-mono text-[9px] tracking-[.13em]">{label}</p><p className="mt-3 font-display text-lg font-bold leading-tight tracking-[-.04em]">{copy}</p></article>)}</div>
          </section>

          <aside className="app-agenda border-t xl:border-l xl:border-t-0">
            <div className="app-agenda-head border-b p-5 sm:p-7"><p className="app-muted font-mono text-[10px] tracking-[.14em]">{weekday} / {selectedDay} SEP</p><div className="mt-3 flex items-end justify-between"><h2 className="font-display text-5xl font-black leading-none tracking-[-.12em]">{selectedDay}{selectedDay === 18 && <span className="ml-2 text-xl opacity-45">TODAY</span>}</h2><p className="font-mono text-[10px]">{completed}/{dayTasks.length} DONE</p></div><div className="mt-5 flex h-1.5 gap-1">{dayTasks.length ? dayTasks.map((task) => <i key={task.id} className="flex-1" style={{ backgroundColor: task.done ? "var(--app-line)" : task.color }} />) : <i className="w-full bg-[var(--app-line)]" />}</div></div>
            <div className="p-5 sm:p-7"><div className="flex items-center justify-between"><p className="font-mono text-[10px] tracking-[.14em]">DAY'S STACK</p><button className="add-task flex size-7 items-center justify-center font-display text-lg">+</button></div><div className="mt-5 space-y-3">{dayTasks.length ? dayTasks.map((task) => <button onClick={() => toggleTask(task.id)} key={task.id} className={`task-card group grid w-full grid-cols-[22px_1fr_auto] items-start gap-3 border p-4 text-left transition-transform hover:-translate-y-0.5 ${task.done ? "is-done" : ""}`}><span className="mt-0.5 flex size-5 items-center justify-center border border-current text-[10px]" style={{ backgroundColor: task.done ? "transparent" : task.color }}>{task.done && "✓"}</span><span><span className={`block font-display text-base font-bold leading-tight tracking-[-.04em] ${task.done ? "line-through" : ""}`}>{task.title}</span><span className="mt-2 block font-mono text-[9px] opacity-55">{task.project}</span></span><span className="font-mono text-[10px]">{task.time}</span></button>) : <div className="empty-state border border-dashed p-5"><span className="flex size-8 items-center justify-center rounded bg-[var(--accent-yellow)] font-display font-bold text-[#111]">+</span><p className="mt-5 font-display text-lg font-bold">这一天没有安排。</p><p className="app-muted mt-1 font-mono text-[9px]">留给临时任务，或什么都不做。</p></div>}</div></div>
            <div className="app-tomorrow border-t p-5 sm:p-7"><p className="app-muted font-mono text-[9px] tracking-[.14em]">NEXT / {selectedDay === 30 ? 1 : selectedDay + 1} SEP</p><button className="tomorrow-card mt-3 flex w-full items-center justify-between border p-4 text-left"><span className="font-display font-bold">客户沟通 / 10:00</span><i className="size-3 bg-[var(--accent-red)]" /></button></div>
          </aside>
        </div>
      </div>
    </div>
  </main>;
}
