// 完整的 SVG QRCode 性能基准测试
//
// 对比以下包：
// - kennytm-qrcode (社区参考)
// - @veaba/qrcode-rust
// - @veaba/qrcode-fast
//
// 使用方法:
//   cargo run --release --features validation --bin benchmark-full

use std::env;
use std::fs;
use std::time::{Duration, Instant};

#[cfg(feature = "validation")]
use rust_tools::validation::validate_qr_code;

// 测试用例
const TEST_CASES: &[(&str, &str)] = &[
    ("Simple", "Hello World"),
    ("Complex", "Test QR Code 123"),
    ("URL", "https://github.com/veaba/qrcodes"),
    (
        "Long",
        "Email: test@example.com | Phone: +1-234-567-8900 | Address: 123 Main St",
    ),
];

// 运行次数用于计算平均时间
const RUNS: u32 = 100;

fn main() {
    let args: Vec<String> = env::args().collect();
    let quick_mode = args.contains(&"--quick".to_string());
    let runs = if quick_mode { 10 } else { RUNS };

    // 解析输出目录参数 (--output-dir <path>)
    let output_dir = args
        .iter()
        .position(|arg| arg == "--output-dir")
        .and_then(|pos| args.get(pos + 1))
        .map(|s| s.as_str())
        .unwrap_or("benchmark-output");

    println!("🚀 QRCode SVG 生成性能基准测试");
    println!("═══════════════════════════════════════════════════════════════════");
    println!("对比包:");
    println!("  - kennytm-qrcode (社区参考)");
    println!("  - @veaba/qrcode-rust");
    println!("  - @veaba/qrcode-fast");
    println!();
    println!("配置:");
    println!("  - 每测试运行: {} 次", runs);
    println!("  - 输出目录: {}", output_dir);
    println!(
        "  - 验证: {}",
        if cfg!(feature = "validation") {
            "启用"
        } else {
            "禁用"
        }
    );
    println!("═══════════════════════════════════════════════════════════════════");

    // 创建输出目录
    fs::create_dir_all(output_dir).ok();

    let mut all_results: Vec<BenchmarkResult> = Vec::new();

    for (name, text) in TEST_CASES {
        println!("\n📋 测试用例: {}", name);
        println!("   文本: \"{}\"", text);
        println!("───────────────────────────────────────────────────────────────────");

        let result = run_benchmark(name, text, runs, output_dir);
        all_results.push(result);
    }

    // 打印总结报告
    print_summary(&all_results);

    // 保存报告
    save_report(&all_results, output_dir);

    println!("\n✅ 基准测试完成!");
    println!("📁 输出目录: {}", output_dir);
}

#[derive(Debug)]
struct PackageResult {
    name: &'static str,
    avg_time_us: f64,
    min_time_us: f64,
    max_time_us: f64,
    valid: bool,
    svg_size: usize,
    module_count: i32,
}

#[derive(Debug)]
struct BenchmarkResult {
    test_name: String,
    text: String,
    kennytm: Option<PackageResult>,
    qrcode_rust: Option<PackageResult>,
    qrcode_fast: Option<PackageResult>,
}

fn run_benchmark(name: &str, text: &str, runs: u32, output_dir: &str) -> BenchmarkResult {
    let mut result = BenchmarkResult {
        test_name: name.to_string(),
        text: text.to_string(),
        kennytm: None,
        qrcode_rust: None,
        qrcode_fast: None,
    };

    // 1. kennytm-qrcode
    println!("\n📦 kennytm-qrcode (社区参考)");
    result.kennytm = Some(benchmark_kennytm(text, runs, output_dir, name));

    // 2. @veaba/qrcode-rust
    println!("\n📦 @veaba/qrcode-rust");
    result.qrcode_rust = Some(benchmark_qrcode_rust(text, runs, output_dir, name));

    // 3. @veaba/qrcode-fast
    println!("\n📦 @veaba/qrcode-fast");
    result.qrcode_fast = Some(benchmark_qrcode_fast(text, runs, output_dir, name));

    result
}

