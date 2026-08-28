import { useState } from 'react';
import {
  Button,
  HorizontalTabs,
  Disclosure,
  EmptyState,
  InlineMessage,
  SelectField,
  StatusBadge,
  TextAreaField,
  TextField,
} from '@allmytools/ui';
import { manifest } from './manifest';
import {
  loadTextWorkbenchPresets,
  loadTextWorkbenchWorkspace,
  saveTextWorkbenchPresets,
  saveTextWorkbenchWorkspace,
  type TextWorkbenchHistoryEntry,
  type TextWorkbenchPreset,
} from './storage';
import { textOperationDefinitions, transformText, type TextOperation } from './transforms';

export { manifest };

const maximumHistoryEntries = 8;

function isTextOperation(value: string): value is TextOperation {
  return textOperationDefinitions.some((operation) => operation.id === value);
}

export function ToolView() {
  const [initialWorkspace] = useState(() => loadTextWorkbenchWorkspace(window.localStorage));
  const [source, setSource] = useState(initialWorkspace.source);
  const [result, setResult] = useState<string | undefined>(initialWorkspace.result);
  const [history, setHistory] = useState<readonly TextWorkbenchHistoryEntry[]>(
    initialWorkspace.history,
  );
  const [presets, setPresets] = useState<readonly TextWorkbenchPreset[]>(() =>
    loadTextWorkbenchPresets(window.localStorage),
  );
  const [operation, setOperation] = useState<TextOperation>('trim');
  const [find, setFind] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(() => Boolean(initialWorkspace.source));

  function updateSource(value: string) {
    setSource(value);
    setResult(undefined);
    setError(undefined);
    setMessage(undefined);
    setSaved(false);
  }

  function processSource() {
    const transform = transformText(source, operation, { find, replaceWith });
    if (!transform.ok) {
      setError(transform.message);
      setMessage(undefined);
      return;
    }

    const entry: TextWorkbenchHistoryEntry = {
      id: `${Date.now()}-${history.length}`,
      input: source,
      output: transform.output,
      operation,
    };
    setResult(transform.output);
    setHistory((current) => [entry, ...current].slice(0, maximumHistoryEntries));
    setError(undefined);
    setMessage(transform.summary);
    setSaved(false);
  }

  function saveWorkspace() {
    saveTextWorkbenchWorkspace(window.localStorage, { source, result, history });
    setSaved(true);
    setError(undefined);
    setMessage('工作区已保存到本机。');
  }

  function savePreset() {
    const name = presetName.trim();
    if (!name) {
      setError('请输入预设名称后再保存。');
      return;
    }

    const preset: TextWorkbenchPreset = {
      id: `${Date.now()}-${presets.length}`,
      name,
      operation,
      find,
      replaceWith,
    };
    const nextPresets = [preset, ...presets].slice(0, 12);
    saveTextWorkbenchPresets(window.localStorage, nextPresets);
    setPresets(nextPresets);
    setPresetName('');
    setSelectedPresetId(preset.id);
    setError(undefined);
    setMessage(`预设“${name}”已保存。`);
  }

  function applyPreset(id: string) {
    setSelectedPresetId(id);
    const preset = presets.find((item) => item.id === id);
    if (!preset || !isTextOperation(preset.operation)) {
      return;
    }

    setOperation(preset.operation);
    setFind(preset.find);
    setReplaceWith(preset.replaceWith);
    setError(undefined);
    setMessage(`已应用预设“${preset.name}”。`);
  }

  function removeSelectedPreset() {
    if (!selectedPresetId) {
      return;
    }

    const removed = presets.find((preset) => preset.id === selectedPresetId);
    const nextPresets = presets.filter((preset) => preset.id !== selectedPresetId);
    saveTextWorkbenchPresets(window.localStorage, nextPresets);
    setPresets(nextPresets);
    setSelectedPresetId('');
    setMessage(removed ? `预设“${removed.name}”已删除。` : '预设已删除。');
  }

  function restoreHistoryEntry(entry: TextWorkbenchHistoryEntry) {
    if (!isTextOperation(entry.operation)) {
      return;
    }

    setSource(entry.input);
    setOperation(entry.operation);
    setResult(entry.output);
    setError(undefined);
    setMessage('已恢复该次处理结果，可继续编辑或再次处理。');
    setSaved(false);
  }

  return (
    <section className="text-workbench" aria-labelledby="text-workbench-heading">
      <p className="eyebrow">工具</p>
      <h2 id="text-workbench-heading">文本工作台</h2>
      <p className="tool-workspace-description">
        在本机处理文本。处理、恢复记录和编辑都只影响当前会话，点击保存工作区后才会写入草稿。
      </p>

      <section className="text-workbench-section" aria-labelledby="text-operation-heading">
        <div className="text-workbench-section-heading">
          <h3 id="text-operation-heading">处理方式</h3>
          <StatusBadge tone="info">
            {textOperationDefinitions.find((item) => item.id === operation)?.label}
          </StatusBadge>
        </div>
        <HorizontalTabs
          ariaLabel="文本处理方式"
          items={textOperationDefinitions.map((item) => ({
            id: item.id,
            label: item.label,
            description: item.description,
          }))}
          value={operation}
          onChange={(value) => {
            if (isTextOperation(value)) {
              setOperation(value);
              setError(undefined);
              setMessage(undefined);
            }
          }}
        />
        {operation === 'replace' ? (
          <Disclosure title="正则替换设置" defaultOpen>
            <div className="text-workbench-replace-fields">
              <TextField
                label="查找（正则）"
                description="例如：\\s+ 会匹配连续空白字符。"
                value={find}
                onChange={(event) => {
                  setFind(event.target.value);
                  setSaved(false);
                }}
              />
              <TextField
                label="替换为"
                value={replaceWith}
                onChange={(event) => {
                  setReplaceWith(event.target.value);
                  setSaved(false);
                }}
              />
            </div>
          </Disclosure>
        ) : null}
      </section>

      <section className="text-workbench-section" aria-labelledby="text-input-heading">
        <h3 id="text-input-heading">输入</h3>
        <TextAreaField
          label="待处理文本"
          description="支持多行内容；编辑后会清除尚未保存的结果。"
          rows={9}
          value={source}
          onChange={(event) => updateSource(event.target.value)}
        />
        <div className="text-workbench-actions">
          <Button onClick={processSource} disabled={!source}>
            处理文本
          </Button>
          <Button
            variant="secondary"
            onClick={saveWorkspace}
            disabled={!source && history.length === 0}
          >
            保存工作区
          </Button>
          {saved ? (
            <StatusBadge tone="success">已保存</StatusBadge>
          ) : (
            <StatusBadge>未保存</StatusBadge>
          )}
        </div>
      </section>

      {error ? (
        <InlineMessage title="无法处理文本" tone="error">
          {error}
        </InlineMessage>
      ) : null}
      {message ? <InlineMessage title="处理状态">{message}</InlineMessage> : null}

      <section className="text-workbench-section" aria-labelledby="text-result-heading">
        <h3 id="text-result-heading">结果</h3>
        {result !== undefined ? (
          <div className="text-workbench-result" key={history[0]?.id ?? 'saved-result'}>
            <TextAreaField label="处理结果" rows={9} value={result} readOnly />
          </div>
        ) : (
          <EmptyState
            title="尚无处理结果"
            description="选择一种处理方式并执行后，结果会显示在这里。"
          />
        )}
      </section>

      <section className="text-workbench-section" aria-labelledby="text-preset-heading">
        <h3 id="text-preset-heading">处理预设</h3>
        <div className="text-workbench-preset-grid">
          <TextField
            label="预设名称"
            placeholder="例如：清理日志空行"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
          />
          <Button variant="secondary" onClick={savePreset}>
            保存预设
          </Button>
        </div>
        {presets.length ? (
          <div className="text-workbench-preset-actions">
            <SelectField
              label="已保存预设"
              options={[
                { value: '', label: '选择一个预设' },
                ...presets.map((preset) => ({ value: preset.id, label: preset.name })),
              ]}
              value={selectedPresetId}
              onChange={(event) => applyPreset(event.target.value)}
            />
            <Button variant="danger" disabled={!selectedPresetId} onClick={removeSelectedPreset}>
              删除预设
            </Button>
          </div>
        ) : (
          <p className="text-workbench-muted">保存常用处理方式后，它会显示在这里。</p>
        )}
      </section>

      <section className="text-workbench-section" aria-labelledby="text-history-heading">
        <div className="text-workbench-section-heading">
          <h3 id="text-history-heading">本次处理记录</h3>
          <StatusBadge>{history.length}/8</StatusBadge>
        </div>
        {history.length ? (
          <div className="text-workbench-history">
            {history.map((entry, index) => (
              <div className="text-workbench-history-item" key={entry.id}>
                <div>
                  <strong>
                    {textOperationDefinitions.find((item) => item.id === entry.operation)?.label ??
                      entry.operation}
                  </strong>
                  <p>
                    第 {history.length - index} 次结果，{entry.output.length} 个字符。
                  </p>
                </div>
                <Button variant="secondary" onClick={() => restoreHistoryEntry(entry)}>
                  恢复
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="尚无处理记录" description="每次成功处理都会保留在当前会话中。" />
        )}
      </section>
    </section>
  );
}
