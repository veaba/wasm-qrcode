#!/usr/bin/env node

/**
 * 批量发包脚本
 * 按照依赖顺序发布所有包
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('='.repeat(70), 'bright');
  log(`  ${title}`, 'blue');
  log('='.repeat(70), 'bright');
  console.log('');
}

// 包配置（按依赖顺序）
const packages = [
  {
    name: '@veaba/qrcode-shared',
    path: 'packages/shared',
    buildCmd: 'pnpm run build',
    publishPath: 'packages/shared'
  },
  {
    name: '@veaba/qrcode-wasm',
    path: 'packages/qrcode-wasm',
    buildCmd: 'wasm-pack build --target web',
    publishPath: 'packages/qrcode-wasm/pkg'
  },
  {
    name: '@veaba/qrcode-node',
    path: 'packages/qrcode-node',
    buildCmd: 'pnpm run build',
    publishPath: 'packages/qrcode-node'
  },
  {
    name: '@veaba/qrcode-bun',
    path: 'packages/qrcode-bun',
    buildCmd: 'pnpm run build',
    publishPath: 'packages/qrcode-bun'
  },
  {
    name: '@veaba/qrcode-js',
    path: 'packages/qrcode-js',
    buildCmd: 'pnpm run build',
    publishPath: 'packages/qrcode-js'
  },
];

// 检查 npm 登录状态
function checkNpmAuth() {
  try {
    const user = execSync('npm whoami', { encoding: 'utf-8' }).trim();
    log(`✅ 已登录 npm: ${user}`, 'green');
    return true;
  } catch {
    log('❌ 未登录 npm，请先运行: npm login', 'red');
    return false;
  }
}

// 检查包是否已存在
function checkPackageExists(pkgName) {
  try {
    execSync(`npm view ${pkgName} --silent`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// 获取当前版本
function getCurrentVersion(pkgPath) {
  try {
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8'));
    return pkgJson.version;
  } catch {
    return null;
  }
}

// 构建包
function buildPackage(pkg) {
  const pkgPath = path.join(rootDir, pkg.path);

  if (!pkg.buildCmd) {
    return true;
  }

  try {
    log(`🔨 构建 ${pkg.name}...`, 'yellow');
    execSync(pkg.buildCmd, {
      cwd: pkgPath,
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    log(`❌ 构建失败: ${error.message}`, 'red');
    return false;
  }
}

// 发布包
function publishPackage(pkg, dryRun = false) {
  const publishPath = path.join(rootDir, pkg.publishPath);

  // 检查发布目录是否存在
  if (!fs.existsSync(publishPath)) {
    log(`❌ 发布目录不存在: ${publishPath}`, 'red');
    return false;
  }

  try {
    if (dryRun) {
      log(`📦 预览 ${pkg.name}...`, 'blue');
      execSync('npm pack --dry-run', {
        cwd: publishPath,
        stdio: 'inherit'
      });
    } else {
      log(`📤 发布 ${pkg.name}...`, 'blue');
      execSync('npm publish --access public', {
        cwd: publishPath,
        stdio: 'inherit'
      });
    }
    return true;
  } catch (error) {
    log(`❌ 发布失败: ${error.message}`, 'red');
    return false;
  }
}

// 主函数
async function main() {
  log('', 'bright');
  log('╔══════════════════════════════════════════════════════════════════════╗', 'blue');
  log('║           📦 批量发包工具                                            ║', 'blue');
  log('║           Publish Packages to npm                                    ║', 'blue');
  log('╚══════════════════════════════════════════════════════════════════════╝', 'blue');
  log('', 'bright');

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipBuild = args.includes('--skip-build');
  const pkgName = args.find(arg => !arg.startsWith('--'));

  // 检查 npm 登录
  if (!checkNpmAuth()) {
    process.exit(1);
  }

  // 过滤要发布的包
  let packagesToPublish = packages;
  if (pkgName) {
    packagesToPublish = packages.filter(p => p.name === pkgName);
    if (packagesToPublish.length === 0) {
      log(`❌ 未找到包: ${pkgName}`, 'red');
      process.exit(1);
    }
  }

  logSection('发包计划');

  for (const pkg of packagesToPublish) {
    const version = getCurrentVersion(path.join(rootDir, pkg.path));
    const exists = checkPackageExists(pkg.name);
    log(`${pkg.name}@${version} ${exists ? '(更新)' : '(新包)'}`, 'yellow');
  }

  if (dryRun) {
    log('\n⚠️  当前为预览模式，不会实际发布', 'yellow');
  }

  log('\n按 Enter 继续，或 Ctrl+C 取消...');
  process.stdin.once('data', () => {
    publishAll(packagesToPublish, dryRun, skipBuild);
  });
}

async function publishAll(packagesToPublish, dryRun, skipBuild) {
  logSection('开始发布');

  const results = [];

  for (const pkg of packagesToPublish) {
    log('', 'bright');
    log(`📦 ${pkg.name}`, 'bright');
    log('─'.repeat(70), 'bright');

    // 构建
    if (!skipBuild) {
      const buildSuccess = buildPackage(pkg);
      if (!buildSuccess) {
        results.push({ name: pkg.name, success: false, step: 'build' });
        continue;
      }
    }

    // 发布
    const publishSuccess = publishPackage(pkg, dryRun);
    results.push({
      name: pkg.name,
      success: publishSuccess,
      step: 'publish'
    });

    if (publishSuccess) {
      log(`✅ ${pkg.name} 处理完成`, 'green');
    }
  }

  // 汇总
  logSection('发布汇总');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;

  for (const result of results) {
    if (result.success) {
      log(`✅ ${result.name}`, 'green');
    } else {
      log(`❌ ${result.name} - 失败步骤: ${result.step}`, 'red');
    }
  }

  log('', 'bright');
  log(`总计: ${successCount} 成功, ${failCount} 失败`, successCount === results.length ? 'green' : 'yellow');

  if (!dryRun && successCount === results.length) {
    log('\n🎉 所有包发布成功！', 'green');
    log('\n查看发布结果:');
    for (const pkg of packagesToPublish) {
      log(`  https://www.npmjs.com/package/${pkg.name}`, 'blue');
    }
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('发包失败:', error);
  process.exit(1);
});
