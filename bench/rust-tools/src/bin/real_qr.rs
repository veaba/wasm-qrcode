// 使用 qrcode-rust 的完整实现 + 高性能 SVG 生成
//
// 使用方法:
//   cargo run --release --bin real-qr -- "你的文本" [输出文件]

use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};
use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        println!("使用方法:");
        println!("  cargo run --release --bin real-qr -- \"你的文本\" [输出文件]");
        println!();
        println!("示例:");
        println!("  cargo run --release --bin real-qr -- \"Hello World\"");
        println!("  cargo run --release --bin real-qr -- \"https://example.com\" mycode.svg");
        std::process::exit(1);
    };
    
    let output_file = if args.len() > 2 {
        args[2].clone()
    } else {
        "qrcode_real.svg".to_string()
    };
    
    println!("🚀 QRCode 生成器 (使用完整编码 + 高性能 SVG)");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();
    
    // 创建 QRCode
    let mut qr = QRCode::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevel::H,
    });
    
    // 生成二维码数据
    qr.make_code(&text);
    
    // 预热
    let _ = generate_fast_svg(&qr, 256);
    
    // 计时生成 SVG
    let start = Instant::now();
    let svg = generate_fast_svg(&qr, 256);
    let elapsed = start.elapsed();
    
    // 保存文件
    fs::write(&output_file, &svg).expect("❌ 无法写入文件");
    
    // 统计
    let file_size = svg.len();
    let modules = qr.get_module_count();
    
    println!("✅ 生成成功！");
    println!("───────────────────────────────────────");
    println!("⏱️  耗时:        {:?}", elapsed);
    println!("📐 二维码版本:   {} ({}x{} 模块)", modules, modules, modules);
    println!("📄 SVG 大小:     {} bytes", file_size);
    println!("💾 输出文件:     {}", output_file);
    println!("═══════════════════════════════════════");
    println!();
    println!("提示: 这是一个真正可扫描的二维码！");
}

/// 高性能 SVG 生成 - 使用扁平数组和预分配
fn generate_fast_svg(qr: &QRCode, size: i32) -> String {
    let count = qr.get_module_count();
    if count == 0 {
        return String::new();
    }

    let cell_size = size / count;
    let actual_size = cell_size * count;
    let offset = (size - actual_size) / 2;
    
    // 统计深色模块数量
    let mut dark_count = 0;
    for row in 0..count {
        for col in 0..count {
            if qr.is_dark(row, col) {
                dark_count += 1;
            }
        }
    }
    
    // 预分配容量
    let path_capacity = dark_count * 25;
    let total_capacity = 200 + path_capacity;
    
    let mut svg = String::with_capacity(total_capacity);
    
    // SVG 头部
    svg.push_str(r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 "#);
    push_i32(&mut svg, size);
    svg.push(' ');
    push_i32(&mut svg, size);
    svg.push_str(r#"" width=""#);
    push_i32(&mut svg, size);
    svg.push_str(r#"" height=""#);
    push_i32(&mut svg, size);
    svg.push_str(r#""><path d="M0 0h"#);
    push_i32(&mut svg, size);
    svg.push('v');
    push_i32(&mut svg, size);
    svg.push_str("H0z\" fill=\"#ffffff\"/><path fill=\"#000000\" d=\"");

    // 生成路径数据
    for row in 0..count {
        for col in 0..count {
            if qr.is_dark(row, col) {
                let x = col * cell_size + offset;
                let y = row * cell_size + offset;
                
                svg.push('M');
                push_i32(&mut svg, x);
                svg.push(' ');
                push_i32(&mut svg, y);
                svg.push('h');
                push_i32(&mut svg, cell_size);
                svg.push('v');
                push_i32(&mut svg, cell_size);
                svg.push('H');
                push_i32(&mut svg, x);
                svg.push('z');
            }
        }
    }

    svg.push_str(r#""/></svg>"#);
    svg
}

/// 快速整数转字符串
#[inline(always)]
fn push_i32(s: &mut String, mut n: i32) {
    if n == 0 {
        s.push('0');
        return;
    }
    if n < 0 {
        s.push('-');
        n = -n;
    }
    let mut buf = [0u8; 10];
    let mut i = 10;
    while n > 0 {
        i -= 1;
        buf[i] = (n % 10) as u8 + b'0';
        n /= 10;
    }
    unsafe {
        s.push_str(std::str::from_utf8_unchecked(&buf[i..]));
    }
}
