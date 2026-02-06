#!/usr/bin/env node
/**
 * 修复 wasm-pack 生成的 package.json
 * 修改 name 为 @veaba/qrcode-wasm
 * 删除 .gitignore 以便 npm 能包含 pkg 目录
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.join(__dirname, '..', 'pkg');
const pkgPath = path.join(pkgDir, 'package.json');
const gitignorePath = path.join(pkgDir, '.gitignore');

// 修复 package.json
const packageJSON = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const pkg = { ...packageJSON }

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('✅ Fixed pkg/package.json name to @veaba/qrcode-wasm');

// 删除 .gitignore 以便 npm 包含 pkg 目录
if (fs.existsSync(gitignorePath)) {
  fs.unlinkSync(gitignorePath);
  console.log('✅ Removed pkg/.gitignore for npm publishing');
}
