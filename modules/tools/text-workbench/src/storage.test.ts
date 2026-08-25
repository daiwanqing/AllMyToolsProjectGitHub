import { describe, expect, it } from 'vitest';
import {
  loadTextWorkbenchPresets,
  loadTextWorkbenchWorkspace,
  saveTextWorkbenchPresets,
  saveTextWorkbenchWorkspace,
  textWorkbenchDraftStorageKey,
  textWorkbenchPresetStorageKey,
} from './storage';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

describe('text workbench storage', () => {
  it('owns namespaced workspace and preset keys', () => {
    const storage = createStorage();

    saveTextWorkbenchWorkspace(storage, {
      source: '原始文本',
      result: '处理后的文本',
      history: [{ id: 'entry-1', input: '原始文本', operation: 'trim', output: '处理后的文本' }],
    });
    saveTextWorkbenchPresets(storage, [
      { id: 'preset-1', name: '清理', operation: 'trim', find: '', replaceWith: '' },
    ]);

    expect(loadTextWorkbenchWorkspace(storage)).toEqual({
      source: '原始文本',
      result: '处理后的文本',
      history: [{ id: 'entry-1', input: '原始文本', operation: 'trim', output: '处理后的文本' }],
    });
    expect(loadTextWorkbenchPresets(storage)).toEqual([
      { id: 'preset-1', name: '清理', operation: 'trim', find: '', replaceWith: '' },
    ]);
    expect(storage.values.has(textWorkbenchDraftStorageKey)).toBe(true);
    expect(storage.values.has(textWorkbenchPresetStorageKey)).toBe(true);
    expect(storage.values.has('entertainment.session-picker.selection')).toBe(false);
  });

  it('continues to restore a legacy plain-text draft', () => {
    const storage = createStorage();
    storage.setItem(textWorkbenchDraftStorageKey, '旧版草稿');

    expect(loadTextWorkbenchWorkspace(storage)).toEqual({
      source: '旧版草稿',
      result: undefined,
      history: [],
    });
  });
});
