export type UiComponentDefinition = Readonly<{
  name: string;
  category: string;
  contract: string;
}>;

export type UiGuidelineGroup = Readonly<{
  title: string;
  rules: readonly string[];
}>;

/** 公共组件与 UI 规范查看器使用的共享元数据，避免桌面查看器维护脱离组件包的副本。 */
export const uiComponentCatalog: readonly UiComponentDefinition[] = [
  {
    name: 'Button',
    category: '基础操作',
    contract: '主、次、危险红色；区分悬停与按下，加载保留尺寸及名称且不可重复触发。',
  },
  {
    name: 'ToggleButton',
    category: '基础操作',
    contract: '用于状态开关，提供 aria-pressed、选中、焦点和禁用状态。',
  },
  { name: 'TextField', category: '基础输入', contract: '可见标签、说明、错误关联和禁用状态。' },
  {
    name: 'TextAreaField',
    category: '基础输入',
    contract: '多行文本的可见标签、说明、错误关联和禁用状态。',
  },
  { name: 'EmptyState', category: '内容状态', contract: '展示空内容，并以明确动作引导下一步。' },
  { name: 'InlineMessage', category: '内容状态', contract: '提供一般信息或可恢复错误反馈。' },
  {
    name: 'FloatingNotice',
    category: '状态反馈',
    contract: '以自动消失的悬浮消息确认已完成或可逆操作，并通过实时区域表达结果。',
  },
  {
    name: 'IconButton',
    category: '基础操作',
    contract: '统一图标按钮尺寸、提示、可访问名称和按下状态。',
  },
  {
    name: 'NavigationItem',
    category: '导航控件',
    contract: '统一紧凑导航项的图标标签布局、当前页面语义和焦点状态。',
  },
  {
    name: 'Tabs',
    category: '页签控件',
    contract: '带面板的受控 tablist/tab/tabpanel；支持 disabled 项，方向键和 Home/End 跳过禁用项。',
  },
  {
    name: 'HorizontalTabs',
    category: '页签控件',
    contract: '无外框横向 tablist；方向键和 Home/End 跳过禁用项，无有效值时保留可用键盘入口。',
  },
  {
    name: 'VerticalTabs',
    category: '页签控件',
    contract: '填满父容器的无外框竖向 tablist；上下方向键和 Home/End 跳过禁用项。',
  },
  {
    name: 'ChoiceGroup',
    category: '状态控件',
    contract:
      '互斥状态选择组，使用无描边选中表面、aria-pressed 和键盘可达按钮；不输出 tablist 语义。',
  },
  {
    name: 'ToggleField',
    category: '复合控件',
    contract: '组合原生 checkbox、标签和 aria-describedby 说明。',
  },
  {
    name: 'SettingRow',
    category: '复合控件',
    contract: '统一设置说明与控件布局，窄屏自动纵向排列。',
  },
  {
    name: 'SelectField',
    category: '复合控件',
    contract: '组合下拉选项、标签、说明和错误关联。',
  },
  {
    name: 'StepperField',
    category: '复合控件',
    contract: '数值草稿允许清空，失焦或 Enter 校验范围并提交，Escape 取消；增减按钮立即提交。',
  },
  {
    name: 'StatusBadge',
    category: '状态反馈',
    contract: '用统一语义色表达可扫描的状态标签。',
  },
  {
    name: 'ProgressBar',
    category: '状态反馈',
    contract: '提供带数值和 ARIA 进度语义的进度条。',
  },
  {
    name: 'Disclosure',
    category: '复合控件',
    contract: '组合可展开标题和内容面板，保持展开状态可见。',
  },
  {
    name: 'Modal',
    category: '复合控件',
    contract: 'modal 对话框；Tab 排除隐藏、禁用和负 tabIndex 元素并在首尾循环，关闭后恢复焦点。',
  },
];

export const uiGuidelineGroups: readonly UiGuidelineGroup[] = [
  {
    title: 'Token 和主题',
    rules: [
      '组件只读取语义样式变量，不在业务页面重新定义颜色或间距。',
      '浅色与深色由主题语义值切换，不修改组件代码。',
      '暖灰画布、白色或炭黑表面与轻结构线建立层级；自定义控件无描边，焦点环保留。',
      '业务身份色仅使用绿、蓝、黄、紫等业务 Token；红色只表示错误和危险操作。',
      '按钮、输入、菜单、面板和图片裁切统一使用 4px 圆角；圆形标记除外。',
      '动效只使用共享时长和标准缓动；系统请求减少动效时立即显示结果。',
    ],
  },
  {
    title: '布局和导航',
    rules: [
      '设置按外观、快捷键和开发者页签组织，开发者内部按诊断目标分组。',
      '运行工作区优先保证密度与扫描效率，不使用嵌套卡片作为装饰。',
      '工作台保留原有字体、小方块色标、主题快捷入口与常用分组；手机工具双列排列。',
    ],
  },
  {
    title: '可访问性与交互',
    rules: [
      '控件必须提供可见标签、关联说明、焦点反馈和键盘路径，状态不能只用颜色表达。',
      '悬停、按下、持久选中使用不同状态；禁用和加载不可触发，切换不改变控件尺寸。',
      '不熟悉的图标按钮必须提供 title 和 aria-label，复制操作必须反馈结果。',
    ],
  },
  {
    title: '状态和响应式',
    rules: [
      '加载、空、错误和权限拒绝状态必须提供文字原因与可恢复的下一步。',
      '复合控件只负责布局与无业务行为，业务状态由页面控制。',
      '手机输入使用共享 16px 字号，保持统一 4px 圆角，不另设手机视觉主题。',
      '输入占位文字使用辅助文字语义色，浅深主题均保持可读对比度。',
      '动效只用于反馈操作、内容切换和进度变化，不使用装饰性循环或整页位移动画。',
    ],
  },
];
