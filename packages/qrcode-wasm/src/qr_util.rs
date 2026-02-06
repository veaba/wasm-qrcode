/**
 * QRCode 工具函数
 * 对应 JS 中的 QRUtil
 */
use crate::qr_math;
use crate::qr_polynomial::QRPolynomial;

/// 遮罩模式
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum QRMaskPattern {
    PATTERN000 = 0,
    PATTERN001 = 1,
    PATTERN010 = 2,
    PATTERN011 = 3,
    PATTERN100 = 4,
    PATTERN101 = 5,
    PATTERN110 = 6,
    PATTERN111 = 7,
}

/// QR 模式
#[derive(Debug, Clone, Copy, PartialEq)]
#[allow(non_camel_case_types, dead_code)]
pub enum QRMode {
    MODE_NUMBER = 1,
    MODE_ALPHA_NUM = 2,
    MODE_8BIT_BYTE = 4,
    MODE_KANJI = 8,
}

// 重新导出 QRErrorCorrectLevel
// QRErrorCorrectLevel is re-exported from qr_rs_block

/// 位置调整图案位置表
const PATTERN_POSITION_TABLE: [&[i32]; 40] = [
    &[],
    &[6, 18],
    &[6, 22],
    &[6, 26],
    &[6, 30],
    &[6, 34],
    &[6, 22, 38],
    &[6, 24, 42],
    &[6, 26, 46],
    &[6, 28, 50],
    &[6, 30, 54],
    &[6, 32, 58],
    &[6, 34, 62],
    &[6, 26, 46, 66],
    &[6, 26, 48, 70],
    &[6, 26, 50, 74],
    &[6, 30, 54, 78],
    &[6, 30, 56, 82],
    &[6, 30, 58, 86],
    &[6, 34, 62, 90],
    &[6, 28, 50, 72, 94],
    &[6, 26, 50, 74, 98],
    &[6, 30, 54, 78, 102],
    &[6, 28, 54, 80, 106],
    &[6, 32, 58, 84, 110],
    &[6, 30, 58, 86, 114],
    &[6, 34, 62, 90, 118],
    &[6, 26, 50, 74, 98, 122],
    &[6, 30, 54, 78, 102, 126],
    &[6, 26, 52, 78, 104, 130],
    &[6, 30, 56, 82, 108, 134],
    &[6, 34, 60, 86, 112, 138],
    &[6, 30, 58, 86, 114, 142],
    &[6, 34, 62, 90, 118, 146],
    &[6, 30, 54, 78, 102, 126, 150],
    &[6, 24, 50, 76, 102, 128, 154],
    &[6, 28, 54, 80, 106, 132, 158],
    &[6, 32, 58, 84, 110, 136, 162],
    &[6, 26, 54, 82, 110, 138, 166],
    &[6, 30, 58, 86, 114, 142, 170],
];

const G15: i32 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18: i32 =
    (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
const G15_MASK: i32 = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

/// 获取 BCH 类型信息
pub fn get_bch_type_info(data: i32) -> i32 {
    let mut d = data << 10;
    while get_bch_digit(d) - get_bch_digit(G15) >= 0 {
        d ^= G15 << (get_bch_digit(d) - get_bch_digit(G15));
    }
    ((data << 10) | d) ^ G15_MASK
}

/// 获取 BCH 类型编号
pub fn get_bch_type_number(data: i32) -> i32 {
    let mut d = data << 12;
    while get_bch_digit(d) - get_bch_digit(G18) >= 0 {
        d ^= G18 << (get_bch_digit(d) - get_bch_digit(G18));
    }
    (data << 12) | d
}

/// 获取 BCH 数字位数
fn get_bch_digit(data: i32) -> i32 {
    let mut digit = 0;
    let mut data = data;
    while data != 0 {
        digit += 1;
        data >>= 1;
    }
    digit
}

/// 获取位置调整图案位置
pub fn get_pattern_position(type_number: i32) -> &'static [i32] {
    if type_number >= 1 && type_number <= 40 {
        PATTERN_POSITION_TABLE[(type_number - 1) as usize]
    } else {
        &[]
    }
}

/// 获取遮罩值
pub fn get_mask(mask_pattern: QRMaskPattern, i: i32, j: i32) -> bool {
    match mask_pattern {
        QRMaskPattern::PATTERN000 => (i + j) % 2 == 0,
        QRMaskPattern::PATTERN001 => i % 2 == 0,
        QRMaskPattern::PATTERN010 => j % 3 == 0,
        QRMaskPattern::PATTERN011 => (i + j) % 3 == 0,
        QRMaskPattern::PATTERN100 => ((i / 2) + (j / 3)) % 2 == 0,
        QRMaskPattern::PATTERN101 => ((i * j) % 2) + ((i * j) % 3) == 0,
        QRMaskPattern::PATTERN110 => (((i * j) % 2) + ((i * j) % 3)) % 2 == 0,
        QRMaskPattern::PATTERN111 => (((i * j) % 3) + ((i + j) % 2)) % 2 == 0,
    }
}

