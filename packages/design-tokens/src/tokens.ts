export const themeNames = ['light', 'dark'] as const;

export type ThemeName = (typeof themeNames)[number];

/** 业务对象可选的身份色；红色严格保留给错误和危险语义。 */
export const businessColorNames = ['lime', 'blue', 'amber', 'violet'] as const;

export type BusinessColorName = (typeof businessColorNames)[number];

export const primitiveTokens = {
  'color.neutral.0': '#ffffff',
  'color.neutral.50': '#f5f5f2',
  'color.neutral.100': '#eeeeea',
  'color.neutral.300': '#c9c9c4',
  'color.neutral.500': '#6f6f6a',
  'color.neutral.600': '#494947',
  'color.neutral.750': '#242424',
  'color.neutral.850': '#1b1b1b',
  'color.neutral.950': '#111111',
  'color.lime.300': '#d9ff00',
  'color.lime.500': '#aee300',
  'color.lime.700': '#5d7800',
  'color.blue.300': '#4b6dff',
  'color.blue.700': '#2854f5',
  'color.amber.300': '#ffd166',
  'color.amber.500': '#ffb800',
  'color.amber.700': '#a55f00',
  'color.violet.300': '#c2a7ff',
  'color.violet.700': '#7450d7',
  'color.red.300': '#ff5036',
  'color.red.700': '#d6352a',
  'space.1': '4px',
  'space.2': '8px',
  'space.3': '12px',
  'space.4': '16px',
  'space.5': '20px',
  'space.6': '24px',
  'space.8': '32px',
  'space.10': '40px',
  'radius.1': '4px',
  'border.width.default': '1px',
  'focus.width.default': '2px',
  'opacity.disabled': '0.56',
  'dimension.control.compact': '32px',
  'dimension.control.default': '40px',
  'dimension.icon.default': '16px',
  'dimension.navigation.rail': '180px',
  'dimension.window.min-width': '960px',
  'dimension.window.min-height': '640px',
  'dimension.workspace.tool-max-width': '880px',
  'typography.font-family.sans':
    "'Archivo', 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif",
  'typography.font-family.mono': "'DM Mono', 'Cascadia Mono', Consolas, 'SFMono-Regular', monospace",
  'typography.size.page-title': '32px',
  'typography.size.tool-title': '24px',
  'typography.size.section-title': '16px',
  'typography.size.body': '14px',
  'typography.size.caption': '12px',
  'typography.size.data': '13px',
  'typography.line-height.page-title': '40px',
  'typography.line-height.tool-title': '32px',
  'typography.line-height.section-title': '24px',
  'typography.line-height.body': '20px',
  'typography.line-height.caption': '16px',
  'typography.weight.regular': '400',
  'typography.weight.medium': '600',
  'typography.weight.bold': '800',
  'duration.fast': '120ms',
  'duration.normal': '180ms',
  'easing.standard': 'cubic-bezier(0.2, 0, 0, 1)',
  'z-index.content': '0',
  'z-index.menu': '100',
  'z-index.dialog': '200',
  'z-index.notification': '300',
} as const;

export const semanticThemeTokens = {
  light: {
    'color.background.canvas': primitiveTokens['color.neutral.50'],
    'color.background.surface': primitiveTokens['color.neutral.0'],
    'color.background.selected': primitiveTokens['color.neutral.100'],
    'color.text.primary': primitiveTokens['color.neutral.950'],
    'color.text.secondary': primitiveTokens['color.neutral.500'],
    'color.border.default': primitiveTokens['color.neutral.300'],
    'color.border.strong': primitiveTokens['color.neutral.600'],
    // Interactive controls stay monochrome in the light theme.
    'color.action.primary': primitiveTokens['color.neutral.950'],
    'color.action.primary-text': primitiveTokens['color.neutral.0'],
    'color.focus.ring': primitiveTokens['color.neutral.600'],
    'color.accent.calendar': primitiveTokens['color.blue.700'],
    'color.status.info': primitiveTokens['color.blue.700'],
    'color.status.success': primitiveTokens['color.lime.700'],
    'color.status.warning': primitiveTokens['color.amber.700'],
    'color.status.error': primitiveTokens['color.red.700'],
    'color.business.lime': primitiveTokens['color.lime.500'],
    'color.business.blue': primitiveTokens['color.blue.700'],
    'color.business.amber': primitiveTokens['color.amber.500'],
    'color.business.violet': primitiveTokens['color.violet.700'],
  },
  dark: {
    'color.background.canvas': primitiveTokens['color.neutral.850'],
    'color.background.surface': primitiveTokens['color.neutral.750'],
    'color.background.selected': primitiveTokens['color.neutral.600'],
    'color.text.primary': primitiveTokens['color.neutral.50'],
    'color.text.secondary': primitiveTokens['color.neutral.300'],
    'color.border.default': primitiveTokens['color.neutral.600'],
    'color.border.strong': primitiveTokens['color.neutral.300'],
    // Interactive controls stay monochrome in the dark theme.
    'color.action.primary': primitiveTokens['color.neutral.50'],
    'color.action.primary-text': primitiveTokens['color.neutral.950'],
    'color.focus.ring': primitiveTokens['color.neutral.300'],
    'color.accent.calendar': primitiveTokens['color.blue.300'],
    'color.status.info': primitiveTokens['color.blue.300'],
    'color.status.success': primitiveTokens['color.lime.300'],
    'color.status.warning': primitiveTokens['color.amber.300'],
    'color.status.error': primitiveTokens['color.red.300'],
    'color.business.lime': primitiveTokens['color.lime.300'],
    'color.business.blue': primitiveTokens['color.blue.300'],
    'color.business.amber': primitiveTokens['color.amber.300'],
    'color.business.violet': primitiveTokens['color.violet.300'],
  },
} as const;

