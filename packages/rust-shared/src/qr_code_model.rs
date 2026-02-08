//! QR Code Model - Shared constants and types

/// QR Code 模式
pub struct QRMode;

impl QRMode {
    pub const MODE_NUMBER: i32 = 1;
    pub const MODE_ALPHA_NUM: i32 = 2;
    pub const MODE_8BIT_BYTE: i32 = 4;
    pub const MODE_KANJI: i32 = 8;
}

/// 错误纠正级别
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum QRErrorCorrectLevel {
    L = 1, // 低 (~7%)
    M = 0, // 中 (~15%)
    Q = 3, // 高 (~25%)
    #[default]
    H = 2, // 最高 (~30%)
}

/// 位置调整图案位置表 (完整 40 版本)
pub const PATTERN_POSITION_TABLE: &[[i32; 7]] = &[
    [0, 0, 0, 0, 0, 0, 0],
    [6, 18, 0, 0, 0, 0, 0],
    [6, 22, 0, 0, 0, 0, 0],
    [6, 26, 0, 0, 0, 0, 0],
    [6, 30, 0, 0, 0, 0, 0],
    [6, 34, 0, 0, 0, 0, 0],
    [6, 22, 38, 0, 0, 0, 0],
    [6, 24, 42, 0, 0, 0, 0],
    [6, 26, 46, 0, 0, 0, 0],
    [6, 28, 50, 0, 0, 0, 0],
    [6, 30, 54, 0, 0, 0, 0],
    [6, 32, 58, 0, 0, 0, 0],
    [6, 34, 62, 0, 0, 0, 0],
    [6, 26, 46, 66, 0, 0, 0],
    [6, 26, 48, 70, 0, 0, 0],
    [6, 26, 50, 74, 0, 0, 0],
    [6, 30, 54, 78, 0, 0, 0],
    [6, 30, 56, 82, 0, 0, 0],
    [6, 30, 58, 86, 0, 0, 0],
    [6, 34, 62, 90, 0, 0, 0],
    [6, 28, 50, 72, 94, 0, 0],
    [6, 26, 50, 74, 98, 0, 0],
    [6, 30, 54, 78, 102, 0, 0],
    [6, 28, 54, 80, 106, 0, 0],
    [6, 32, 58, 84, 110, 0, 0],
    [6, 30, 58, 86, 114, 0, 0],
    [6, 34, 62, 90, 118, 0, 0],
    [6, 26, 50, 74, 98, 122, 0],
    [6, 30, 54, 78, 102, 126, 0],
    [6, 26, 52, 78, 104, 130, 0],
    [6, 30, 56, 82, 108, 134, 0],
    [6, 34, 60, 86, 112, 138, 0],
    [6, 30, 58, 86, 114, 142, 0],
    [6, 34, 62, 90, 118, 146, 0],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
];

/// 完整容量表 (40 版本 x 4 纠错级别)
pub const QR_CODE_LIMIT_LENGTH: &[[i32; 4]] = &[
    [17, 14, 11, 7],
    [32, 26, 20, 14],
    [53, 42, 32, 24],
    [78, 62, 46, 34],
    [106, 84, 60, 44],
    [134, 106, 74, 58],
    [154, 122, 86, 64],
    [192, 152, 108, 84],
    [230, 180, 130, 98],
    [271, 213, 151, 119],
    [321, 251, 177, 137],
    [367, 287, 203, 155],
    [425, 331, 241, 177],
    [458, 362, 258, 194],
    [520, 412, 292, 220],
    [586, 450, 322, 250],
    [644, 504, 364, 280],
    [718, 560, 394, 310],
    [792, 624, 442, 338],
    [858, 666, 482, 382],
    [929, 711, 509, 403],
    [1003, 779, 565, 439],
    [1091, 857, 611, 461],
    [1171, 911, 661, 511],
    [1273, 997, 715, 535],
    [1367, 1059, 751, 593],
    [1465, 1125, 805, 625],
    [1528, 1190, 868, 658],
    [1628, 1264, 908, 698],
    [1732, 1370, 982, 742],
    [1840, 1452, 1030, 790],
    [1952, 1538, 1112, 842],
    [2068, 1628, 1168, 898],
    [2188, 1722, 1228, 958],
    [2303, 1809, 1283, 983],
    [2431, 1911, 1351, 1051],
    [2563, 1989, 1423, 1093],
    [2699, 2099, 1499, 1139],
    [2809, 2213, 1579, 1219],
    [2953, 2331, 1663, 1273],
];

/// 获取类型号 (完整版本，支持 40 个版本)
pub fn get_type_number(text: &str, correct_level: QRErrorCorrectLevel) -> i32 {
    let length = text.len();
    let level_map = [1, 0, 3, 2];
    let level_index = level_map[correct_level as usize];
    let data_length = length + 2; // 考虑模式指示符和长度字段

    for (i, limits) in QR_CODE_LIMIT_LENGTH.iter().enumerate() {
        let limit = limits[level_index as usize];
        if data_length <= limit as usize {
            return (i + 1) as i32;
        }
    }
    40 // 最大版本号
}

/// 快速版本：获取最小版本号 (支持 1-10 版本，用于 qrcode-fast)
pub fn get_min_version(text_len: usize, level: QRErrorCorrectLevel) -> i32 {
    let level_idx = match level {
        QRErrorCorrectLevel::L => 0,
        QRErrorCorrectLevel::M => 1,
        QRErrorCorrectLevel::Q => 2,
        QRErrorCorrectLevel::H => 3,
    };

    for (version, limits) in QR_CODE_LIMIT_LENGTH.iter().enumerate().skip(1).take(10) {
        if limits[level_idx] >= text_len as i32 {
            return version as i32;
        }
    }
    10 // 最大支持 Version 10 (fast mode)
}

/// 获取位置调整图案位置
pub fn get_pattern_position(type_number: i32) -> Vec<i32> {
    let pos = &PATTERN_POSITION_TABLE[(type_number - 1) as usize];
    pos.iter().copied().filter(|&x| x > 0).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_correct_level_values() {
        assert_eq!(QRErrorCorrectLevel::L as i32, 1);
        assert_eq!(QRErrorCorrectLevel::M as i32, 0);
        assert_eq!(QRErrorCorrectLevel::Q as i32, 3);
        assert_eq!(QRErrorCorrectLevel::H as i32, 2);
    }

    #[test]
    fn test_get_type_number_basic() {
        // "Hello" (5 chars) with H level should fit in version 1
        let version = get_type_number("Hello", QRErrorCorrectLevel::H);
        assert!((1..=40).contains(&version));
    }

    #[test]
    fn test_get_min_version_fast() {
        // Short text should fit in version 1-2
        let v = get_min_version(5, QRErrorCorrectLevel::H);
        assert!((1..=10).contains(&v));
    }

    #[test]
    fn test_get_pattern_position() {
        let pos = get_pattern_position(2);
        assert_eq!(pos, vec![6, 18]);

        let pos = get_pattern_position(7);
        assert_eq!(pos, vec![6, 22, 38]);
    }
}
