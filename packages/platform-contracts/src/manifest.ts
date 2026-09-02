import {
  capabilities,
  toolCategories,
  toolSubcategories,
  type ManifestValidationIssue,
  type ManifestValidationResult,
  type ToolManifest,
} from './types';
import { isSemanticVersion } from './version';

const toolIdExpression = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

function issue(
  code: ManifestValidationIssue['code'],
  field: ManifestValidationIssue['field'],
  message: string,
): ManifestValidationIssue {
  return { code, field, message };
}

function isKnownCapability(value: string): value is ToolManifest['capabilities'][number] {
  return capabilities.includes(value as (typeof capabilities)[number]);
}

/**
 * 对构建期工具清单执行运行时边界校验。注册表唯一性和能力授予属于外层服务，
 * 因此不在此纯契约包内处理。
 */
export function validateToolManifest(manifest: ToolManifest): ManifestValidationResult {
  const issues: ManifestValidationIssue[] = [];

  if (!toolIdExpression.test(manifest.id)) {
    issues.push(issue('invalid-id', 'id', '工具 ID 必须使用小写字母、数字、点或连字符。'));
  }

  if (manifest.name.trim().length === 0) {
    issues.push(issue('missing-name', 'name', '工具名称不能为空。'));
  }

  if (!isSemanticVersion(manifest.version)) {
    issues.push(issue('invalid-version', 'version', '工具版本必须为稳定语义化版本。'));
  }

  if (!toolCategories.includes(manifest.category)) {
    issues.push(issue('invalid-category', 'category', '工具分类不受平台支持。'));
  }

  if (
    !toolCategories.includes(manifest.category) ||
    !(toolSubcategories[manifest.category] as readonly string[]).includes(manifest.subcategory)
  ) {
    issues.push(
      issue('invalid-subcategory', 'subcategory', '工具二级分类必须存在且属于当前一级模块。'),
    );
  }

  if (manifest.entry.trim().length === 0) {
    issues.push(issue('missing-entry', 'entry', '工具入口不能为空。'));
  }

  if (manifest.icon.trim().length === 0) {
    issues.push(issue('missing-icon', 'icon', '工具图标不能为空。'));
  }

  const seenCapabilities = new Set<string>();
  for (const capability of manifest.capabilities) {
    if (!isKnownCapability(capability)) {
      issues.push(issue('invalid-capability', 'capabilities', `不支持能力“${capability}”。`));
      continue;
    }

    if (seenCapabilities.has(capability)) {
      issues.push(
        issue('duplicate-capability', 'capabilities', `能力“${capability}”不能重复声明。`),
      );
      continue;
    }

    seenCapabilities.add(capability);
  }

  if (!isSemanticVersion(manifest.minPlatformVersion)) {
    issues.push(
      issue(
        'invalid-min-platform-version',
        'minPlatformVersion',
        '最低平台版本必须为稳定语义化版本。',
      ),
    );
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, manifest };
}

/** 在工具模块导出清单时快速失败，避免错误配置传播到桌面壳。 */
export function defineToolManifest(manifest: ToolManifest): ToolManifest {
  const result = validateToolManifest(manifest);

  if (!result.ok) {
    throw new Error(result.issues.map((item) => item.message).join(' '));
  }

  return result.manifest;
}
