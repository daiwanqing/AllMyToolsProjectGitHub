import { describe, expect, it } from 'vitest';
import { isPlatformVersionCompatible, isSemanticVersion } from './version';

describe('版本契约', () => {
  it('仅接受稳定语义化版本', () => {
    expect(isSemanticVersion('1.2.3')).toBe(true);
    expect(isSemanticVersion('01.2.3')).toBe(false);
    expect(isSemanticVersion('1.2.3-beta.1')).toBe(false);
  });

  it('比较平台版本和最低平台版本', () => {
    expect(isPlatformVersionCompatible('1.2.3', '1.2.3')).toBe(true);
    expect(isPlatformVersionCompatible('1.3.0', '1.2.9')).toBe(true);
    expect(isPlatformVersionCompatible('2.0.0', '1.9.9')).toBe(true);
    expect(isPlatformVersionCompatible('1.2.2', '1.2.3')).toBe(false);
    expect(isPlatformVersionCompatible('next', '1.2.3')).toBe(false);
  });
});
