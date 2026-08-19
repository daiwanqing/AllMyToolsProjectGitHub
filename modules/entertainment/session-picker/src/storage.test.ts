import { describe, expect, it } from 'vitest';
import { loadSelectedSession, saveSelectedSession, selectedSessionStorageKey } from './storage';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

describe('session picker storage', () => {
  it('owns a namespaced key and persists only after an explicit save', () => {
    const storage = createStorage();

    expect(loadSelectedSession(storage)).toBe('');
    saveSelectedSession(storage, '玩一局游戏');

    expect(storage.values.get(selectedSessionStorageKey)).toBe('玩一局游戏');
    expect(storage.values.has('learning.note-review.draft')).toBe(false);
    expect(loadSelectedSession(storage)).toBe('玩一局游戏');
  });
});
