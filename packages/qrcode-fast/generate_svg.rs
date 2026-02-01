// 生成 SVG 文件的示例脚本
// 使用方法: rustc generate_svg.rs -L target/release/deps -o generate_svg && ./generate_svg

use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    // 获取命令行参数
    let args: Vec<String> = env::args().collect();
    
    let text = if args.len() > 1 {
        &args[1]
    } else {
        "https://github.com/veaba/qrcodes"
    };
    
    let output_file = if args.len() > 2 {
        &args[2]
    } else {
        "qrcode_output.svg"
    };
    
    println!("🚀 qrcode-fast - 生成 SVG");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();
    
    // 这里需要链接到 qrcode-fast 库
    // 由于 Rust 不能直接运行依赖外部 crate 的脚本，
    // 我们提供两种方法：
    
    println!("请使用以下命令之一：");
    println!();
    println!("方法1 - 使用 cargo run:");
    println!("  cargo run --example generate_svg -- '{}' {}", text, output_file);
    println!();
    println!("方法2 - 运行基准测试对比:");
    println!("  cargo bench --bench compare");
}
