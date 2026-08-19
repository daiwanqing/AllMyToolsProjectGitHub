export const textWorkbenchDraftStorageKey = 'tools.text-workbench.draft';

export type TextWorkbenchStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export function loadTextDraft(storage: TextWorkbenchStorage): string {
  return storage.getItem(textWorkbenchDraftStorageKey) ?? '';
}

export function saveTextDraft(storage: TextWorkbenchStorage, value: string): void {
  storage.setItem(textWorkbenchDraftStorageKey, value);
}
