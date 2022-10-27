use std::{vec};
use bytes::{BufMut, BytesMut};
use crate::shared;

pub struct QR8BitByte {
    mode: u32,
    parsed_data: Vec<Vec<u32>>,     // 存储数组
    parsed_data_u32: Vec<u32>,      // 存储数字
    parsed_data_buffer: Vec<Bytes>, // 存储 byte
    // parsed_data: Vec<u32, Vec<u32>>,
    // (u32, Vec<u32>)
    data: String,
}

impl QR8BitByte {
    pub fn new(&mut self) {
        let data_len = self.data.len();
        for i in 1..data_len {
            let mut byte_array = vec![];
            let code = self.data.chars().nth(i).unwrap() as u32; // TODO==?

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
            self.parsed_data.push(byte_array);
        }

        // TODO：怎么让 parsed_data 支持 u32，又支持数组 push，即作为二维数组
        // a = [ [322],112 ]
        if self.parsed_data.len() != self.data.len() {
            self.parsed_data_u32.insert(0, 191);
            self.parsed_data_u32.insert(0, 187);
            self.parsed_data_u32.insert(0, 239);
        }
    }

    // 方法
    pub fn get_length(&self) -> usize {
        return self.parsed_data.len();
    }
    // TODO rust byte
    // TODO 因为数组里不能同时有多个类型，需要区分一下
    pub fn write(&self, buffer: &mut QRBitBuffer) {
        for buf in self.parsed_data_buffer {
            // TODO 数字转buffer
            buffer.put(buf, 8); // num,len
        }
    }
}
