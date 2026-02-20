/*!
 * QRCode 8位字节数据
 * 对应 JS 中的 QR8bitByte
 */

use crate::qr_bit_buffer::QRBitBuffer;
use crate::qr_util::QRMode;

#[derive(Debug, Clone)]
pub struct QR8bitByte {
    #[allow(dead_code)]
    pub mode: QRMode,
    #[allow(dead_code)]
    pub data: String,
    pub parsed_data: Vec<u8>,
}

impl QR8bitByte {
    /// 创建新的 8bit 字节数据
    pub fn new(data: &str) -> Self {
        // 使用与 JS TextEncoder 一致的方式：直接使用 UTF-8 字节
        // 不添加 BOM，与 qrcode-js-shared 保持一致
        let parsed_data = data.as_bytes().to_vec();

        QR8bitByte {
            mode: QRMode::MODE_8BIT_BYTE,
            data: data.to_string(),
            parsed_data,
        }
    }

    /// 获取数据长度
    pub fn get_length(&self) -> usize {
        self.parsed_data.len()
    }

    /// 写入缓冲区
    pub fn write(&self, buffer: &mut QRBitBuffer) {
        for &byte in &self.parsed_data {
            buffer.put(byte as u32, 8);
        }
    }
}
