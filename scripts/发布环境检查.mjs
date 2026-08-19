import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const repositoryRoot = process.cwd();
const checks = [];

function record(status, name, detail) {
  checks.push({ status, name, detail });
}

function command(commandName, args = []) {
  const candidates =
    process.platform === 'win32'
      ? [commandName, `${commandName}.cmd`, `${commandName}.exe`]
      : [commandName];

  for (const candidate of candidates) {
    try {
      const executable = candidate.endsWith('.cmd')
        ? [process.env.ComSpec ?? 'cmd.exe', ['/d', '/c', candidate, ...args]]
        : [candidate, args];
      return execFileSync(executable[0], executable[1], {
        cwd: repositoryRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      }).trim();
    } catch {
      // Try the next Windows executable suffix when the bare name is not directly runnable.
    }
  }

  return undefined;
}

function majorVersion(value) {
  const match = value?.match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

const nodeVersion = process.version;
if ((majorVersion(nodeVersion) ?? 0) >= 20) {
  record('通过', 'Node.js', `${nodeVersion}（满足 Node.js 20+）`);
} else {
  record('失败', 'Node.js', `${nodeVersion}（需要 Node.js 20+）`);
}

const pnpmVersion = command('pnpm', ['--version']);
if (pnpmVersion === '9.15.5') {
  record('通过', 'pnpm', pnpmVersion);
} else if (pnpmVersion) {
  record('警告', 'pnpm', `检测到 ${pnpmVersion}，工作区锁定 pnpm 9.15.5`);
} else {
  const npmVersion = command('npm', ['--version']);
  record(
    npmVersion ? '警告' : '失败',
    'pnpm',
    npmVersion
      ? `未找到独立 pnpm，但可使用 npm ${npmVersion} 运行根目录 BAT 的临时兼容模式。`
      : '未找到 pnpm 或 npm；无法安装工作区依赖。',
  );
}

const cargoVersion = command('cargo', ['--version']);
if (cargoVersion) {
  record('通过', 'Cargo', cargoVersion);
} else {
  record('失败', 'Cargo', '未找到 Cargo；无法构建 Tauri 原生宿主。');
}

const rustupTargets = command('rustup', ['target', 'list', '--installed']);
const currentTarget = process.platform === 'win32' ? 'x86_64-pc-windows-msvc' : undefined;
if (currentTarget && rustupTargets?.split(/\r?\n/).includes(currentTarget)) {
  record('通过', 'Windows Rust 目标', currentTarget);
} else if (currentTarget) {
  record('失败', 'Windows Rust 目标', `缺少 ${currentTarget}`);
} else {
  record(
    '警告',
    '当前平台 Rust 目标',
    '预检脚本未对该平台指定固定目标，请在对应构建机执行 Tauri 构建。',
  );
}

const configPath = join(repositoryRoot, 'apps', 'desktop', 'src-tauri', 'tauri.conf.json');
try {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const configuredTargets = config.bundle?.targets ?? '未指定';
  record('通过', 'Tauri 配置', `应用 ${config.productName}，bundle.targets=${configuredTargets}`);
} catch {
  record('失败', 'Tauri 配置', `无法读取 ${configPath}`);
}

const releaseExecutable = join(
  repositoryRoot,
  'apps',
  'desktop',
  'src-tauri',
  'target',
  'release',
  process.platform === 'win32' ? 'allmytools-desktop.exe' : 'allmytools-desktop',
);
if (existsSync(releaseExecutable)) {
  record('通过', 'Release 应用产物', releaseExecutable);
} else {
  record('警告', 'Release 应用产物', '尚未生成；执行 tauri build --no-bundle 进行本机验证。');
}

if (process.platform === 'win32') {
  const wix = command('candle', ['-?']);
  const signingTool = command('signtool', ['/?']);
  record(
    wix ? '通过' : '警告',
    'Windows WiX',
    wix ? '已找到 candle.exe' : '未找到 WiX candle.exe，MSI 可能无法生成。',
  );
  record(
    signingTool ? '通过' : '警告',
    'Windows 代码签名',
    signingTool ? '已找到 signtool.exe' : '未找到 signtool.exe，发布包尚未具备签名条件。',
  );
  record(
    '警告',
    'macOS 发布验证',
    '当前为 Windows 构建机，需在 macOS 13+ 构建机验证 .app、DMG、签名与公证。',
  );
} else if (process.platform === 'darwin') {
  record(
    existsSync('/usr/bin/codesign') ? '通过' : '失败',
    'macOS 代码签名',
    existsSync('/usr/bin/codesign') ? '已找到 codesign' : '未找到 codesign',
  );
  record(
    existsSync('/usr/bin/xcrun') ? '通过' : '失败',
    'macOS 公证工具',
    existsSync('/usr/bin/xcrun') ? '已找到 xcrun' : '未找到 xcrun',
  );
  record(
    '警告',
    'Windows 发布验证',
    '当前为 macOS 构建机，需在 Windows 构建机验证 MSI 与 signtool。',
  );
} else {
  record(
    '警告',
    '桌面发布平台',
    `当前平台 ${process.platform} 不在首发 Windows/macOS 验证范围内。`,
  );
}

for (const check of checks) {
  console.log(`[${check.status}] ${check.name}: ${check.detail}`);
}

const failures = checks.filter(({ status }) => status === '失败');
console.log(
  `\n发布预检完成：${checks.length - failures.length}/${checks.length} 项未发现硬性失败。`,
);
process.exitCode = failures.length > 0 ? 1 : 0;
