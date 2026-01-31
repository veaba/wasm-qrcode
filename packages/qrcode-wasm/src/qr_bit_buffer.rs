/**
 * QRCode 位缓冲区
 * 对应 JS 中的 QRBitBuffer
 */

#[derive(Debug, Clone)]
pub struct QRBitBuffer {
    buffer: Vec<u8>,
    length: usize,
}

impl QRBitBuffer {
    /// 创建新的位缓冲区
    pub fn new() -> Self {
        QRBitBuffer {
            buffer: Vec::new(),
            length: 0,
        }
    }

    #[allow(dead_code)]
    /// 获取指定索引的位值
    pub fn get(&self, index: usize) -> bool {
        let buf_index = index / 8;
        ((self.buffer[buf_index] >> (7 - (index % 8))) & 1) == 1
    }

    /// 放入数值（指定长度）
    pub fn put(&mut self, num: u32, length: usize) {
        for i in 0..length {
            self.put_bit(((num >> (length - i - 1)) & 1) == 1);
        }
    }

    /// 获取位长度
    pub fn get_length_in_bits(&self) -> usize {
        self.length
    }

    /// 放入单个位
    pub fn put_bit(&mut self, bit: bool) {
        let buf_index = self.length / 8;
        if self.buffer.len() <= buf_index {
            self.buffer.push(0);
        }
        if bit {
            self.buffer[buf_index] |= 0x80 >> (self.length % 8);
        }
        self.length += 1;
    }

    /// 获取缓冲区
    pub fn get_buffer(&self) -> &Vec<u8> {
        &self.buffer
    }
}

impl Default for QRBitBuffer {
    fn default() -> Self {
        Self::new()
    }
}
