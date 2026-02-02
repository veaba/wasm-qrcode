# 📦 发包引导文档

> 如何将 @veaba/qrcode 生态包发布到 npm 和 crates.io

---

## 📋 目录

1. [前置准备](#前置准备)
2. [发包前检查](#发包前检查)
3. [构建流程](#构建流程)
4. [版本管理](#版本管理)
5. [发包步骤](#发包步骤)
6. [验证发布](#验证发布)
7. [常见问题](#常见问题)

---

## 前置准备

### 1. 注册 npm 账号

如果你还没有 npm 账号，请先注册：

```bash
# 在 npm 官网注册
# https://www.npmjs.com/signup

# 或者在命令行注册
npm adduser
```

### 2. 登录 npm

```bash
# 登录 npm
npm login

# 验证登录状态
npm whoami
```

### 3. 检查包名可用性

确保你要发布的包名在 npm 上可用：

```bash
# 检查包名是否被占用
npm view @veaba/qrcode-wasm

# 如果返回 404，说明包名可用
```

### 4. 配置发布权限

确保你在 `@veaba` 组织下有发布权限：

```bash
# 查看组织成员
npm org ls @veaba

# 添加成员（如果是组织管理员）
npm org add @veaba <username>
```

---

## 发包前检查

### 1. 代码检查

```bash
# 运行测试
pnpm test

# 检查 TypeScript 类型
pnpm run type-check

# 代码格式化检查
pnpm run lint

# 构建所有包
pnpm run build
```

### 2. 更新版本号

检查每个包的 `package.json` 版本号：

```bash
# 查看当前版本
node -e "console.log(require('./packages/qrcode-wasm/package.json').version)"
```

### 3. 更新 CHANGELOG

确保每个包都有更新日志：

```bash
# 检查 CHANGELOG 是否存在
ls packages/*/CHANGELOG.md
```

---

## 构建流程

### 1. 安装依赖

```bash
# 根目录安装
pnpm install

# 安装所有包的依赖
pnpm -r install
```

### 2. 构建顺序

按照依赖顺序构建（从底层到上层）：

```bash
# 1. 构建 shared（被所有包依赖）
cd packages/shared
pnpm run build

# 2. 构建 qrcode-wasm（WASM 包）
cd ../qrcode-wasm
wasm-pack build --target web

# 3. 构建 qrcode-node
cd ../qrcode-node
pnpm run build

# 4. 构建 qrcode-bun
cd ../qrcode-bun
pnpm run build

# 5. 构建 qrcode-js
cd ../qrcode-js
pnpm run build
```

### 3. 验证构建产物

```bash
# 检查构建产物是否存在
ls packages/shared/dist/
ls packages/qrcode-node/dist/
ls packages/qrcode-bun/dist/
ls packages/qrcode-js/dist/
ls packages/qrcode-wasm/pkg/
```

---

## 版本管理

### 语义化版本规范

| 版本类型 | 说明 | 示例 |
|---------|------|------|
| major | 破坏性更新 | 1.0.0 → 2.0.0 |
| minor | 新功能，向后兼容 | 1.0.0 → 1.1.0 |
| patch | bug 修复 | 1.0.0 → 1.0.1 |

### 版本更新命令

```bash
# 更新 patch 版本
pnpm version patch

# 更新 minor 版本
pnpm version minor

# 更新 major 版本
pnpm version major

# 指定版本
pnpm version 1.2.3
```

### 批量更新版本

```bash
# 更新所有包的版本（推荐保持版本一致）
cd packages/shared && pnpm version 1.0.1
cd packages/qrcode-wasm && pnpm version 1.0.1
cd packages/qrcode-node && pnpm version 1.0.1
cd packages/qrcode-bun && pnpm version 1.0.1
cd packages/qrcode-js && pnpm version 1.0.1
cd packages/qrcode-rust && pnpm version 1.0.1
```

---

## 发包步骤

### 方式一：手动逐个发包

#### 1. 发布 @veaba/qrcode-shared

```bash
cd packages/shared

# 检查包内容
npm pack --dry-run

# 发布（公开访问）
npm publish --access public
```

#### 2. 发布 @veaba/qrcode-wasm

```bash
cd packages/qrcode-wasm

# 确保 pkg 目录已生成
wasm-pack build --target web

# 进入 pkg 目录发布
cd pkg

# 检查并发布
npm pack --dry-run
npm publish --access public
```

#### 3. 发布 @veaba/qrcode-node

```bash
cd packages/qrcode-node

# 构建
pnpm run build

# 检查并发布
npm pack --dry-run
npm publish --access public
```

#### 4. 发布 @veaba/qrcode-bun

```bash
cd packages/qrcode-bun

# 构建
pnpm run build

# 检查并发布
npm pack --dry-run
npm publish --access public
```

#### 5. 发布 @veaba/qrcode-js

```bash
cd packages/qrcode-js

# 构建
pnpm run build

# 检查并发布
npm pack --dry-run
npm publish --access public
```

#### 6. 发布 qrcode-rust (Rust Crate)

`qrcode-rust` 是 Rust 原生包，发布到 **crates.io** 而不是 npm：

```bash
cd packages/qrcode-rust

# 登录 crates.io（首次需要）
cargo login

# 验证包
cargo package --list
cargo package --allow-dirty

# 发布到 crates.io
cargo publish

# 或者使用 --dry-run 先测试
cargo publish --dry-run
```

**注意**:

- 确保 `Cargo.toml` 中的 `version` 已更新
- crates.io 上的包名是 `qrcode-rust`（不带 @veaba 前缀）
- 发布后可在 <https://crates.io/crates/qrcode-rust> 查看

### 方式二：使用脚本批量发包

创建发包脚本 `scripts/publish.js`：

```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// npm 包列表（按依赖顺序）
const npmPackages = [
  { name: '@veaba/shared', path: 'packages/shared', build: 'pnpm run build' },
  { name: '@veaba/qrcode-wasm', path: 'packages/qrcode-wasm/pkg', build: 'wasm-pack build --target web' },
  { name: '@veaba/qrcode-node', path: 'packages/qrcode-node', build: 'pnpm run build' },
  { name: '@veaba/qrcode-bun', path: 'packages/qrcode-bun', build: 'pnpm run build' },
  { name: '@veaba/qrcode-js', path: 'packages/qrcode-js', build: 'pnpm run build' },
];

// Rust crate（发布到 crates.io）
const rustCrate = { name: 'qrcode-rust', path: 'packages/qrcode-rust', build: 'cargo build --release' };

// 发布 npm 包
console.log('🚀 开始批量发布 npm 包...\n');

for (const pkg of npmPackages) {
  const pkgPath = path.join(rootDir, pkg.path);
  
  console.log(`📦 发布 ${pkg.name}...`);
  
  try {
    // 构建
    if (pkg.build) {
      console.log(`  🔨 构建...`);
      execSync(pkg.build, { cwd: path.dirname(pkgPath), stdio: 'inherit' });
    }
    
    // 发布到 npm
    console.log(`  📤 发布到 npm...`);
    execSync('npm publish --access public', { cwd: pkgPath, stdio: 'inherit' });
    
    console.log(`  ✅ ${pkg.name} 发布成功\n`);
  } catch (error) {
    console.error(`  ❌ ${pkg.name} 发布失败:`, error.message);
  }
}

// 发布 Rust crate
console.log(`📦 发布 ${rustCrate.name} 到 crates.io...`);
try {
  if (rustCrate.build) {
    console.log(`  🔨 构建...`);
    execSync(rustCrate.build, { cwd: path.join(rootDir, rustCrate.path), stdio: 'inherit' });
  }
  
  console.log(`  📤 发布到 crates.io...`);
  execSync('cargo publish', { cwd: path.join(rootDir, rustCrate.path), stdio: 'inherit' });
  
  console.log(`  ✅ ${rustCrate.name} 发布成功\n`);
} catch (error) {
  console.error(`  ❌ ${rustCrate.name} 发布失败:`, error.message);
}

console.log('🎉 批量发包完成！');
```

使用脚本：

```bash
# 添加执行权限（Linux/Mac）
chmod +x scripts/publish.js

# 运行发包脚本
node scripts/publish.js
```

---

## 验证发布

### 1. 检查 npm 页面

访问以下链接确认包已发布：

- <https://www.npmjs.com/package/@veaba/qrcode-shared>
- <https://www.npmjs.com/package/@veaba/qrcode-wasm>
- <https://www.npmjs.com/package/@veaba/qrcode-node>
- <https://www.npmjs.com/package/@veaba/qrcode-bun>
- <https://www.npmjs.com/package/@veaba/qrcode-js>
- <https://crates.io/crates/qrcode-rust> (Rust crate，非 npm)

### 2. 安装测试

```bash
# 创建测试目录
mkdir test-install && cd test-install
npm init -y

# 测试安装
npm install @veaba/qrcode-wasm
npm install @veaba/qrcode-node
npm install @veaba/qrcode-bun

# 验证安装
ls node_modules/@veaba/
```

### 3. 功能测试

```javascript
// test.js
import { QRCode } from '@veaba/qrcode-node';

const qr = new QRCode('https://github.com/veaba/qrcodes');
console.log(qr.toSVG());
```

---

## 常见问题

### Q1: 发布时提示 "You do not have permission"

**原因**: 你不是该包的维护者

**解决**:

```bash
# 如果是组织包，确保在组织中有发布权限
npm org ls @veaba

# 添加权限
npm owner add <your-username> @veaba/<package-name>
```

### Q2: 发布时提示 "Package name already exists"

**原因**: 包名已被占用

**解决**:

- 更换包名
- 或者联系包所有者获取权限

### Q3: WASM 包发布失败

**原因**: `pkg` 目录未正确生成

**解决**:

```bash
cd packages/qrcode-wasm
wasm-pack build --target web

# 检查 pkg/package.json 是否存在
cat pkg/package.json
```

### Q4: 依赖包未找到

**原因**: 依赖包需要先发布

**解决**: 按照依赖顺序发布：

npm 包（按依赖顺序）：

1. `@veaba/shared` (最先)
2. `@veaba/qrcode-wasm`
3. `@veaba/qrcode-node`
4. `@veaba/qrcode-bun`
5. `@veaba/qrcode-js`

Rust crate：

- `qrcode-rust`（发布到 crates.io，独立流程）

### Q5: 版本冲突

**原因**: 远程版本比本地新

**解决**:

```bash
# 更新版本号
pnpm version patch

# 或者强制发布（不推荐）
npm publish --force
```

### Q6: 2FA 验证失败

**原因**: npm 账号启用了双因素认证

**解决**:

```bash
# 方法1: 使用 --otp 参数
npm publish --otp 123456

# 方法2: 配置 npm 自动处理
npm config set otp 123456
```

---

## 发布检查清单

发布前请确认以下事项：

- [ ] 所有测试通过
- [ ] 代码已提交到 git
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] README 已更新
- [ ] 构建产物已生成
- [ ] 已登录 npm
- [ ] 有发布权限
- [ ] 包名可用

---

## 相关命令速查

```bash
# 登录/登出
npm login
npm logout

# 查看当前用户
npm whoami

# 查看包信息
npm view @veaba/qrcode-wasm

# 查看包版本
npm view @veaba/qrcode-wasm versions

# 废弃版本
npm deprecate @veaba/qrcode-wasm@1.0.0 "deprecated message"

# 取消发布（24小时内）
npm unpublish @veaba/qrcode-wasm@1.0.0

# 查看发布历史
npm view @veaba/qrcode-wasm time
```

---

## 联系支持

如有问题，请联系：

- 🐙 GitHub: <https://github.com/veaba/qrcodes/issues>

---

> 💡 **提示**: 首次发包建议先在测试环境验证，确保流程正确后再正式发布。
