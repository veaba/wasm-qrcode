#!/usr/bin/env node

/**
 * 发包前检查脚本
 * 验证所有包的发布条件
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

function check(condition, message) {
  if (condition) {
    log(`  ✅ ${message}`, 'green');
    return true;
  } else {
    log(`  ❌ ${message}`, 'red');
    return false;
  }
}

const packages = [
  { name: '@veaba/qrcode-shared', path: 'packages/qrcode-shared' },
  { name: '@veaba/qrcode-wasm', path: 'packages/qrcode-wasm' },
  { name: '@veaba/qrcode-node', path: 'packages/qrcode-node' },
  { name: '@veaba/qrcode-bun', path: 'packages/qrcode-bun' },
  { name: '@veaba/qrcode-js', path: 'packages/qrcode-js' },
];

let allPassed = true;

log('', 'bright');
log('╔══════════════════════════════════════════════════════════════════════╗', 'blue');
log('║           🔍 发包前检查                                              ║', 'blue');
log('║           Pre-publish Check                                          ║', 'blue');
log('╚══════════════════════════════════════════════════════════════════════╝', 'blue');
log('', 'bright');

// 1. 检查 npm 登录
log('\n📦 npm 认证检查', 'bright');
try {
  const user = execSync('npm whoami', { encoding: 'utf-8' }).trim();
  check(true, `已登录 npm: ${user}`);
} catch {
  check(false, '未登录 npm，请运行: npm login');
  allPassed = false;
}

// 2. 检查 git 状态
log('\n📁 Git 状态检查', 'bright');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
  if (status) {
    check(false, '有未提交的更改');
    log('    请提交所有更改后再发布', 'yellow');
    allPassed = false;
  } else {
    check(true, '工作区干净');
  }
} catch {
  check(false, '无法获取 git 状态');
  allPassed = false;
}

// 3. 检查每个包
log('\n📋 包检查', 'bright');

for (const pkg of packages) {
  log(`\n  ${pkg.name}:`, 'blue');

  const pkgPath = path.join(rootDir, pkg.path);
  const pkgJsonPath = path.join(pkgPath, 'package.json');

  // 检查 package.json 是否存在
  if (!check(fs.existsSync(pkgJsonPath), 'package.json 存在')) {
    allPassed = false;
    continue;
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  // 检查必要字段
  check(pkgJson.name, 'name 字段存在') || (allPassed = false);
  check(pkgJson.version, 'version 字段存在') || (allPassed = false);
  check(pkgJson.description, 'description 字段存在') || (allPassed = false);
  check(pkgJson.main || pkgJson.module, 'main/module 字段存在') || (allPassed = false);

  // 检查版本格式
  const versionRegex = /^\d+\.\d+\.\d+/;
  check(versionRegex.test(pkgJson.version), `版本号格式正确: ${pkgJson.version}`) || (allPassed = false);

  // 检查构建产物
  if (pkg.name === '@veaba/qrcode-wasm') {
    const pkgDir = path.join(pkgPath, 'pkg');
    check(fs.existsSync(pkgDir), 'pkg 目录存在') || (allPassed = false);
    check(fs.existsSync(path.join(pkgDir, 'package.json')), 'pkg/package.json 存在') || (allPassed = false);
  } else if (pkg.name === '@veaba/qrcode-bun') {
    // Bun 包直接使用 TypeScript 源码
    const srcDir = path.join(pkgPath, 'src');
    check(fs.existsSync(srcDir), 'src 目录存在') || (allPassed = false);
    check(fs.existsSync(path.join(srcDir, 'index.ts')), 'src/index.ts 存在') || (allPassed = false);
  } else {
    const distDir = path.join(pkgPath, 'dist');
    check(fs.existsSync(distDir), 'dist 目录存在') || (allPassed = false);
    check(fs.existsSync(path.join(distDir, 'index.js')), 'dist/index.js 存在') || (allPassed = false);
    check(fs.existsSync(path.join(distDir, 'index.d.ts')), 'dist/index.d.ts 存在') || (allPassed = false);
  }

  // 检查 README
  check(fs.existsSync(path.join(pkgPath, 'README.md')), 'README.md 存在') || (allPassed = false);

  // 检查远程版本
  try {
    const remoteVersion = execSync(`npm view ${pkg.name} version --silent 2>nul || echo "not found"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    if (remoteVersion === 'not found') {
      check(true, '新包（未发布）');
    } else {
      const localVersion = pkgJson.version;
      if (remoteVersion === localVersion) {
        check(false, `版本 ${localVersion} 已存在，请更新版本号`);
        allPassed = false;
      } else {
        check(true, `版本更新: ${remoteVersion} → ${localVersion}`);
      }
    }
  } catch {
    check(true, '无法检查远程版本（可能是新包）');
  }
}

// 4. 汇总
log('\n' + '='.repeat(70), 'bright');

if (allPassed) {
  log('✅ 所有检查通过，可以发布！', 'green');
  log('\n发布命令:', 'bright');
  log('  pnpm run publish:all       # 发布所有包', 'blue');
  log('  pnpm run publish:dry-run   # 预览发布内容', 'blue');
  process.exit(0);
} else {
  log('❌ 检查未通过，请修复上述问题后再发布', 'red');
  process.exit(1);
}
