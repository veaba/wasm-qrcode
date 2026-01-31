//! QR Code utilities

/// 获取 BCH 数字
pub fn get_bch_digit(data: i32) -> i32 {
    let mut digit = 0;
    let mut data = data;
    while data != 0 {
        digit += 1;
        data >>= 1;
    }
    digit
}

/// 模式指示符长度
pub fn get_length_in_bits(mode: i32, type_num: i32) -> i32 {
    if mode != 4 {
        // MODE_8BIT_BYTE
        panic!("Invalid mode");
    }
    
    if type_num >= 1 && type_num < 10 {
        8
    } else if type_num < 27 {
        16
    } else {
        16
    }
}
