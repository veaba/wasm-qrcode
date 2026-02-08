// 调试数据位映射

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust};

fn main() {
    let text = "Test QR Code 123";

    println!("🔍 调试数据位映射");
    println!("═══════════════════════════════════════════════════════════════════");
    println!("文本: '{}'", text);
    println!();

    // 创建 qrcode-rust 实例
    let mut qr = QRCodeRust::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: LevelRust::M,
    });
    qr.make_code(text);

    // 获取数据
    let data = qr.data_cache.as_ref().unwrap();

    println!("数据 ({} 字节):", data.len());
    for (i, byte) in data.iter().enumerate() {
        print!("{:02X} ", byte);
        if (i + 1) % 16 == 0 {
            println!();
        }
    }
    println!();

    // 模拟 map_data 来跟踪数据位位置
    let module_count = qr.module_count;
    let mut inc = -1;
    let mut row = module_count - 1;
    let mut bit_index = 7;
    let mut byte_index = 0;
    let mut col = module_count - 1;

    // 创建一个标记哪些位置是数据位的矩阵
    // 固定图案的位置: 定位图案、定时图案、对齐图案、暗模块、格式信息
    let mut is_fixed = vec![vec![false; module_count as usize]; module_count as usize];

    // 定位图案 (3个角)
    for r in 0..9 {
        for c in 0..9 {
            is_fixed[r][c] = true; // 左上
            is_fixed[r][module_count as usize - 9 + c] = true; // 右上
            is_fixed[module_count as usize - 9 + r][c] = true; // 左下
        }
    }

    // 定时图案 (第6行和第6列)
    for i in 8..(module_count - 8) {
        is_fixed[6][i as usize] = true;
        is_fixed[i as usize][6] = true;
    }

    // 对齐图案 (版本2在(18,18))
    // 版本2的对齐图案中心在 (6, 18) 和 (18, 6) 和 (18, 18)
    // 但实际上版本2只有 (18, 18)
    let align_centers = [(18, 18)];
    for (cr, cc) in align_centers.iter() {
        for r in (cr - 2)..=(cr + 2) {
            for c in (cc - 2)..=(cc + 2) {
                if r >= 0 && r < module_count && c >= 0 && c < module_count {
                    is_fixed[r as usize][c as usize] = true;
                }
            }
        }
    }

    // 暗模块 (版本2在 (4*2+9, 8) = (17, 8))
    is_fixed[17][8] = true;

    // 格式信息区域
    // 左上: 第8行和第8列的0-8区域
    #[allow(clippy::needless_range_loop)]
    for i in 0..9 {
        is_fixed[8][i] = true;
        is_fixed[i][8] = true;
    }
    // 右上和左下区域
    let mc = module_count as usize;
    #[allow(clippy::needless_range_loop)]
    for i in (mc - 8)..mc {
        is_fixed[8][i] = true;  // 右上
        is_fixed[i][8] = true;  // 左下
    }

    println!();
    println!("模块矩阵 (D=数据位, X=固定图案, .=空):");
    for row in 0..module_count {
        for col in 0..module_count {
            let is_data = !is_fixed[row as usize][col as usize];
            let is_dark = qr.is_dark(row, col);

            if is_data {
                print!("{}", if is_dark { 'D' } else { 'd' });
            } else {
                print!("{}", if is_dark { 'X' } else { '.' });
            }
        }
        println!();
    }

    println!();
    println!("数据位位置 (行,列):");

    let mut positions = Vec::new();

    while col > 0 {
        if col == 6 {
            col -= 1;
        }

        loop {
            for c in 0..2 {
                let col_idx = col - c;
                if col_idx < 0 || col_idx >= module_count {
                    continue;
                }
                if !is_fixed[row as usize][col_idx as usize] {
                    let dark = if byte_index < data.len() {
                        ((data[byte_index] >> bit_index) & 1) == 1
                    } else {
                        false
                    };

                    let mask = (row + col_idx) % 2 == 0;
                    let final_dark = if mask { !dark } else { dark };

                    positions.push((row, col_idx, byte_index, bit_index, dark, mask, final_dark));

                    if bit_index == 0 {
                        bit_index = 7;
                        byte_index += 1;
                    } else {
                        bit_index -= 1;
                    }
                }
            }

            row += inc;

            if row < 0 || module_count <= row {
                row -= inc;
                inc = -inc;
                break;
            }
        }

        col -= 2;
    }

    // 打印前50个数据位
    for (i, (row, col, byte_idx, bit_idx, data_bit, mask, final_bit)) in
        positions.iter().take(50).enumerate()
    {
        println!(
            "  [{:3}] 位置({:2},{:2}) 字节[{:2}].位{} 数据={} mask={} 最终={}",
            i,
            row,
            col,
            byte_idx,
            bit_idx,
            if *data_bit { 1 } else { 0 },
            if *mask { 1 } else { 0 },
            if *final_bit { 1 } else { 0 }
        );
    }
}
