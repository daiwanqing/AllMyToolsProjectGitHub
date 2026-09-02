import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'tools.travel-notes',
  name: '旅行笔记',
  description: '把旅途中的地点、片段与花费，整理成一段可以回看的故事。',
  version: '0.1.0',
  category: 'tools',
  subcategory: 'productivity',
  entry: './index',
  icon: 'map-pin',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
