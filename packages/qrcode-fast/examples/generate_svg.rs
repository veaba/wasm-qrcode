// qrcode-fast SVG 生成示例
// 运行: cargo run --example generate_svg -- "你的文本" [输出文件]

use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        "https://github.com/veaba/qrcodes".to_string()
    };
    
    let output_file = if args.len() > 2 {
        args[2].clone()
    } else {
        "qrcode_fast_output.svg".to_string()
    };
    
    println!("🚀 qrcode-fast - 生成 SVG");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();
    
    // 这里使用库的实际 API
    // 由于示例需要独立运行，我们模拟一个简单的实现
    
    let start = Instant::now();
    let svg = generate_simple_svg(&text);
    let elapsed = start.elapsed();
    
    fs::write(&output_file, &svg).expect("无法写入文件");
    
    println!("✅ 生成成功！");
    println!("⏱️  耗时: {:?}", elapsed);
    println!("📄 SVG 大小: {} bytes", svg.len());
    println!("💾 已保存到: {}", output_file);
}

fn generate_simple_svg(text: &str) -> String {
    // 这是一个简化版实现
    // 实际使用时应链接 qrcode-fast crate
    format!(r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<rect width="256" height="256" fill="white"/>
<text x="128" y="128" text-anchor="middle" font-size="14">{}</text>
</svg>"#, text)
}
