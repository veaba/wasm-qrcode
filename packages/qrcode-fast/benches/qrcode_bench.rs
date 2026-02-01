use criterion::{black_box, criterion_group, criterion_main, Criterion};
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

fn benchmark_single_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    
    c.bench_function("single_generation", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            black_box(qr.get_module_count());
        });
    });
}

fn benchmark_batch_generation(c: &mut Criterion) {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://example.com/item{}", i))
        .collect();
    
    c.bench_function("batch_generation_100", |b| {
        b.iter(|| {
            for text in &texts {
                let mut qr = QRCode::new();
                qr.make_code(text);
                black_box(qr.get_module_count());
            }
        });
    });
}

fn benchmark_svg_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    let mut qr = QRCode::new();
    qr.make_code(text);
    
    c.bench_function("svg_generation", |b| {
        b.iter(|| {
            black_box(qr.get_svg());
        });
    });
}

fn benchmark_error_levels(c: &mut Criterion) {
    let text = "https://example.com";
    let levels = [
        ("L", QRErrorCorrectLevel::L),
        ("M", QRErrorCorrectLevel::M),
        ("Q", QRErrorCorrectLevel::Q),
        ("H", QRErrorCorrectLevel::H),
    ];
    
    for (name, level) in levels {
        c.bench_function(&format!("error_level_{}", name), |b| {
            b.iter(|| {
                let mut qr = QRCode::new();
                qr.options.correct_level = level;
                qr.make_code(text);
                black_box(qr.get_module_count());
            });
        });
    }
}

criterion_group!(
    benches,
    benchmark_single_generation,
    benchmark_batch_generation,
    benchmark_svg_generation,
    benchmark_error_levels
);
criterion_main!(benches);
