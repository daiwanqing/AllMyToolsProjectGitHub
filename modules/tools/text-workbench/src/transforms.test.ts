import { describe, expect, it } from 'vitest';
import { transformText } from './transforms';

describe('text transforms', () => {
  it('applies line-oriented operations without changing the source value', () => {
    const input = '乙\r\n甲\r\n甲\r\n\r\n';

    expect(transformText(input, 'normalize-lines', { find: '', replaceWith: '' })).toMatchObject({
      ok: true,
      output: '乙\n甲\n甲\n\n',
    });
    expect(transformText(input, 'remove-empty-lines', { find: '', replaceWith: '' })).toMatchObject(
      {
        ok: true,
        output: '乙\n甲\n甲',
      },
    );
    expect(transformText(input, 'deduplicate-lines', { find: '', replaceWith: '' })).toMatchObject({
      ok: true,
      output: '乙\n甲\n',
    });
    expect(transformText(input, 'sort-lines', { find: '', replaceWith: '' })).toMatchObject({
      ok: true,
      output: '\n\n甲\n甲\n乙',
    });
    expect(input).toBe('乙\r\n甲\r\n甲\r\n\r\n');
  });

  it('formats valid JSON and reports invalid JSON as a recoverable error', () => {
    expect(
      transformText('{"name":"AllMyTools"}', 'format-json', { find: '', replaceWith: '' }),
    ).toEqual({
      ok: true,
      output: '{\n  "name": "AllMyTools"\n}',
      summary: 'JSON 有效，已完成格式化。',
    });
    expect(transformText('{', 'format-json', { find: '', replaceWith: '' })).toEqual({
      ok: false,
      message: 'JSON 格式无效，请修正后重新处理。',
    });
  });

  it('replaces every regular-expression match and exposes invalid input', () => {
    expect(
      transformText('alpha 123 beta 456', 'replace', { find: '\\d+', replaceWith: '#' }),
    ).toEqual({
      ok: true,
      output: 'alpha # beta #',
      summary: '已完成全部正则替换。',
    });
    expect(transformText('text', 'replace', { find: '(', replaceWith: '' })).toEqual({
      ok: false,
      message: '正则表达式无效，请检查查找条件。',
    });
  });
});
