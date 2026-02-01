//! QR Code 模型和常量

/// 纠错级别
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum QRErrorCorrectLevel {
    L = 1,
    M = 0,
    Q = 3,
    H = 2,
}

/// 默认使用 H 级别（最高纠错）
impl Default for QRErrorCorrectLevel {
    fn default() -> Self {
        QRErrorCorrectLevel::H
    }
}

// 简化的容量表（Version 1-10）
pub const QR_CAPACITY: [[usize; 4]; 11] = [
    [0, 0, 0, 0],      // 占位
    [17, 14, 11, 7],   // Version 1
    [32, 26, 20, 14],  // Version 2
    [53, 42, 32, 24],  // Version 3
    [78, 62, 46, 34],  // Version 4
    [106, 84, 60, 44], // Version 5
    [134, 106, 74, 58],// Version 6
    [154, 122, 86, 64],// Version 7
    [192, 152, 108, 84],// Version 8
    [230, 180, 130, 98],// Version 9
    [271, 213, 151, 119],// Version 10
];

/// 获取文本需要的 QR Code 版本（简化版）
pub fn get_min_version(text_len: usize, level: QRErrorCorrectLevel) -> i32 {
    let level_idx = match level {
        QRErrorCorrectLevel::L => 0,
        QRErrorCorrectLevel::M => 1,
        QRErrorCorrectLevel::Q => 2,
        QRErrorCorrectLevel::H => 3,
    };
    
    for version in 1..=10 {
        if QR_CAPACITY[version][level_idx] >= text_len {
            return version as i32;
        }
    }
    10 // 最大支持 Version 10
}
