import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'tools.text-workbench',
  name: '文本工作台',
  description: '处理临时文本、格式和可重复的转换操作。',
  version: '0.1.0',
  category: 'tools',
  entry: './index',
  icon: 'wrench',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