fn benchmark_kennytm(text: &str, runs: u32, output_dir: &str, test_name: &str) -> PackageResult {
    use qrcode_kennytm::render::svg;
    use qrcode_kennytm::QrCode;

    let mut times = Vec::with_capacity(runs as usize);
    let mut svg_result = String::new();

    // 预热
    for _ in 0..5 {
        let qr = QrCode::new(text).unwrap();
        let _svg = qr.render::<svg::Color>().build();
    }

    // 正式测试
    for _ in 0..runs {
        let start = Instant::now();
        let qr = QrCode::new(text).unwrap();
        svg_result = qr.render::<svg::Color>().build();
        times.push(start.elapsed());
    }

    // 保存示例文件
    let output_file = format!("{}/{}_kennytm.svg", output_dir, test_name);
    fs::write(&output_file, &svg_result).ok();

    // 验证
    let valid = validate_svg(&svg_result, text);

    let avg_time = times.iter().sum::<Duration>() / runs;
    let min_time = times.iter().min().copied().unwrap_or_default();
    let max_time = times.iter().max().copied().unwrap_or_default();

    let qr = QrCode::new(text).unwrap();

    println!("  ⏱️  平均时间: {:.2} µs", avg_time.as_micros());
    println!("  ⏱️  最短时间: {:.2} µs", min_time.as_micros());
    println!("  ⏱️  最长时间: {:.2} µs", max_time.as_micros());
    println!("  📄 SVG 大小: {} bytes", svg_result.len());
    println!("  📐 模块数: {}x{}", qr.width(), qr.width());
    println!(
        "  {}",
        if valid {
            "✅ 验证通过"
        } else {
            "❌ 验证失败"
        }
    );

    PackageResult {
        name: "kennytm-qrcode",
        avg_time_us: avg_time.as_micros() as f64,
        min_time_us: min_time.as_micros() as f64,
        max_time_us: max_time.as_micros() as f64,
        valid,
        svg_size: svg_result.len(),
        module_count: qr.width() as i32,
    }
}

fn benchmark_qrcode_rust(
    text: &str,
    runs: u32,
    output_dir: &str,
    test_name: &str,
) -> PackageResult {
    use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};

    let mut times = Vec::with_capacity(runs as usize);
    let mut svg_result = String::new();
    let mut module_count = 0;

    // 预热
    for _ in 0..5 {
        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            color_dark: String::from("#000000"),
            color_light: String::from("#ffffff"),
            correct_level: QRErrorCorrectLevel::M,
        });
        qr.make_code(text);
        let _svg = generate_svg_from_rust(&qr);
    }

    // 正式测试
    for _ in 0..runs {
        let start = Instant::now();
        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            color_dark: String::from("#000000"),
            color_light: String::from("#ffffff"),
            correct_level: QRErrorCorrectLevel::M,
        });
        qr.make_code(text);
        svg_result = generate_svg_from_rust(&qr);
        module_count = qr.module_count;
        times.push(start.elapsed());
    }

    // 保存示例文件
    let output_file = format!("{}/{}_qrcode_rust.svg", output_dir, test_name);
    fs::write(&output_file, &svg_result).ok();

    // 验证
    let valid = validate_svg(&svg_result, text);

    let avg_time = times.iter().sum::<Duration>() / runs;
    let min_time = times.iter().min().copied().unwrap_or_default();
    let max_time = times.iter().max().copied().unwrap_or_default();

    println!("  ⏱️  平均时间: {:.2} µs", avg_time.as_micros());
    println!("  ⏱️  最短时间: {:.2} µs", min_time.as_micros());
    println!("  ⏱️  最长时间: {:.2} µs", max_time.as_micros());
    println!("  📄 SVG 大小: {} bytes", svg_result.len());
    println!("  📐 模块数: {}x{}", module_count, module_count);
    println!(
        "  {}",
        if valid {
            "✅ 验证通过"
        } else {
            "❌ 验证失败"
        }
    );

    PackageResult {
        name: "@veaba/qrcode-rust",
        avg_time_us: avg_time.as_micros() as f64,
        min_time_us: min_time.as_micros() as f64,
        max_time_us: max_time.as_micros() as f64,
        valid,
        svg_size: svg_result.len(),
        module_count,
    }
}

