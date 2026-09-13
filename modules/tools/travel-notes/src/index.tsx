import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import {
  BookOpen,
  CalendarDays,
  Camera,
  ChevronLeft,
  MapPin,
  Plus,
  Receipt,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  Button,
  EmptyState,
  FloatingNotice,
  HorizontalTabs,
  Modal,
  SelectField,
  StatusBadge,
  TextAreaField,
  TextField,
} from '@allmytools/ui';
import type { BusinessColorName } from '@allmytools/design-tokens';
import { manifest } from './manifest';
import {
  loadTravelNotesWorkspace,
  saveTravelNotesWorkspace,
  type TravelEntry,
  type TravelExpense,
  type TravelNotesWorkspace,
  type TravelTrip,
} from './storage';

export { manifest };

type NewTripDraft = { title: string; destination: string; startDate: string; endDate: string };
const emptyDraft: NewTripDraft = { title: '', destination: '', startDate: '', endDate: '' };
type ExpenseDraft = {
  title: string;
  category: TravelExpense['category'];
  amount: string;
  date: string;
};
const emptyExpense: ExpenseDraft = { title: '', category: '餐饮', amount: '', date: '' };
const expenseCategories = [
  { value: '交通', label: '交通' },
  { value: '住宿', label: '住宿' },
  { value: '餐饮', label: '餐饮' },
  { value: '门票', label: '门票' },
  { value: '其他', label: '其他' },
] as const;

function businessColor(color: BusinessColorName) {
  return `var(--amt-color-business-${color})`;
}

function formatDay(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(parsed);
}

function TripCover({ trip, compact = false }: Readonly<{ trip: TravelTrip; compact?: boolean }>) {
  return (
    <div
      className={`travel-trip-cover ${compact ? 'travel-trip-cover-compact' : ''}`}
      style={{ '--trip-accent': businessColor(trip.accent) } as CSSProperties}
    >
      <img src={trip.coverImage} alt="" />
      <div className="travel-trip-cover-wash" />
      <span className="travel-trip-stamp">TRAVEL NOTE / {trip.dateLabel}</span>
      <div className="travel-trip-cover-copy">
        <span>{trip.destination}</span>
        <strong>{trip.title}</strong>
      </div>
    </div>
  );
}

function EntryCard({ entry }: Readonly<{ entry: TravelEntry }>) {
  return (
    <article
      className="travel-entry"
      style={
        {
          '--entry-accent': businessColor(entry.mood === '惊喜' ? 'lime' : 'blue'),
        } as CSSProperties
      }
    >
      <div className="travel-entry-time">
        <span>{entry.time}</span>
        <i />
      </div>
      <div className="travel-entry-body">
        <div className="travel-entry-heading">
          <div>
            <span className="travel-entry-type">旅途记录</span>
            <h3>{entry.title}</h3>
          </div>
          {entry.mood ? <StatusBadge tone="info">{entry.mood}</StatusBadge> : null}
        </div>
        <p>{entry.content}</p>
        <div className="travel-entry-meta">
          {entry.place ? (
            <span>
              <MapPin size={14} aria-hidden="true" />
              {entry.place}
            </span>
          ) : null}
          {entry.image ? <img src={entry.image} alt="" /> : null}
        </div>
      </div>
    </article>
  );
}

