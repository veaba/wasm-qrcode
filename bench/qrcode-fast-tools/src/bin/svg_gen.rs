// qrcode-fast SVG 生成工具
// 
// 使用方法:
//   cargo run --release --bin svg-gen -- "你的文本" [输出文件]
//
// 示例:
//   cargo run --release --bin svg-gen -- "Hello World"
//   cargo run --release --bin svg-gen -- "https://example.com" mycode.svg
//
// 此工具已迁移到 bench/qrcode-fast-tools

use qrcode_kennytm::QrCode;
use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        println!("使用方法:");
        println!("  cargo run --release --bin svg-gen -- \"你的文本\" [输出文件]");
        println!();
        println!("示例:");
        println!("  cargo run --release --bin svg-gen -- \"Hello World\"");
        println!("  cargo run --release --bin svg-gen -- \"https://example.com\" mycode.svg");
        std::process::exit(1);
    };
    
    let output_file = if args.len() > 2 {
        args[2].clone()
    } else {
        "qrcode_output.svg".to_string()
    };
    
    println!("🚀 SVG 生成器 (kennytm/qrcode)");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();
    
    // 生成二维码
    let start = Instant::now();
    let qr = QrCode::new(&text).unwrap();
    let svg = qr.render::<qrcode_kennytm::render::svg::Color>().build();
    let elapsed = start.elapsed();
    
    // 保存文件
    fs::write(&output_file, &svg).expect("❌ 无法写入文件");
    
    println!("✅ 生成成功！");
    println!("───────────────────────────────────────");
    println!("⏱️  耗时:        {:?}", elapsed);
    println!("📐 二维码版本:   {} ({}x{} 模块)", qr.width(), qr.width(), qr.width());
    println!("📄 SVG 大小:     {} bytes", svg.len());
    println!("💾 输出文件:     {}", output_file);
    println!("═══════════════════════════════════════");
}
