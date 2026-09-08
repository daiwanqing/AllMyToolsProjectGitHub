import { describe, expect, it } from 'vitest';
import { boardGamesStorageKey, loadBoardGames, saveBoardGames } from './storage';

function createStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(boardGamesStorageKey, initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

describe('桌游收藏存储', () => {
  it('uses its own namespace and persists an explicit collection', () => {
    const storage = createStorage();

    expect(loadBoardGames(storage)).toEqual([]);
    expect(saveBoardGames(storage, ['卡坦岛', '璀璨宝石'])).toEqual({ ok: true });
    expect(storage.values.get(boardGamesStorageKey)).toBe('["卡坦岛","璀璨宝石"]');
    expect(loadBoardGames(storage)).toEqual(['卡坦岛', '璀璨宝石']);
    expect(storage.values.has('entertainment.session-picker.selection')).toBe(false);
  });

  it('ignores malformed stored values', () => {
    expect(loadBoardGames(createStorage('{"items":[]}'))).toEqual([]);
    expect(loadBoardGames(createStorage('["卡坦岛", "", 3]'))).toEqual(['卡坦岛']);
  });

  it('returns a recoverable result when the browser rejects the write', () => {
    const result = saveBoardGames(
      {
        getItem: () => null,
        setItem: () => {
          throw new Error('storage unavailable');
        },
      },
      ['卡坦岛'],
    );

    expect(result).toMatchObject({ ok: false, code: 'write-failed' });
  });
});
