import { describe, expect, it, vi } from 'vitest';
import type { Capability, ToolManifest } from '@allmytools/platform-contracts';
import { CapabilityBroker, type CapabilityConsent } from './capabilityBroker';

const manifest: ToolManifest = {
  id: 'tools.capability-check',
  name: '能力检查',
  description: '测试受限能力中介。',
  version: '0.1.0',
  category: 'tools',
  subcategory: 'productivity',
  entry: './index',
  icon: 'shield-check',
  capabilities: ['filesystem'],
  minPlatformVersion: '0.1.0',
};

function createConsentStore() {
  const values = new Map<string, CapabilityConsent>();
  return {
    get: (toolId: string, capability: Capability) => values.get(`${toolId}:${capability}`),
    set: (
      toolId: string,
      capability: Capability,
      consent: Exclude<CapabilityConsent, 'cancelled'>,
    ) => values.set(`${toolId}:${capability}`, consent),
  };
}

describe('CapabilityBroker', () => {
  it('executes only after declared, available, and granted access', async () => {
    const requestConsent = vi.fn().mockResolvedValue('granted');
    const operation = vi.fn().mockResolvedValue('completed');
    const broker = new CapabilityBroker(createConsentStore(), requestConsent, () => ({
      available: true,
    }));

    await expect(broker.execute(manifest, 'filesystem', operation)).resolves.toEqual({
      ok: true,
      value: 'completed',
    });
    expect(operation).toHaveBeenCalledTimes(1);
    expect(broker.isGranted(manifest, 'filesystem')).toBe(true);

    await broker.execute(manifest, 'filesystem', operation);
    expect(requestConsent).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['undeclared-capability', 'network', 'granted', { available: true }],
    ['permission-denied', 'filesystem', 'denied', { available: true }],
    ['request-cancelled', 'filesystem', 'cancelled', { available: true }],
    ['system-unavailable', 'filesystem', 'granted', { available: false }],
  ] as const)(
    'returns %s without executing the protected operation',
    async (expectedCode, capability, consent, availability) => {
      const operation = vi.fn();
      const broker = new CapabilityBroker(
        createConsentStore(),
        async () => consent,
        () => availability,
      );

      const result = await broker.execute(manifest, capability, operation);

      expect(result).toMatchObject({ ok: false, failure: { code: expectedCode } });
      expect(operation).not.toHaveBeenCalled();
    },
  );

  it('converts protected operation exceptions into a recoverable failure', async () => {
    const broker = new CapabilityBroker(
      createConsentStore(),
      async () => 'granted',
      () => ({ available: true }),
    );

    await expect(
      broker.execute(manifest, 'filesystem', () => Promise.reject(new Error('failed'))),
    ).resolves.toMatchObject({ ok: false, failure: { code: 'operation-failed' } });
  });
});
