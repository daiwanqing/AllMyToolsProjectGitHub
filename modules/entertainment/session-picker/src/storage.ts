export const selectedSessionStorageKey = 'entertainment.session-picker.selection';

export type SessionPickerStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export function loadSelectedSession(storage: SessionPickerStorage): string {
  return storage.getItem(selectedSessionStorageKey) ?? '';
}

export function saveSelectedSession(
  storage: SessionPickerStorage,
  value: string,
): StorageWriteResult {
  return writeStorage(storage, selectedSessionStorageKey, value);
}
import { writeStorage, type StorageWriteResult } from '@allmytools/platform-services';
