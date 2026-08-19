import { describe, expect, it } from 'vitest';
import { loadTextDraft, saveTextDraft, textWorkbenchDraftStorageKey } from './storage';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

describe('text workbench storage', () => {
  it('owns a namespaced draft key and restores saved text', () => {
    const storage = createStorage();

    expect(loadTextDraft(storage)).toBe('');
    saveTextDraft(storage, '清理后的文本');

    expect(storage.values.get(textWorkbenchDraftStorageKey)).toBe('清理后的文本');
    expect(storage.values.has('entertainment.session-picker.selection')).toBe(false);
    expect(loadTextDraft(storage)).toBe('清理后的文本');
  });
});