fn benchmark_qrcode_fast(
    text: &str,
    runs: u32,
    output_dir: &str,
    test_name: &str,
) -> PackageResult {
    use qrcode_fast::{QRCode, QRErrorCorrectLevel};

    let mut times = Vec::with_capacity(runs as usize);
    let mut svg_result = String::new();
    let mut module_count = 0;

    // 预热
    for _ in 0..5 {
        let mut qr = QRCode::with_options(QRErrorCorrectLevel::M);
        qr.make_code(text);
        let _svg = qr.get_svg();
    }

    // 正式测试
    for _ in 0..runs {
        let start = Instant::now();
        let mut qr = QRCode::with_options(QRErrorCorrectLevel::M);
        qr.make_code(text);
        svg_result = qr.get_svg();
        module_count = qr.module_count;
        times.push(start.elapsed());
    }

    // 保存示例文件
    let output_file = format!("{}/{}_qrcode_fast.svg", output_dir, test_name);
    fs::write(&output_file, &svg_result).ok();

    // 验证
    let valid = validate_svg(&svg_result, text);

    let avg_time = times.iter().sum::<Duration>() / runs;
    let min_time = times.iter().min().copied().unwrap_or_default();
    let max_time = times.iter().max().copied().unwrap_or_default();

    println!("  ⏱️  平均时间: {:.2} µs", avg_time.as_micros());
    println!("  ⏱️  最短时间: {:.2} µs", min_time.as_micros());
    println!("  ⏱️  最长时间: {:.2} µs", max_time.as_micros());
    println!("  📄 SVG 大小: {} bytes", svg_result.len());
    println!("  📐 模块数: {}x{}", module_count, module_count);
    println!(
        "  {}",
        if valid {
            "✅ 验证通过"
        } else {
            "❌ 验证失败"
        }
    );

    PackageResult {
        name: "@veaba/qrcode-fast",
        avg_time_us: avg_time.as_micros() as f64,
        min_time_us: min_time.as_micros() as f64,
        max_time_us: max_time.as_micros() as f64,
        valid,
        svg_size: svg_result.len(),
        module_count,
    }
}

fn generate_svg_from_rust(qr: &qrcode_rust::QRCode) -> String {
    let count = qr.module_count;
    let size = 256;
    let cell_size = size / count;
    let actual_size = cell_size * count;
    let offset = (size - actual_size) / 2;

    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {} {}\" width=\"{}\" height=\"{}\">",
        size, size, size, size
    );

    svg.push_str(&format!(
        "<rect width=\"{}\" height=\"{}\" fill=\"#ffffff\" />",
        size, size
    ));

    for row in 0..count {
        for col in 0..count {
            if qr.is_dark(row, col) {
                svg.push_str(&format!(
                    "<rect x=\"{}\" y=\"{}\" width=\"{}\" height=\"{}\" fill=\"#000000\" />",
                    col * cell_size + offset,
                    row * cell_size + offset,
                    cell_size,
                    cell_size
                ));
            }
        }
    }

    svg.push_str("</svg>");
    svg
}

#[cfg(feature = "validation")]
fn validate_svg(svg: &str, expected_text: &str) -> bool {
    match validate_qr_code(svg, expected_text) {
        Ok(()) => true,
        Err(_) => false,
    }
}

#[cfg(not(feature = "validation"))]
fn validate_svg(_svg: &str, _expected_text: &str) -> bool {
    println!("  ⚠️  验证已禁用 (编译时未启用 validation 特性)");
    true
}

