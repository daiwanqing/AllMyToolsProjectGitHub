export const reviewDraftStorageKey = 'learning.note-review.draft';

export type ReviewDraftStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export function loadReviewDraft(storage: ReviewDraftStorage): string {
  return storage.getItem(reviewDraftStorageKey) ?? '';
}

export function saveReviewDraft(storage: ReviewDraftStorage, value: string): void {
  storage.setItem(reviewDraftStorageKey, value);
}
