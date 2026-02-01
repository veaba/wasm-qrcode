// 使用 kennytm/qrcode 生成正确的二维码，并验证
//
// 使用方法:
//   cargo run --release --features validation --bin simple-qr -- "你的文本"
//
// 此工具已迁移到 bench/rust-tools

#[cfg(feature = "validation")]
use qrcode_fast_tools::validation::validate_qr_code;
use qrcode_kennytm::QrCode;

use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    let args: Vec<String> = env::args().collect();

    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        "Hello World".to_string()
    };

    let output_file = if args.len() > 2 {
        args[2].clone()
    } else {
        "qrcode_simple.svg".to_string()
    };

    println!("🚀 简单二维码生成器 (使用 kennytm 默认渲染)");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();

    // 生成二维码（使用 kennytm 的默认渲染）
    let start = Instant::now();
    let qr = QrCode::new(&text).unwrap();
    let svg = qr.render::<qrcode_kennytm::render::svg::Color>().build();
    let elapsed = start.elapsed();

    // 保存文件
    fs::write(&output_file, &svg).expect("❌ 无法写入文件");

    println!("✅ SVG 生成成功！");
    println!("───────────────────────────────────────");
    println!("⏱️  生成耗时:   {:?}", elapsed);
    println!(
        "📐 二维码版本: {} ({}x{} 模块)",
        qr.width(),
        qr.width(),
        qr.width()
    );
    println!("📄 SVG 大小:   {} bytes", svg.len());
    println!("💾 输出文件:   {}", output_file);
    println!();

    // 验证二维码
    #[cfg(feature = "validation")]
    {
        println!("🔍 正在验证二维码...");
        println!("───────────────────────────────────────");

        let validate_start = Instant::now();
        match validate_qr_code(&svg, &text) {
            Ok(()) => {
                let validate_elapsed = validate_start.elapsed();
                println!("✅ 验证通过！");
                println!("   二维码可以被正确扫描");
                println!("   内容匹配: '{}'", text);
                println!("   验证耗时: {:?}", validate_elapsed);
            }
            Err(e) => {
                println!("❌ 验证失败！");
                println!("   错误: {}", e);
            }
        }
    }

    #[cfg(not(feature = "validation"))]
    {
        println!("⚠️  跳过验证（validation 特性未启用）");
        println!("   启用方式: cargo run --release --features validation --bin simple-qr");
    }

    println!();
    println!("═══════════════════════════════════════");
    println!("🎉 完成！");
}
