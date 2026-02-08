//! QR Code Core Library
//!
//! Shared core functionality for QR Code generation.
//! Used by both qrcode-rust (full-featured) and qrcode-fast (performance-optimized).

// Core modules shared between implementations
pub mod qr_8bit_byte;
pub mod qr_bit_buffer;
pub mod qr_code_model;
pub mod qr_math;
pub mod qr_polynomial;
pub mod qr_rs_block;
pub mod qr_util;

// Re-export commonly used types
pub use qr_8bit_byte::QR8bitByte;
pub use qr_bit_buffer::BitBuffer;
pub use qr_code_model::{QRErrorCorrectLevel, QRMode};
pub use qr_math::QRMath;
pub use qr_polynomial::Polynomial;
pub use qr_rs_block::{get_rs_blocks, QRRSBlock};

/// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
