//! SVG 生成性能基准测试
//! 
//! 对比 qrcode-fast（优化版）vs kennytm/qrcode 的 SVG 生成性能

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use qrcode_kennytm::QrCode;

/// 使用 qrcode-fast 优化方法生成 SVG
fn generate_optimized_svg(qr: &QrCode) -> String {
    let width = qr.width();
    let cell_size = 8;
    let quiet_zone = 4;
    let offset = cell_size * quiet_zone;
    let total_size = width * cell_size + 2 * offset;
    
    let dark_count = qr.to_colors().iter().filter(|&&c| c == qrcode_kennytm::Color::Dark).count();
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

    // 生成路径数据
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

/// 使用 kennytm 默认方式生成 SVG
fn generate_kennytm_svg(qr: &QrCode) -> String {
    use qrcode_kennytm::render::svg;
    qr.render::<svg::Color>().build()
}

fn svg_benchmark(c: &mut Criterion) {
    // 测试不同长度的文本
    let test_cases = vec![
        ("短文本 (11B)", "Hello World"),
        ("URL (36B)", "https://github.com/veaba/qrcodes"),
        ("长文本 (109B)", "https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3#section"),
    ];
    
    let mut group = c.benchmark_group("SVG Generation");
    
    for (name, text) in test_cases {
        let qr = QrCode::new(text).unwrap();
        
        // 基准测试：kennytm 默认方式
        group.bench_with_input(
            BenchmarkId::new("kennytm", name),
            &qr,
            |b, qr| {
                b.iter(|| {
                    let svg = generate_kennytm_svg(qr);
                    black_box(svg);
                });
            },
        );
        
        // 基准测试：qrcode-fast 优化方式
        group.bench_with_input(
            BenchmarkId::new("qrcode-fast", name),
            &qr,
            |b, qr| {
                b.iter(|| {
                    let svg = generate_optimized_svg(qr);
                    black_box(svg);
                });
            },
        );
    }
    
    group.finish();
}

fn throughput_benchmark(c: &mut Criterion) {
    // 吞吐量测试：批量生成
    let text = "https://github.com/veaba/qrcodes";
    let qr = QrCode::new(text).unwrap();
    
    let mut group = c.benchmark_group("SVG Throughput");
    group.throughput(criterion::Throughput::Elements(100));
    
    // kennytm 批量生成
    group.bench_function("kennytm_batch_100", |b| {
        b.iter(|| {
            for _ in 0..100 {
                let svg = generate_kennytm_svg(&qr);
                black_box(svg);
            }
        });
    });
    
    // qrcode-fast 批量生成
    group.bench_function("qrcode-fast_batch_100", |b| {
        b.iter(|| {
            for _ in 0..100 {
                let svg = generate_optimized_svg(&qr);
                black_box(svg);
            }
        });
    });
    
    group.finish();
}

criterion_group!(benches, svg_benchmark, throughput_benchmark);
criterion_main!(benches);
