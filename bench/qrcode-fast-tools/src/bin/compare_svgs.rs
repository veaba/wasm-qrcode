// QRCode 性能对比工具 - 对比不同库的性能
//
// 使用方法:
//   cargo run --release --bin compare-svgs -- "你的文本"
//
// 注意: 此工具已迁移到 bench/qrcode-fast-tools
// 原 qrcode-fast 库已简化为性能测试版本

use qrcode_kennytm::{QrCode, render::svg};

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
    
    let warmup_iterations = 100;
    let test_iterations = 1000;
    
    println!("╔══════════════════════════════════════════════════════════════════╗");
    println!("║           QRCode 生成性能对比 - kennytm/qrcode                   ║");
    println!("╚══════════════════════════════════════════════════════════════════╝");
    println!();
    println!("测试文本: {}", text);
    println!("文本长度: {} 字符", text.len());
    println!("预热次数: {} 次", warmup_iterations);
    println!("测试次数: {} 次", test_iterations);
    println!();
    
    // 预热
    for _ in 0..warmup_iterations {
        let qr = QrCode::new(&text).unwrap();
        let _ = qr.render::<svg::Color>().build();
    }
    
    // 正式测试
    let start = Instant::now();
    for _ in 0..test_iterations {
        let qr = QrCode::new(&text).unwrap();
        let _ = qr.render::<svg::Color>().build();
    }
    let elapsed = start.elapsed();
    let avg = elapsed / test_iterations;
    
    // 生成示例 SVG
    let qr = QrCode::new(&text).unwrap();
    let svg = qr.render::<svg::Color>().build();
    fs::write("qrcode_kennytm_output.svg", &svg).expect("写入失败");
    
    println!("性能测试结果:");
    println!();
    println!("┌─────────────────────┬──────────────────┬──────────────────┐");
    println!("│ 库                  │ 平均耗时 (单次)  │ 总耗时 ({}次)   │", test_iterations);
    println!("├─────────────────────┼──────────────────┼──────────────────┤");
    println!("│ {:<19} │ {:>14?}   │ {:>14?}   │", 
        "kennytm/qrcode", 
        avg, 
        elapsed
    );
    println!("└─────────────────────┴──────────────────┴──────────────────┘");
    println!();
    println!("📁 生成的 SVG 文件: qrcode_kennytm_output.svg ({} bytes)", svg.len());
    println!();
    println!("提示: 完整的对比工具请查看 bench/qrcode-fast-tools");
}
