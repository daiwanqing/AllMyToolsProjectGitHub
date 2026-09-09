import { writeStorage, type StorageWriteResult } from '@allmytools/platform-services';

export const boardGamesStorageKey = 'life.board-games.collection';

export type BoardGamesStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export type BoardGameCategory = '策略' | '聚会' | '双人';

export type BoardGameDifficulty = '轻松入门' | '需要规划' | '深度策略';

export type StoredBoardGame = Readonly<{
  category: BoardGameCategory;
  description: string;
  difficulty: BoardGameDifficulty;
  duration: string;
  id: string;
  imageData?: string;
  name: string;
  players: string;
  tagline: string;
}>;

export type BoardGameCollection = Readonly<{
  favorites: string[];
  games?: StoredBoardGame[];
}>;

function validFavorites(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function validGames(value: unknown): StoredBoardGame[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is StoredBoardGame => {
    if (!item || typeof item !== 'object') return false;
    const game = item as Partial<StoredBoardGame>;
    return (
      typeof game.id === 'string' &&
      (game.imageData === undefined ||
        (typeof game.imageData === 'string' && game.imageData.startsWith('data:image/'))) &&
      typeof game.name === 'string' &&
      typeof game.tagline === 'string' &&
      typeof game.description === 'string' &&
      (game.category === '策略' || game.category === '聚会' || game.category === '双人') &&
      typeof game.players === 'string' &&
      typeof game.duration === 'string' &&
      (game.difficulty === '轻松入门' ||
        game.difficulty === '需要规划' ||
        game.difficulty === '深度策略')
    );
  });
}

export function loadBoardGames(storage: Pick<Storage, 'getItem'>): string[] {
  return loadBoardGameCollection(storage).favorites;
}

export function loadBoardGameCollection(storage: Pick<Storage, 'getItem'>): BoardGameCollection {
  const stored = storage.getItem(boardGamesStorageKey);
  if (!stored) return { favorites: [] };

  try {
    const value: unknown = JSON.parse(stored);
    if (Array.isArray(value)) return { favorites: validFavorites(value) };
    if (!value || typeof value !== 'object') return { favorites: [] };

    const collection = value as { favorites?: unknown; games?: unknown };
    return {
      favorites: validFavorites(collection.favorites),
      games: Array.isArray(collection.games) ? validGames(collection.games) : undefined,
    };
  } catch {
    return { favorites: [] };
  }
}

export function saveBoardGames(
  storage: BoardGamesStorage,
  games: readonly string[],
): StorageWriteResult {
  return writeStorage(storage, boardGamesStorageKey, JSON.stringify(games));
}

export function saveBoardGameCollection(
  storage: BoardGamesStorage,
  collection: BoardGameCollection,
): StorageWriteResult {
  return writeStorage(storage, boardGamesStorageKey, JSON.stringify(collection));
}
