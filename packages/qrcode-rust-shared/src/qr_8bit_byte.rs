//! QR Code 8-bit Byte Mode

pub struct QR8bitByte {
    pub data: String,
}

impl QR8bitByte {
    pub fn new(data: &str) -> Self {
        QR8bitByte {
            data: data.to_string(),
        }
    }

    pub fn get_length(&self) -> usize {
        self.data.len()
    }

    pub fn write(&self, buffer: &mut crate::qr_bit_buffer::BitBuffer) {
        for byte in self.data.bytes() {
            buffer.put(byte as i32, 8);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::qr_bit_buffer::BitBuffer;

    #[test]
    fn test_qr8bit_byte() {
        let data = QR8bitByte::new("Hi");
        assert_eq!(data.get_length(), 2);

        let mut buf = BitBuffer::new();
        data.write(&mut buf);
        assert_eq!(buf.length, 16); // 2 bytes * 8 bits
    }
}
