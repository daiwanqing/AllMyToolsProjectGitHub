import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'learning.note-review',
  name: '复习笔记',
  description: '整理待复习内容并建立下一次学习计划。',
  version: '0.1.0',
  category: 'learning',
  entry: './index',
  icon: 'sparkles',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
