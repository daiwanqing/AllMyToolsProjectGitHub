export const themeNames = ['light', 'dark'] as const;

export type ThemeName = (typeof themeNames)[number];

export const primitiveTokens = {
  'color.neutral.0': '#ffffff',
  'color.neutral.50': '#f7f8f8',
  'color.neutral.100': '#edf0f1',
  'color.neutral.300': '#ced5d8',
  'color.neutral.500': '#647079',
  'color.neutral.600': '#3c464d',
  'color.neutral.750': '#22272b',
  'color.neutral.850': '#171a1d',
  'color.neutral.950': '#0f1113',
  'color.cyan.300': '#77cad3',
  'color.cyan.700': '#216570',
  'color.green.300': '#8bc7a8',
  'color.green.700': '#2f7657',
  'color.amber.300': '#e1bb73',
  'color.amber.700': '#8a5d16',
  'color.red.300': '#ea9292',
  'color.red.700': '#a84242',
  'space.1': '4px',
  'space.2': '8px',
  'space.3': '12px',
  'space.4': '16px',
  'space.5': '20px',
  'space.6': '24px',
  'space.8': '32px',
  'space.10': '40px',
  'radius.1': '4px',
  'radius.2': '6px',
  'radius.3': '8px',
  'border.width.default': '1px',
  'focus.width.default': '2px',
  'opacity.disabled': '0.56',
  'dimension.control.compact': '32px',
  'dimension.control.default': '40px',
  'dimension.icon.default': '16px',
  'dimension.navigation.rail': '156px',
  'dimension.window.min-width': '960px',
  'dimension.window.min-height': '640px',
  'dimension.workspace.tool-max-width': '880px',
  'duration.fast': '120ms',
  'duration.normal': '180ms',
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
    'color.status.success': primitiveTokens['color.green.700'],
    'color.status.warning': primitiveTokens['color.amber.700'],
    'color.status.error': primitiveTokens['color.red.700'],
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
    'color.status.success': primitiveTokens['color.green.300'],
    'color.status.warning': primitiveTokens['color.amber.300'],
    'color.status.error': primitiveTokens['color.red.300'],
  },
} as const;

export const componentTokens = {
  'button.compact.height': primitiveTokens['dimension.control.compact'],
  'button.compact.radius': primitiveTokens['radius.2'],
  'button.compact.padding-x': primitiveTokens['space.3'],
  'button.default.height': primitiveTokens['dimension.control.default'],
  'button.default.radius': primitiveTokens['radius.2'],
  'button.default.padding-x': primitiveTokens['space.4'],
  'field.height': primitiveTokens['dimension.control.default'],
  'field.radius': primitiveTokens['radius.2'],
  'field.padding-x': primitiveTokens['space.3'],
  'message.radius': primitiveTokens['radius.2'],
  'message.padding': primitiveTokens['space.3'],
  'control.disabled.opacity': primitiveTokens['opacity.disabled'],
  'navigation.item.radius': primitiveTokens['radius.2'],
  'navigation.item.padding-x': primitiveTokens['space.3'],
  'navigation.item.padding-y': primitiveTokens['space.2'],
  'focus.ring.width': primitiveTokens['focus.width.default'],
  'focus.ring.offset': primitiveTokens['space.1'],
} as const;

export type ResolvedThemeTokens = Readonly<{
  primitive: typeof primitiveTokens;
  semantic: (typeof semanticThemeTokens)[ThemeName];
  component: typeof componentTokens;
}>;

/** 返回构建期 Token 的只读快照，供测试和开发者查看器使用。 */
export function resolveThemeTokens(theme: ThemeName): ResolvedThemeTokens {
  return {
    primitive: primitiveTokens,
    semantic: semanticThemeTokens[theme],
    component: componentTokens,
  };
}
