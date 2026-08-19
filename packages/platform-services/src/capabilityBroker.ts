import type { Capability, ToolManifest } from '@allmytools/platform-contracts';

export type CapabilityConsent = 'granted' | 'denied' | 'cancelled';

export type CapabilityAvailability = Readonly<{
  available: boolean;
  message?: string;
}>;

export type CapabilityConsentStore = Readonly<{
  get: (toolId: string, capability: Capability) => CapabilityConsent | undefined;
  set: (
    toolId: string,
    capability: Capability,
    consent: Exclude<CapabilityConsent, 'cancelled'>,
  ) => void;
}>;

export type CapabilityConsentRequester = (
  manifest: ToolManifest,
  capability: Capability,
) => Promise<CapabilityConsent>;

export type CapabilityAvailabilityChecker = (
  capability: Capability,
) => CapabilityAvailability | Promise<CapabilityAvailability>;

export type CapabilityAccessFailure = Readonly<{
  code:
    | 'undeclared-capability'
    | 'permission-denied'
    | 'request-cancelled'
    | 'system-unavailable'
    | 'operation-failed';
  message: string;
}>;

export type CapabilityAccessResult<T> =
  Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; failure: CapabilityAccessFailure }>;

/**
 * 受限能力的唯一执行入口。工具只能经由此处完成声明、同意与可用性检查后再运行操作。
 */
export class CapabilityBroker {
  public constructor(
    private readonly consentStore: CapabilityConsentStore,
    private readonly requestConsent: CapabilityConsentRequester,
    private readonly checkAvailability: CapabilityAvailabilityChecker,
  ) {}

  public isGranted(manifest: ToolManifest, capability: Capability): boolean {
    return (
      manifest.capabilities.includes(capability) &&
      this.consentStore.get(manifest.id, capability) === 'granted'
    );
  }

  public revoke(manifest: ToolManifest, capability: Capability): void {
    this.consentStore.set(manifest.id, capability, 'denied');
  }

  public async execute<T>(
    manifest: ToolManifest,
    capability: Capability,
    operation: () => Promise<T> | T,
  ): Promise<CapabilityAccessResult<T>> {
    if (!manifest.capabilities.includes(capability)) {
      return this.failure('undeclared-capability', `工具未声明“${capability}”能力。`);
    }

    const availability = await this.checkAvailability(capability);
    if (!availability.available) {
      return this.failure(
        'system-unavailable',
        availability.message ?? `当前系统无法提供“${capability}”能力。`,
      );
    }

    const consent = await this.resolveConsent(manifest, capability);
    if (consent === 'denied') {
      return this.failure('permission-denied', `用户未授予“${capability}”能力。`);
    }
    if (consent === 'cancelled') {
      return this.failure('request-cancelled', `用户取消了“${capability}”授权请求。`);
    }

    try {
      return { ok: true, value: await operation() };
    } catch {
      return this.failure('operation-failed', `“${capability}”操作未能完成。`);
    }
  }

  private async resolveConsent(
    manifest: ToolManifest,
    capability: Capability,
  ): Promise<CapabilityConsent> {
    const savedConsent = this.consentStore.get(manifest.id, capability);
    if (savedConsent) {
      return savedConsent;
    }

    const consent = await this.requestConsent(manifest, capability);
    if (consent !== 'cancelled') {
      this.consentStore.set(manifest.id, capability, consent);
    }
    return consent;
  }

  private failure<T>(
    code: CapabilityAccessFailure['code'],
    message: string,
  ): CapabilityAccessResult<T> {
    return { ok: false, failure: { code, message } };
  }
}
