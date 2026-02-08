//! QR Code utilities

/// Get BCH digit count
pub fn get_bch_digit(data: i32) -> i32 {
    let mut digit = 0;
    let mut data = data;
    while data != 0 {
        digit += 1;
        data >>= 1;
    }
    digit
}

/// Get length in bits for mode indicator
pub fn get_length_in_bits(mode: i32, type_num: i32) -> i32 {
    if mode != 4 {
        // MODE_8BIT_BYTE
        panic!("Invalid mode");
    }
    
    if (1..10).contains(&type_num) {
        8
    } else {
        16
    }
}
