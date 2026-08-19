type SemanticVersion = Readonly<{
  major: number;
  minor: number;
  patch: number;
}>;

const semanticVersionExpression = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function parseSemanticVersion(value: string): SemanticVersion | undefined {
  const match = semanticVersionExpression.exec(value);

  if (!match) {
    return undefined;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/** 仅接受稳定的 `major.minor.patch` 版本，预发布版本须在未来另行定义兼容策略。 */
export function isSemanticVersion(value: string): boolean {
  return parseSemanticVersion(value) !== undefined;
}

/**
 * 判断平台版本是否满足工具声明的最低版本。输入必须为稳定语义化版本；
 * 不合法的任一版本都会得到 `false`，防止无效清单被误判为兼容。
 */
export function isPlatformVersionCompatible(
  platformVersion: string,
  minimumPlatformVersion: string,
): boolean {
  const platform = parseSemanticVersion(platformVersion);
  const minimum = parseSemanticVersion(minimumPlatformVersion);

  if (!platform || !minimum) {
    return false;
  }

  if (platform.major !== minimum.major) {
    return platform.major > minimum.major;
  }

  if (platform.minor !== minimum.minor) {
    return platform.minor > minimum.minor;
  }

  return platform.patch >= minimum.patch;
}
