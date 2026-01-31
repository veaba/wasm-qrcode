/**
 * QRCode 核心模型 - 修复版
 * 使用 Option<bool> 来区分未设置和功能图案的白色间隔
 */

use crate::qr_8bit_byte::QR8bitByte;
use crate::qr_bit_buffer::QRBitBuffer;
use crate::qr_polynomial::QRPolynomial;
use crate::qr_rs_block::{get_rs_blocks, QRErrorCorrectLevel};
use crate::qr_util;
use crate::qr_util::{QRMaskPattern, QRMode};

pub const PAD0: u8 = 0xEC;
pub const PAD1: u8 = 0x11;

#[derive(Debug, Clone)]
pub struct QRCodeModel {
    pub type_number: i32,
    pub error_correct_level: QRErrorCorrectLevel,
    pub modules: Vec<Vec<Option<bool>>>,
    pub module_count: i32,
    pub data_cache: Option<Vec<u8>>,
    pub data_list: Vec<QR8bitByte>,
}

impl QRCodeModel {
    /// 创建新的 QRCode 模型
    pub fn new(type_number: i32, error_correct_level: QRErrorCorrectLevel) -> Self {
        QRCodeModel {
            type_number,
            error_correct_level,
            modules: Vec::new(),
            module_count: 0,
            data_cache: None,
            data_list: Vec::new(),
        }
    }

    /// 添加数据
    pub fn add_data(&mut self, data: &str) {
        let new_data = QR8bitByte::new(data);
        self.data_list.push(new_data);
        self.data_cache = None;
    }

    /// 判断指定位置是否为深色
    pub fn is_dark(&self, row: i32, col: i32) -> bool {
        if row < 0 || self.module_count <= row || col < 0 || self.module_count <= col {
            panic!("{}, {}", row, col);
        }
        self.modules[row as usize][col as usize].unwrap_or(false)
    }

    /// 获取模块数量
    pub fn get_module_count(&self) -> i32 {
        self.module_count
    }

    /// 生成 QRCode
    pub fn make(&mut self) {
        let best_mask_pattern = self.get_best_mask_pattern();
        self.make_impl(false, best_mask_pattern);
    }

    /// 内部实现
    fn make_impl(&mut self, test: bool, mask_pattern: QRMaskPattern) {
        self.module_count = self.type_number * 4 + 17;
        
        // 初始化模块矩阵为 None
        self.modules = vec![vec![None; self.module_count as usize]; self.module_count as usize];

        self.setup_position_probe_pattern(0, 0); // 左上角
        self.setup_position_probe_pattern(self.module_count - 7, 0); // 左下角
        self.setup_position_probe_pattern(0, self.module_count - 7); // 右上角
        self.setup_position_adjust_pattern();
        self.setup_timing_pattern();
        self.setup_type_info(test, mask_pattern);

        if self.type_number >= 7 {
            self.setup_type_number(test);
        }

        if self.data_cache.is_none() {
            self.data_cache = Some(create_data(
                self.type_number,
                self.error_correct_level,
                &self.data_list,
            ));
        }

        let data_cache = self.data_cache.as_ref().unwrap().clone();
        self.map_data(&data_cache, mask_pattern);
    }

    /// 设置位置探测图案
    fn setup_position_probe_pattern(&mut self, row: i32, col: i32) {
        for r in -1..=7 {
            if row + r <= -1 || self.module_count <= row + r {
                continue;
            }
            for c in -1..=7 {
                if col + c <= -1 || self.module_count <= col + c {
                    continue;
                }
                let is_dark = (0 <= r && r <= 6 && (c == 0 || c == 6))
                    || (0 <= c && c <= 6 && (r == 0 || r == 6))
                    || (2 <= r && r <= 4 && 2 <= c && c <= 4);
                self.modules[(row + r) as usize][(col + c) as usize] = Some(is_dark);
            }
        }
    }

    /// 获取最佳遮罩模式
    fn get_best_mask_pattern(&mut self) -> QRMaskPattern {
        let mut min_lost_point = 0;
        let mut pattern = QRMaskPattern::PATTERN000;

        for i in 0..8 {
            self.make_impl(true, QRMaskPattern::from_i32(i));
            let lost_point = qr_util::get_lost_point_option(&self.modules);
            if i == 0 || min_lost_point > lost_point {
                min_lost_point = lost_point;
                pattern = QRMaskPattern::from_i32(i);
            }
        }

        pattern
    }

