// 调试 QR 码模块矩阵
//
// 对比 qrcode-rust 和 kennytm 的模块矩阵

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust};

fn main() {
    let text = "Test QR Code 123";
    
    println!("🔍 调试 QR 码模块矩阵");
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
    
    // 输出模块矩阵
    println!("qrcode-rust 模块矩阵 (0=白, 1=黑):");
    for row in 0..qr.module_count {
        for col in 0..qr.module_count {
            let is_dark = qr.is_dark(row as i32, col as i32);
            print!("{}", if is_dark { 1 } else { 0 });
        }
        println!();
    }
}
