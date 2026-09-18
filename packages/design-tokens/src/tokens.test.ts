import { describe, expect, it } from 'vitest';
import {
  businessColorNames,
  primitiveTokens,
  resolveThemeTokens,
  semanticThemeTokens,
  themeNames,
} from './tokens';

function contrastRatio(foreground: string, background: string) {
  function luminance(hex: string) {
    const channels = hex
      .slice(1)
      .match(/.{2}/g)
      ?.map((channel) => Number.parseInt(channel, 16) / 255);
    if (!channels || channels.length !== 3) {
      throw new Error(`Expected a six-digit hex color, received ${hex}.`);
    }
    const [red, green, blue] = channels.map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  }

  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

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
    expect(light.semantic['color.background.navigation']).toBe(primitiveTokens['color.neutral.0']);
    expect(light.semantic['color.background.navigation-selected']).toBe(
      primitiveTokens['color.neutral.200'],
    );
    expect(light.semantic['color.text.navigation']).toBe(primitiveTokens['color.neutral.950']);
    expect(dark.semantic['color.action.primary']).toBe(primitiveTokens['color.neutral.50']);
    expect(dark.semantic['color.focus.ring']).toBe(primitiveTokens['color.neutral.300']);
    expect(dark.semantic['color.background.navigation']).toBe(primitiveTokens['color.neutral.950']);
    expect(dark.semantic['color.background.navigation-selected']).toBe(
      primitiveTokens['color.neutral.700'],
    );
    expect(dark.semantic['color.text.navigation']).toBe(primitiveTokens['color.neutral.50']);
  });

  it('为日历提供按主题明度变化的珊瑚橙共享强调色', () => {
    const light = resolveThemeTokens('light');
    const dark = resolveThemeTokens('dark');

    expect(light.semantic['color.accent.calendar']).toBe(primitiveTokens['color.blue.700']);
    expect(dark.semantic['color.accent.calendar']).toBe(primitiveTokens['color.blue.300']);
  });

  it('keeps business identity colors separate from the red danger color', () => {
    expect(businessColorNames).toEqual(['lime', 'blue', 'amber', 'violet']);
    expect(Object.keys(semanticThemeTokens.light)).toEqual(
      expect.arrayContaining([
        'color.business.lime',
        'color.business.blue',
        'color.business.amber',
        'color.business.violet',
      ]),
    );
    expect(semanticThemeTokens.light['color.status.error']).toBe(primitiveTokens['color.red.700']);
    expect(semanticThemeTokens.dark['color.status.error']).toBe(primitiveTokens['color.red.300']);
  });

  it('keeps status text readable across themes while business marks remain vivid', () => {
    for (const theme of themeNames) {
      const resolved = resolveThemeTokens(theme);
      const background = resolved.semantic['color.background.surface'];
      for (const name of [
        'color.status.info',
        'color.status.success',
        'color.status.warning',
        'color.status.error',
      ] as const) {
        expect(contrastRatio(resolved.semantic[name], background)).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(semanticThemeTokens.light['color.business.lime']).toBe(
      primitiveTokens['color.lime.500'],
    );
    expect(semanticThemeTokens.light['color.business.amber']).toBe(
      primitiveTokens['color.amber.500'],
    );
  });

  it('允许仅覆盖语义颜色并保留原始色阶和组件 Token', () => {
    const resolved = resolveThemeTokens('light', {
      'color.background.canvas': '#123456',
    });

    expect(resolved.semantic['color.background.canvas']).toBe('#123456');
    expect(resolved.primitive).toBe(primitiveTokens);
    expect(resolved.component).toBe(resolveThemeTokens('light').component);
  });

  it('让原始颜色覆盖沿引用关系同步到语义颜色', () => {
    const resolved = resolveThemeTokens('light', {
      'color.neutral.50': '#123456',
    });

    expect(resolved.primitive['color.neutral.50']).toBe('#123456');
    expect(resolved.semantic['color.background.canvas']).toBe('#123456');
  });

  it('提供桌面窗口和工作区的稳定尺寸 Token', () => {
    expect(primitiveTokens['dimension.window.min-width']).toBe('960px');
    expect(primitiveTokens['dimension.window.min-height']).toBe('640px');
    expect(primitiveTokens['dimension.navigation.rail']).toBe('200px');
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

  it('提供工具台使用的共享排版层级', () => {
    expect(primitiveTokens['typography.font-family.sans']).toContain("'Archivo'");
    expect(primitiveTokens['typography.font-family.mono']).toContain("'DM Mono'");
    expect(primitiveTokens['typography.size.page-title']).toBe('32px');
    expect(primitiveTokens['typography.size.tool-title']).toBe('24px');
    expect(primitiveTokens['typography.size.body']).toBe('14px');
    expect(primitiveTokens['typography.line-height.body']).toBe('20px');
    expect(primitiveTokens['typography.weight.bold']).toBe('800');
  });

  it('提供示例工作台的高对比中性灰阶和鲜明身份色', () => {
    expect(primitiveTokens['color.neutral.50']).toBe('#f5f5f2');
    expect(primitiveTokens['color.neutral.600']).toBe('#494947');
    expect(primitiveTokens['color.neutral.850']).toBe('#1b1b1b');
    expect(primitiveTokens['color.lime.500']).toBe('#aee300');
    expect(primitiveTokens['color.blue.700']).toBe('#b84200');
    expect(primitiveTokens['color.blue.300']).toBe('#ffad70');
    expect(primitiveTokens['color.red.700']).not.toBe(
      semanticThemeTokens.light['color.business.blue'],
    );
  });

  it('提供返回操作统一且更紧凑的顶部间距', () => {
    expect(resolveThemeTokens('light').component['navigation.back-top-spacing']).toBe('8px');
    expect(resolveThemeTokens('dark').component['navigation.back-top-spacing']).toBe('8px');
  });

  it('提供移动导航可复用的默认控件触控尺寸', () => {
    expect(resolveThemeTokens('light').component['button.default.height']).toBe('40px');
    expect(resolveThemeTokens('dark').component['button.default.height']).toBe('40px');
  });
});
