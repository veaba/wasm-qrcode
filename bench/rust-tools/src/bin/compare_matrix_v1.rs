// 对比 qrcode-rust 和 kennytm 的模块矩阵 - 版本 1

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust};

// kennytm 的参考矩阵 (0=白, 1=黑) - Hello World, v1
const KENNYTM_MATRIX: &str = r#"
111111100100101111111
100000101011001000001
101110100100101011101
101110100100001011101
101110101110101011101
100000100010101000001
111111101010101111111
000000000101100000000
101010100111000010010
010110011000001110011
010000111010110111111
011011011100000010010
010110101110110110000
000000001011010000110
111111100111000110111
100000100001100100001
101110101111000010000
101110100111001110110
101110101010101010101
100000100011000010010
111111101101100100011
"#;

fn main() {
    let text = "Hello World";
    
    println!("🔍 对比 QR 码模块矩阵 (版本 1)");
    println!("═══════════════════════════════════════════════════════════════════");
    println!("文本: {}", text);
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
    
    println!("类型号: {}", qr.type_number);
    println!("模块数: {}x{}", qr.module_count, qr.module_count);
    println!();
    
    // 解析 kennytm 矩阵
    let kennytm_lines: Vec<&str> = KENNYTM_MATRIX.trim().lines().collect();
    
    let mut total_diff = 0;
    let mut diff_positions = Vec::new();
    
    println!("差异位置 (行,列):");
    for (row, line) in kennytm_lines.iter().enumerate() {
        for (col, c) in line.chars().enumerate() {
            let kennytm_dark = c == '1';
            let rust_dark = qr.is_dark(row as i32, col as i32);
            
            if kennytm_dark != rust_dark {
                total_diff += 1;
                if diff_positions.len() < 30 {
                    diff_positions.push((row, col, kennytm_dark, rust_dark));
                    println!("  ({:2}, {:2}): kennytm={}, rust={}", 
                             row, col, 
                             if kennytm_dark { 1 } else { 0 },
                             if rust_dark { 1 } else { 0 });
                }
            }
        }
    }
    
    println!();
    println!("总差异数: {}", total_diff);
    
    // 打印两个矩阵的对比
    println!();
    println!("qrcode-rust 矩阵:");
    for row in 0..qr.module_count {
        for col in 0..qr.module_count {
            let is_dark = qr.is_dark(row, col);
            print!("{}", if is_dark { '1' } else { '0' });
        }
        println!();
    }
    
    println!();
    println!("kennytm 矩阵:");
    for line in kennytm_lines.iter() {
        println!("{}", line);
    }
}
