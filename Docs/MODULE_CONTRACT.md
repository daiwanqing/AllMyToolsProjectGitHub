# 模块接入契约

新增模块必须独立目录，并包含 `manifest.ts`、页面入口、数据层、测试和 README。模块只能依赖 `@daidai/design-system`、`@daidai/shell` 和 `@daidai/shared`，不能依赖另一个业务模块。

```ts
export type ModuleManifest = {
  id: string;
  title: string;
  category: 'learning' | 'entertainment' | 'tools';
  icon: string;
  entry: string;
  permissions: string[];
  commands: { id: string; title: string; shortcut?: string }[];
};
```

验收标准：入口可被注册表发现；无权限时有明确状态；刷新后路由与偏好可恢复；主题、密度、动效遵守全局设置；失败、空数据、离线和加载态完整；模块删除不会影响其他模块。
