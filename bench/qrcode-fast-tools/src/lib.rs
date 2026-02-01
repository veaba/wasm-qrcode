//! qrcode-fast-tools - 二维码性能测试和验证工具
//!
//! 此 crate 包含各种用于测试和验证二维码生成的工具。
//! 已从 qrcode-fast 包中迁移出来，以保持主包的简洁。

#[cfg(feature = "validation")]
pub mod validation;
