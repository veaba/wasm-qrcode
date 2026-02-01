use std::fs;
use std::time::Instant;

fn main() {
    let text = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "https://github.com/veaba/qrcodes".to_string());
    
    let size: i32 = std::env::args()
        .nth(2)
        .and_then(|s| s.parse().ok())
        .unwrap_or(256);

    println!("\n🏆 QRCode SVG 对比");
    println!("{}", "=".repeat(60));
    println!("文本: {}", text);
    println!("尺寸: {}x{}", size, size);
    println!("{}", "=".repeat(60));

    // 我们的实现
    println!("\n🚀 @veaba/qrcode-wasm (我们的)");
    println!("{}", "-".repeat(60));
    
    let start_ours = Instant::now();
    let ours_svg = generate_ours(&text, size);
    let time_ours = start_ours.elapsed();
    
    println!("SVG 长度: {} bytes", ours_svg.len());
    println!("⏱️  生成时间: {:?}", time_ours);
    
    fs::write("ours_output.svg", &ours_svg).expect("写入失败");
    println!("✅ 已保存到 ours_output.svg");
    
    // 打印前 500 字符
    println!("\nSVG 预览:");
    println!("{}", &ours_svg[..ours_svg.len().min(500)]);
    if ours_svg.len() > 500 {
        println!("...");
    }

    // kennytm 的实现
    println!("\n🐌 kennytm/qrcode (crates.io 最流行)");
    println!("{}", "-".repeat(60));
    
    let start_kenny = Instant::now();
    let kenny_svg = generate_kenny(&text, size);
    let time_kenny = start_kenny.elapsed();
    
    println!("SVG 长度: {} bytes", kenny_svg.len());
    println!("⏱️  生成时间: {:?}", time_kenny);
    
    fs::write("kenny_output.svg", &kenny_svg).expect("写入失败");
    println!("✅ 已保存到 kenny_output.svg");
    
    // 打印前 500 字符
    println!("\nSVG 预览:");
    println!("{}", &kenny_svg[..kenny_svg.len().min(500)]);
    if kenny_svg.len() > 500 {
        println!("...");
    }

    // 对比结果
    println!("\n📊 对比结果");
    println!("{}", "=".repeat(60));
    
    let speedup = time_kenny.as_nanos() as f64 / time_ours.as_nanos() as f64;
    
    println!("我们的实现:   {:?}", time_ours);
    println!("kennytm:      {:?}", time_kenny);
    println!("性能提升:     {:.1}x faster!", speedup);
    
    if speedup > 10.0 {
        println!("\n🎉 我们的实现比 kennytm 快 {:.0} 倍！", speedup);
    }
    
    // 文件对比
    println!("\n📁 生成的文件:");
    println!("  - ours_output.svg   (我们的实现)");
    println!("  - kenny_output.svg  (kennytm)");
    
    // 验证 SVG 是否正确
    println!("\n🔍 SVG 验证:");
    if ours_svg.contains("<svg") && ours_svg.contains("</svg>") {
        println!("  ✅ ours_output.svg 格式正确");
    } else {
        println!("  ❌ ours_output.svg 格式错误");
    }
    
    if kenny_svg.contains("<svg") && kenny_svg.contains("</svg>") {
        println!("  ✅ kenny_output.svg 格式正确");
    } else {
        println!("  ❌ kenny_output.svg 格式错误");
    }
    
    println!();
}

// 我们的实现
fn generate_ours(text: &str, size: i32) -> String {
    use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};
    
    let mut qr = QRCode::with_options(QRCodeOptions {
        width: size,
        height: size,
        correct_level: QRErrorCorrectLevel::H,
        ..Default::default()
    });
    qr.make_code(text);
    
    qr.to_svg(size)
}

// kennytm 的实现
fn generate_kenny(text: &str, size: i32) -> String {
    use qrcode::{QrCode, Version, EcLevel};
    use qrcode::render::svg;
    
    let code = QrCode::with_version(
        text.as_bytes(),
        Version::Normal(4),
        EcLevel::H
    ).unwrap();
    
    code.render()
        .min_dimensions(size as u32, size as u32)
        .build()
}
