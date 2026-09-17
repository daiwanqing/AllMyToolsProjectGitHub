import { writeStorage } from '@allmytools/platform-services';

export const dataBackupFormat = 'allmytools-tool-data';
export const dataBackupVersion = 1;

const toolStoragePrefixes = ['learning.', 'entertainment.', 'tools.', 'life.'] as const;

export type DataBackup = Readonly<{
  format: typeof dataBackupFormat;
  version: typeof dataBackupVersion;
  exportedAt: string;
  sourceOrigin?: string;
  entries: Readonly<Record<string, string>>;
}>;

export type DataBackupParseResult =
  Readonly<{ ok: true; backup: DataBackup }> | Readonly<{ ok: false; message: string }>;

export type DataBackupApplyResult =
  Readonly<{ ok: true; importedKeys: number }> | Readonly<{ ok: false; message: string }>;

type BackupReadStorage = Pick<Storage, 'length' | 'key' | 'getItem'>;
type BackupWriteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function isToolStorageKey(key: string): boolean {
  return toolStoragePrefixes.some((prefix) => key.startsWith(prefix));
}

export function createDataBackup(
  storage: BackupReadStorage,
  exportedAt = new Date().toISOString(),
  sourceOrigin?: string,
): DataBackup {
  const entries: Record<string, string> = {};
  const keys: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && isToolStorageKey(key)) keys.push(key);
  }

  for (const key of keys.sort()) {
    const value = storage.getItem(key);
    if (value !== null) entries[key] = value;
  }

  return {
    format: dataBackupFormat,
    version: dataBackupVersion,
    exportedAt,
    ...(sourceOrigin ? { sourceOrigin } : {}),
    entries,
  };
}

export function serializeDataBackup(backup: DataBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

export function parseDataBackup(raw: string): DataBackupParseResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, message: '备份文件不是有效的 JSON。' };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, message: '备份文件格式不正确。' };
  }

  const record = value as Record<string, unknown>;
  if (record.format !== dataBackupFormat || record.version !== dataBackupVersion) {
    return { ok: false, message: '备份文件版本不受支持，请从当前版本重新导出。' };
  }
  if (typeof record.exportedAt !== 'string' || !record.exportedAt) {
    return { ok: false, message: '备份文件缺少导出时间。' };
  }
  if (
    record.sourceOrigin !== undefined &&
    (typeof record.sourceOrigin !== 'string' || !record.sourceOrigin)
  ) {
    return { ok: false, message: '备份文件来源信息不正确。' };
  }
  if (!record.entries || typeof record.entries !== 'object' || Array.isArray(record.entries)) {
    return { ok: false, message: '备份文件缺少工具数据。' };
  }

  const entries: Record<string, string> = {};
  for (const [key, valueEntry] of Object.entries(record.entries)) {
    if (!isToolStorageKey(key) || typeof valueEntry !== 'string') {
      return { ok: false, message: '备份文件包含无法识别的工具数据。' };
    }
    entries[key] = valueEntry;
  }

  return {
    ok: true,
    backup: {
      format: dataBackupFormat,
      version: dataBackupVersion,
      exportedAt: record.exportedAt,
      ...(typeof record.sourceOrigin === 'string' ? { sourceOrigin: record.sourceOrigin } : {}),
      entries,
    },
  };
}

export function applyDataBackup(
  storage: BackupWriteStorage,
  backup: DataBackup,
): DataBackupApplyResult {
  const entries = Object.entries(backup.entries).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const previous = new Map<string, string | null>();

  for (const [key] of entries) previous.set(key, storage.getItem(key));

  for (const [key, value] of entries) {
    const result = writeStorage(storage, key, value);
    if (!result.ok) {
      for (const [previousKey, previousValue] of previous) {
        try {
          if (previousValue === null) storage.removeItem(previousKey);
          else storage.setItem(previousKey, previousValue);
        } catch {
          // Best-effort rollback; the original storage error is more actionable.
        }
      }
      return { ok: false, message: result.message };
    }
  }

  return { ok: true, importedKeys: entries.length };
}
