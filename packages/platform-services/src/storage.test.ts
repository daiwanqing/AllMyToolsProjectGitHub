import { describe, expect, it } from 'vitest';
import { writeStorage } from './storage';

describe('platform storage', () => {
  it('returns success for a completed write', () => {
    const values = new Map<string, string>();
    expect(
      writeStorage({ setItem: (key, value) => values.set(key, value) }, 'key', 'value'),
    ).toEqual({
      ok: true,
    });
    expect(values.get('key')).toBe('value');
  });

  it('returns a recoverable quota failure without throwing', () => {
    const result = writeStorage(
      {
        setItem: () => {
          throw new Error('quota');
        },
      },
      'key',
      'value',
    );
    expect(result).toMatchObject({ ok: false, code: 'write-failed' });
  });

  it('classifies browser quota errors', () => {
    const error = new Error('full');
    error.name = 'QuotaExceededError';
    expect(
      writeStorage(
        {
          setItem: () => {
            throw error;
          },
        },
        'key',
        'value',
      ),
    ).toMatchObject({
      ok: false,
      code: 'quota-exceeded',
    });
  });
});
