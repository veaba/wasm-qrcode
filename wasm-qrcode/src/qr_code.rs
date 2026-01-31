/**
 * QRCode 主类
 * 对应 JS 中的 QRCode
 */

use crate::qr_code_model::QRCodeModel;
use crate::qr_rs_block::QRErrorCorrectLevel;

/// QRCode 限制长度表
const QR_CODE_LIMIT_LENGTH: &[[i32; 4]] = &[
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

/// 获取类型编号
pub fn get_type_number(s_text: &str, n_correct_level: QRErrorCorrectLevel) -> i32 {
    let mut n_type = 1;
    let length = get_utf8_length(s_text);

    for i in 0..QR_CODE_LIMIT_LENGTH.len() {
        let n_limit = match n_correct_level {
            QRErrorCorrectLevel::L => QR_CODE_LIMIT_LENGTH[i][0],
            QRErrorCorrectLevel::M => QR_CODE_LIMIT_LENGTH[i][1],
            QRErrorCorrectLevel::Q => QR_CODE_LIMIT_LENGTH[i][2],
            QRErrorCorrectLevel::H => QR_CODE_LIMIT_LENGTH[i][3],
        };

        if length <= n_limit {
            break;
        } else {
            n_type += 1;
        }
    }

    if n_type > QR_CODE_LIMIT_LENGTH.len() as i32 {
        panic!("Too long data");
    }

    n_type
}

/// 获取 UTF-8 长度
fn get_utf8_length(s_text: &str) -> i32 {
    let mut count = 0;
    for ch in s_text.chars() {
        let code = ch as u32;
        if code > 0x10000 {
            count += 4;
        } else if code > 0x800 {
            count += 3;
        } else if code > 0x80 {
            count += 2;
        } else {
            count += 1;
        }
    }
    // 如果有 UTF-8 多字节字符，需要额外加上 BOM 的长度
    if count != s_text.len() as i32 {
        count + 3
    } else {
        count
    }
}

/// QRCode 选项
#[derive(Debug, Clone)]
pub struct QRCodeOptions {
    #[allow(dead_code)]
    pub width: i32,
    #[allow(dead_code)]
    pub height: i32,
    #[allow(dead_code)]
    pub type_number: i32,
    pub color_dark: String,
    pub color_light: String,
    pub correct_level: QRErrorCorrectLevel,
    pub text: String,
}

impl Default for QRCodeOptions {
    fn default() -> Self {
        QRCodeOptions {
            width: 256,
            height: 256,
            type_number: 4,
            color_dark: "#000000".to_string(),
            color_light: "#ffffff".to_string(),
            correct_level: QRErrorCorrectLevel::H,
            text: String::new(),
        }
    }
}

/// QRCode 结构体
#[derive(Debug)]
pub struct QRCode {
    pub options: QRCodeOptions,
    pub model: Option<QRCodeModel>,
}

impl QRCode {
    /// 创建新的 QRCode
    pub fn new() -> Self {
        QRCode {
            options: QRCodeOptions::default(),
            model: None,
        }
    }

    /// 使用选项创建
    pub fn with_options(options: QRCodeOptions) -> Self {
        let mut qr = QRCode {
            options,
            model: None,
        };
        
        if !qr.options.text.is_empty() {
            qr.make_code(&qr.options.text.clone());
        }
        
        qr
    }

    /// 生成 QRCode
    pub fn make_code(&mut self, text: &str) {
        let type_number = get_type_number(text, self.options.correct_level);
        let mut model = QRCodeModel::new(type_number, self.options.correct_level);
        model.add_data(text);
        model.make();
        self.model = Some(model);
        self.options.text = text.to_string();
    }

    /// 获取模块数据
    pub fn get_modules(&self) -> Option<&Vec<Vec<Option<bool>>>> {
        self.model.as_ref().map(|m| &m.modules)
    }

    /// 获取模块数量
    pub fn get_module_count(&self) -> i32 {
        self.model.as_ref().map_or(0, |m| m.get_module_count())
    }

    /// 判断指定位置是否为深色
    pub fn is_dark(&self, row: i32, col: i32) -> bool {
        self.model.as_ref().map_or(false, |m| m.is_dark(row, col))
    }
}

impl Default for QRCode {
    fn default() -> Self {
        Self::new()
    }
}
