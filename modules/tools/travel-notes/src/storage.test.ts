import { describe, expect, it } from 'vitest';
import {
  demoWorkspace,
  loadTravelNotesWorkspace,
  saveTravelNotesWorkspace,
  travelNotesStorageKey,
} from './storage';

function createStorage(initial?: string): Storage {
  let value = initial;
  return {
    getItem: () => value ?? null,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  } as unknown as Storage;
}

describe('travel notes storage', () => {
  it('loads the demo workspace when nothing has been saved', () => {
    expect(loadTravelNotesWorkspace(createStorage()).trips[0]?.id).toBe('dali-slow-days');
  });

  it('persists a valid workspace in its own namespace', () => {
    const storage = createStorage();
    expect(saveTravelNotesWorkspace(storage, { trips: [] }).ok).toBe(true);
    expect(storage.getItem(travelNotesStorageKey)).toContain('trips');
    expect(loadTravelNotesWorkspace(storage)).toEqual({ trips: [] });
  });

  it('ignores malformed trips while retaining the valid ones', () => {
    const storage = createStorage(
      JSON.stringify({ trips: [...demoWorkspace.trips, { id: 'bad' }] }),
    );
    expect(loadTravelNotesWorkspace(storage).trips).toHaveLength(1);
  });

  it('migrates trips without expenses to an empty expense list', () => {
    const trip = { ...demoWorkspace.trips[0] };
    const legacyTrip = { ...trip } as Partial<typeof trip>;
    delete legacyTrip.expenses;
    const storage = createStorage(JSON.stringify({ trips: [legacyTrip] }));
    expect(loadTravelNotesWorkspace(storage).trips[0]?.expenses).toEqual([]);
  });
});
