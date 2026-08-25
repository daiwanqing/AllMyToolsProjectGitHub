import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'tools.text-workbench',
  name: '文本工作台',
  description: '离线清理、转换、格式化文本并保存常用处理预设。',
  version: '0.1.0',
  category: 'tools',
  entry: './index',
  icon: 'wrench',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
