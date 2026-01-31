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
