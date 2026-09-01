export type StorageWriteFailureCode = 'quota-exceeded' | 'write-failed';

export type StorageWriteResult =
  Readonly<{ ok: true }> | Readonly<{ ok: false; code: StorageWriteFailureCode; message: string }>;

/** 统一处理 WebView 存储配额和不可用存储异常，避免业务工具被同步异常打断。 */
export function writeStorage(
  storage: Pick<Storage, 'setItem'>,
  key: string,
  value: string,
): StorageWriteResult {
  try {
    storage.setItem(key, value);
    return { ok: true };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : undefined;
    const isQuotaError =
      errorName === 'QuotaExceededError' || errorName === 'NS_ERROR_DOM_QUOTA_REACHED';
    return {
      ok: false,
      code: isQuotaError ? 'quota-exceeded' : 'write-failed',
      message: isQuotaError
        ? '本地存储空间不足，请先导出或清理旧数据。'
        : '本地数据写入失败，请稍后重试。',
    };
  }
}
