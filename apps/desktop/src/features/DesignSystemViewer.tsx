import { useMemo, useState } from 'react';
import { resolveThemeTokens, type ThemeName } from '@allmytools/design-tokens';
import { Button, InlineMessage, TextField } from '@allmytools/ui';
import { Copy } from 'lucide-react';

type TokenLayer = 'primitive' | 'semantic' | 'component';

type TokenRow = Readonly<{
  layer: TokenLayer;
  name: string;
  value: string;
}>;

const layerLabels: Readonly<Record<TokenLayer, string>> = {
  primitive: '原始',
  semantic: '语义',
  component: '组件',
};

function tokenRows(theme: ThemeName): readonly TokenRow[] {
  const tokens = resolveThemeTokens(theme);
  const groups: ReadonlyArray<Readonly<{ layer: TokenLayer; values: Record<string, string> }>> = [
    { layer: 'primitive', values: tokens.primitive },
    { layer: 'semantic', values: tokens.semantic },
    { layer: 'component', values: tokens.component },
  ];

  return groups.flatMap(({ layer, values }) =>
    Object.entries(values).map(([name, value]) => ({ layer, name, value })),
  );
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function TokenValue({ value }: Readonly<{ value: string }>) {
  const isColor = value.startsWith('#');

  return (
    <span className="token-value">
      {isColor ? (
        <span className="token-swatch" style={{ backgroundColor: value }} aria-hidden="true" />
      ) : null}
      <code>{value}</code>
    </span>
  );
}

export function DesignSystemViewer({ theme }: Readonly<{ theme: ThemeName }>) {
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState<string>();
  const currentRows = useMemo(() => tokenRows(theme), [theme]);
  const lightSemantic = useMemo(() => resolveThemeTokens('light').semantic, []);
  const darkSemantic = useMemo(() => resolveThemeTokens('dark').semantic, []);
  const normalizedFilter = filter.trim().toLocaleLowerCase('zh-CN');
  const filteredRows = currentRows.filter((row) =>
    `${row.layer} ${row.name} ${row.value}`.toLocaleLowerCase('zh-CN').includes(normalizedFilter),
  );

  async function copyToken(name: string, value: string) {
    try {
      await copyText(`${name}: ${value}`);
      setCopied(name);
    } catch {
      setCopied('复制失败，请手动选择 Token 名称。');
    }
  }

  return (
    <section
      className="settings-section design-system-viewer"
      aria-labelledby="design-system-heading"
    >
      <p className="eyebrow">开发者</p>
      <h2 id="design-system-heading">设计系统查看器</h2>
      <p>当前主题为{theme === 'light' ? '浅色' : '深色'}，下方数据直接来自设计 Token 包。</p>

      <div className="token-viewer-toolbar">
        <TextField
          label="筛选 Token"
          placeholder="按层级、名称或值筛选"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <span>{filteredRows.length} 个 Token</span>
      </div>

      <div className="token-table-wrap" tabIndex={0} aria-label="当前主题 Token 列表">
        <table className="token-table">
          <thead>
            <tr>
              <th scope="col">层级</th>
              <th scope="col">Token</th>
              <th scope="col">当前解析值</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={`${row.layer}-${row.name}`}>
                <td>{layerLabels[row.layer]}</td>
                <td>
                  <code>{row.name}</code>
                </td>
                <td>
                  <TokenValue value={row.value} />
                </td>
                <td>
                  <button
                    className="icon-button token-copy-button"
                    type="button"
                    title={`复制 ${row.name}`}
                    aria-label={`复制 ${row.name}`}
                    onClick={() => void copyToken(row.name, row.value)}
                  >
                    <Copy aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {copied ? (
        <InlineMessage title="复制状态">
          {copied === '复制失败，请手动选择 Token 名称。' ? copied : `已复制 ${copied}。`}
        </InlineMessage>
      ) : null}

      <div className="theme-comparison" aria-labelledby="theme-comparison-heading">
        <h3 id="theme-comparison-heading">语义 Token 对比</h3>
        <div className="theme-comparison-table-wrap" tabIndex={0}>
          <table className="token-table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">浅色</th>
                <th scope="col">深色</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(lightSemantic).map((name) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>
                    <TokenValue value={lightSemantic[name as keyof typeof lightSemantic]} />
                  </td>
                  <td>
                    <TokenValue value={darkSemantic[name as keyof typeof darkSemantic]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="component-preview" aria-labelledby="component-preview-heading">
        <h3 id="component-preview-heading">公共组件状态</h3>
        <div className="component-preview-row">
          <Button variant="primary">主要操作</Button>
          <Button variant="secondary">次要操作</Button>
          <Button variant="ghost">无边框操作</Button>
          <Button loading>加载中</Button>
          <Button disabled>不可用</Button>
        </div>
        <div className="component-preview-fields">
          <TextField label="默认输入" placeholder="输入内容" />
          <TextField label="错误输入" error="请输入有效内容。" value="无效示例" readOnly />
          <TextField label="禁用输入" value="不可编辑" disabled readOnly />
        </div>
        <InlineMessage title="信息状态">这是来自公共组件的原位提示。</InlineMessage>
        <InlineMessage title="错误状态" tone="error">
          这是来自公共组件的可恢复错误提示。
        </InlineMessage>
      </div>
    </section>
  );
}
