import { describe, expect, it } from 'vitest';
import { canTransitionToolLifecycle } from './lifecycle';

describe('工具生命周期契约', () => {
  it('接受正常推进、恢复和资源释放', () => {
    expect(canTransitionToolLifecycle({ from: 'registered', to: 'capability-checked' })).toBe(true);
    expect(canTransitionToolLifecycle({ from: 'suspended', to: 'active' })).toBe(true);
    expect(canTransitionToolLifecycle({ from: 'loaded', to: 'disposed' })).toBe(true);
  });

  it('拒绝跳过检查、从已释放状态恢复和自循环', () => {
    expect(canTransitionToolLifecycle({ from: 'registered', to: 'loaded' })).toBe(false);
    expect(canTransitionToolLifecycle({ from: 'disposed', to: 'active' })).toBe(false);
    expect(canTransitionToolLifecycle({ from: 'active', to: 'active' })).toBe(false);
  });
});
