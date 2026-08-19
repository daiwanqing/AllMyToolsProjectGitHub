import { describe, expect, it } from 'vitest';
import { defineToolManifest, validateToolManifest } from './manifest';
import type { ToolManifest } from './types';

const validManifest: ToolManifest = {
  id: 'tools.example',
  name: '示例工具',
  version: '1.0.0',
  category: 'tools',
  entry: './src/index.ts',
  icon: 'wrench',
  capabilities: ['clipboard'],
  minPlatformVersion: '1.0.0',
};

describe('工具清单契约', () => {
  it('接受有效的构建期清单', () => {
    expect(validateToolManifest(validManifest)).toEqual({ ok: true, manifest: validManifest });
  });

  it('汇总不合法字段和重复能力', () => {
    const result = validateToolManifest({
      ...validManifest,
      id: 'Tools Example',
      name: ' ',
      version: '1.0',
      entry: ' ',
      icon: ' ',
      capabilities: ['clipboard', 'clipboard'],
      minPlatformVersion: 'next',
    });

    expect(result).toMatchObject({ ok: false });
    if (!result.ok) {
      expect(result.issues.map((item) => item.code)).toEqual([
        'invalid-id',
        'missing-name',
        'invalid-version',
        'missing-entry',
        'missing-icon',
        'duplicate-capability',
        'invalid-min-platform-version',
      ]);
    }
  });

  it('在定义工具时拒绝无效清单', () => {
    expect(() => defineToolManifest({ ...validManifest, id: 'invalid id' })).toThrow(
      '工具 ID 必须使用小写字母、数字、点或连字符。',
    );
  });
});
