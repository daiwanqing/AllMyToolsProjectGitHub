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

  it('为日历提供按主题色温变化的共享强调色', () => {
    const light = resolveThemeTokens('light');
    const dark = resolveThemeTokens('dark');

    expect(light.semantic['color.accent.calendar']).toBe(primitiveTokens['color.red.700']);
    expect(dark.semantic['color.accent.calendar']).toBe(primitiveTokens['color.cyan.300']);
  });

  it('提供桌面窗口和工作区的稳定尺寸 Token', () => {
    expect(primitiveTokens['dimension.window.min-width']).toBe('960px');
    expect(primitiveTokens['dimension.window.min-height']).toBe('640px');
    expect(primitiveTokens['dimension.workspace.tool-max-width']).toBe('880px');
  });

  it('提供统一动效时长和标准缓动曲线', () => {
    expect(primitiveTokens['duration.fast']).toBe('120ms');
    expect(primitiveTokens['duration.normal']).toBe('180ms');
    expect(primitiveTokens['easing.standard']).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(resolveThemeTokens('light').component['motion.easing.standard']).toBe(
      primitiveTokens['easing.standard'],
    );
  });
});
