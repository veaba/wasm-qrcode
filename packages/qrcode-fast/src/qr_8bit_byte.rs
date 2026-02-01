//! 8-bit Byte Mode

pub struct QR8bitByte {
    pub data: String,
    pub parsed_data: Vec<u8>,
}

impl QR8bitByte {
    pub fn new(data: &str) -> Self {
        let parsed_data = data.bytes().collect();
        QR8bitByte {
            data: data.to_string(),
            parsed_data,
        }
    }

    pub fn get_length(&self) -> usize {
        self.parsed_data.len()
    }

    pub fn write(&self, buffer: &mut crate::qr_bit_buffer::BitBuffer) {
        for &byte in &self.parsed_data {
            buffer.put(byte as i32, 8);
        }
    }
}
