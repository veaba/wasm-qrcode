use std::str::Bytes;
use crate::shared;

pub struct QR8BitByte {
    mode: shared::QRMode::MODE_8BIT_BYTE,
    parsed_data: Vec<Vec<i32>>,
    data: Vec<i32>,
}

impl QR8BitByte {
    pub fn new(&mut self) {
        for i in self.data.len() {
            let mut byte_array: vec<usize> = [];
            let code = self.data.charCodeAt(i);

            // TODO 和 JS >>> 区别？
            if code > 0x10000 {
                byte_array[0] = 0xf0 | ((code & 0x1c0000) >> 18);
                byte_array[1] = 0x80 | ((code & 0x3f000) >> 12);
                byte_array[2] = 0x80 | ((code & 0xfc0) >> 6);
                byte_array[3] = 0x80 | (code & 0x3f);
            } else if code > 0x800 {
                byte_array[0] = 0xe0 | ((code & 0xf000) >> 12);
                byte_array[1] = 0x80 | ((code & 0xfc0) >> 6);
                byte_array[2] = 0x80 | (code & 0x3f);
            } else if code > 0x80 {
                byte_array[0] = 0xc0 | ((code & 0x7c0) >> 6);
                byte_array[1] = 0x80 | (code & 0x3f);
            } else {
                byte_array[0] = code
            }
            self.parsed_data.push(byte_array)
        }

        if self.parsed_data.len() != self.data.len() {
            self.parsedData.insert(0, 191);
            self.parsedData.insert(0, 0187);
            self.parsedData.insert(0, 239);
        }
    }

    // 方法
    pub fn get_length(&self) -> usize {
        return self.parsed_data.len();
    }
    // TODO？？
    // pub fn write(&self, buffer: vec<Bytes>) {
    //     for buf in self.parsed_data {
    //         buffer.push(buf, 8)
    //     }
    // }
}
