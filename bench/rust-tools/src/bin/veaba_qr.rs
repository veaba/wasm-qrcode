// 使用 @veaba/qrcode-rust 和 @veaba/qrcode-fast 生成二维码
// 并与 kennytm-qrcode 进行对比
// 使用 rust-tools/bin/validate_qr.rs 验证
//
// 使用方法:
//   cargo run --release --features validation --bin veaba-qr -- "你的文本"

use std::env;
use std::fs;
use std::time::Instant;

#[cfg(feature = "validation")]
use rust_tools::validation::validate_qr_code;

fn main() {
    let args: Vec<String> = env::args().collect();

    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        "https://github.com/veaba/qrcodes".to_string()
    };

    println!("🚀 @veaba QRCode 生成器 vs kennytm-qrcode");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!();

    // 1. 使用 qrcode-rust 生成
    println!("📦 @veaba/qrcode-rust");
    println!("───────────────────────────────────────");
    let (rust_svg, rust_valid) = generate_with_rust(&text);
    let rust_file = "@veaba_qrcode_rust.svg";
    fs::write(rust_file, &rust_svg).expect("❌ 无法写入文件");
    println!("✅ 已生成: {}", rust_file);

    if rust_valid {
        println!("✅ 验证通过！");
    } else {
        println!("❌ 验证失败 - 包实现需要修复");
    }
    println!();

    // 2. 使用 qrcode-fast 生成
    println!("📦 @veaba/qrcode-fast");
    println!("───────────────────────────────────────");
    let (fast_svg, fast_valid) = generate_with_fast(&text);
    let fast_file = "@veaba_qrcode_fast.svg";
    fs::write(fast_file, &fast_svg).expect("❌ 无法写入文件");
    println!("✅ 已生成: {}", fast_file);

    if fast_valid {
        println!("✅ 验证通过！");
    } else {
        println!("❌ 验证失败 - 需要修复实现");
    }
    println!();

    // 3. 使用 kennytm-qrcode 生成 (对比)
    println!("📦 kennytm-qrcode (社区库)");
    println!("───────────────────────────────────────");
    let (kennytm_svg, kennytm_valid) = generate_with_kennytm(&text);
    let kennytm_file = "qrcode_kennytm.svg";
    fs::write(kennytm_file, &kennytm_svg).expect("❌ 无法写入文件");
    println!("✅ 已生成: {}", kennytm_file);

    if kennytm_valid {
        println!("✅ 验证通过！");
    } else {
        println!("❌ 验证失败");
    }
    println!();

    println!("═══════════════════════════════════════");
    println!("🎉 完成！");
    println!();
    println!("生成的文件:");
    println!("  - {} (@veaba/qrcode-rust 生成)", rust_file);
    println!("  - {} (@veaba/qrcode-fast 生成)", fast_file);
    println!("  - {} (kennytm-qrcode 生成)", kennytm_file);
}

/// 使用 qrcode-rust 生成二维码
fn generate_with_rust(text: &str) -> (String, bool) {
    use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};

    let start = Instant::now();

    let mut qr = QRCode::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevel::M, // 使用 M 级别以匹配 kennytm 默认值
    });
    qr.make_code(text);

    let svg = generate_svg_from_rust(&qr);
    let elapsed = start.elapsed();

    println!("⏱️  生成耗时: {:?}", elapsed);
    println!(
        "📐 二维码版本: {} ({}x{} 模块)",
        qr.type_number, qr.module_count, qr.module_count
    );
    println!("📄 SVG 大小: {} bytes", svg.len());

    // 验证
    #[cfg(feature = "validation")]
    {
        println!("🔍 验证中...");
        match validate_qr_code(&svg, text) {
            Ok(()) => {
                println!("✅ 验证通过！");
                (svg, true)
            }
            Err(e) => {
                println!("❌ 验证失败: {}", e);
                (svg, false)
            }
        }
    }

    #[cfg(not(feature = "validation"))]
    {
        println!("⚠️  跳过验证（validation 特性未启用）");
        (svg, false)
    }
}

/// 从 qrcode-rust 生成 SVG
fn generate_svg_from_rust(qr: &qrcode_rust::QRCode) -> String {
    let count = qr.module_count;
    let size = 256;
    let cell_size = size / count;
    let actual_size = cell_size * count;
    let offset = (size - actual_size) / 2;

    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {} {}\" width=\"{}\" height=\"{}\">",
        size, size, size, size
    );

    // 背景
    svg.push_str(&format!(
        "<rect width=\"{}\" height=\"{}\" fill=\"#ffffff\" />",
        size, size
    ));

    // 绘制模块
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

/// 使用 qrcode-fast 生成二维码
fn generate_with_fast(text: &str) -> (String, bool) {
    use qrcode_fast::{QRCode, QRErrorCorrectLevel};

    let start = Instant::now();

    let mut qr = QRCode::with_options(QRErrorCorrectLevel::M); // 使用 M 级别
    qr.make_code(text);

    let svg = qr.get_svg();
    let elapsed = start.elapsed();

    println!("⏱️  生成耗时: {:?}", elapsed);
    println!(
        "📐 二维码版本: {} ({}x{} 模块)",
        qr.module_count, qr.module_count, qr.module_count
    );
    println!("📄 SVG 大小: {} bytes", svg.len());
    println!("✅ 完整 QR 码实现，高性能优化版");

    // 验证
    #[cfg(feature = "validation")]
    {
        println!("🔍 验证中...");
        match validate_qr_code(&svg, text) {
            Ok(()) => {
                println!("✅ 验证通过！");
                (svg, true)
            }
            Err(e) => {
                println!("❌ 验证失败: {}", e);
                (svg, false)
            }
        }
    }

    #[cfg(not(feature = "validation"))]
    {
        println!("⚠️  跳过验证（validation 特性未启用）");
        (svg, false)
    }
}

/// 使用 kennytm-qrcode 生成二维码 (对比)
fn generate_with_kennytm(text: &str) -> (String, bool) {
    use qrcode_kennytm::render::svg;
    use qrcode_kennytm::QrCode;

    let start = Instant::now();

    let qr = QrCode::new(text).unwrap();
    let svg = qr.render::<svg::Color>().build();
    let elapsed = start.elapsed();

    println!("⏱️  生成耗时: {:?}", elapsed);
    println!("📐 二维码版本: {:?}", qr.version());
    println!("📄 SVG 大小: {} bytes", svg.len());
    println!("📦 社区流行库，作为性能对比基准");

    // 验证
    #[cfg(feature = "validation")]
    {
        println!("🔍 验证中...");
        match validate_qr_code(&svg, text) {
            Ok(()) => {
                println!("✅ 验证通过！");
                (svg, true)
            }
            Err(e) => {
                println!("❌ 验证失败: {}", e);
                (svg, false)
            }
        }
    }

    #[cfg(not(feature = "validation"))]
    {
        println!("⚠️  跳过验证（validation 特性未启用）");
        (svg, false)
    }
}
