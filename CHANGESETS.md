# Changesets 使用指南

本项目使用 [Changesets](https://github.com/changesets/changesets) 来管理版本和发布。

## 快速开始

### 1. 添加变更集

当你对包进行修改后，需要添加一个变更集：

```bash
pnpm changeset:add
# 或
pnpm changeset
```

这将启动交互式 CLI，引导你：
1. 选择受影响的包
2. 选择版本类型（patch/minor/major）
3. 编写变更描述

### 2. 版本升级

当准备发布时，运行：

```bash
pnpm changeset:version
```

这将：
- 根据变更集自动升级包版本
- 更新 `CHANGELOG.md`
- 清理已应用的变更集文件

### 3. 发布到 npm

```bash
pnpm changeset:publish
```

## 版本规则

- **patch**: 修复 bug（如 0.1.0 → 0.1.1）
- **minor**: 新增功能（如 0.1.0 → 0.2.0）
- **major**: 破坏性变更（如 0.1.0 → 1.0.0）

## 命令速查

| 命令 | 说明 |
|------|------|
| `pnpm changeset:add` | 添加变更集 |
| `pnpm changeset:status` | 查看变更集状态 |
| `pnpm changeset:version` | 升级版本并生成 changelog |
| `pnpm changeset:publish` | 发布到 npm |
| `pnpm ci:version` | CI 用：升级版本 + 更新 lockfile |
| `pnpm ci:publish` | CI 用：发布到 npm |

## 注意事项

1. **Rust crate** (`@veaba/qrcode-rust`, `@veaba/qrcode-fast`) 设置了 `private: true`，不会被发布到 npm，它们通过 Cargo 管理版本
2. 提交 PR 前请确保已添加变更集（如果有用户可见的修改）
3. 版本升级和发布通常由维护者在合并到 main 分支后执行
