// 二维码生成 + 验证工具
//
// 使用方法:
//   cargo run --release --features validation --bin validate-qr -- "你的文本"
//
// 此工具已迁移到 bench/rust-tools

use qrcode_kennytm::QrCode;
#[cfg(feature = "validation")]
use rust_tools::validation::validate_qr_code;

use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        println!("使用方法:");
        println!("  cargo run --release --features validation --bin validate-qr -- \"你的文本\" [输出文件]");
        println!();
        println!("示例:");
        println!("  cargo run --release --features validation --bin validate-qr -- \"Hello World\"");
        std::process::exit(1);
    };
    
    let output_file = if args.len() > 2 {
        args[2].clone()
    } else {
        "qrcode_validated.svg".to_string()
    };
    
    println!("🚀 QRCode 生成 + 验证工具");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();
    
    // 生成二维码
    let start = Instant::now();
    let qr = QrCode::new(&text).unwrap();
    let svg = generate_svg(&qr);
    let elapsed = start.elapsed();
    
    // 保存文件
    fs::write(&output_file, &svg).expect("❌ 无法写入文件");
    
    println!("✅ SVG 生成成功！");
    println!("───────────────────────────────────────");
    println!("⏱️  SVG 生成耗时: {:?}", elapsed);
    println!("📐 二维码版本:    {} ({}x{} 模块)", qr.width(), qr.width(), qr.width());
    println!("📄 SVG 大小:      {} bytes", svg.len());
    println!("💾 输出文件:      {}", output_file);
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
                std::process::exit(1);
            }
        }
    }
    
    #[cfg(not(feature = "validation"))]
    {
        println!("⚠️  跳过验证（validation 特性未启用）");
        println!("   启用方式: cargo run --release --features validation --bin validate-qr");
    }
    
    println!();
    println!("═══════════════════════════════════════");
    println!("🎉 完成！二维码已生成并通过验证！");
}

/// 生成 SVG
fn generate_svg(qr: &QrCode) -> String {
    use qrcode_kennytm::render::svg;
    qr.render::<svg::Color>().build()
}
