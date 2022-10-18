/**
 * QRCode 错误更正级别
 */
pub enum QRErrorCorrectLevel {
    M = 0,
    L = 1,
    Q = 3,
    H = 2,
}

/**
 * QRCode 遮罩的模式
 */
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

pub struct Code {
    width: i32,
    height: i32,
    type_number: i32,
    color_dark: String,
    color_light: String,
    correct_level: QRErrorCorrectLevel,
}

/**
 * util 变量
 */
// const PATTERN_POSITION_TABLE: [; 0]; 40] = [
// [],
// [6, 18],
// [6, 22],
// [6, 26],
// [6, 30],
// [6, 34],
// [6, 22, 38],
// [6, 24, 42],
// [6, 26, 46],
// [6, 28, 50],
// [6, 30, 54],
// [6, 32, 58],
// [6, 34, 62],
// [6, 26, 46, 66],
// [6, 26, 48, 70],
// [6, 26, 50, 74],
// [6, 30, 54, 78],
// [6, 30, 56, 82],
// [6, 30, 58, 86],
// [6, 34, 62, 90],
// [6, 28, 50, 72, 94],
// [6, 26, 50, 74, 98],
// [6, 30, 54, 78, 102],
// [6, 28, 54, 80, 106],
// [6, 32, 58, 84, 110],
// [6, 30, 58, 86, 114],
// [6, 34, 62, 90, 118],
// [6, 26, 50, 74, 98, 122],
// [6, 30, 54, 78, 102, 126],
// [6, 26, 52, 78, 104, 130],
// [6, 30, 56, 82, 108, 134],
// [6, 34, 60, 86, 112, 138],
// [6, 30, 58, 86, 114, 142],
// [6, 34, 62, 90, 118, 146],
// [6, 30, 54, 78, 102, 126, 150],
// [6, 24, 50, 76, 102, 128, 154],
// [6, 28, 54, 80, 106, 132, 158],
// [6, 32, 58, 84, 110, 136, 162],
// [6, 26, 54, 82, 110, 138, 166],
// [6, 30, 58, 86, 114, 142, 170],
// ];

const G15: i32 = (1 << 10) |
    (1 << 8) |
    (1 << 5) |
    (1 << 4) |
    (1 << 2) |
    (1 << 1) |
    (1 << 0);
const G15_MASK: i32 = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

struct StructUtils {
    pattern_position_table: [[i32; 0]; 40],
    g15: i32,
    g15_mask: i32,
    get_bchtype_info: (i32),
    get_bchtype_number: (i32),
    get_pattern_position: (i32),
    get_mask: (i32),
    get_error_correct_polynomial: (i32),
    get_length_in_bits: (i32),
    get_lost_point: (i32),
}

struct StructQRMath {
    glog: (i32),
    gexp: (i32),
    exp_table: [i32; 256],
    log_table: [i32; 256],
}

struct StructRSBlock {
    a: (i32),
}
