# Changesets

本项目使用 `@changesets/cli` 管理版本和发布。

## 快速链接

- [Changesets 文档](https://github.com/changesets/changesets)
- [常见问答](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
- [项目 CHANGESETS.md](../CHANGESETS.md)

## 常用命令

```bash
# 添加变更集
pnpm changeset add

# 查看状态
pnpm changeset status

# 升级版本
pnpm changeset version

# 发布
pnpm changeset publish
```

## 配置说明

- `access`: `public` - 公开发布到 npm
- `baseBranch`: `main` - 基于 main 分支
- `ignore`: `["@veaba/qrcode-rust", "@veaba/qrcode-fast"]` - Rust crate 通过 Cargo 管理