/// 获取错误纠正多项式
pub fn get_error_correct_polynomial(error_correct_length: i32) -> QRPolynomial {
    let mut a = QRPolynomial::new(&[1], 0);
    for i in 0..error_correct_length {
        let gexp_val = qr_math::gexp(i);
        a = a.multiply(&QRPolynomial::new(&[1, gexp_val], 0));
    }
    a
}

/// 获取长度位数
pub fn get_length_in_bits(mode: QRMode, type_num: i32) -> usize {
    if type_num >= 1 && type_num < 10 {
        match mode {
            QRMode::MODE_NUMBER => 10_usize,
            QRMode::MODE_ALPHA_NUM => 9_usize,
            QRMode::MODE_8BIT_BYTE => 8_usize,
            QRMode::MODE_KANJI => 8_usize,
        }
    } else if type_num < 27 {
        match mode {
            QRMode::MODE_NUMBER => 12_usize,
            QRMode::MODE_ALPHA_NUM => 11_usize,
            QRMode::MODE_8BIT_BYTE => 16_usize,
            QRMode::MODE_KANJI => 10_usize,
        }
    } else if type_num < 41 {
        match mode {
            QRMode::MODE_NUMBER => 14_usize,
            QRMode::MODE_ALPHA_NUM => 13_usize,
            QRMode::MODE_8BIT_BYTE => 16_usize,
            QRMode::MODE_KANJI => 12_usize,
        }
    } else {
        panic!("type:{}", type_num);
    }
}

/// 获取失分（用于选择最佳遮罩模式）
// `get_lost_point` removed — use `get_lost_point_option` instead.
/// 获取失分（用于选择最佳遮罩模式）- Option<bool> 版本
pub fn get_lost_point_option(modules: &[Vec<Option<bool>>]) -> i32 {
    let module_count = modules.len() as i32;
    let mut lost_point = 0;

    // LEVEL1
    for row in 0..module_count {
        for col in 0..module_count {
            let mut same_count = 0;
            let dark = modules[row as usize][col as usize].unwrap_or(false);
            for r in -1..=1 {
                if row + r < 0 || module_count <= row + r {
                    continue;
                }
                for c in -1..=1 {
                    if col + c < 0 || module_count <= col + c {
                        continue;
                    }
                    if r == 0 && c == 0 {
                        continue;
                    }
                    if dark == modules[(row + r) as usize][(col + c) as usize].unwrap_or(false) {
                        same_count += 1;
                    }
                }
            }
            if same_count > 5 {
                lost_point += 3 + same_count - 5;
            }
        }
    }

    // LEVEL2
    for row in 0..module_count - 1 {
        for col in 0..module_count - 1 {
            let mut count = 0;
            if modules[row as usize][col as usize].unwrap_or(false) {
                count += 1;
            }
            if modules[(row + 1) as usize][col as usize].unwrap_or(false) {
                count += 1;
            }
            if modules[row as usize][(col + 1) as usize].unwrap_or(false) {
                count += 1;
            }
            if modules[(row + 1) as usize][(col + 1) as usize].unwrap_or(false) {
                count += 1;
            }
            if count == 0 || count == 4 {
                lost_point += 3;
            }
        }
    }

    // LEVEL3
    for row in 0..module_count {
        for col in 0..module_count - 6 {
            if modules[row as usize][col as usize].unwrap_or(false)
                && !modules[row as usize][(col + 1) as usize].unwrap_or(false)
                && modules[row as usize][(col + 2) as usize].unwrap_or(false)
                && modules[row as usize][(col + 3) as usize].unwrap_or(false)
                && modules[row as usize][(col + 4) as usize].unwrap_or(false)
                && !modules[row as usize][(col + 5) as usize].unwrap_or(false)
                && modules[row as usize][(col + 6) as usize].unwrap_or(false)
            {
                lost_point += 40;
            }
        }
    }

    for col in 0..module_count {
        for row in 0..module_count - 6 {
            if modules[row as usize][col as usize].unwrap_or(false)
                && !modules[(row + 1) as usize][col as usize].unwrap_or(false)
                && modules[(row + 2) as usize][col as usize].unwrap_or(false)
                && modules[(row + 3) as usize][col as usize].unwrap_or(false)
                && modules[(row + 4) as usize][col as usize].unwrap_or(false)
                && !modules[(row + 5) as usize][col as usize].unwrap_or(false)
                && modules[(row + 6) as usize][col as usize].unwrap_or(false)
            {
                lost_point += 40;
            }
        }
    }

    // LEVEL4
    let mut dark_count = 0;
    for col in 0..module_count {
        for row in 0..module_count {
            if modules[row as usize][col as usize].unwrap_or(false) {
                dark_count += 1;
            }
        }
    }

    let ratio = ((100 * dark_count) / module_count / module_count - 50).abs() / 5;
    lost_point += ratio * 10;

    lost_point
}
