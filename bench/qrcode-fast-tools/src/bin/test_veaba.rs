// 直接测试 @veaba/qrcode-rust 和 @veaba/qrcode-fast 的原始输出
// 不使用 kennytm 的数据

use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        "Hello World".to_string()
    };
    
    println!("🧪 直接测试 @veaba 包");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!();

    // 1. 测试 qrcode-rust
    println!("📦 @veaba/qrcode-rust");
    println!("───────────────────────────────────────");
    test_qrcode_rust(&text);
    println!();

    // 2. 测试 qrcode-fast
    println!("📦 @veaba/qrcode-fast");
    println!("───────────────────────────────────────");
    test_qrcode_fast(&text);
    println!();
}

fn test_qrcode_rust(text: &str) {
    use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};
    
    let mut qr = QRCode::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevel::H,
    });
    
    qr.make_code(text);
    
    println!("类型号: {}", qr.type_number);
    println!("模块数: {}x{}", qr.module_count, qr.module_count);
    
    // 生成 SVG
    let svg = generate_rust_svg(&qr);
    let file = "test_rust_veaba.svg";
    fs::write(file, &svg).unwrap();
    println!("✅ 已生成: {}", file);
    println!("📄 SVG 大小: {} bytes", svg.len());
    
    // 尝试解码
    #[cfg(feature = "validation")]
    {
        use qrcode_fast_tools::validation::validate_qr_code;
        println!("🔍 验证...");
        match validate_qr_code(&svg, text) {
            Ok(()) => println!("✅ 验证通过！"),
            Err(e) => println!("❌ 验证失败: {}", e),
        }
    }
}

fn test_qrcode_fast(text: &str) {
    use qrcode_fast::{QRCode, QRErrorCorrectLevel};
    
    let mut qr = QRCode::with_options(QRErrorCorrectLevel::H);
    qr.make_code(text);
    
    println!("模块数: {}x{}", qr.module_count, qr.module_count);
    println!("⚠️  注意: qrcode-fast 生成的是伪数据，仅用于性能测试");
    
    // 生成 SVG
    let svg = qr.get_svg();
    let file = "test_fast_veaba.svg";
    fs::write(file, &svg).unwrap();
    println!("✅ 已生成: {}", file);
    println!("📄 SVG 大小: {} bytes", svg.len());
    
    // 尝试解码
    #[cfg(feature = "validation")]
    {
        use qrcode_fast_tools::validation::validate_qr_code;
        println!("🔍 验证...");
        match validate_qr_code(&svg, text) {
            Ok(()) => println!("✅ 验证通过！"),
            Err(e) => println!("❌ 验证失败 (预期): {}", e),
        }
    }
}

fn generate_rust_svg(qr: &qrcode_rust::QRCode) -> String {
    let count = qr.module_count;
    let size = 256;
    let cell_size = size / count;
    let actual_size = cell_size * count;
    let offset = (size - actual_size) / 2;
    
    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {} {}\" width=\"{}\" height=\"{}\">",
        size, size, size, size
    );
    
    svg.push_str(&format!(
        "<rect width=\"{}\" height=\"{}\" fill=\"#ffffff\" />",
        size, size
    ));
    
    for row in 0..count {
        for col in 0..count {
            if qr.is_dark(row, col) {
                svg.push_str(&format!(
                    "<rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" fill=\"#000000\" />",
                    col * cell_size + offset,
                    row * cell_size + offset,
                    cell_size,
                    cell_size
                ));
            }
        }
    }
    
    svg.push_str("</svg>");
    svg
}
