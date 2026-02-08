// 调试 @veaba/qrcode-rust 的实现
// 对比 kennytm 的正确实现

use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        "Hello World".to_string()
    };
    
    println!("🔍 QRCode 调试工具");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!();

    // 1. 检查 kennytm 的实现
    println!("📦 kennytm/qrcode (参考实现)");
    println!("───────────────────────────────────────");
    let qr_kennytm = qrcode_kennytm::QrCode::new(&text).unwrap();
    let width = qr_kennytm.width();
    println!("版本: {} ({}x{} 模块)", (width - 17) / 4, width, width);
    
    // 打印模块数据
    println!("\n前 10x10 模块:");
    for row in 0..10.min(width) {
        for col in 0..10.min(width) {
            let c = match qr_kennytm[(col, row)] {
                qrcode_kennytm::Color::Dark => "██",
                qrcode_kennytm::Color::Light => "  ",
            };
            print!("{}", c);
        }
        println!();
    }
    println!();

    // 2. 检查我们的实现
    println!("📦 @veaba/qrcode-rust");
    println!("───────────────────────────────────────");
    use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};
    
    let mut qr_rust = QRCode::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevel::H,
    });
    qr_rust.make_code(&text);
    
    println!("类型号: {}", qr_rust.type_number);
    println!("模块数: {}x{}", qr_rust.module_count, qr_rust.module_count);
    
    // 打印模块数据
    let count = qr_rust.module_count as usize;
    println!("\n前 10x10 模块:");
    for row in 0..10.min(count) {
        for col in 0..10.min(count) {
            let c = if qr_rust.is_dark(row as i32, col as i32) {
                "██"
            } else {
                "  "
            };
            print!("{}", c);
        }
        println!();
    }
    println!();

    // 3. 对比位置探测图案
    println!("🔍 对比位置探测图案 (左上角 9x9)");
    println!("───────────────────────────────────────");
    println!("kennytm    |    qrcode-rust");
    println!("           |");
    
    for row in 0..9 {
        // kennytm
        for col in 0..9 {
            let c = match qr_kennytm[(col, row)] {
                qrcode_kennytm::Color::Dark => "██",
                qrcode_kennytm::Color::Light => "  ",
            };
            print!("{}", c);
        }
        print!("   |   ");
        
        // qrcode-rust
        for col in 0..9 {
            let c = if qr_rust.is_dark(row as i32, col) {
                "██"
            } else {
                "  "
            };
            print!("{}", c);
        }
        println!();
    }
    println!();

    // 4. 检查数据区域差异
    println!("🔍 数据区域差异统计");
    println!("───────────────────────────────────────");
    let mut diff_count = 0;
    let mut total_modules = 0;
    
    for row in 0..width.min(qr_rust.module_count as usize) {
        for col in 0..width.min(qr_rust.module_count as usize) {
            let kennytm_dark = matches!(qr_kennytm[(col, row)], qrcode_kennytm::Color::Dark);
            let rust_dark = qr_rust.is_dark(row as i32, col as i32);
            
            if kennytm_dark != rust_dark {
                diff_count += 1;
            }
            total_modules += 1;
        }
    }
    
    println!("总模块数: {}", total_modules);
    println!("差异模块数: {}", diff_count);
    println!("差异比例: {:.2}%", (diff_count as f64 / total_modules as f64) * 100.0);
}
