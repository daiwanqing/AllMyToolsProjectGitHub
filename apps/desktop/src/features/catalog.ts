import {
  toolSubcategories,
  type ToolCategory,
  type ToolSubcategory,
} from '@allmytools/platform-contracts';
import { toolRegistry } from './registeredTools';

export type ToolCatalogEntry = Readonly<{
  category: ToolCategory;
  subcategory: ToolSubcategory;
  description: string;
  id: string;
  keywords: readonly string[];
  name: string;
}>;

const keywordsByToolId: Readonly<Record<string, readonly string[]>> = {
  'learning.note-review': ['笔记', '复习', '学习'],
  'entertainment.session-picker': ['活动', '娱乐', '选择'],
  'tools.calendar-todos': ['日历', '待办', '任务', '计划', '日程'],
  'tools.travel-notes': ['旅行', '笔记', '旅程', '地点', '回顾'],
  'life.board-games': ['桌游', '收藏', '游戏', '聚会'],
};

export const toolCatalog: readonly ToolCatalogEntry[] = toolRegistry.list().map((manifest) => ({
  id: manifest.id,
  name: manifest.name,
  description: manifest.description ?? '',
  category: manifest.category,
  subcategory: manifest.subcategory,
  keywords: keywordsByToolId[manifest.id] ?? [],
}));

export const categoryLabels: Readonly<Record<ToolCategory, string>> = {
  learning: '学习',
  entertainment: '娱乐',
  tools: '工具',
  life: '生活',
};

export const subcategoryLabels: Readonly<Record<ToolSubcategory, string>> = {
  'study-planning': '学习规划',
  art: '美术',
  english: '英语',
  activity: '活动',
  music: '音乐',
  games: '游戏',
  calendar: '日程',
  productivity: '效率',
  'learning-other': '其他学习',
  'entertainment-other': '其他娱乐',
  'tools-other': '其他工具',
  'daily-life': '生活日常',
  collection: '收藏',
  health: '健康',
  finance: '财务',
  household: '家庭',
  'life-other': '其他生活',
};

export function subcategoriesForCategory(category: ToolCategory) {
  return toolSubcategories[category].map((id) => ({ id, label: subcategoryLabels[id] }));
}

export function matchesToolSearch(entry: ToolCatalogEntry, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');

  if (!normalizedQuery) {
    return true;
  }

  return [entry.name, entry.description, ...entry.keywords].some((value) =>
    value.toLocaleLowerCase('zh-CN').includes(normalizedQuery),
  );
}
