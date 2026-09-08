import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'life.board-games',
  name: '桌游',
  description: '整理和保存自己的桌游收藏。',
  version: '0.1.0',
  category: 'life',
  subcategory: 'collection',
  entry: './index',
  icon: 'grid-2x2',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
