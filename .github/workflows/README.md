# GitHub Actions 工作流

本项目使用 GitHub Actions 实现完整的 CI/CD 流水线。

## 工作流概览

| 工作流                     | 触发条件                | 说明                       |
|----------------------------|-------------------------|----------------------------|
| [CI](./ci.yml)             | Push/PR 到 main/develop | 代码检查、测试、构建         |
| [Release](./release.yml)   | 推送 tag 或手动触发     | 发布到 npm 和 crates.io    |
| [Docs](./docs.yml)         | docs/ 目录变更          | 构建和部署文档             |
| [PR Check](./pr-check.yml) | PR 创建/更新            | PR 质量检查                |
| [Weekly](./weekly.yml)     | 每周一凌晨 2 点         | 依赖更新、性能测试、安全审计 |

## 详细说明

### 1. CI (ci.yml)

**触发**: Push/PR 到 main 或 develop 分支

**任务**:

- ✅ Lint - JavaScript/TypeScript 代码检查
- ✅ Rust Check - Rust 代码格式和 clippy 检查
- ✅ Build - 构建所有包
- ✅ Test Unit - 单元测试
- ✅ Test Node - Node.js 包测试
- ✅ Benchmark - 性能基准测试

### 2. Release (release.yml)

**触发**: 推送 `v*` 标签或手动触发

**任务**:

- 📦 构建所有包
- 🚀 发布到 npm
  - @veaba/shared
  - @veaba/qrcode-js
  - @veaba/qrcode-wasm
  - @veaba/qrcode-node
  - @veaba/qrcode-bun
- 🦀 发布到 crates.io
- 📝 创建 GitHub Release
- 📚 更新文档

**所需 Secrets**:

- `NPM_TOKEN` - npm 发布令牌
- `CARGO_REGISTRY_TOKEN` - crates.io 发布令牌

### 3. Docs (docs.yml)

**触发**: docs/ 目录变更

**任务**:

- 📖 构建 Rspress 文档
- 🌐 部署到 GitHub Pages

### 4. PR Check (pr-check.yml)

**触发**: PR 创建/更新

**任务**:

- 📝 检查 PR 标题格式（语义化提交）
- 📁 检查变更文件
- 🔍 代码质量检查
- 🔒 安全审计
- 📏 包大小检查
- 🧪 测试报告
- 🔧 Node.js 兼容性测试 (18, 20, 21)

### 5. Weekly (weekly.yml)

**触发**: 每周一 UTC 02:00 或手动触发

**任务**:

- 📦 检查依赖更新
- 📊 性能回归测试
- 🔒 安全审计
- 📈 代码覆盖率
- 🔗 文档链接检查

## 配置 Secrets

在 GitHub 仓库 Settings -> Secrets and variables -> Actions 中配置：

| Secret                 | 说明           | 必需                   |
|------------------------|----------------|------------------------|
| `NPM_TOKEN`            | npm 发布令牌   | 发布到 npm 时需要      |
| `CARGO_REGISTRY_TOKEN` | crates.io 令牌 | 发布 Rust crate 时需要 |
| `CODECOV_TOKEN`        | Codecov 令牌   | 上传覆盖率报告时需要   |

### 获取 NPM Token

1. 访问 <https://www.npmjs.com/settings/tokens>
2. 创建 Granular Access Token
3. 选择 Packages and scopes -> Publish
4. 复制 token 到 GitHub Secrets

### 获取 Cargo Token

```bash
cargo login
# 复制 token 到 GitHub Secrets
```

## 本地测试

使用 [act](https://github.com/nektos/act) 本地测试工作流：

```bash
# 安装 act
brew install act

# 运行 CI 工作流
act -j lint

# 运行构建
act -j build

# 运行测试
act -j test-unit
```

## 状态徽章

在 README.md 中添加状态徽章：

```markdown
![CI](https://github.com/veaba/qrcodes/workflows/CI/badge.svg)
![Release](https://github.com/veaba/qrcodes/workflows/Release/badge.svg)
![Docs](https://github.com/veaba/qrcodes/workflows/Documentation/badge.svg)
```

## 故障排除

### 工作流失败常见原因

1. **Rust 构建失败**
   - 检查 `wasm-pack` 是否安装
   - 检查 Rust 版本是否兼容

2. **npm 发布失败**
   - 检查 `NPM_TOKEN` 是否设置
   - 检查版本号是否已存在

3. **文档部署失败**
   - 检查 GitHub Pages 是否启用
   - 检查权限设置

### 手动重试

在 GitHub Actions 页面点击 "Re-run jobs" 按钮重试失败的工作流。

## 贡献指南

修改工作流时请遵循：

1. 在 PR 中说明工作流变更的原因
2. 确保工作流在 fork 仓库中测试通过
3. 更新本文档说明变更内容
