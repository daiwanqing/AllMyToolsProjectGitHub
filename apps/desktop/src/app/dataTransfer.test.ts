import { describe, expect, it } from 'vitest';
import {
  applyDataBackup,
  createDataBackup,
  dataBackupFormat,
  dataBackupVersion,
  parseDataBackup,
  serializeDataBackup,
} from './dataTransfer';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    key(index: number) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
    values,
  };
}

describe('tool data transfer', () => {
  it('exports only tool namespaces in stable key order', () => {
    const storage = createStorage({
      'shell.workspace-state': '{}',
      'tools.z-last': 'last',
      'learning.note-review.draft': 'note',
      'life.board-games.collection': 'games',
    });

    expect(createDataBackup(storage, '2026-09-17T00:00:00.000Z', 'https://example.test')).toEqual({
      format: dataBackupFormat,
      version: dataBackupVersion,
      exportedAt: '2026-09-17T00:00:00.000Z',
      sourceOrigin: 'https://example.test',
      entries: {
        'learning.note-review.draft': 'note',
        'life.board-games.collection': 'games',
        'tools.z-last': 'last',
      },
    });
  });

  it('serializes and parses a backup', () => {
    const backup = createDataBackup(createStorage({ 'tools.text-workbench.draft': 'text' }));
    const result = parseDataBackup(serializeDataBackup(backup));

    expect(result).toEqual({ ok: true, backup });
  });

  it('rejects malformed, unsupported, or non-tool data', () => {
    expect(parseDataBackup('{')).toEqual({ ok: false, message: '备份文件不是有效的 JSON。' });
    expect(
      parseDataBackup(
        JSON.stringify({ format: dataBackupFormat, version: 99, exportedAt: 'now', entries: {} }),
      ),
    ).toEqual({ ok: false, message: '备份文件版本不受支持，请从当前版本重新导出。' });
    expect(
      parseDataBackup(
        JSON.stringify({
          format: dataBackupFormat,
          version: dataBackupVersion,
          exportedAt: 'now',
          entries: { 'shell.workspace-state': '{}' },
        }),
      ),
    ).toEqual({ ok: false, message: '备份文件包含无法识别的工具数据。' });
  });

  it('overwrites imported keys while preserving unrelated data', () => {
    const storage = createStorage({
      'tools.text-workbench.draft': 'old',
      'life.board-games.collection': 'keep',
    });
    const backup = createDataBackup(createStorage({ 'tools.text-workbench.draft': 'new' }));

    expect(applyDataBackup(storage, backup)).toEqual({ ok: true, importedKeys: 1 });
    expect(storage.values).toEqual(
      new Map([
        ['tools.text-workbench.draft', 'new'],
        ['life.board-games.collection', 'keep'],
      ]),
    );
  });

  it('rolls back writes when storage rejects an imported value', () => {
    const storage = createStorage({ 'tools.first': 'old-first', 'tools.second': 'old-second' });
    const originalSetItem = storage.setItem;
    storage.setItem = (key: string, value: string) => {
      if (key === 'tools.second' && value === 'new-second') {
        const error = new Error('full');
        error.name = 'QuotaExceededError';
        throw error;
      }
      originalSetItem(key, value);
    };
    const backup = createDataBackup(
      createStorage({ 'tools.first': 'new-first', 'tools.second': 'new-second' }),
    );

    expect(applyDataBackup(storage, backup)).toEqual({
      ok: false,
      message: '本地存储空间不足，请先导出或清理旧数据。',
    });
    expect(storage.values).toEqual(
      new Map([
        ['tools.first', 'old-first'],
        ['tools.second', 'old-second'],
      ]),
    );
  });
});
