//! QR Code Bit Buffer

pub struct BitBuffer {
    pub buffer: Vec<i32>,
    pub length: usize,
}

impl BitBuffer {
    pub fn new() -> Self {
        BitBuffer {
            buffer: Vec::new(),
            length: 0,
        }
    }

    pub fn put(&mut self, num: i32, length: i32) {
        for i in (0..length).rev() {
            self.put_bit(((num >> i) & 1) == 1);
        }
    }

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
}

impl Default for BitBuffer {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bit_buffer_basic() {
        let mut buf = BitBuffer::new();
        buf.put(0x0F, 4); // 1111
        assert_eq!(buf.length, 4);
        assert_eq!(buf.buffer[0], 0xF0); // 11110000
    }

    #[test]
    fn test_bit_buffer_multiple_bytes() {
        let mut buf = BitBuffer::new();
        buf.put(0xFF, 8);
        buf.put(0x01, 1);
        assert_eq!(buf.length, 9);
        assert_eq!(buf.buffer[0], 0xFF);
        assert_eq!(buf.buffer[1], 0x80);
    }
}
