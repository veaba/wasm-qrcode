# GitHub Actions + npm OIDC 发布指南

本项目使用 GitHub Actions + Changesets + npm OIDC 进行自动化发布。

## OIDC 优势

传统方式需要在 GitHub 存储 `NPM_TOKEN`，而 **OIDC (OpenID Connect)** 允许 GitHub Actions 使用短期令牌直接与 npm 交互，无需长期凭证。

## 配置步骤

### 步骤 1: 在 npm 配置组织发布策略

1. 访问 https://www.npmjs.com/settings/veaba/packages
2. 找到 **"Package Access and Publishing"**
3. 确保组织设置为 **"Require two-factor authentication"**

### 步骤 2: 配置 GitHub 作为可信身份提供者

1. 访问 https://www.npmjs.com/settings/veaba/providers
2. 点击 **"Add GitHub Actions as a provider"**
3. 配置如下：
   - **Provider**: GitHub Actions
   - **Namespace**: `veaba`
   - **Repository**: `qrcodes` (或留空允许所有仓库)
   - **Workflow**: `.github/workflows/release.yml`

### 步骤 3: 创建 GitHub Environment（推荐）

1. 进入 GitHub 仓库 → Settings → Environments
2. 点击 **"New environment"**
3. 命名为 `npm`
4. 配置保护规则（可选）：
   - 添加 Required reviewers
   - 设置 Deployment branches (main)

### 步骤 4: 更新 Workflow 使用 OIDC

修改 `.github/workflows/release.yml`，添加 environment：

```yaml
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    environment: npm  # 添加这一行
    permissions:
      contents: write
      pull-requests: write
      id-token: write  # OIDC 必需
```

### 步骤 5: 配置 npm 发布权限

1. 访问 https://www.npmjs.com/settings/veaba/packages
2. 对每个包设置 **"Publish via GitHub Actions"** 权限
3. 或者使用 `npm access` 命令：

```bash
# 登录 npm
npm login

# 为每个包启用 OIDC 发布
npm access grant read-write github-actions:veaba/qrcodes @veaba/qrcode-shared
npm access grant read-write github-actions:veaba/qrcodes @veaba/qrcode-js
npm access grant read-write github-actions:veaba/qrcodes @veaba/qrcode-node
npm access grant read-write github-actions:veaba/qrcodes @veaba/qrcode-bun
npm access grant read-write github-actions:veaba/qrcodes @veaba/qrcode-wasm
```

## 备用方案：使用 NPM_TOKEN

如果 OIDC 配置有问题，可以使用传统方式：

1. 生成 npm Access Token (Classic)：
   - https://www.npmjs.com/settings/veaba/tokens/new
   - 选择 "Classic Token" → "Automation"

2. 添加到 GitHub Secrets：
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加 `NPM_TOKEN`

3. workflow 已兼容此方式，无需修改。

## 发布流程

### 正常开发流程

```bash
# 1. 开发代码
# ...

# 2. 添加变更集
pnpm changeset:add

# 3. 提交代码
git add .
git commit -m "feat: xxx"
git push
```

### 发布触发

1. Changesets Action 会检测到变更集
2. 创建 Version Packages PR
3. 合并 PR 后自动发布到 npm

### 手动发布（维护者）

```bash
# 本地版本升级
pnpm changeset:version

# 提交变更
git add .
git commit -m "chore: version packages"
git push

# 手动触发发布（需要 NPM_TOKEN）
pnpm changeset:publish
```

## 故障排查

### 错误："You do not have permission"

检查：
1. npm 组织是否正确配置了 OIDC provider
2. GitHub 仓库路径是否匹配 (namespace/repo)
3. workflow 文件是否有 `id-token: write` 权限

### 错误："Package not found"

首次发布需要先在 npm 创建包：
```bash
npm publish --access public
```

### 检查 OIDC 配置

在 GitHub Actions 日志中查看：
- 是否有 `id-token: write` 权限
- 是否正确请求了 OIDC 令牌

## 参考资料

- [npm OIDC 文档](https://docs.npmjs.com/generating-provenance-statements)
- [Changesets Action](https://github.com/changesets/action)
- [GitHub OIDC 文档](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-external-services)