    /// 设置时序图案
    fn setup_timing_pattern(&mut self) {
        for r in 8..self.module_count - 8 {
            if self.modules[r as usize][6].is_some() {
                continue;
            }
            self.modules[r as usize][6] = Some(r % 2 == 0);
        }
        for c in 8..self.module_count - 8 {
            if self.modules[6][c as usize].is_some() {
                continue;
            }
            self.modules[6][c as usize] = Some(c % 2 == 0);
        }
    }

    /// 设置位置调整图案
    fn setup_position_adjust_pattern(&mut self) {
        let pos = qr_util::get_pattern_position(self.type_number);
        for i in 0..pos.len() {
            for j in 0..pos.len() {
                let row = pos[i];
                let col = pos[j];
                if self.modules[row as usize][col as usize].is_some() {
                    continue;
                }
                for r in -2..=2 {
                    for c in -2..=2 {
                        let is_dark = r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0);
                        self.modules[(row + r) as usize][(col + c) as usize] = Some(is_dark);
                    }
                }
            }
        }
    }

    /// 设置类型编号
    fn setup_type_number(&mut self, test: bool) {
        let bits = qr_util::get_bch_type_number(self.type_number);
        for i in 0..18 {
            let mod_val = !test && ((bits >> i) & 1) == 1;
            self.modules[(i / 3) as usize][(self.module_count - 8 - 3 + (i % 3)) as usize] = Some(mod_val);
        }
        for i in 0..18 {
            let mod_val = !test && ((bits >> i) & 1) == 1;
            self.modules[(self.module_count - 8 - 3 + (i % 3)) as usize][(i / 3) as usize] = Some(mod_val);
        }
    }

    /// 设置类型信息
    fn setup_type_info(&mut self, test: bool, mask_pattern: QRMaskPattern) {
        let data = ((self.error_correct_level as i32) << 3) | (mask_pattern as i32);
        let bits = qr_util::get_bch_type_info(data);

        for i in 0..15 {
            let mod_val = !test && ((bits >> i) & 1) == 1;
            if i < 6 {
                self.modules[i as usize][8] = Some(mod_val);
            } else if i < 8 {
                self.modules[(i + 1) as usize][8] = Some(mod_val);
            } else {
                self.modules[(self.module_count - 15 + i) as usize][8] = Some(mod_val);
            }
        }

        for i in 0..15 {
            let mod_val = !test && ((bits >> i) & 1) == 1;
            if i < 8 {
                self.modules[8][(self.module_count - i - 1) as usize] = Some(mod_val);
            } else if i < 9 {
                self.modules[8][(15 - i - 1 + 1) as usize] = Some(mod_val);
            } else {
                self.modules[8][(15 - i - 1) as usize] = Some(mod_val);
            }
        }
        self.modules[(self.module_count - 8) as usize][8] = Some(!test);
    }

    /// 映射数据 - 关键修复：只写入 None 位置
    fn map_data(&mut self, data: &[u8], mask_pattern: QRMaskPattern) {
        let mut inc = -1;
        let mut row = self.module_count - 1;
        let mut bit_index = 7;
        let mut byte_index = 0;

        let mut col = self.module_count - 1;
        while col > 0 {
            if col == 6 {
                col -= 1;
            }

            loop {
                for c in 0..2 {
                    // 关键修复：只写入 None（未设置）的位置
                    if self.modules[row as usize][(col - c) as usize].is_none() {
                        let mut dark = false;
                        if byte_index < data.len() {
                            dark = ((data[byte_index] >> bit_index) & 1) == 1;
                        }
                        let mask = qr_util::get_mask(mask_pattern, row, col - c);
                        if mask {
                            dark = !dark;
                        }
                        self.modules[row as usize][(col - c) as usize] = Some(dark);
                        bit_index = if bit_index == 0 { 7 } else { bit_index - 1 };
                        if bit_index == 7 {
                            byte_index += 1;
                        }
                    }
                }

                row += inc;
                if row < 0 || self.module_count <= row {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }

            col -= 2;
        }
    }
}

