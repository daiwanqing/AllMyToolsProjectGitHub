import { describe, expect, it } from 'vitest';
import { primitiveTokens, resolveThemeTokens, semanticThemeTokens, themeNames } from './tokens';

describe('设计 Token', () => {
  it('为全部内置主题解析相同的 Token 层结构', () => {
    for (const theme of themeNames) {
      const resolved = resolveThemeTokens(theme);

      expect(resolved.primitive).toBe(primitiveTokens);
      expect(resolved.component['button.compact.height']).toBe(
        primitiveTokens['dimension.control.compact'],
      );
      expect(resolved.semantic).toBe(semanticThemeTokens[theme]);
    }
  });

  it('让浅色和深色主题覆写语义色，而不覆写原始色阶', () => {
    const light = resolveThemeTokens('light');
    const dark = resolveThemeTokens('dark');

    expect(light.primitive).toBe(dark.primitive);
    expect(light.semantic['color.background.canvas']).not.toBe(
      dark.semantic['color.background.canvas'],
    );
    expect(light.semantic['color.text.primary']).not.toBe(dark.semantic['color.text.primary']);
  });

  it('让两套主题的交互控件使用黑白灰语义色', () => {
    const light = resolveThemeTokens('light');
    const dark = resolveThemeTokens('dark');

    expect(light.semantic['color.action.primary']).toBe(primitiveTokens['color.neutral.950']);
    expect(light.semantic['color.focus.ring']).toBe(primitiveTokens['color.neutral.600']);
    expect(dark.semantic['color.action.primary']).toBe(primitiveTokens['color.neutral.50']);
    expect(dark.semantic['color.focus.ring']).toBe(primitiveTokens['color.neutral.300']);
  });
});
