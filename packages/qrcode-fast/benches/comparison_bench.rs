use criterion::{black_box, criterion_group, criterion_main, Criterion};
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

fn benchmark_fast_single_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";

    c.bench_function("fast_single_generation", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });
}

fn benchmark_fast_batch_generation(c: &mut Criterion) {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://example.com/{}", i))
        .collect();

    c.bench_function("fast_batch_100", |b| {
        b.iter(|| {
            for text in &texts {
                let mut qr = QRCode::new();
                qr.make_code(text);
                black_box(qr.get_svg());
            }
        });
    });
}

fn benchmark_fast_svg_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    let mut qr = QRCode::new();
    qr.make_code(text);

    c.bench_function("fast_svg_generation", |b| {
        b.iter(|| {
            black_box(qr.get_svg());
        });
    });
}

fn benchmark_fast_error_levels(c: &mut Criterion) {
    let text = "https://example.com";

    let mut group = c.benchmark_group("fast_error_levels");

    group.bench_function("L", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.options.correct_level = QRErrorCorrectLevel::L;
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("M", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.options.correct_level = QRErrorCorrectLevel::M;
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("Q", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.options.correct_level = QRErrorCorrectLevel::Q;
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("H", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.options.correct_level = QRErrorCorrectLevel::H;
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.finish();
}

fn benchmark_fast_different_lengths(c: &mut Criterion) {
    let mut group = c.benchmark_group("fast_text_lengths");

    // 短文本
    let short = "https://a.co";
    group.bench_function("short_12chars", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(short);
            black_box(qr.get_svg());
        });
    });

    // 中等文本
    let medium = "https://github.com/veaba/qrcodes";
    group.bench_function("medium_36chars", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(medium);
            black_box(qr.get_svg());
        });
    });

    // 长文本
    let long = "https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3";
    group.bench_function("long_98chars", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(long);
            black_box(qr.get_svg());
        });
    });

    group.finish();
}

criterion_group!(
    fast_benches,
    benchmark_fast_single_generation,
    benchmark_fast_batch_generation,
    benchmark_fast_svg_generation,
    benchmark_fast_error_levels,
    benchmark_fast_different_lengths
);

criterion_main!(fast_benches);
