import { describe, expect, it } from 'vitest';
import {
  boardGamesStorageKey,
  loadBoardGameCollection,
  loadBoardGames,
  saveBoardGameCollection,
  saveBoardGames,
} from './storage';

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

  it('migrates legacy favorites and persists the editable collection', () => {
    const legacy = createStorage('["卡坦岛"]');
    expect(loadBoardGameCollection(legacy)).toEqual({ favorites: ['卡坦岛'] });

    const storage = createStorage();
    const game = {
      id: 'custom-1',
      imageData: 'data:image/png;base64,Y292ZXI=',
      name: '新桌游',
      tagline: '轻松开始一局',
      description: '适合朋友一起玩的新桌游。',
      category: '聚会' as const,
      players: '3–6 人',
      duration: '30 分钟',
      difficulty: '轻松入门' as const,
    };
    expect(saveBoardGameCollection(storage, { games: [game], favorites: ['新桌游'] })).toEqual({
      ok: true,
    });
    expect(loadBoardGameCollection(storage)).toEqual({ games: [game], favorites: ['新桌游'] });
  });
});
