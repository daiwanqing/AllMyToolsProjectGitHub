export const themeNames = ['light', 'dark', 'dopamine'] as const;

export type ThemeName = (typeof themeNames)[number];

export const themeLabels: Readonly<Record<ThemeName, string>> = {
  light: '浅色',
  dark: '深色',
  dopamine: '多巴胺',
};

/** 业务对象可选的身份色；红色严格保留给错误和危险语义。 */
export const businessColorNames = ['lime', 'blue', 'amber', 'violet'] as const;

export type BusinessColorName = (typeof businessColorNames)[number];

export const primitiveTokens = {
  'color.neutral.0': '#ffffff',
  'color.neutral.50': '#f3f3f1',
  'color.neutral.100': '#eeeeea',
  'color.neutral.200': '#e2e2de',
  'color.neutral.300': '#c9c9c4',
  'color.neutral.500': '#686863',
  'color.neutral.600': '#494947',
  'color.neutral.700': '#393938',
  'color.neutral.750': '#242424',
  'color.neutral.850': '#1b1b1b',
  'color.neutral.950': '#111111',
  'color.gray.50': '#f5f5f5',
  'color.gray.100': '#ededed',
  'color.gray.200': '#e2e2e2',
  'color.gray.300': '#c9c9c9',
  'color.gray.500': '#626262',
  'color.electric.700': '#2455e6',
  'color.pink.500': '#f032b4',
  'color.pink.700': '#ad167b',
  'color.green.500': '#20db86',
  'color.yellow.300': '#ffe44d',
  'color.lime.300': '#d9ff00',
  'color.lime.500': '#aee300',
  'color.lime.700': '#5d7800',
  // Keep the established token keys for compatibility; the visual family is coral orange.
  'color.blue.300': '#ffad70',
  'color.blue.700': '#b84200',
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
  'interaction.hover.mix': '8%',
  'interaction.pressed.mix': '16%',
  'dimension.control.compact': '32px',
  'dimension.control.default': '40px',
  'dimension.icon.default': '16px',
  'dimension.navigation.rail': '200px',
  'dimension.window.min-width': '960px',
  'dimension.window.min-height': '640px',
  'dimension.workspace.tool-max-width': '880px',
  'typography.font-family.sans':
    "'Archivo', 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif",
  'typography.font-family.mono':
    "'DM Mono', 'Cascadia Mono', Consolas, 'SFMono-Regular', monospace",
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
    'color.background.control-selected': primitiveTokens['color.neutral.100'],
    'color.background.hover': primitiveTokens['color.neutral.200'],
    'color.background.pressed': primitiveTokens['color.neutral.300'],
    'color.background.navigation-selected': primitiveTokens['color.neutral.200'],
    'color.background.navigation-hover': primitiveTokens['color.neutral.200'],
    'color.background.navigation-pressed': primitiveTokens['color.neutral.300'],
    'color.focus.navigation': primitiveTokens['color.neutral.600'],
    'color.background.navigation': primitiveTokens['color.neutral.0'],
    'color.text.primary': primitiveTokens['color.neutral.950'],
    'color.text.secondary': primitiveTokens['color.neutral.500'],
    'color.text.navigation': primitiveTokens['color.neutral.950'],
    'color.border.default': primitiveTokens['color.neutral.200'],
    'color.border.strong': primitiveTokens['color.neutral.600'],
    // Interactive controls stay monochrome in the light theme.
    'color.action.primary': primitiveTokens['color.neutral.950'],
    'color.action.primary-text': primitiveTokens['color.neutral.0'],
    'color.action.button-background': primitiveTokens['color.neutral.100'],
    'color.action.button-text': primitiveTokens['color.neutral.950'],
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
    'color.background.selected': primitiveTokens['color.neutral.700'],
    'color.background.control-selected': primitiveTokens['color.neutral.700'],
    'color.background.hover': primitiveTokens['color.neutral.600'],
    'color.background.pressed': primitiveTokens['color.neutral.500'],
    'color.background.navigation-selected': primitiveTokens['color.neutral.700'],
    'color.background.navigation-hover': primitiveTokens['color.neutral.600'],
    'color.background.navigation-pressed': primitiveTokens['color.neutral.500'],
    'color.focus.navigation': primitiveTokens['color.neutral.300'],
    'color.background.navigation': primitiveTokens['color.neutral.950'],
    'color.text.primary': primitiveTokens['color.neutral.50'],
    'color.text.secondary': primitiveTokens['color.neutral.300'],
    'color.text.navigation': primitiveTokens['color.neutral.50'],
    'color.border.default': primitiveTokens['color.neutral.700'],
    'color.border.strong': primitiveTokens['color.neutral.300'],
    // Interactive controls stay monochrome in the dark theme.
    'color.action.primary': primitiveTokens['color.neutral.50'],
    'color.action.primary-text': primitiveTokens['color.neutral.950'],
    'color.action.button-background': primitiveTokens['color.neutral.700'],
    'color.action.button-text': primitiveTokens['color.neutral.50'],
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
  dopamine: {
    'color.background.canvas': primitiveTokens['color.neutral.0'],
    'color.background.surface': primitiveTokens['color.neutral.0'],
    'color.background.selected': primitiveTokens['color.gray.100'],
    'color.background.control-selected': primitiveTokens['color.gray.100'],
    'color.background.hover': primitiveTokens['color.gray.200'],
    'color.background.pressed': primitiveTokens['color.gray.300'],
    'color.background.navigation-selected': primitiveTokens['color.neutral.750'],
    'color.background.navigation-hover': primitiveTokens['color.neutral.700'],
    'color.background.navigation-pressed': primitiveTokens['color.neutral.600'],
    'color.focus.navigation': primitiveTokens['color.neutral.0'],
    'color.background.navigation': primitiveTokens['color.neutral.950'],
    'color.text.primary': primitiveTokens['color.neutral.950'],
    'color.text.secondary': primitiveTokens['color.gray.500'],
    'color.text.navigation': primitiveTokens['color.neutral.0'],
    'color.border.default': primitiveTokens['color.gray.200'],
    'color.border.strong': primitiveTokens['color.gray.500'],
    'color.action.primary': primitiveTokens['color.neutral.950'],
    'color.action.primary-text': primitiveTokens['color.neutral.0'],
    'color.action.button-background': primitiveTokens['color.neutral.950'],
    'color.action.button-text': primitiveTokens['color.neutral.0'],
    'color.focus.ring': primitiveTokens['color.gray.500'],
    'color.accent.calendar': primitiveTokens['color.pink.700'],
    'color.status.info': primitiveTokens['color.electric.700'],
    'color.status.success': primitiveTokens['color.lime.700'],
    'color.status.warning': primitiveTokens['color.amber.700'],
    'color.status.error': primitiveTokens['color.red.700'],
    'color.business.lime': primitiveTokens['color.green.500'],
    'color.business.blue': primitiveTokens['color.electric.700'],
    'color.business.amber': primitiveTokens['color.yellow.300'],
    'color.business.violet': primitiveTokens['color.pink.500'],
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
    'color.background.control-selected': 'color.neutral.100',
    'color.background.hover': 'color.neutral.200',
    'color.background.pressed': 'color.neutral.300',
    'color.background.navigation-selected': 'color.neutral.200',
    'color.background.navigation-hover': 'color.neutral.200',
    'color.background.navigation-pressed': 'color.neutral.300',
    'color.focus.navigation': 'color.neutral.600',
    'color.background.navigation': 'color.neutral.0',
    'color.text.primary': 'color.neutral.950',
    'color.text.secondary': 'color.neutral.500',
    'color.text.navigation': 'color.neutral.950',
    'color.border.default': 'color.neutral.200',
    'color.border.strong': 'color.neutral.600',
    'color.action.primary': 'color.neutral.950',
    'color.action.primary-text': 'color.neutral.0',
    'color.action.button-background': 'color.neutral.100',
    'color.action.button-text': 'color.neutral.950',
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
    'color.background.selected': 'color.neutral.700',
    'color.background.control-selected': 'color.neutral.700',
    'color.background.hover': 'color.neutral.600',
    'color.background.pressed': 'color.neutral.500',
    'color.background.navigation-selected': 'color.neutral.700',
    'color.background.navigation-hover': 'color.neutral.600',
    'color.background.navigation-pressed': 'color.neutral.500',
    'color.focus.navigation': 'color.neutral.300',
    'color.background.navigation': 'color.neutral.950',
    'color.text.primary': 'color.neutral.50',
    'color.text.secondary': 'color.neutral.300',
    'color.text.navigation': 'color.neutral.50',
    'color.border.default': 'color.neutral.700',
    'color.border.strong': 'color.neutral.300',
    'color.action.primary': 'color.neutral.50',
    'color.action.primary-text': 'color.neutral.950',
    'color.action.button-background': 'color.neutral.700',
    'color.action.button-text': 'color.neutral.50',
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
  dopamine: {
    'color.background.canvas': 'color.neutral.0',
    'color.background.surface': 'color.neutral.0',
    'color.background.selected': 'color.gray.100',
    'color.background.control-selected': 'color.gray.100',
    'color.background.hover': 'color.gray.200',
    'color.background.pressed': 'color.gray.300',
    'color.background.navigation-selected': 'color.neutral.750',
    'color.background.navigation-hover': 'color.neutral.700',
    'color.background.navigation-pressed': 'color.neutral.600',
    'color.focus.navigation': 'color.neutral.0',
    'color.background.navigation': 'color.neutral.950',
    'color.text.primary': 'color.neutral.950',
    'color.text.secondary': 'color.gray.500',
    'color.text.navigation': 'color.neutral.0',
    'color.border.default': 'color.gray.200',
    'color.border.strong': 'color.gray.500',
    'color.action.primary': 'color.neutral.950',
    'color.action.primary-text': 'color.neutral.0',
    'color.action.button-background': 'color.neutral.950',
    'color.action.button-text': 'color.neutral.0',
    'color.focus.ring': 'color.gray.500',
    'color.accent.calendar': 'color.pink.700',
    'color.status.info': 'color.electric.700',
    'color.status.success': 'color.lime.700',
    'color.status.warning': 'color.amber.700',
    'color.status.error': 'color.red.700',
    'color.business.lime': 'color.green.500',
    'color.business.blue': 'color.electric.700',
    'color.business.amber': 'color.yellow.300',
    'color.business.violet': 'color.pink.500',
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
  'control.hover.mix': primitiveTokens['interaction.hover.mix'],
  'control.pressed.mix': primitiveTokens['interaction.pressed.mix'],
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

  // Preserve existing light/dark customizations until the new roles are overridden explicitly.
  if (theme !== 'dopamine') {
    for (const [target, source] of [
      ['color.background.control-selected', 'color.background.selected'],
      ['color.action.button-background', 'color.background.selected'],
      ['color.action.button-text', 'color.text.primary'],
      ['color.background.navigation-hover', 'color.background.hover'],
      ['color.background.navigation-pressed', 'color.background.pressed'],
      ['color.focus.navigation', 'color.focus.ring'],
    ] as const) {
      if (!colorOverrides[target] && colorOverrides[source]) {
        (semantic as Record<string, string>)[target] = semantic[source];
      }
    }
  }

  return {
    primitive,
    semantic,
    component: componentTokens,
  };
}
