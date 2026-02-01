//! 最终对比报告：qrcode-fast vs kennytm/qrcode

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use std::time::Duration;

use qrcode_fast::QRCode;
use qrcode_kennytm::QrCode;

fn generate_test_texts() -> Vec<String> {
    vec![
        "a".to_string(),                                    // 超短文本
        "https://a.co".to_string(),                        // 短 URL
        "https://github.com/veaba/qrcodes".to_string(), // 中等 URL
        "https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3&param4=value4".to_string(), // 长文本
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.".to_string(), // 超长文本
    ]
}

fn benchmark_complete_workflow(c: &mut Criterion) {
    let texts = generate_test_texts();
    let mut group = c.benchmark_group("完整工作流：生成 QRCode + SVG");
    group.measurement_time(Duration::from_secs(10));
    
    for text in &texts {
        let len = text.len();
        
        group.bench_with_input(BenchmarkId::new("qrcode-fast", len), text, |b, text| {
            b.iter(|| {
                let mut qr = QRCode::new();
                qr.make_code(text);
                black_box(qr.get_svg());
            });
        });
        
        group.bench_with_input(BenchmarkId::new("kennytm", len), text, |b, text| {
            b.iter(|| {
                let qr = QrCode::new(text.as_bytes()).unwrap();
                black_box(qr.render::<qrcode_kennytm::render::svg::Color>().build());
            });
        });
    }
    
    group.finish();
}

fn benchmark_svg_only(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    
    // 预先生成 QRCode
    let mut qr_fast = QRCode::new();
    qr_fast.make_code(text);
    
    let qr_kenny = QrCode::new(text.as_bytes()).unwrap();
    
    let mut group = c.benchmark_group("纯 SVG 渲染（QRCode 已生成）");
    group.measurement_time(Duration::from_secs(10));
    
    group.bench_function("qrcode-fast", |b| {
        b.iter(|| {
            black_box(qr_fast.get_svg());
        });
    });
    
    group.bench_function("kennytm", |b| {
        b.iter(|| {
            black_box(qr_kenny.render::<qrcode_kennytm::render::svg::Color>().build());
        });
    });
    
    group.finish();
}

fn benchmark_batch_sizes(c: &mut Criterion) {
    let batch_sizes = vec![1, 10, 50, 100, 500];
    
    let mut group = c.benchmark_group("批量生成性能");
    group.measurement_time(Duration::from_secs(15));
    
    for size in batch_sizes {
        let texts: Vec<String> = (0..size)
            .map(|i| format!("https://example.com/page/{}", i))
            .collect();
        
        group.bench_with_input(BenchmarkId::new("qrcode-fast", size), &size, |b, _| {
            b.iter(|| {
                for text in &texts {
                    let mut qr = QRCode::new();
                    qr.make_code(text);
                    black_box(qr.get_svg());
                }
            });
        });
        
        group.bench_with_input(BenchmarkId::new("kennytm", size), &size, |b, _| {
            b.iter(|| {
                for text in &texts {
                    let qr = QrCode::new(text.as_bytes()).unwrap();
                    black_box(qr.render::<qrcode_kennytm::render::svg::Color>().build());
                }
            });
        });
    }
    
    group.finish();
}

fn benchmark_throughput(c: &mut Criterion) {
    let mut group = c.benchmark_group("吞吐量测试（每秒生成数量）");
    group.measurement_time(Duration::from_secs(10));
    
    let text = "https://github.com/veaba/qrcodes";
    
    // 计算单次耗时，反推 ops/s
    group.bench_function("qrcode-fast-ops", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });
    
    group.bench_function("kennytm-ops", |b| {
        b.iter(|| {
            let qr = QrCode::new(text.as_bytes()).unwrap();
            black_box(qr.render::<qrcode_kennytm::render::svg::Color>().build());
        });
    });
    
    group.finish();
}

criterion_group!(
    benches,
    benchmark_complete_workflow,
    benchmark_svg_only,
    benchmark_batch_sizes,
    benchmark_throughput
);
criterion_main!(benches);
