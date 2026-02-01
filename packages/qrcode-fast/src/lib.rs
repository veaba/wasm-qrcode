//! QR Code Fast - 极致性能版本
//!
//! 目标：在 SVG 生成性能上超越 kennytm/qrcode
//!
//! 注意: 验证和比较工具已迁移到 bench/rust-tools

pub mod qr_code;
pub mod qr_code_model;

pub use qr_code::{QRCode, QRCodeOptions};
pub use qr_code_model::{QRErrorCorrectLevel, QRErrorCorrectLevel as CorrectLevel};

// 重新导出，保持 API 兼容
pub use qr_code::QRCode as QRCodeWasm;
