import type { ToolCategory } from '@allmytools/platform-contracts';
import { toolRegistry } from './registeredTools';

export type ToolCatalogEntry = Readonly<{
  category: ToolCategory;
  description: string;
  id: string;
  keywords: readonly string[];
  name: string;
}>;

const keywordsByToolId: Readonly<Record<string, readonly string[]>> = {
  'learning.note-review': ['笔记', '复习', '学习'],
  'entertainment.session-picker': ['活动', '娱乐', '选择'],
  'tools.text-workbench': ['文本', '转换', '格式化', 'JSON', '正则', '去重', '排序'],
  'tools.calendar-todos': ['日历', '待办', '任务', '计划', '日程'],
};

export const toolCatalog: readonly ToolCatalogEntry[] = toolRegistry.list().map((manifest) => ({
  id: manifest.id,
  name: manifest.name,
  description: manifest.description ?? '',
  category: manifest.category,
  keywords: keywordsByToolId[manifest.id] ?? [],
}));

export const categoryLabels: Readonly<Record<ToolCategory, string>> = {
  learning: '学习',
  entertainment: '娱乐',
  tools: '工具',
};

export function matchesToolSearch(entry: ToolCatalogEntry, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN');

  if (!normalizedQuery) {
    return true;
  }

  return [entry.name, entry.description, ...entry.keywords].some((value) =>
    value.toLocaleLowerCase('zh-CN').includes(normalizedQuery),
  );
}
