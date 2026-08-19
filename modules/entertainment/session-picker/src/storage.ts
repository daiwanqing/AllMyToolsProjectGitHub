export const selectedSessionStorageKey = 'entertainment.session-picker.selection';

export type SessionPickerStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export function loadSelectedSession(storage: SessionPickerStorage): string {
  return storage.getItem(selectedSessionStorageKey) ?? '';
}

export function saveSelectedSession(storage: SessionPickerStorage, value: string): void {
  storage.setItem(selectedSessionStorageKey, value);
}
