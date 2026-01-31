/**
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
        let mut parsed_data: Vec<u8> = Vec::new();

        // 处理 UTF-8 字符
        for ch in data.chars() {
            let code = ch as u32;
            if code > 0x10000 {
                // 4字节 UTF-8
                parsed_data.push((0xf0 | ((code & 0x1c0000) >> 18)) as u8);
                parsed_data.push((0x80 | ((code & 0x3f000) >> 12)) as u8);
                parsed_data.push((0x80 | ((code & 0xfc0) >> 6)) as u8);
                parsed_data.push((0x80 | (code & 0x3f)) as u8);
            } else if code > 0x800 {
                // 3字节 UTF-8
                parsed_data.push((0xe0 | ((code & 0xf000) >> 12)) as u8);
                parsed_data.push((0x80 | ((code & 0xfc0) >> 6)) as u8);
                parsed_data.push((0x80 | (code & 0x3f)) as u8);
            } else if code > 0x80 {
                // 2字节 UTF-8
                parsed_data.push((0xc0 | ((code & 0x7c0) >> 6)) as u8);
                parsed_data.push((0x80 | (code & 0x3f)) as u8);
            } else {
                // 1字节 ASCII
                parsed_data.push(code as u8);
            }
        }

        // 如果解析后的数据长度与原始字符串长度不同（说明有 UTF-8 多字节字符），添加 BOM
        if parsed_data.len() != data.len() {
            parsed_data.insert(0, 191);
            parsed_data.insert(0, 187);
            parsed_data.insert(0, 239);
        }

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
