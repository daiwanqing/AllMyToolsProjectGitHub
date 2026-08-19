import { describe, expect, it } from 'vitest';
import { ToolRegistry } from './toolRegistry';

const manifest = {
  id: 'tools.sample',
  name: '示例工具',
  version: '0.1.0',
  category: 'tools' as const,
  entry: './index',
  icon: 'wrench',
  capabilities: [],
  minPlatformVersion: '0.1.0',
};

describe('ToolRegistry', () => {
  it('activates and disposes an independently loaded tool', async () => {
    const registry = new ToolRegistry<string>('0.1.0');
    registry.register({ manifest, load: async () => 'loaded-module' });

    const result = await registry.activate(manifest.id);

    expect(result).toEqual({
      ok: true,
      session: { id: manifest.id, lifecycle: 'active', module: 'loaded-module' },
    });
    if (result.ok) {
      expect(registry.dispose(result.session).lifecycle).toBe('disposed');
    }
  });

  it('contains a failed loader without affecting another registered tool', async () => {
    const registry = new ToolRegistry<string>('0.1.0');
    registry.register({ manifest, load: async () => 'healthy-module' });
    registry.register({
      manifest: { ...manifest, id: 'tools.broken', name: '故障工具' },
      load: async () => Promise.reject(new Error('broken')),
    });

    await expect(registry.activate('tools.broken')).resolves.toMatchObject({
      ok: false,
      failure: { code: 'load-failed' },
    });
    await expect(registry.activate(manifest.id)).resolves.toMatchObject({
      ok: true,
      session: { module: 'healthy-module', lifecycle: 'active' },
    });
  });
});
