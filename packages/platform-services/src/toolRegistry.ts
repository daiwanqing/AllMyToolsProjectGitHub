import {
  canTransitionToolLifecycle,
  isPlatformVersionCompatible,
  validateToolManifest,
  type Capability,
  type ToolLifecycleState,
  type ToolManifest,
} from '@allmytools/platform-contracts';

export type CapabilityGrant = (capability: Capability, manifest: ToolManifest) => boolean;

export type RegisteredTool<TModule> = Readonly<{
  manifest: ToolManifest;
  load: () => Promise<TModule>;
}>;

export type ToolActivationFailure = Readonly<{
  code: 'missing-capability' | 'unsupported-version' | 'load-failed' | 'unknown-tool';
  message: string;
}>;

export type ToolSession<TModule> = Readonly<{
  id: string;
  lifecycle: ToolLifecycleState;
  module?: TModule;
}>;

export type ToolActivationResult<TModule> =
  | Readonly<{ ok: true; session: ToolSession<TModule> }>
  | Readonly<{ ok: false; failure: ToolActivationFailure; session?: ToolSession<TModule> }>;

export class ToolRegistry<TModule> {
  private readonly registrations = new Map<string, RegisteredTool<TModule>>();

  public constructor(
    private readonly platformVersion: string,
    private readonly isCapabilityGranted: CapabilityGrant = () => false,
  ) {}

  public register(tool: RegisteredTool<TModule>) {
    const validation = validateToolManifest(tool.manifest);

    if (!validation.ok) {
      throw new Error(validation.issues.map((issue) => issue.message).join(' '));
    }

    if (this.registrations.has(tool.manifest.id)) {
      throw new Error(`工具“${tool.manifest.id}”已注册。`);
    }

    this.registrations.set(tool.manifest.id, tool);
  }

  public list() {
    return [...this.registrations.values()].map(({ manifest }) => manifest);
  }

  public async activate(id: string): Promise<ToolActivationResult<TModule>> {
    const registration = this.registrations.get(id);

    if (!registration) {
      return {
        ok: false,
        failure: { code: 'unknown-tool', message: '未找到请求启动的工具。' },
      };
    }

    let session: ToolSession<TModule> = { id, lifecycle: 'registered' };

    if (
      !isPlatformVersionCompatible(registration.manifest.minPlatformVersion, this.platformVersion)
    ) {
      return {
        ok: false,
        session,
        failure: { code: 'unsupported-version', message: '当前平台版本不支持此工具。' },
      };
    }

    const missingCapability = registration.manifest.capabilities.find(
      (capability) => !this.isCapabilityGranted(capability, registration.manifest),
    );
    if (missingCapability) {
      return {
        ok: false,
        session,
        failure: { code: 'missing-capability', message: `工具缺少“${missingCapability}”授权。` },
      };
    }

    session = this.transition(session, 'capability-checked');

    try {
      const module = await registration.load();
      session = this.transition(session, 'loaded');
      return { ok: true, session: this.transition({ ...session, module }, 'active') };
    } catch {
      return {
        ok: false,
        session,
        failure: { code: 'load-failed', message: '工具启动失败，平台仍可继续使用。' },
      };
    }
  }

  public dispose(session: ToolSession<TModule>) {
    return session.lifecycle === 'disposed' ? session : this.transition(session, 'disposed');
  }

  private transition(
    session: ToolSession<TModule>,
    target: ToolLifecycleState,
  ): ToolSession<TModule> {
    if (!canTransitionToolLifecycle({ from: session.lifecycle, to: target })) {
      throw new Error(`工具“${session.id}”不能从“${session.lifecycle}”转换到“${target}”。`);
    }

    return { ...session, lifecycle: target };
  }
}
