import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'life.board-games',
  name: '代代桌游馆',
  description: '浏览馆藏桌游，按玩法找到下一局值得打开的游戏。',
  version: '0.1.0',
  category: 'life',
  subcategory: 'collection',
  entry: './index',
  icon: 'grid-2x2',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
