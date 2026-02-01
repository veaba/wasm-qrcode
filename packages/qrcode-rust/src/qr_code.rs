//! QR Code implementation

use core::fmt::Write;

use crate::qr_8bit_byte::QR8bitByte;
use crate::qr_bit_buffer::BitBuffer;
use crate::qr_code_model::{get_type_number, PATTERN_POSITION_TABLE, QRErrorCorrectLevel, QRMode};
use crate::qr_rs_block::get_rs_blocks;
use crate::qr_util::{get_bch_digit, get_length_in_bits};

/// QRCode 选项
#[derive(Clone)]
pub struct QRCodeOptions {
    pub width: i32,
    pub height: i32,
    pub color_dark: String,
    pub color_light: String,
    pub correct_level: QRErrorCorrectLevel,
}

impl Default for QRCodeOptions {
    fn default() -> Self {
        QRCodeOptions {
            width: 256,
            height: 256,
            color_dark: String::from("#000000"),
            color_light: String::from("#ffffff"),
            correct_level: QRErrorCorrectLevel::H,
        }
    }
}

/// QRCode 结构
pub struct QRCode {
    pub options: QRCodeOptions,
    pub type_number: i32,
    pub module_count: i32,
    pub modules: Vec<Vec<Option<bool>>>,
    pub data_cache: Option<Vec<i32>>,
    pub data_list: Vec<QR8bitByte>,
}

impl QRCode {
    pub fn new() -> Self {
        QRCode {
            options: QRCodeOptions::default(),
            type_number: 0,
            module_count: 0,
            modules: Vec::new(),
            data_cache: None,
            data_list: Vec::new(),
        }
    }

    pub fn with_options(options: QRCodeOptions) -> Self {
        QRCode {
            options,
            type_number: 0,
            module_count: 0,
            modules: Vec::new(),
            data_cache: None,
            data_list: Vec::new(),
        }
    }

    pub fn add_data(&mut self, data: &str) {
        self.data_list.push(QR8bitByte::new(data));
        self.data_cache = None;
    }

    pub fn is_dark(&self, row: i32, col: i32) -> bool {
        if row < 0 || self.module_count <= row || col < 0 || self.module_count <= col {
            panic!("isDark: out of range");
        }
        self.modules[row as usize][col as usize].unwrap_or(false)
    }

    pub fn get_module_count(&self) -> i32 {
        self.module_count
    }

    pub fn get_modules(&self) -> Option<&Vec<Vec<Option<bool>>>> {
        if self.modules.is_empty() {
            None
        } else {
            Some(&self.modules)
        }
    }

    pub fn make_code(&mut self, text: &str) {
        self.data_list.clear();
        self.add_data(text);
        self.make();
    }

    fn make(&mut self) {
        self.make_impl(false);
    }

    fn make_impl(&mut self, test: bool) {
        // 计算类型号
        if self.type_number == 0 {
            let mut type_num = 1;
            for data in &self.data_list {
                type_num = type_num.max(get_type_number(&data.data, self.options.correct_level));
            }
            self.type_number = type_num;
        }

        self.module_count = self.type_number * 4 + 17;
        self.modules = vec![vec![None; self.module_count as usize]; self.module_count as usize];

        self.setup_position_probe_pattern(0, 0);
        self.setup_position_probe_pattern(self.module_count - 7, 0);
        self.setup_position_probe_pattern(0, self.module_count - 7);
        self.setup_position_adjust_pattern();
        self.setup_timing_pattern();
        self.setup_type_info(test);

        if self.type_number >= 7 {
            self.setup_type_number(test);
        }

        if self.data_cache.is_none() {
            self.data_cache = Some(self.create_data());
        }

        let data = self.data_cache.as_ref().unwrap().clone();
        self.map_data(&data);
    }

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

