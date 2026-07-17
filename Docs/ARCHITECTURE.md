# DaiDai Hub 架构与落地规则

## 目标

DaiDai Hub 是所有工具的入口，不把业务做成一个巨型页面。产品由平台壳和独立模块组成：用户从首页进入探索，再进入学习、娱乐或工具模块；模块共享设计系统、命令、主题和用户偏好，但不直接依赖彼此的实现。

## 设计源接入规则

`Docs/Figma设计源头` 是只读设计源，本项目不修改其中的代码、Token 或素材。新代码通过适配层逐步吸收它的内容：颜色、间距、圆角、控件尺寸、Motion、主题名和 UI 原子组件。发现设计源变化时，先登记变更，再同步到产品 Token；禁止业务页面直接引用 Figma 页面内部 class。

## 分层

```text
apps/desktop-hub                 产品入口（路由、Provider、窗口）
  -> platform                     平台能力（设置、文件、通知、更新）
  -> shell                        AppShell、导航、命令中心、工作区
  -> modules                      学习 / 娱乐 / 工具，各自独立
  -> design system                Token、Primitive、Pattern
```

依赖只能向下：`modules -> shell/design-system`，`shell -> design-system`。模块之间禁止 import；跨模块能力通过 `shared` 的接口、事件或命令调用。UI 组件不处理业务数据，业务模块不自定义颜色和动效数值。

## 模块契约

每个模块必须提供唯一 `id`、名称、分类、入口组件、图标、权限声明和状态。模块只暴露公开入口和命令，不暴露内部组件。模块注册表是唯一导航来源，后续接入新软件只需增加一个 manifest 与实现包。

## 状态边界

- URL / Router：当前模块和可分享的页面位置。
- Zustand：壳层状态，例如侧栏、当前工作区、主题、密度、最近访问。
- TanStack Query：远程数据、缓存、重试和加载状态。
- 模块内部状态：只留在模块内部；需要持久化时通过 platform storage 接口。
- Rust/Tauri：文件、系统通知、窗口、更新、凭据等桌面能力，前端不可直接操作系统 API。

## 交互规则

所有功能入口都可由鼠标和键盘使用；全局命令中心统一管理快捷键；所有异步操作具备 loading、success、error、empty、offline 状态；遵守 reduced-motion。主题只修改语义 Token，不在业务组件里写主题判断。

## 开发顺序

1. 固化 Token 与 Primitive，接入 Button、Input、Card、Dialog、Tabs、Toast、Command。
2. 完成 AppShell、Module Registry、主题 Provider、工作区持久化。
3. 完成首页“开始探索”和三分类模块目录。
4. 逐个接入真实模块，每个模块独立测试和发布。
5. 再接入 Tauri 2，把 platform 能力从 mock 替换为 Rust command。

## 技术选择

首选 Tauri 2 + React + TypeScript + Vite + pnpm workspace。Tauri 适合大量工具集合：包体和内存开销较低，Rust 能力边界清晰。若某个模块强依赖 Node 原生生态，再单独评估 Electron，不改变上层模块契约。

## 启动与测试

最简单的方式是双击仓库根目录的 `start-daidai-hub.bat`。

在仓库根目录执行：

```powershell
pnpm install
pnpm --dir apps/desktop-hub desktop:dev
```

这会启动 Vite，并打开 Tauri 开发窗口。验证前端构建：

```powershell
pnpm --dir apps/desktop-hub build
```

生成 Windows 安装包：

```powershell
pnpm --dir apps/desktop-hub desktop:build
```

产物位于 `apps/desktop-hub/src-tauri/target/release/bundle`，包含 `.msi` 和 NSIS `.exe` 安装包。独立运行未安装版本可执行 `src-tauri/target/release/daidai-hub.exe`。
