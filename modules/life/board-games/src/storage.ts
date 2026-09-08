import { writeStorage, type StorageWriteResult } from '@allmytools/platform-services';

export const boardGamesStorageKey = 'life.board-games.collection';

export type BoardGamesStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export function loadBoardGames(storage: Pick<Storage, 'getItem'>): string[] {
  const stored = storage.getItem(boardGamesStorageKey);
  if (!stored) return [];

  try {
    const value: unknown = JSON.parse(stored);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );
  } catch {
    return [];
  }
}

export function saveBoardGames(
  storage: BoardGamesStorage,
  games: readonly string[],
): StorageWriteResult {
  return writeStorage(storage, boardGamesStorageKey, JSON.stringify(games));
}
