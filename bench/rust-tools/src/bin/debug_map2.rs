// 调试数据位映射 - 修正固定图案标记

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust};

fn main() {
    let text = "Test QR Code 123";
    
    println!("🔍 调试数据位映射 (修正版)");
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
    let module_count = qr.module_count as usize;
    
    println!("数据 ({} 字节):", data.len());
    for (i, byte) in data.iter().enumerate() {
        print!("{:02X} ", byte);
        if (i + 1) % 16 == 0 {
            println!();
        }
    }
    println!();
    
    // 创建一个标记哪些位置是数据位的矩阵
    // 使用 qrcode-rust 的 modules 来判断
    // 实际上，我们需要检查 qrcode-rust 的 setup_*_pattern 函数
    
    // 让我通过 is_dark 和手动检查来重建固定图案
    let mut is_fixed = vec![vec![false; module_count]; module_count];
    
    // 定位图案 (3个角): 7x7 区域 + 1 分隔符
    for r in 0..8 {
        for c in 0..8 {
            is_fixed[r][c] = true; // 左上
            is_fixed[r][module_count - 8 + c] = true; // 右上
            is_fixed[module_count - 8 + r][c] = true; // 左下
        }
    }
    
    // 定时图案 (第6行和第6列)
    for i in 8..(module_count - 8) {
        is_fixed[6][i] = true;
        is_fixed[i][6] = true;
    }
    
    // 对齐图案 (版本2在(18,18))
    let align_centers = [(18, 18)];
    for (cr, cc) in align_centers.iter() {
        for r in (cr - 2)..=(cr + 2) {
            for c in (cc - 2)..=(cc + 2) {
                if r >= 0 && r < module_count as i32 && c >= 0 && c < module_count as i32 {
                    is_fixed[r as usize][c as usize] = true;
                }
            }
        }
    }
    
    // 暗模块 (版本2在 (4*2+9, 8) = (17, 8))
    is_fixed[17][8] = true;
    
    // 格式信息区域
    // 左上: 第8行 (0-8列) 和 第8列 (0-8行)
    for i in 0..9 {
        is_fixed[8][i] = true;
        is_fixed[i][8] = true;
    }
    // 右上: 第8行 (module_count-8 到 module_count-1)
    for i in (module_count - 8)..module_count {
        is_fixed[8][i] = true;
    }
    // 左下: 第8列 (module_count-8 到 module_count-1)
    for i in (module_count - 8)..module_count {
        is_fixed[i][8] = true;
    }
    
    println!();
    println!("模块矩阵 (D=数据位, X=固定图案, .=空):");
    for row in 0..module_count {
        for col in 0..module_count {
            let is_data = !is_fixed[row][col];
            let is_dark = qr.is_dark(row as i32, col as i32);
            
            if is_data {
                print!("{}", if is_dark { 'D' } else { 'd' });
            } else {
                print!("{}", if is_dark { 'X' } else { '.' });
            }
        }
        println!();
    }
    
    // 对比 kennytm 的矩阵
    println!();
    println!("kennytm 的矩阵:");
    println!("XXXXXXX.XXX..XX.X.XXXXXXX");
    println!("X.....X...X..XXX..X.....X");
    println!("X.XXX.X..XXXX.X...X.XXX.X");
    
    // 检查差异
    println!();
    println!("检查第0行:");
    let kennytm_row0 = "XXXXXXX.XXX..XX.X.XXXXXXX";
    for (col, c) in kennytm_row0.chars().enumerate() {
        let is_data_kennytm = c == 'D' || c == 'd';
        let is_data_rust = !is_fixed[0][col];
        if is_data_kennytm != is_data_rust {
            println!("  列 {}: kennytm={}, rust={}", col, 
                     if is_data_kennytm { "data" } else { "fixed" },
                     if is_data_rust { "data" } else { "fixed" });
        }
    }
}
