// 对比 qrcode-rust 和 kennytm 的模块矩阵

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust};

// kennytm 的参考矩阵 (0=白, 1=黑) - Test QR Code 123, v2
const KENNYTM_MATRIX: &str = r#"
1111111011100110101111111
1000001000100111001000001
1011101001111010001011101
1011101011001000101011101
1011101010110000001011101
1000001011000000101000001
1111111010101010101111111
0000000011100100100000000
1000101110000100111111001
0001110011110111000010010
1011001001100001101110000
0000010001000010101000100
0010011011100110111111111
1110000011101001000011000
0000011111111111000001100
0011110011010101110001110
1111001010101100111110111
0000000011100111100010011
1111111011100000101011100
1000001000101011100010110
1011101011110110111111001
1011101001001000011100011
1011101001011111111000110
1000001001010101000010110
1111111010101100011111011
"#;

fn main() {
    let text = "Test QR Code 123";

    println!("🔍 对比 QR 码模块矩阵");
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
                    println!(
                        "  ({:2}, {:2}): kennytm={}, rust={}",
                        row,
                        col,
                        if kennytm_dark { 1 } else { 0 },
                        if rust_dark { 1 } else { 0 }
                    );
                }
            }
        }
    }

    println!();
    println!("总差异数: {}", total_diff);

    // 打印两个矩阵的对比
    println!("\n═══════════════════════════════════════════════════════════════════");
    println!("并排对比 (K=kennytm, R=rust, X=不同):");
    for (row, line) in kennytm_lines.iter().enumerate() {
        let mut row_str = String::new();
        for (col, c) in line.chars().enumerate() {
            let kennytm_dark = c == '1';
            let rust_dark = qr.is_dark(row as i32, col as i32);

            if kennytm_dark == rust_dark {
                row_str.push(if kennytm_dark { '█' } else { ' ' });
            } else {
                row_str.push('X');
            }
        }
        println!("{}", row_str);
    }
}
