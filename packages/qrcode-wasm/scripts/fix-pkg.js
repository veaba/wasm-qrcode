#!/usr/bin/env node
/**
 * 修复 wasm-pack 生成的 package.json
 * 修改 name 为 @veaba/qrcode-wasm
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, '..', 'pkg', 'package.json');

const packageJSON = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const pkg = { ...packageJSON }

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('✅ Fixed pkg/package.json name to @veaba/qrcode-wasm');
