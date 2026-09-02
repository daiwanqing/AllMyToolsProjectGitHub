import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'entertainment.session-picker',
  name: '活动选择器',
  description: '从已保存的娱乐项目中快速决定当前活动。',
  version: '0.1.0',
  category: 'entertainment',
  subcategory: 'activity',
  entry: './index',
  icon: 'grid-2x2',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