export function ToolView({ onClose }: Readonly<{ onClose?: () => void }>) {
  const [workspace, setWorkspace] = useState<TravelNotesWorkspace>(() =>
    loadTravelNotesWorkspace(window.localStorage),
  );
  const [selectedId, setSelectedId] = useState(() => workspace.trips[0]?.id ?? '');
  const [showCreate, setShowCreate] = useState(false);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [activeView, setActiveView] = useState<'timeline' | 'review'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState(emptyDraft);
  const [expense, setExpense] = useState<ExpenseDraft>(emptyExpense);
  const [note, setNote] = useState({ title: '', content: '', place: '' });
  const [notice, setNotice] = useState<string>();
  const selectedTrip = workspace.trips.find((trip) => trip.id === selectedId) ?? workspace.trips[0];

  const entriesByDate = useMemo(() => {
    if (!selectedTrip) return [];
    const groups = new Map<string, TravelEntry[]>();
    const query = searchQuery.trim().toLocaleLowerCase('zh-CN');
    selectedTrip.entries
      .filter(
        (entry) =>
          !query ||
          [entry.title, entry.content, entry.place ?? ''].some((value) =>
            value.toLocaleLowerCase('zh-CN').includes(query),
          ),
      )
      .forEach((entry) => groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry]));
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [searchQuery, selectedTrip]);

  const totalExpenses = selectedTrip?.expenses.reduce((sum, item) => sum + item.amount, 0) ?? 0;

  function commit(next: TravelNotesWorkspace, message: string) {
    setWorkspace(next);
    const result = saveTravelNotesWorkspace(window.localStorage, next);
    setNotice(result.ok ? message : '保存失败，请检查本地存储权限。');
  }

  function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.destination.trim()) return;
    const id = `trip-${Date.now()}`;
    const trip: TravelTrip = {
      id,
      title: draft.title.trim(),
      destination: draft.destination.trim(),
      dateLabel: `${draft.startDate || '待定'} — ${draft.endDate || '待定'}`,
      startDate: draft.startDate,
      endDate: draft.endDate,
      coverImage:
        'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
      accent: 'blue',
      entries: [],
      expenses: [],
    };
    const next = { trips: [trip, ...workspace.trips] };
    commit(next, '新的旅行已经加入档案。');
    setSelectedId(id);
    setDraft(emptyDraft);
    setShowCreate(false);
  }

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTrip || !expense.title.trim() || !expense.amount || Number(expense.amount) <= 0)
      return;
    const item: TravelExpense = {
      id: `expense-${Date.now()}`,
      title: expense.title.trim(),
      category: expense.category,
      amount: Number(expense.amount),
      currency: 'CNY',
      date: expense.date || selectedTrip.startDate || new Date().toISOString().slice(0, 10),
    };
    const next: TravelNotesWorkspace = {
      trips: workspace.trips.map((trip) =>
        trip.id === selectedTrip.id ? { ...trip, expenses: [...trip.expenses, item] } : trip,
      ),
    };
    commit(next, '花费已加入旅程。');
    setExpense(emptyExpense);
    setShowExpense(false);
  }

  function addQuickNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTrip || !note.content.trim()) return;
    const now = new Date();
    const entry: TravelEntry = {
      id: `entry-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      title: note.title.trim() || '未命名片段',
      content: note.content.trim(),
      place: note.place.trim() || undefined,
    };
    const next: TravelNotesWorkspace = {
      trips: workspace.trips.map((trip) =>
        trip.id === selectedTrip.id ? { ...trip, entries: [...trip.entries, entry] } : trip,
      ),
    };
    commit(next, '记录已加入今天的旅程。');
    setNote({ title: '', content: '', place: '' });
    setShowQuickNote(false);
  }

  if (!selectedTrip) {
    return (
      <section className="travel-notes-workspace">
        <EmptyState
          title="还没有旅行"
          description="创建一段旅程，把沿途的地点、片段和心情收进来。"
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} aria-hidden="true" />
              新建旅行
            </Button>
          }
        />
        {showCreate ? (
          <CreateTripModal
            draft={draft}
            setDraft={setDraft}
            onSubmit={createTrip}
            onClose={() => setShowCreate(false)}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section
      className="travel-notes-workspace"
      aria-label="旅行笔记工作区"
      data-debug-target="true"
      data-debug-kind="区域"
      data-debug-label="旅行笔记工作区"
      data-debug-source="modules/tools/travel-notes/src/index.tsx:120"
    >
      <aside className="travel-notes-sidebar">
        <div className="travel-sidebar-heading">
          <div>
            <span className="travel-kicker">YOUR JOURNEYS</span>
            <h2>我的旅行</h2>
          </div>
          <Button aria-label="新建旅行" onClick={() => setShowCreate(true)}>
            <Plus size={17} aria-hidden="true" />
          </Button>
        </div>
        <div className="travel-trip-list">
          {workspace.trips.map((trip) => (
            <button
              type="button"
              key={trip.id}
              className={`travel-trip-row ${trip.id === selectedTrip.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedId(trip.id)}
            >
              <span
                className="travel-trip-row-dot"
                style={{ background: businessColor(trip.accent) }}
              />
              <span>
                <strong>{trip.title}</strong>
                <small>
                  {trip.destination} · {trip.dateLabel}
                </small>
              </span>
            </button>
          ))}
        </div>
        <div className="travel-sidebar-footer">
          <span>
            <BookOpen size={16} aria-hidden="true" />
            {workspace.trips.length} 段旅程
          </span>
          <button type="button" onClick={() => onClose?.()}>
            <ChevronLeft size={15} aria-hidden="true" />
            工具台
          </button>
        </div>
      </aside>
      <div className="travel-notes-main">
        <TripCover trip={selectedTrip} />
        <header className="travel-notes-header">
          <div>
            <span className="travel-kicker">THE FIELD NOTES</span>
            <h1>{selectedTrip.title}</h1>
            <p>
              <MapPin size={15} aria-hidden="true" />
              {selectedTrip.destination}
              <span className="travel-header-divider" />
              {selectedTrip.dateLabel}
            </p>
          </div>
          <Button onClick={() => setShowQuickNote(true)}>
            <Send size={16} aria-hidden="true" />
            快速记录
          </Button>
        </header>
        <div className="travel-view-tools">
          <HorizontalTabs
            className="travel-view-tabs"
            ariaLabel="旅行视图"
            items={[
              { id: 'timeline', label: '时间线' },
              { id: 'review', label: '回顾' },
            ]}
            value={activeView}
            onChange={(value) => {
              if (value === 'timeline' || value === 'review') {
                setActiveView(value);
              }
            }}
          />
          <label className="travel-search-field">
            <Search size={16} aria-hidden="true" />
            <span className="visually-hidden">搜索这段旅程</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索地点、标题或片段"
            />
          </label>
        </div>
        <div className="travel-stat-strip">
          <div>
            <strong>{selectedTrip.entries.length}</strong>
            <span>条记录</span>
          </div>
          <div>
            <strong>{new Set(selectedTrip.entries.map((entry) => entry.date)).size || 0}</strong>
            <span>个日子</span>
          </div>
          <div>
            <strong>{totalExpenses.toFixed(0)}</strong>
            <span>总花费 CNY</span>
          </div>
          <div className="travel-stat-note">
            <Sparkles size={16} aria-hidden="true" />
            <span>让今天留下点什么</span>
          </div>
        </div>
        {activeView === 'review' ? (
          <section className="travel-review" aria-label="旅行回顾">
            <div className="travel-review-intro">
              <span className="travel-kicker">A SMALL RECAP</span>
              <h2>这段旅程留下了什么</h2>
              <p>从第一天抵达到最后一次回头，把沿途的片段重新放在一起。</p>
            </div>
            <div className="travel-review-grid">
              <div>
                <strong>{selectedTrip.entries.length}</strong>
                <span>个瞬间</span>
              </div>
              <div>
                <strong>
                  {new Set(selectedTrip.entries.map((entry) => entry.place).filter(Boolean)).size}
                </strong>
                <span>个地点</span>
              </div>
              <div>
                <strong>{totalExpenses.toFixed(0)}</strong>
                <span>CNY 花费</span>
              </div>
            </div>
            <div className="travel-review-list">
              {selectedTrip.entries.map((entry, index) => (
                <div className="travel-review-item" key={entry.id}>
                  <span>0{index + 1}</span>
                  <div>
                    <strong>{entry.title}</strong>
                    <p>{entry.content}</p>
                  </div>
                  <time>{entry.date}</time>
                </div>
              ))}
            </div>
            <section className="travel-expense-list" aria-labelledby="travel-expense-list-title">
              <div className="travel-expense-heading">
                <div>
                  <span className="travel-kicker">THE RECEIPTS</span>
                  <h3 id="travel-expense-list-title">费用明细</h3>
                </div>
                <span className="travel-expense-total">CNY {totalExpenses.toFixed(0)}</span>
              </div>
              {selectedTrip.expenses.length ? (
                selectedTrip.expenses.map((item) => (
                  <div className="travel-expense-row" key={item.id}>
                    <span>{item.category}</span>
                    <strong>{item.title}</strong>
                    <time>{item.date}</time>
                    <b>
                      {item.currency} {item.amount.toFixed(2)}
                    </b>
                  </div>
                ))
              ) : (
                <p className="travel-expense-empty">还没有费用记录。</p>
              )}
            </section>
          </section>
        ) : null}
        <div className={`travel-timeline ${activeView === 'review' ? 'is-hidden' : ''}`}>
          {entriesByDate.length ? (
            entriesByDate.map(([date, entries], index) => (
              <section className="travel-day" key={date}>
                <header>
                  <span className="travel-day-index">0{index + 1}</span>
                  <div>
                    <h2>{formatDay(date)}</h2>
                    <p>{date}</p>
                  </div>
                  <span className="travel-day-rule" />
                </header>
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </section>
            ))
          ) : (
            <EmptyState
              title="这一段旅程还没有记录"
              description="从一句话开始，记下抵达时看到的第一个瞬间。"
              action={
                <Button onClick={() => setShowQuickNote(true)}>
                  <Send size={16} aria-hidden="true" />
                  写下第一条
                </Button>
              }
            />
          )}
        </div>
        <div className="travel-bottom-actions">
          <Button variant="secondary" onClick={() => setShowQuickNote(true)}>
            <Camera size={16} aria-hidden="true" />
            添加照片记录
          </Button>
          <Button variant="secondary" onClick={() => setShowExpense(true)}>
            <Receipt size={16} aria-hidden="true" />
            记录花费
          </Button>
          <Button variant="secondary" onClick={() => setActiveView('review')}>
            <CalendarDays size={16} aria-hidden="true" />
            查看回顾
          </Button>
        </div>
      </div>
      {showCreate ? (
        <CreateTripModal
          draft={draft}
          setDraft={setDraft}
          onSubmit={createTrip}
          onClose={() => setShowCreate(false)}
        />
      ) : null}
      {showQuickNote ? (
        <Modal labelledBy="travel-note-dialog-title" open onClose={() => setShowQuickNote(false)}>
          <form className="travel-dialog" onSubmit={addQuickNote}>
            <div className="travel-dialog-heading">
              <span className="travel-kicker">ADD A MOMENT</span>
              <h2 id="travel-note-dialog-title">记下此刻</h2>
            </div>
            <TextField
              label="标题"
              placeholder="例如：在雨里抵达古城"
              value={note.title}
              onChange={(event) => setNote({ ...note, title: event.target.value })}
            />
            <TextField
              label="地点"
              placeholder="例如：才村码头"
              value={note.place}
              onChange={(event) => setNote({ ...note, place: event.target.value })}
            />
            <TextAreaField
              label="发生了什么"
              placeholder="写下今天最想留下的一句话……"
              rows={5}
              value={note.content}
              required
              onChange={(event) => setNote({ ...note, content: event.target.value })}
            />
            <div className="travel-dialog-actions">
              <Button variant="secondary" type="button" onClick={() => setShowQuickNote(false)}>
                取消
              </Button>
              <Button type="submit">
                <Send size={16} aria-hidden="true" />
                保存记录
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
      {showExpense ? (
        <Modal labelledBy="travel-expense-dialog-title" open onClose={() => setShowExpense(false)}>
          <form className="travel-dialog" onSubmit={addExpense}>
            <div className="travel-dialog-heading">
              <span className="travel-kicker">KEEP THE RECEIPTS</span>
              <h2 id="travel-expense-dialog-title">记一笔花费</h2>
            </div>
            <TextField
              label="项目"
              placeholder="例如：湖边午餐"
              required
              value={expense.title}
              onChange={(event) => setExpense({ ...expense, title: event.target.value })}
            />
            <div className="travel-date-grid">
              <TextField
                label="金额（CNY）"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={expense.amount}
                onChange={(event) => setExpense({ ...expense, amount: event.target.value })}
              />
              <TextField
                label="日期"
                type="date"
                value={expense.date}
                onChange={(event) => setExpense({ ...expense, date: event.target.value })}
              />
            </div>
            <SelectField
              label="分类"
              options={expenseCategories}
              value={expense.category}
              onChange={(event) =>
                setExpense({ ...expense, category: event.target.value as ExpenseDraft['category'] })
              }
            />
            <div className="travel-dialog-actions">
              <Button variant="secondary" type="button" onClick={() => setShowExpense(false)}>
                取消
              </Button>
              <Button type="submit">
                <Receipt size={16} aria-hidden="true" />
                保存花费
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
      {notice ? (
        <FloatingNotice title="旅行笔记" onDismiss={() => setNotice(undefined)}>
          {notice}
        </FloatingNotice>
      ) : null}
    </section>
  );
}

function CreateTripModal({
  draft,
  setDraft,
  onSubmit,
  onClose,
}: Readonly<{
  draft: NewTripDraft;
  setDraft: (draft: NewTripDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}>) {
  return (
    <Modal labelledBy="travel-create-dialog-title" open onClose={onClose}>
      <form className="travel-dialog" onSubmit={onSubmit}>
        <div className="travel-dialog-heading">
          <span className="travel-kicker">A NEW JOURNEY</span>
          <h2 id="travel-create-dialog-title">开始一段旅行</h2>
          <p>先写下目的地，其他内容可以在路上慢慢补齐。</p>
        </div>
        <TextField
          label="旅行名称"
          placeholder="例如：大理，慢下来"
          required
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
        <TextField
          label="目的地"
          placeholder="例如：云南 · 大理"
          required
          value={draft.destination}
          onChange={(event) => setDraft({ ...draft, destination: event.target.value })}
        />
        <div className="travel-date-grid">
          <TextField
            label="出发日期"
            type="date"
            value={draft.startDate}
            onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
          />
          <TextField
            label="结束日期"
            type="date"
            value={draft.endDate}
            onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
          />
        </div>
        <div className="travel-dialog-actions">
          <Button variant="secondary" type="button" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">
            <Plus size={16} aria-hidden="true" />
            创建旅行
          </Button>
        </div>
      </form>
    </Modal>
  );
}