/// 创建数据
fn create_data(type_number: i32, error_correct_level: QRErrorCorrectLevel, data_list: &[QR8bitByte]) -> Vec<u8> {
    let rs_blocks = get_rs_blocks(type_number, error_correct_level);
    let mut buffer = QRBitBuffer::new();

    for data in data_list {
        buffer.put(QRMode::MODE_8BIT_BYTE as u32, 4);
        buffer.put(data.get_length() as u32, qr_util::get_length_in_bits(QRMode::MODE_8BIT_BYTE, type_number));
        data.write(&mut buffer);
    }

    let mut total_data_count = 0;
    for block in &rs_blocks {
        total_data_count += block.data_count;
    }

    if buffer.get_length_in_bits() > total_data_count as usize * 8 {
        panic!(
            "code length overflow. ({} > {})",
            buffer.get_length_in_bits(),
            total_data_count * 8
        );
    }

    if buffer.get_length_in_bits() + 4 <= total_data_count as usize * 8 {
        buffer.put(0, 4);
    }

    while buffer.get_length_in_bits() % 8 != 0 {
        buffer.put_bit(false);
    }

    loop {
        if buffer.get_length_in_bits() >= total_data_count as usize * 8 {
            break;
        }
        buffer.put(PAD0 as u32, 8);
        if buffer.get_length_in_bits() >= total_data_count as usize * 8 {
            break;
        }
        buffer.put(PAD1 as u32, 8);
    }

    create_bytes(&buffer, &rs_blocks)
}

/// 创建字节数据
fn create_bytes(buffer: &QRBitBuffer, rs_blocks: &[crate::qr_rs_block::QRRSBlock]) -> Vec<u8> {
    let mut offset = 0;
    let mut max_dc_count = 0;
    let mut max_ec_count = 0;

    let mut dcdata: Vec<Vec<u8>> = vec![Vec::new(); rs_blocks.len()];
    let mut ecdata: Vec<Vec<u8>> = vec![Vec::new(); rs_blocks.len()];

    for r in 0..rs_blocks.len() {
        let dc_count = rs_blocks[r].data_count as usize;
        let ec_count = rs_blocks[r].total_count as usize - dc_count;

        max_dc_count = max_dc_count.max(dc_count);
        max_ec_count = max_ec_count.max(ec_count);

        dcdata[r] = vec![0; dc_count];
        for i in 0..dc_count {
            dcdata[r][i] = buffer.get_buffer()[i + offset];
        }
        offset += dc_count;

        let rs_poly = qr_util::get_error_correct_polynomial(ec_count as i32);
        let raw_poly = QRPolynomial::new(&dcdata[r].iter().map(|&x| x as i32).collect::<Vec<_>>(), rs_poly.get_length() - 1);
        let mod_poly = raw_poly.modulo(&rs_poly);

        ecdata[r] = vec![0; rs_poly.get_length() - 1];
        for i in 0..ecdata[r].len() {
            let offset = i + mod_poly.get_length();
            if offset >= ecdata[r].len() {
                let mod_index = offset - ecdata[r].len();
                ecdata[r][i] = mod_poly.get(mod_index) as u8;
            }
        }
    }

    let mut total_code_count = 0;
    for block in rs_blocks {
        total_code_count += block.total_count;
    }

    let mut data: Vec<u8> = vec![0; total_code_count as usize];
    let mut index = 0;

    for i in 0..max_dc_count {
        for r in 0..rs_blocks.len() {
            if i < dcdata[r].len() {
                data[index] = dcdata[r][i];
                index += 1;
            }
        }
    }

    for i in 0..max_ec_count {
        for r in 0..rs_blocks.len() {
            if i < ecdata[r].len() {
                data[index] = ecdata[r][i];
                index += 1;
            }
        }
    }

    data
}

impl QRMaskPattern {
    fn from_i32(value: i32) -> Self {
        match value {
            0 => QRMaskPattern::PATTERN000,
            1 => QRMaskPattern::PATTERN001,
            2 => QRMaskPattern::PATTERN010,
            3 => QRMaskPattern::PATTERN011,
            4 => QRMaskPattern::PATTERN100,
            5 => QRMaskPattern::PATTERN101,
            6 => QRMaskPattern::PATTERN110,
            7 => QRMaskPattern::PATTERN111,
            _ => QRMaskPattern::PATTERN000,
        }
    }
}