export const semanticColorTokenNames = Object.freeze(
  Object.keys(semanticThemeTokens.light).filter((name) => name.startsWith('color.')),
) as readonly Extract<keyof (typeof semanticThemeTokens)['light'], `color.${string}`>[];

export const primitiveColorTokenNames = Object.freeze(
  Object.keys(primitiveTokens).filter((name) => name.startsWith('color.')),
) as readonly Extract<keyof typeof primitiveTokens, `color.${string}`>[];

export type PrimitiveColorTokenName = (typeof primitiveColorTokenNames)[number];
export type SemanticColorTokenName = (typeof semanticColorTokenNames)[number];
export type ColorTokenName = PrimitiveColorTokenName | SemanticColorTokenName;
export type ThemeColorOverrides = Partial<Record<ColorTokenName, string>>;

const semanticPrimitiveSources: Readonly<
  Record<ThemeName, Readonly<Record<SemanticColorTokenName, PrimitiveColorTokenName>>>
> = {
  light: {
    'color.background.canvas': 'color.neutral.50',
    'color.background.surface': 'color.neutral.0',
    'color.background.selected': 'color.neutral.100',
    'color.text.primary': 'color.neutral.950',
    'color.text.secondary': 'color.neutral.500',
    'color.border.default': 'color.neutral.300',
    'color.border.strong': 'color.neutral.600',
    'color.action.primary': 'color.neutral.950',
    'color.action.primary-text': 'color.neutral.0',
    'color.focus.ring': 'color.neutral.600',
    'color.accent.calendar': 'color.blue.700',
    'color.status.info': 'color.blue.700',
    'color.status.success': 'color.lime.700',
    'color.status.warning': 'color.amber.700',
    'color.status.error': 'color.red.700',
    'color.business.lime': 'color.lime.500',
    'color.business.blue': 'color.blue.700',
    'color.business.amber': 'color.amber.500',
    'color.business.violet': 'color.violet.700',
  },
  dark: {
    'color.background.canvas': 'color.neutral.850',
    'color.background.surface': 'color.neutral.750',
    'color.background.selected': 'color.neutral.600',
    'color.text.primary': 'color.neutral.50',
    'color.text.secondary': 'color.neutral.300',
    'color.border.default': 'color.neutral.600',
    'color.border.strong': 'color.neutral.300',
    'color.action.primary': 'color.neutral.50',
    'color.action.primary-text': 'color.neutral.950',
    'color.focus.ring': 'color.neutral.300',
    'color.accent.calendar': 'color.blue.300',
    'color.status.info': 'color.blue.300',
    'color.status.success': 'color.lime.300',
    'color.status.warning': 'color.amber.300',
    'color.status.error': 'color.red.300',
    'color.business.lime': 'color.lime.300',
    'color.business.blue': 'color.blue.300',
    'color.business.amber': 'color.amber.300',
    'color.business.violet': 'color.violet.300',
  },
};

export const componentTokens = {
  'button.compact.height': primitiveTokens['dimension.control.compact'],
  'button.compact.radius': primitiveTokens['radius.1'],
  'button.compact.padding-x': primitiveTokens['space.3'],
  'button.default.height': primitiveTokens['dimension.control.default'],
  'button.default.radius': primitiveTokens['radius.1'],
  'button.default.padding-x': primitiveTokens['space.4'],
  'field.height': primitiveTokens['dimension.control.default'],
  'field.radius': primitiveTokens['radius.1'],
  'field.padding-x': primitiveTokens['space.3'],
  'message.radius': primitiveTokens['radius.1'],
  'message.padding': primitiveTokens['space.3'],
  'control.disabled.opacity': primitiveTokens['opacity.disabled'],
  'navigation.item.radius': primitiveTokens['radius.1'],
  'navigation.item.padding-x': primitiveTokens['space.3'],
  'navigation.item.padding-y': primitiveTokens['space.2'],
  'navigation.back-top-spacing': primitiveTokens['space.2'],
  'focus.ring.width': primitiveTokens['focus.width.default'],
  'focus.ring.offset': primitiveTokens['space.1'],
  'motion.fast.duration': primitiveTokens['duration.fast'],
  'motion.normal.duration': primitiveTokens['duration.normal'],
  'motion.easing.standard': primitiveTokens['easing.standard'],
} as const;

export type ResolvedThemeTokens = Readonly<{
  primitive: typeof primitiveTokens;
  semantic: (typeof semanticThemeTokens)[ThemeName];
  component: typeof componentTokens;
}>;

/** 返回构建期 Token 的只读快照，供测试和开发者查看器使用。 */
export function resolveThemeTokens(
  theme: ThemeName,
  colorOverrides: ThemeColorOverrides = {},
): ResolvedThemeTokens {
  const hasPrimitiveOverrides = primitiveColorTokenNames.some((name) =>
    Boolean(colorOverrides[name]),
  );
  const hasSemanticOverrides = semanticColorTokenNames.some((name) =>
    Boolean(colorOverrides[name]),
  );
  const primitive = hasPrimitiveOverrides ? { ...primitiveTokens } : primitiveTokens;
  const semantic =
    hasPrimitiveOverrides || hasSemanticOverrides
      ? { ...semanticThemeTokens[theme] }
      : semanticThemeTokens[theme];
  for (const name of primitiveColorTokenNames) {
    const override = colorOverrides[name];
    if (override) {
      (primitive as Record<string, string>)[name] = override;
    }
  }
  for (const name of semanticColorTokenNames) {
    const override = colorOverrides[name] ?? colorOverrides[semanticPrimitiveSources[theme][name]];
    if (override) {
      (semantic as Record<string, string>)[name] = override;
    }
  }

  return {
    primitive,
    semantic,
    component: componentTokens,
  };
}
