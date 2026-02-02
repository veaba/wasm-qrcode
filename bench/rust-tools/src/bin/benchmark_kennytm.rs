// kennytm-qrcode 基准测试工具
//
// 使用方法:
//   cargo run --release --bin benchmark-kennytm
//
// 此工具专门用于测试 kennytm/qrcode 的 SVG 生成性能
// 输出 JSON 格式结果，可集成到 backend-benchmark-pk

use qrcode_kennytm::{QrCode, EcLevel};
use qrcode_kennytm::render::svg;
use std::time::Instant;

#[derive(Debug, serde::Serialize)]
struct BenchmarkResult {
    name: String,
    ops: u64,
    avg_time: f64,  // 微秒
    category: String,
}

#[derive(Debug, serde::Serialize)]
struct KennytmBenchmarkOutput {
    package_name: String,
    version: String,
    runtime: String,
    runtime_version: String,
    results: Vec<BenchmarkResult>,
}

fn run_test(name: &str, iterations: u64, test_fn: &dyn Fn() -> String) -> BenchmarkResult {
    // 预热
    for _ in 0..10 {
        test_fn();
    }

    let start = Instant::now();
    for _ in 0..iterations {
        let _ = test_fn();
    }
    let elapsed = start.elapsed();

    let avg_time_ns = elapsed.as_nanos() as f64 / iterations as f64;
    let avg_time_us = avg_time_ns / 1000.0;
    let ops = (1_000_000.0 / avg_time_us) as u64;

    // 确定分类
    let category = if name.contains("SVG") {
        "svg"
    } else if name.contains("批量") {
        "batch"
    } else if name.contains("纠错") {
        "error_level"
    } else {
        "single"
    };

    BenchmarkResult {
        name: name.to_string(),
        ops,
        avg_time: avg_time_us,
        category: category.to_string(),
    }
}

fn main() {
    println!("╔══════════════════════════════════════════════════════════════════════════════╗");
    println!("║           📊 kennytm/qrcode SVG 生成性能基准测试                            ║");
    println!("╚══════════════════════════════════════════════════════════════════════════════╝");
    println!();

    let mut results = Vec::new();

    // ========== 单条生成测试 ==========
    println!("📝 单条生成测试...");

    let short = "https://a.co";
    results.push(run_test("单条生成 (short)", 1000, &|| {
        let qr = QrCode::new(short).unwrap();
        qr.render::<svg::Color>().build()
    }));

    let medium = "https://github.com/veaba/qrcodes";
    results.push(run_test("单条生成 (medium)", 1000, &|| {
        let qr = QrCode::new(medium).unwrap();
        qr.render::<svg::Color>().build()
    }));

    let long = "https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3";
    results.push(run_test("单条生成 (long)", 500, &|| {
        let qr = QrCode::new(long).unwrap();
        qr.render::<svg::Color>().build()
    }));

    // ========== 批量生成测试 ==========
    println!("📚 批量生成测试...");

    let texts: Vec<String> = (0..100).map(|i| format!("https://example.com/{}", i)).collect();
    results.push(run_test("批量生成 (100 条)", 100, &|| {
        let mut output = String::new();
        for text in &texts {
            let qr = QrCode::new(text).unwrap();
            output.push_str(&qr.render::<svg::Color>().build());
        }
        output
    }));

    // ========== SVG 输出测试 ==========
    println!("🎨 SVG 生成测试...");

    results.push(run_test("SVG 输出", 1000, &|| {
        let qr = QrCode::new("https://github.com/veaba/qrcodes").unwrap();
        qr.render::<svg::Color>().build()
    }));

    // ========== 纠错级别测试 ==========
    println!("🔧 纠错级别测试...");

    let error_text = "https://example.com";

    results.push(run_test("纠错级别 L (低)", 1000, &|| {
        let qr = QrCode::with_error_correction_level(error_text, EcLevel::L).unwrap();
        qr.render::<svg::Color>().build()
    }));

    results.push(run_test("纠错级别 M (中)", 1000, &|| {
        let qr = QrCode::with_error_correction_level(error_text, EcLevel::M).unwrap();
        qr.render::<svg::Color>().build()
    }));

    results.push(run_test("纠错级别 Q (较高)", 1000, &|| {
        let qr = QrCode::with_error_correction_level(error_text, EcLevel::Q).unwrap();
        qr.render::<svg::Color>().build()
    }));

    results.push(run_test("纠错级别 H (高)", 1000, &|| {
        let qr = QrCode::with_error_correction_level(error_text, EcLevel::H).unwrap();
        qr.render::<svg::Color>().build()
    }));

    // ========== 输出结果 ==========
    println!();
    println!("═══════════════════════════════════════════════════════════════════════════════");
    println!();
    println!("📊 测试结果:");
    println!();

    for result in &results {
        println!("  {}: {} ops/s ({:.2} µs)", result.name, result.ops, result.avg_time);
    }

    println!();
    println!("═══════════════════════════════════════════════════════════════════════════════");
    println!();
    println!("📄 JSON 输出:");
    println!();

    let output = KennytmBenchmarkOutput {
        package_name: "kennytm-qrcode".to_string(),
        version: "0.14.0".to_string(),
        runtime: "Rust".to_string(),
        runtime_version: env!("CARGO_PKG_RUST_VERSION").to_string(),
        results,
    };

    let json = serde_json::to_string_pretty(&output).unwrap();
    println!("{}", json);
    println!();
    println!("═══════════════════════════════════════════════════════════════════════════════");
}
