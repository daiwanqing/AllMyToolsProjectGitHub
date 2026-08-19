import { describe, expect, it } from 'vitest';
import { loadReviewDraft, reviewDraftStorageKey, saveReviewDraft } from './storage';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

describe('review draft storage', () => {
  it('owns a namespaced key and persists only after an explicit save', () => {
    const storage = createStorage();

    expect(loadReviewDraft(storage)).toBe('');
    saveReviewDraft(storage, '下一次复习重点');

    expect(storage.values.get(reviewDraftStorageKey)).toBe('下一次复习重点');
    expect(storage.values.has('tools.text-workbench.draft')).toBe(false);
    expect(loadReviewDraft(storage)).toBe('下一次复习重点');
  });
});