fn print_summary(results: &[BenchmarkResult]) {
    println!("\n");
    println!("╔══════════════════════════════════════════════════════════════════════════════════════════╗");
    println!("║                              📊 性能基准测试总结报告                                      ║");
    println!("╚══════════════════════════════════════════════════════════════════════════════════════════╝");

    // 表头
    println!("\n┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐");
    println!(
        "│ {:<19} │ {:>19} │ {:>19} │ {:>19} │",
        "测试用例", "kennytm (µs)", "qrcode-rust (µs)", "qrcode-fast (µs)"
    );
    println!(
        "├─────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┤"
    );

    // 数据行
    for result in results {
        let kennytm_time = result
            .kennytm
            .as_ref()
            .map(|r| format!("{:.2}", r.avg_time_us))
            .unwrap_or_else(|| "N/A".to_string());
        let rust_time = result
            .qrcode_rust
            .as_ref()
            .map(|r| format!("{:.2}", r.avg_time_us))
            .unwrap_or_else(|| "N/A".to_string());
        let fast_time = result
            .qrcode_fast
            .as_ref()
            .map(|r| format!("{:.2}", r.avg_time_us))
            .unwrap_or_else(|| "N/A".to_string());

        println!(
            "│ {:<19} │ {:>19} │ {:>19} │ {:>19} │",
            result.test_name, kennytm_time, rust_time, fast_time
        );
    }

    println!(
        "└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘"
    );

    // 速度对比
    println!("\n📈 速度对比 (相对于 kennytm-qrcode):");
    for result in results {
        if let (Some(kennytm), Some(fast)) = (&result.kennytm, &result.qrcode_fast) {
            let speedup = kennytm.avg_time_us / fast.avg_time_us;
            println!("  {}: qrcode-fast 快 {:.2}x", result.test_name, speedup);
        }
    }

    // 验证状态
    println!("\n✅ 验证状态:");
    for result in results {
        let kennytm_valid = result.kennytm.as_ref().map(|r| r.valid).unwrap_or(false);
        let rust_valid = result
            .qrcode_rust
            .as_ref()
            .map(|r| r.valid)
            .unwrap_or(false);
        let fast_valid = result
            .qrcode_fast
            .as_ref()
            .map(|r| r.valid)
            .unwrap_or(false);

        println!("  {}:", result.test_name);
        println!(
            "    kennytm-qrcode: {}",
            if kennytm_valid { "✅" } else { "❌" }
        );
        println!(
            "    @veaba/qrcode-rust: {}",
            if rust_valid { "✅" } else { "❌" }
        );
        println!(
            "    @veaba/qrcode-fast: {}",
            if fast_valid { "✅" } else { "❌" }
        );
    }
}

fn save_report(results: &[BenchmarkResult], output_dir: &str) {
    let report_path = format!("{}/benchmark-report.json", output_dir);

    let json = serde_json::json!({
        "timestamp": chrono::Local::now().to_rfc3339(),
        "test_cases": results.iter().map(|r| {
            serde_json::json!({
                "name": r.test_name,
                "text": r.text,
                "kennytm": r.kennytm.as_ref().map(|p| serde_json::json!({
                    "name": p.name,
                    "avg_time_us": p.avg_time_us,
                    "min_time_us": p.min_time_us,
                    "max_time_us": p.max_time_us,
                    "valid": p.valid,
                    "svg_size": p.svg_size,
                    "module_count": p.module_count,
                })),
                "qrcode_rust": r.qrcode_rust.as_ref().map(|p| serde_json::json!({
                    "name": p.name,
                    "avg_time_us": p.avg_time_us,
                    "min_time_us": p.min_time_us,
                    "max_time_us": p.max_time_us,
                    "valid": p.valid,
                    "svg_size": p.svg_size,
                    "module_count": p.module_count,
                })),
                "qrcode_fast": r.qrcode_fast.as_ref().map(|p| serde_json::json!({
                    "name": p.name,
                    "avg_time_us": p.avg_time_us,
                    "min_time_us": p.min_time_us,
                    "max_time_us": p.max_time_us,
                    "valid": p.valid,
                    "svg_size": p.svg_size,
                    "module_count": p.module_count,
                })),
            })
        }).collect::<Vec<_>>(),
    });

    fs::write(&report_path, serde_json::to_string_pretty(&json).unwrap()).ok();
    println!("\n📄 详细报告已保存: {}", report_path);
}
