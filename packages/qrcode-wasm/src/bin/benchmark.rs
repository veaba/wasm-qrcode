// QRCode 基准测试 - 分离矩阵生成和 SVG 渲染
use wasm_qrcode::QRCodeGenerator;
use std::time::Instant;

fn main() {
    println!("🏁 QRCode 基准测试 - Rust vs Node.js 对比");
    println!("============================================\n");
    println!("测试分为两个阶段：");
    println!("1. 矩阵生成: 字符串 → QRCode 矩阵（0/1）");
    println!("2. SVG 渲染: 矩阵 → SVG 字符串\n");

    let text = "https://github.com/veaba/qrcodes";
    let count = 1000;

    println!("测试文本: {}", text);
    println!("生成次数: {}\n", count);

    // ========== 阶段 1: 纯矩阵生成（无 SVG） ==========
    println!("【阶段 1: 纯矩阵生成（字符串 → 矩阵）】");
    let start = Instant::now();
    let mut gen = QRCodeGenerator::new();
    for i in 0..count {
        let test_text = format!("{}/test{}", text, i);
        let _ = gen.generate(&test_text);
        // 不调用 get_svg，只生成矩阵
    }
    let matrix_ms = start.elapsed().as_secs_f64() * 1000.0;
    let matrix_ops = count as f64 / (matrix_ms / 1000.0);
    
    println!("总耗时: {:.2} ms", matrix_ms);
    println!("平均每次: {:.3} ms", matrix_ms / count as f64);
    println!("每秒生成: {:.0} ops/s", matrix_ops);
    println!();

    // ========== 阶段 2: SVG 字符串渲染 ==========
    println!("【阶段 2: SVG 渲染（矩阵 → SVG 字符串）】");
    // 先预生成一个矩阵
    let _ = gen.generate(text);
    
    let start = Instant::now();
    for _ in 0..count {
        let _svg = gen.get_svg();
    }
    let svg_ms = start.elapsed().as_secs_f64() * 1000.0;
    let svg_ops = count as f64 / (svg_ms / 1000.0);
    
    println!("总耗时: {:.2} ms", svg_ms);
    println!("平均每次: {:.3} ms", svg_ms / count as f64);
    println!("每秒生成: {:.0} ops/s", svg_ops);
    println!();

    // ========== 阶段 3: 完整流程（矩阵 + SVG） ==========
    println!("【阶段 3: 完整流程（字符串 → SVG）】");
    let start = Instant::now();
    for i in 0..count {
        let test_text = format!("{}/test{}", text, i);
        let mut gen = QRCodeGenerator::new();
        let _ = gen.generate(&test_text);
        let _svg = gen.get_svg();
    }
    let full_ms = start.elapsed().as_secs_f64() * 1000.0;
    let full_ops = count as f64 / (full_ms / 1000.0);
    
    println!("总耗时: {:.2} ms", full_ms);
    println!("平均每次: {:.3} ms", full_ms / count as f64);
    println!("每秒生成: {:.0} ops/s", full_ops);
    println!();

    // ========== 阶段 4: 实例复用优化 ==========
    println!("【阶段 4: 实例复用优化（推荐）】");
    let start = Instant::now();
    let mut gen = QRCodeGenerator::new();
    for i in 0..count {
        let test_text = format!("{}/test{}", text, i);
        let _ = gen.generate(&test_text);
        let _svg = gen.get_svg();
    }
    let reuse_ms = start.elapsed().as_secs_f64() * 1000.0;
    let reuse_ops = count as f64 / (reuse_ms / 1000.0);
    
    println!("总耗时: {:.2} ms", reuse_ms);
    println!("平均每次: {:.3} ms", reuse_ms / count as f64);
    println!("每秒生成: {:.0} ops/s", reuse_ops);
    println!();

    // 输出 JSON 结果
    println!("【JSON 结果】");
    let result = format!(
        r#"{{"rust_matrix_ops": {:.0}, "rust_svg_ops": {:.0}, "rust_full_ops": {:.0}, "rust_reuse_ops": {:.0}}}"#,
        matrix_ops, svg_ops, full_ops, reuse_ops
    );
    println!("{}", result);
    
    // 保存结果
    std::fs::write("benchmark_result.json", result).expect("无法写入结果文件");
    println!("\n结果已保存到 benchmark_result.json");
    
    // 性能分析
    println!("\n【性能分析】");
    println!("矩阵生成:     {:.0} ops/s ({:.1}%)", matrix_ops, matrix_ms/full_ms*100.0);
    println!("SVG 渲染:     {:.0} ops/s ({:.1}%)", svg_ops, svg_ms/full_ms*100.0);
    println!("完整流程:     {:.0} ops/s", full_ops);
    println!("实例复用:     {:.0} ops/s (快 {:.1}x)", reuse_ops, full_ms/reuse_ms);
    
    println!("\n【与 Node.js 对比建议】");
    println!("Node.js 应该对比的指标:");
    println!("- 纯矩阵生成:   rust_matrix_ops");
    println!("- 完整流程:     rust_full_ops 或 rust_reuse_ops");
}
