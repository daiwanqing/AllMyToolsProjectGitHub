import { defineToolManifest } from '@allmytools/platform-contracts';

export const manifest = defineToolManifest({
  id: 'tools.calendar-todos',
  name: '日历待办',
  description: '按日期安排待办，在月历中查看每天的计划。',
  version: '0.1.0',
  category: 'tools',
  entry: './index',
  icon: 'calendar-check',
  capabilities: [],
  minPlatformVersion: '0.1.0',
});
