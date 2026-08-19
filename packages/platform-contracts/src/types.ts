/** 独立工具所属的产品域。 */
export const toolCategories = ['learning', 'entertainment', 'tools'] as const;

export type ToolCategory = (typeof toolCategories)[number];

/** 工具可以声明但不能自行授予的受限平台能力。 */
export const capabilities = [
  'filesystem',
  'network',
  'camera',
  'system-command',
  'clipboard',
  'cloud-account',
] as const;

export type Capability = (typeof capabilities)[number];

/**
 * 构建期随工具打包的静态描述。`entry` 为工具包相对于其公开入口的模块标识，
 * 不承担动态 URL 或文件路径解析职责。
 */
export type ToolManifest = Readonly<{
  id: string;
  name: string;
  description?: string;
  version: string;
  category: ToolCategory;
  entry: string;
  icon: string;
  capabilities: readonly Capability[];
  minPlatformVersion: string;
}>;

export const toolLifecycleStates = [
  'registered',
  'capability-checked',
  'loaded',
  'active',
  'suspended',
  'disposed',
] as const;

export type ToolLifecycleState = (typeof toolLifecycleStates)[number];

export type ToolLifecycleTransition = Readonly<{
  from: ToolLifecycleState;
  to: ToolLifecycleState;
}>;

export type ManifestValidationIssueCode =
  | 'invalid-id'
  | 'missing-name'
  | 'invalid-version'
  | 'invalid-category'
  | 'missing-entry'
  | 'missing-icon'
  | 'invalid-capability'
  | 'duplicate-capability'
  | 'invalid-min-platform-version';

export type ManifestValidationIssue = Readonly<{
  code: ManifestValidationIssueCode;
  field: keyof ToolManifest;
  message: string;
}>;

export type ManifestValidationResult =
  | Readonly<{ ok: true; manifest: ToolManifest }>
  | Readonly<{ ok: false; issues: readonly ManifestValidationIssue[] }>;
