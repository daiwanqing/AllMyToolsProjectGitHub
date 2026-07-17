# Figma 设计源接入审计

## 当前状态

- Figma 源目录：`Docs/Figma设计源头`，只读，不修改。
- 桌面应用通过 `apps/desktop-hub/src/styles.css` 直接引入 Figma 的 `src/styles/theme.css`。
- Figma `theme.css` 中的语义颜色、控件尺寸、圆角、Motion、层级和状态色会随桌面应用一起打包。
- Figma 源中识别到 22 个 `.theme-*` 主题；应用选择器保留了 Figma 工作台声明的 `paper`、`violet` 以及这 22 个主题名。
- 桌面应用字体已对齐 Figma 的 `Manrope`、`DM Mono`、`Playfair Display` 字体组合。

## 主题差异说明

Figma 的 `App.tsx` 声明了 `violet`，但 `theme.css` 没有 `.theme-violet` 定义，所以它会使用默认 `paper` Token。这是设计源自身的不一致，不由桌面应用补写，避免悄悄改变设计源语义。

`dark`、`.dark.theme-*` 是 Figma 内部的暗色变体选择器，不是单独的主题入口；当前桌面应用按 Figma 的“完整画布主题”方式选择 `midnight`、`graphite`、`plum`、`mono-night` 等主题。

## 桌面适配规则

Tauri 主窗口默认 `1200 x 800`，最小 `920 x 640`。界面使用固定桌面壳：顶部工具栏、可滚动工作区、底部状态栏；内容不会依赖浏览器页面高度，窗口缩放时只在工作区内部滚动。移动端媒体规则仅作为未来小窗口或窄屏调试兜底，不作为产品主布局。

## 尚未接入的 Figma 产品内容

当前接入的是 Token、主题和 Motion 规则，以及部分交互风格；Figma 工作台中的 50+ UI primitives、知识库工作区、学习工作区、设置面板、数据表、Dialog/Drawer 等还没有全部迁移到业务模块。下一阶段应先把高频 primitive 提取到 `packages/design-system`，再逐个接入真实模块，不能把 Figma 的展示页整体复制进桌面应用。
