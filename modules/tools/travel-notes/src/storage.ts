import { writeStorage, type StorageWriteResult } from '@allmytools/platform-services';

export const travelNotesStorageKey = 'tools.travel-notes.workspace';

export type TravelEntry = Readonly<{
  id: string;
  date: string;
  time: string;
  title: string;
  content: string;
  place?: string;
  mood?: string;
  image?: string;
}>;

export type TravelTrip = Readonly<{
  id: string;
  title: string;
  destination: string;
  dateLabel: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  accent: string;
  entries: readonly TravelEntry[];
  expenses: readonly TravelExpense[];
}>;

export type TravelExpense = Readonly<{
  id: string;
  title: string;
  category: '交通' | '住宿' | '餐饮' | '门票' | '其他';
  amount: number;
  currency: string;
  date: string;
}>;

export type TravelNotesWorkspace = Readonly<{ trips: readonly TravelTrip[] }>;

export const demoWorkspace: TravelNotesWorkspace = {
  trips: [
    {
      id: 'dali-slow-days',
      title: '大理，慢下来',
      destination: '云南 · 大理',
      dateLabel: '06.12 — 06.18',
      startDate: '2025-06-12',
      endDate: '2025-06-18',
      coverImage:
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      accent: '#E56B57',
      expenses: [
        {
          id: 'expense-1',
          title: '机场到古城打车',
          category: '交通',
          amount: 86,
          currency: 'CNY',
          date: '2025-06-12',
        },
        {
          id: 'expense-2',
          title: '湖边午餐',
          category: '餐饮',
          amount: 128,
          currency: 'CNY',
          date: '2025-06-13',
        },
      ],
      entries: [
        {
          id: 'dali-1',
          date: '2025-06-12',
          time: '18:40',
          title: '抵达古城',
          content: '夜雨刚停，石板路亮得像一张旧地图。先去找一碗热腾腾的饵丝。',
          place: '大理古城',
          mood: '松弛',
        },
        {
          id: 'dali-2',
          date: '2025-06-13',
          time: '11:20',
          title: '洱海边走了很久',
          content: '风从湖面过来，沿着环海西路慢慢走，不需要给今天安排一个终点。',
          place: '才村码头',
          mood: '自由',
          image:
            'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=80',
        },
        {
          id: 'dali-3',
          date: '2025-06-15',
          time: '07:10',
          title: '苍山的云海',
          content: '缆车上升的时候，云从山脊漫过来。今天的颜色是苔藓绿和很轻的灰。',
          place: '苍山',
          mood: '惊喜',
        },
      ],
    },
  ],
};

export type TravelNotesStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

function isEntry(value: unknown): value is TravelEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return ['id', 'date', 'time', 'title', 'content'].every((key) => typeof entry[key] === 'string');
}

function isExpense(value: unknown): value is TravelExpense {
  if (!value || typeof value !== 'object') return false;
  const expense = value as Record<string, unknown>;
  return (
    typeof expense.id === 'string' &&
    typeof expense.title === 'string' &&
    ['交通', '住宿', '餐饮', '门票', '其他'].includes(expense.category as string) &&
    typeof expense.amount === 'number' &&
    Number.isFinite(expense.amount) &&
    typeof expense.currency === 'string' &&
    typeof expense.date === 'string'
  );
}

function isTrip(value: unknown): value is TravelTrip {
  if (!value || typeof value !== 'object') return false;
  const trip = value as Record<string, unknown>;
  return (
    [
      'id',
      'title',
      'destination',
      'dateLabel',
      'startDate',
      'endDate',
      'coverImage',
      'accent',
    ].every((key) => typeof trip[key] === 'string') &&
    Array.isArray(trip.entries) &&
    trip.entries.every(isEntry) &&
    (trip.expenses === undefined ||
      (Array.isArray(trip.expenses) && trip.expenses.every(isExpense)))
  );
}

export function loadTravelNotesWorkspace(storage: TravelNotesStorage): TravelNotesWorkspace {
  const stored = storage.getItem(travelNotesStorageKey);
  if (!stored) return demoWorkspace;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as Record<string, unknown>).trips)
    ) {
      const trips = (parsed as { trips: unknown[] }).trips.filter(isTrip).map((trip) => ({
        ...trip,
        expenses: trip.expenses ?? [],
      }));
      return { trips };
    }
  } catch {
    return demoWorkspace;
  }
  return demoWorkspace;
}

export function saveTravelNotesWorkspace(
  storage: TravelNotesStorage,
  workspace: TravelNotesWorkspace,
): StorageWriteResult {
  return writeStorage(storage, travelNotesStorageKey, JSON.stringify(workspace));
}
