// 使用 kennytm/qrcode 生成正确的二维码 + 优化的 SVG 渲染
//
// 使用方法:
//   cargo run --release --features validation --bin fast-qr -- "你的文本"
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
        "Hello World".to_string()
    };

    let output_file = if args.len() > 2 {
        args[2].clone()
    } else {
        "qrcode_fast.svg".to_string()
    };

    println!("🚀 高性能二维码生成器 (优化版)");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!("输出: {}", output_file);
    println!();

    // 生成二维码数据
    let qr = QrCode::new(&text).unwrap();

    // 使用优化的方式生成 SVG
    let start = Instant::now();
    let svg = generate_optimized_svg(&qr);
    let elapsed = start.elapsed();

    // 保存文件
    fs::write(&output_file, &svg).expect("❌ 无法写入文件");

    println!("✅ SVG 生成成功！");
    println!("───────────────────────────────────────");
    println!("⏱️  SVG 生成耗时: {:?}", elapsed);
    println!(
        "📐 二维码版本:   {} ({}x{} 模块)",
        qr.width(),
        qr.width(),
        qr.width()
    );
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
        println!("   启用方式: cargo run --release --features validation --bin fast-qr");
    }

    println!();
    println!("═══════════════════════════════════════");
    println!("🎉 完成！");
}

/// 优化的 SVG 生成 - 使用 kennytm 的坐标系统
fn generate_optimized_svg(qr: &QrCode) -> String {
    let width = qr.width();

    // 使用 kennytm 的默认配置
    let cell_size = 8;
    let quiet_zone = 4;
    let offset = cell_size * quiet_zone;
    let total_size = width * cell_size + 2 * offset;

    // 预分配容量
    let dark_count = qr
        .to_colors()
        .iter()
        .filter(|&&c| c == qrcode_kennytm::Color::Dark)
        .count();
    let capacity = 200 + dark_count * 30;
    let mut svg = String::with_capacity(capacity);

    // SVG 头部
    svg.push_str(r#"<?xml version="1.0" standalone="yes"?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width=""#);
    push_usize(&mut svg, total_size);
    svg.push_str(r#"" height=""#);
    push_usize(&mut svg, total_size);
    svg.push_str(r#"" viewBox="0 0 "#);
    push_usize(&mut svg, total_size);
    svg.push(' ');
    push_usize(&mut svg, total_size);
    svg.push_str(r#"" shape-rendering="crispEdges"><rect x="0" y="0" width=""#);
    push_usize(&mut svg, total_size);
    svg.push_str(r#"" height=""#);
    push_usize(&mut svg, total_size);
    svg.push_str("\" fill=\"#fff\"/><path fill=\"#000\" d=\"");

    // 生成路径数据 - 使用与 kennytm 相同的遍历顺序
    for y in 0..width {
        for x in 0..width {
            if qr[(x, y)] == qrcode_kennytm::Color::Dark {
                let px = x * cell_size + offset;
                let py = y * cell_size + offset;

                svg.push('M');
                push_usize(&mut svg, px);
                svg.push(' ');
                push_usize(&mut svg, py);
                svg.push('h');
                push_usize(&mut svg, cell_size);
                svg.push('v');
                push_usize(&mut svg, cell_size);
                svg.push('H');
                push_usize(&mut svg, px);
                svg.push('V');
                push_usize(&mut svg, py);
            }
        }
    }

    svg.push_str(r#""/></svg>"#);
    svg
}

/// 快速 usize 转字符串
#[inline(always)]
fn push_usize(s: &mut String, mut n: usize) {
    if n == 0 {
        s.push('0');
        return;
    }
    let mut buf = [0u8; 20];
    let mut i = 20;
    while n > 0 {
        i -= 1;
        buf[i] = (n % 10) as u8 + b'0';
        n /= 10;
    }
    unsafe {
        s.push_str(std::str::from_utf8_unchecked(&buf[i..]));
    }
}
