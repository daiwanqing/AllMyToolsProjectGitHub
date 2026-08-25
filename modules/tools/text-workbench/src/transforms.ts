export const textOperations = [
  'trim',
  'normalize-lines',
  'remove-empty-lines',
  'deduplicate-lines',
  'sort-lines',
  'format-json',
  'replace',
] as const;

export type TextOperation = (typeof textOperations)[number];

export type TextOperationDefinition = Readonly<{
  id: TextOperation;
  label: string;
  description: string;
}>;

export const textOperationDefinitions: readonly TextOperationDefinition[] = [
  { id: 'trim', label: '清理首尾空白', description: '移除全文开头与结尾的空白字符。' },
  { id: 'normalize-lines', label: '统一换行', description: '将不同平台的换行格式统一为 LF。' },
  { id: 'remove-empty-lines', label: '移除空行', description: '删除只包含空白字符的行。' },
  { id: 'deduplicate-lines', label: '去重行', description: '保留每一行第一次出现的位置。' },
  { id: 'sort-lines', label: '排序行', description: '按中文本地排序规则排列所有行。' },
  { id: 'format-json', label: '格式化 JSON', description: '校验并按两空格缩进格式化 JSON。' },
  { id: 'replace', label: '正则替换', description: '用正则表达式查找并替换全部匹配内容。' },
];

export type TextTransformOptions = Readonly<{
  find: string;
  replaceWith: string;
}>;

export type TextTransformResult =
  | Readonly<{ ok: true; output: string; summary: string }>
  | Readonly<{ ok: false; message: string }>;

const lineCollator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

function normalizedLines(value: string): string[] {
  return value.replace(/\r\n?/g, '\n').split('\n');
}

export function transformText(
  input: string,
  operation: TextOperation,
  options: TextTransformOptions,
): TextTransformResult {
  if (!input) {
    return { ok: false, message: '请输入要处理的文本。' };
  }

  switch (operation) {
    case 'trim':
      return { ok: true, output: input.trim(), summary: '已清理全文首尾空白。' };
    case 'normalize-lines':
      return { ok: true, output: input.replace(/\r\n?/g, '\n'), summary: '已统一换行格式。' };
    case 'remove-empty-lines': {
      const lines = normalizedLines(input).filter((line) => line.trim().length > 0);
      return { ok: true, output: lines.join('\n'), summary: '已移除空行。' };
    }
    case 'deduplicate-lines': {
      const seen = new Set<string>();
      const lines = normalizedLines(input).filter((line) => {
        if (seen.has(line)) {
          return false;
        }
        seen.add(line);
        return true;
      });
      return { ok: true, output: lines.join('\n'), summary: '已按完整行内容去重。' };
    }
    case 'sort-lines':
      return {
        ok: true,
        output: normalizedLines(input).sort(lineCollator.compare).join('\n'),
        summary: '已按本地排序规则排列各行。',
      };
    case 'format-json':
      try {
        return {
          ok: true,
          output: JSON.stringify(JSON.parse(input), null, 2),
          summary: 'JSON 有效，已完成格式化。',
        };
      } catch {
        return { ok: false, message: 'JSON 格式无效，请修正后重新处理。' };
      }
    case 'replace':
      if (!options.find) {
        return { ok: false, message: '请输入用于查找的正则表达式。' };
      }
      try {
        return {
          ok: true,
          output: input.replace(new RegExp(options.find, 'g'), options.replaceWith),
          summary: '已完成全部正则替换。',
        };
      } catch {
        return { ok: false, message: '正则表达式无效，请检查查找条件。' };
      }
  }
}
