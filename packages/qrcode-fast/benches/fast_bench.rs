use criterion::{black_box, criterion_group, criterion_main, Criterion};

// 我们的 fast 版本
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

// kennytm 的版本
use qrcode_kennytm::{QrCode, EcLevel};

// 原版的 qrcode-rust
use qrcode_rust::{QRCode as QROriginal, QRErrorCorrectLevel as LevelOriginal};

fn benchmark_single_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    
    let mut group = c.benchmark_group("single_generation");
    
    group.bench_function("qrcode_fast", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });
    
    group.bench_function("kennytm", |b| {
        b.iter(|| {
            let qr = QrCode::new(text).unwrap();
            black_box(qr.render::<qrcode_kennytm::render::svg::Color>().build());
        });
    });
    
    group.bench_function("qrcode_rust_original", |b| {
        b.iter(|| {
            let mut qr = QROriginal::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });
    
    group.finish();
}

fn benchmark_svg_only(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    
    let mut group = c.benchmark_group("svg_only");
    
    // 预先创建 QRCode
    let mut qr_fast = QRCode::new();
    qr_fast.make_code(text);
    
    let qr_kenny = QrCode::new(text).unwrap();
    
    let mut qr_orig = QROriginal::new();
    qr_orig.make_code(text);
    
    group.bench_function("qrcode_fast", |b| {
        b.iter(|| {
            black_box(qr_fast.get_svg());
        });
    });
    
    group.bench_function("kennytm", |b| {
        b.iter(|| {
            black_box(qr_kenny.render::<qrcode_kennytm::render::svg::Color>().build());
        });
    });
    
    group.bench_function("qrcode_rust_original", |b| {
        b.iter(|| {
            black_box(qr_orig.get_svg());
        });
    });
    
    group.finish();
}

fn benchmark_batch(c: &mut Criterion) {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://example.com/{}", i))
        .collect();
    
    let mut group = c.benchmark_group("batch_100");
    
    group.bench_function("qrcode_fast", |b| {
        b.iter(|| {
            for text in &texts {
                let mut qr = QRCode::new();
                qr.make_code(text);
                black_box(qr.get_svg());
            }
        });
    });
    
    group.bench_function("kennytm", |b| {
        b.iter(|| {
            for text in &texts {
                let qr = QrCode::new(text).unwrap();
                black_box(qr.render::<qrcode_kennytm::render::svg::Color>().build());
            }
        });
    });
    
    group.finish();
}

criterion_group!(benches, benchmark_single_generation, benchmark_svg_only, benchmark_batch);
criterion_main!(benches);
