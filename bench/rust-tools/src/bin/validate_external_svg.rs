//! 验证外部 SVG 二维码文件
//!
//! 用法:
//!   cargo run --release --bin validate-external-svg -- <svg文件路径> [期望内容]
//!
//! 示例:
//!   cargo run --release --bin validate-external-svg -- ./tmp/qr-validation/basic.svg "Hello World"

use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("🚀 外部 SVG 二维码验证工具");
        println!("═══════════════════════════════════════");
        println!();
        println!("用法:");
        println!("  cargo run --release --bin validate-external-svg -- <svg文件路径> [期望内容]");
        println!();
        println!("示例:");
        println!("  cargo run --release --bin validate-external-svg -- ./tmp/qr-validation/basic.svg \"Hello World\"");
        println!();
        std::process::exit(1);
    }

    let svg_path = &args[1];
    let expected_content = args.get(2).map(|s| s.as_str());

    println!("🚀 外部 SVG 二维码验证");
    println!("═══════════════════════════════════════");
    println!("文件: {}", svg_path);
    if let Some(content) = expected_content {
        println!("期望内容: {}", content);
    }
    println!();

    // 读取 SVG 文件
    let svg = match fs::read_to_string(svg_path) {
        Ok(s) => s,
        Err(e) => {
            println!("❌ 无法读取文件: {}", e);
            std::process::exit(1);
        }
    };

    println!("✅ SVG 文件读取成功");
    println!("   大小: {} bytes", svg.len());

    // 基本 SVG 结构检查
    if !svg.contains("<svg") || !svg.contains("</svg>") {
        println!("❌ 无效的 SVG 结构");
        std::process::exit(1);
    }

    if !svg.contains("viewBox") {
        println!("⚠️  警告: SVG 缺少 viewBox 属性");
    }

    println!("   基本结构检查通过");

    // 尝试解码二维码
    match decode_qr_from_svg(&svg) {
        Ok(decoded) => {
            println!();
            println!("✅ 二维码解码成功！");
            println!("───────────────────────────────────────");
            println!("解码内容: \"{}\"", decoded);

            if let Some(expected) = expected_content {
                if decoded == expected {
                    println!();
                    println!("✅ 内容匹配！");
                    println!("═══════════════════════════════════════");
                    println!("🎉 验证通过！二维码合法且内容正确。");
                } else {
                    println!();
                    println!("❌ 内容不匹配！");
                    println!("   期望: \"{}\"", expected);
                    println!("   实际: \"{}\"", decoded);
                    std::process::exit(1);
                }
            } else {
                println!();
                println!("ℹ️  未提供期望内容，跳过内容匹配检查");
                println!("═══════════════════════════════════════");
                println!("🎉 二维码可以成功解码！");
            }
        }
        Err(e) => {
            println!();
            println!("❌ 二维码解码失败！");
            println!("───────────────────────────────────────");
            println!("错误: {}", e);
            println!();
            println!("可能的原因:");
            println!("  - SVG 格式不兼容");
            println!("  - 二维码结构损坏");
            println!("  - 使用了 <rect> 而不是 <path> 元素（某些解码器不支持）");
            std::process::exit(1);
        }
    }
}

/// 从 SVG 解码二维码
fn decode_qr_from_svg(svg: &str) -> Result<String, Box<dyn std::error::Error>> {
    use resvg::usvg;

    let opt = usvg::Options::default();
    let tree = usvg::Tree::from_str(svg, &opt)?;

    // 渲染为位图
    let scale = 8.0;
    let size = tree.size();
    let width = (size.width() * scale) as u32;
    let height = (size.height() * scale) as u32;

    let mut pixmap =
        resvg::tiny_skia::Pixmap::new(width, height).ok_or("Failed to create pixmap")?;

    let transform = resvg::tiny_skia::Transform::from_scale(scale, scale);
    resvg::render(&tree, transform, &mut pixmap.as_mut());

    // 转换为灰度图像
    let img_data = pixmap.data();
    let mut gray_img = image::GrayImage::new(width, height);

    for (i, chunk) in img_data.chunks(4).enumerate() {
        let x = (i as u32) % width;
        let y = (i as u32) / width;
        // 灰度转换
        let gray = ((chunk[0] as u32 * 3 + chunk[1] as u32 * 4 + chunk[2] as u32) / 8) as u8;
        gray_img.put_pixel(x, y, image::Luma([gray]));
    }

    // 使用 rqrr 解码
    let mut img = rqrr::PreparedImage::prepare(gray_img);
    let grids = img.detect_grids();

    if grids.is_empty() {
        return Err("No QR code found in image".into());
    }

    // 尝试解码第一个找到的二维码
    match grids[0].decode() {
        Ok((_meta, content)) => Ok(content),
        Err(e) => Err(format!("Failed to decode QR code: {:?}", e).into()),
    }
}
