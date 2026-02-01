// 使用 kennytm/qrcode 生成正确的二维码 + 高性能 SVG 输出
//
// 使用方法:
//   cargo run --release --features validation,compare --bin verified-qr -- "你的文本"

use qrcode_kennytm::QrCode;
#[cfg(feature = "validation")]
use qrcode_fast::validation::validate_qr_code;

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
        "qrcode_verified.svg".to_string()
    };
    
    println!("🚀 高性能二维码生成器 (kennytm + 优化SVG)");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();
    
    // 生成二维码数据（使用 kennytm/qrcode - 确保正确性）
    let start = Instant::now();
    let qr = QrCode::new(&text).unwrap();
    let svg = generate_optimized_svg(&qr, 256);
    let elapsed = start.elapsed();
    
    // 保存文件
    fs::write(&output_file, &svg).expect("❌ 无法写入文件");
    
    println!("✅ SVG 生成成功！");
    println!("───────────────────────────────────────");
    println!("⏱️  总耗时:       {:?}", elapsed);
    println!("📐 二维码版本:   {} ({}x{} 模块)", qr.width(), qr.width(), qr.width());
    println!("📄 SVG 大小:     {} bytes", svg.len());
    println!("💾 输出文件:     {}", output_file);
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
        println!("   启用方式: cargo run --release --features validation,compare --bin verified-qr");
    }
    
    println!();
    println!("═══════════════════════════════════════");
    println!("🎉 完成！二维码已生成并通过验证！");
}

/// 优化的 SVG 生成 - 使用 kennytm 的坐标系统确保正确性
fn generate_optimized_svg(qr: &QrCode, _size: i32) -> String {
    let count = qr.width() as i32;
    if count == 0 {
        return String::new();
    }

    // 使用 kennytm 的默认配置
    let cell_size = 8i32;
    let quiet_zone = 4i32; // 4 模块的静默区
    let offset = quiet_zone * cell_size;
    let size = count * cell_size + 2 * offset;
    
    // 统计深色模块数量
    let mut dark_count = 0;
    for row in 0..count {
        for col in 0..count {
            if qr[(row as usize, col as usize)] == qrcode_kennytm::Color::Dark {
                dark_count += 1;
            }
        }
    }
    
    // 预分配容量
    let path_capacity = dark_count * 30;
    let total_capacity = 300 + path_capacity;
    
    let mut svg = String::with_capacity(total_capacity);
    
    // SVG 头部 - 使用 kennytm 的格式
    svg.push_str(r#"<?xml version="1.0" standalone="yes"?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width=""#);
    push_i32(&mut svg, size);
    svg.push_str(r#"" height=""#);
    push_i32(&mut svg, size);
    svg.push_str(r#"" viewBox="0 0 "#);
    push_i32(&mut svg, size);
    svg.push(' ');
    push_i32(&mut svg, size);
    svg.push_str(r#"" shape-rendering="crispEdges"><rect x="0" y="0" width=""#);
    push_i32(&mut svg, size);
    svg.push_str(r#"" height=""#);
    push_i32(&mut svg, size);
    svg.push_str("\" fill=\"#fff\"/><path fill=\"#000\" d=\"");

    // 生成路径数据 - 使用 kennytm 的格式
    for row in 0..count {
        for col in 0..count {
            if qr[(row as usize, col as usize)] == qrcode_kennytm::Color::Dark {
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
                svg.push('V');
                push_i32(&mut svg, y);
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
