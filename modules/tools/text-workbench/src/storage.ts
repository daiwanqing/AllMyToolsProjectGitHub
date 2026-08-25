export const textWorkbenchDraftStorageKey = 'tools.text-workbench.draft';
export const textWorkbenchPresetStorageKey = 'tools.text-workbench.presets';

export type TextWorkbenchStorage = Readonly<Pick<Storage, 'getItem' | 'setItem'>>;

export type TextWorkbenchHistoryEntry = Readonly<{
  id: string;
  input: string;
  operation: string;
  output: string;
}>;

export type TextWorkbenchWorkspace = Readonly<{
  source: string;
  result: string | undefined;
  history: readonly TextWorkbenchHistoryEntry[];
}>;

export type TextWorkbenchPreset = Readonly<{
  id: string;
  name: string;
  operation: string;
  find: string;
  replaceWith: string;
}>;

const emptyWorkspace: TextWorkbenchWorkspace = {
  source: '',
  result: undefined,
  history: [],
};

function isHistoryEntry(value: unknown): value is TextWorkbenchHistoryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.input === 'string' &&
    typeof entry.operation === 'string' &&
    typeof entry.output === 'string'
  );
}

function isWorkspace(value: unknown): value is TextWorkbenchWorkspace {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const workspace = value as Record<string, unknown>;
  return (
    typeof workspace.source === 'string' &&
    (typeof workspace.result === 'string' || workspace.result === null) &&
    Array.isArray(workspace.history) &&
    workspace.history.every(isHistoryEntry)
  );
}

function isPreset(value: unknown): value is TextWorkbenchPreset {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const preset = value as Record<string, unknown>;
  return (
    typeof preset.id === 'string' &&
    typeof preset.name === 'string' &&
    typeof preset.operation === 'string' &&
    typeof preset.find === 'string' &&
    typeof preset.replaceWith === 'string'
  );
}

/** 兼容早期仅保存纯文本草稿的存储格式。 */
export function loadTextWorkbenchWorkspace(storage: TextWorkbenchStorage): TextWorkbenchWorkspace {
  const stored = storage.getItem(textWorkbenchDraftStorageKey);
  if (!stored) {
    return emptyWorkspace;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (isWorkspace(parsed)) {
      return {
        source: parsed.source,
        result: parsed.result ?? undefined,
        history: parsed.history.slice(0, 8),
      };
    }
  } catch {
    // The legacy draft is plain text, so it intentionally falls through.
  }

  return { ...emptyWorkspace, source: stored };
}

export function saveTextWorkbenchWorkspace(
  storage: TextWorkbenchStorage,
  workspace: TextWorkbenchWorkspace,
): void {
  storage.setItem(
    textWorkbenchDraftStorageKey,
    JSON.stringify({
      source: workspace.source,
      result: workspace.result ?? null,
      history: workspace.history.slice(0, 8),
    }),
  );
}

export function loadTextWorkbenchPresets(
  storage: TextWorkbenchStorage,
): readonly TextWorkbenchPreset[] {
  const stored = storage.getItem(textWorkbenchPresetStorageKey);
  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isPreset).slice(0, 12) : [];
  } catch {
    return [];
  }
}

export function saveTextWorkbenchPresets(
  storage: TextWorkbenchStorage,
  presets: readonly TextWorkbenchPreset[],
): void {
  storage.setItem(textWorkbenchPresetStorageKey, JSON.stringify(presets.slice(0, 12)));
}