    fn setup_position_adjust_pattern(&mut self) {
        let pos = PATTERN_POSITION_TABLE[(self.type_number - 1) as usize];
        for i in 0..pos.len() {
            for j in 0..pos.len() {
                let row = pos[i];
                let col = pos[j];
                
                // 跳过无效位置（0 表示没有位置调整图案）
                if row == 0 || col == 0 {
                    continue;
                }
                
                // 跳过与位置探测图案重叠的位置
                // 位置探测图案在：(0,0), (module_count-7, 0), (0, module_count-7)
                // 每个位置探测图案占 7x7，加上 1 格分隔符是 9x9
                if row <= 8 && col <= 8 {
                    continue;  // 左上角区域
                }
                if row <= 8 && col >= self.module_count - 8 {
                    continue;  // 右上角区域
                }
                if row >= self.module_count - 8 && col <= 8 {
                    continue;  // 左下角区域
                }
                
                // 跳过已经设置的位置
                if self.modules[row as usize][col as usize].is_some() {
                    continue;
                }

                for r in -2..=2 {
                    for c in -2..=2 {
                        let new_row = row + r;
                        let new_col = col + c;
                        // 确保不越界
                        if new_row < 0 || new_row >= self.module_count ||
                           new_col < 0 || new_col >= self.module_count {
                            continue;
                        }
                        let is_dark = r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0);
                        self.modules[new_row as usize][new_col as usize] = Some(is_dark);
                    }
                }
            }
        }
    }

    fn setup_timing_pattern(&mut self) {
        for r in 8..self.module_count - 8 {
            if self.modules[r as usize][6].is_none() {
                self.modules[r as usize][6] = Some(r % 2 == 0);
            }
        }
        for c in 8..self.module_count - 8 {
            if self.modules[6][c as usize].is_none() {
                self.modules[6][c as usize] = Some(c % 2 == 0);
            }
        }
    }

    fn setup_type_info(&mut self, _test: bool) {
        let g15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
        let g15_mask = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

        let mask_pattern = 0;
        let correct_level = match self.options.correct_level {
            QRErrorCorrectLevel::L => 1,
            QRErrorCorrectLevel::M => 0,
            QRErrorCorrectLevel::Q => 3,
            QRErrorCorrectLevel::H => 2,
        };

        let mut data = (correct_level << 3) | mask_pattern;
        let mut d = data << 10;

        while get_bch_digit(d) - get_bch_digit(g15) >= 0 {
            d ^= g15 << (get_bch_digit(d) - get_bch_digit(g15));
        }

        data = ((data << 10) | d) ^ g15_mask;

        // 水平类型信息（第 8 行）
        for i in 0..15 {
            let bit = ((data >> i) & 1) == 1;

            if i < 6 {
                self.modules[i as usize][8] = Some(bit);
            } else if i < 8 {
                self.modules[(i + 1) as usize][8] = Some(bit);
            } else {
                self.modules[(self.module_count - 15 + i) as usize][8] = Some(bit);
            }
        }

        // 垂直类型信息（第 8 列）- 匹配 JS 实现
        for i in 0..8 {
            let bit = ((data >> i) & 1) == 1;
            // moduleCount - 1, moduleCount - 2, ..., moduleCount - 8
            self.modules[8][(self.module_count - 1 - i) as usize] = Some(bit);
        }
        for i in 8..15 {
            let bit = ((data >> i) & 1) == 1;
            // 15-8=7, 15-9=6, ..., 15-14=1
            self.modules[8][(15 - i) as usize] = Some(bit);
        }

        // 固定暗模块
        self.modules[(self.module_count - 8) as usize][8] = Some(true);
    }

    fn setup_type_number(&mut self, _test: bool) {
        // 简化版本
    }

    fn map_data(&mut self, data: &[i32]) {
        let mut inc = -1;
        let mut row = self.module_count - 1;
        let mut bit_index = 7;
        let mut byte_index = 0;

        let mut col = self.module_count - 1;
        while col > 0 {
            // Skip column 6 (timing pattern column)
            if col == 6 {
                col -= 1;
            }

            loop {
                for c in 0..2 {
                    let col_idx = col - c;
                    if col_idx < 0 || col_idx >= self.module_count {
                        continue;
                    }
                    if self.modules[row as usize][col_idx as usize].is_none() {
                        let mut dark = false;
                        if byte_index < data.len() {
                            dark = ((data[byte_index] >> bit_index) & 1) == 1;
                        }

                        // Mask pattern: (row + col - c) % 2 === 0 in JS
                        let mask = (row + col - c) % 2 == 0;
                        if mask {
                            dark = !dark;
                        }

                        self.modules[row as usize][col_idx as usize] = Some(dark);

                        if bit_index == 0 {
                            bit_index = 7;
                            byte_index += 1;
                        } else {
                            bit_index -= 1;
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

    fn create_data(&self) -> Vec<i32> {
        let rs_blocks = get_rs_blocks(self.type_number, self.options.correct_level);
        
        let mut buffer = BitBuffer::new();

        for data in &self.data_list {
            buffer.put(QRMode::MODE_8BIT_BYTE, 4);
            buffer.put(data.get_length() as i32, get_length_in_bits(QRMode::MODE_8BIT_BYTE, self.type_number));
            data.write(&mut buffer);
        }

        let mut total_data_count = 0;
        for block in &rs_blocks {
            total_data_count += block.data_count;
        }

        if buffer.length + 4 <= total_data_count as usize * 8 {
            buffer.put(0, 4);
        }

        while buffer.length % 8 != 0 {
            buffer.put_bit(false);
        }

        loop {
            if buffer.length >= total_data_count as usize * 8 {
                break;
            }
            buffer.put(0xEC, 8);
            if buffer.length >= total_data_count as usize * 8 {
                break;
            }
            buffer.put(0x11, 8);
        }

        #[cfg(test)]
        eprintln!("DEBUG: buffer.length={}, buffer.buffer.len={}, total_data_count*8={}", buffer.length, buffer.buffer.len(), total_data_count as usize * 8);

        let data = buffer.buffer;
        

        
        let mut offset = 0;
        let max_dc_count = rs_blocks.iter().map(|b| b.data_count).max().unwrap_or(0);
        let max_ec_count = rs_blocks.iter().map(|b| b.total_count - b.data_count).max().unwrap_or(0);

        let mut dcdata: Vec<Vec<i32>> = Vec::new();
        let mut ecdata: Vec<Vec<i32>> = Vec::new();

        for block in &rs_blocks {
            let dc_count = block.data_count;
            let ec_count = block.total_count - dc_count;

            dcdata.push(data[offset as usize..(offset + dc_count) as usize].to_vec());
            offset += dc_count;

            // 生成 Reed-Solomon 纠错码
            // 数据多项式: d(x) = d_0*x^(n-1) + d_1*x^(n-2) + ... + d_{n-1}
            // 系数按降序排列（JS 匹配）
            let rs_poly = crate::qr_polynomial::Polynomial::generate_rs_poly(ec_count);

            // 创建数据多项式并扩展 ec_count 个零
            // 在降序表示中，在末尾添加零相当于乘以 x^ec_count
            let dc = dcdata.last().unwrap();
            let mut raw_coeff = dc.clone();
            for _ in 0..ec_count {
                raw_coeff.push(0);
            }
            let raw_poly = crate::qr_polynomial::Polynomial::new(raw_coeff, 0);

            // 计算纠错码: (数据多项式 * x^{ec_count}) mod 生成多项式
            let mod_poly = raw_poly.r#mod(&rs_poly);

            // 提取纠错码：取 mod_poly 的最后 ec_count 个系数（最低次项）
            // 降序排列中，最低次项在数组末尾
            // 匹配 JS 实现: const modIndex = i + modPoly.length - ecCount;
            let mut ec: Vec<i32> = Vec::with_capacity(ec_count as usize);
            for i in 0..ec_count {
                let mod_index = i as i32 + mod_poly.len() as i32 - ec_count;
                let val = if mod_index >= 0 {
                    mod_poly.get(mod_index as usize)
                } else {
                    0
                };
                #[cfg(test)]
                if i < 5 { eprintln!("DEBUG: ec[{}] = {} (mod_index={})", i, val, mod_index); }
                ec.push(val);
            }
            ecdata.push(ec);
        }

        let mut result: Vec<i32> = Vec::new();
        
        for i in 0..max_dc_count {
            for r in 0..rs_blocks.len() {
                if i < dcdata[r].len() as i32 {
                    result.push(dcdata[r][i as usize]);
                }
            }
        }
        

        
        for i in 0..max_ec_count {
            for r in 0..rs_blocks.len() {
                if i < ecdata[r].len() as i32 {
                    result.push(ecdata[r][i as usize]);
                }
            }
        }



        result
    }
}

impl QRCode {
    /// 生成 SVG 字符串（高性能版本 - 使用 Path 合并 + write! 优化）
    pub fn get_svg(&self) -> String {
        let count = self.module_count;
        if count == 0 {
            return String::new();
        }

        let size = 256;
        let cell_size = size / count;
        let actual_size = cell_size * count;
        let offset = (size - actual_size) / 2;
        
        // 估算容量：约 50% 模块为深色，每个模块约 25 字节
        let estimated_dark = (count * count) as usize / 2;
        let mut svg = String::with_capacity(350 + estimated_dark * 25);
        
        // SVG 头部 - 使用 write! 避免临时字符串
        write!(
            svg,
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {0} {0}" width="{0}" height="{0}"><path d="M0 0h{0}v{0}H0z" fill="{1}"/><path fill="{2}" d=""#,
            size, self.options.color_light, self.options.color_dark
        ).unwrap();

        // 使用单个 Path 绘制所有深色模块
        // 展平二维访问为一维，减少边界检查开销
        let modules_flat: Vec<bool> = self.modules.iter()
            .flat_map(|row| row.iter().map(|&m| m.unwrap_or(false)))
            .collect();
        
        let count_i32 = count;
        for (idx, is_dark) in modules_flat.iter().enumerate() {
            if *is_dark {
                let row = (idx as i32) / count_i32;
                let col = (idx as i32) % count_i32;
                let x = col * cell_size + offset;
                let y = row * cell_size + offset;
                write!(svg, "M{x} {y}h{cell_size}v{cell_size}h-{cell_size}z").unwrap();
            }
        }
        
        svg.push_str(r#""/></svg>"#);
        svg
    }
}

impl Default for QRCode {
    fn default() -> Self {
        Self::new()
    }
}
