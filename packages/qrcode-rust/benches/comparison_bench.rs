use criterion::{black_box, criterion_group, criterion_main, Criterion};

// 我们的实现
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

// kennytm 的实现
use qrcode_kennytm::{EcLevel, QrCode};

// qrcode-fast 实现
use qrcode_fast::{QRCode as FastQRCode, QRErrorCorrectLevel as FastQRErrorCorrectLevel};

fn benchmark_veaba_single_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";

    c.bench_function("veaba_single_generation", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });
}

fn benchmark_veaba_batch_generation(c: &mut Criterion) {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://example.com/{}", i))
        .collect();

    c.bench_function("veaba_batch_100", |b| {
        b.iter(|| {
            for text in &texts {
                let mut qr = QRCode::new();
                qr.make_code(text);
                black_box(qr.get_svg());
            }
        });
    });
}

fn benchmark_veaba_svg_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    let mut qr = QRCode::new();
    qr.make_code(text);

    c.bench_function("veaba_svg_generation", |b| {
        b.iter(|| {
            // 注意：get_svg 会生成新的 SVG 字符串，这是正确的测试方式
            black_box(qr.get_svg());
        });
    });
}

// 公平对比：只测试 SVG 渲染（不重新生成 QRCode）
fn benchmark_veaba_svg_only(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    let mut qr = QRCode::new();
    qr.make_code(text);

    // 先获取一次 SVG，确保缓存等优化已生效
    let _ = qr.get_svg();

    c.bench_function("veaba_svg_only", |b| {
        b.iter(|| {
            black_box(qr.get_svg());
        });
    });
}

fn benchmark_veaba_error_levels(c: &mut Criterion) {
    let text = "https://example.com";

    let mut group = c.benchmark_group("veaba_error_levels");

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

fn benchmark_veaba_different_lengths(c: &mut Criterion) {
    let mut group = c.benchmark_group("veaba_text_lengths");

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

// ========== kennytm 实现的基准测试 ==========

fn benchmark_kennytm_single_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";

    c.bench_function("kennytm_single_generation", |b| {
        b.iter(|| {
            let qr = QrCode::new(text).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });
}

fn benchmark_kennytm_batch_generation(c: &mut Criterion) {
    let texts: Vec<String> = (0..100)
        .map(|i| format!("https://example.com/{}", i))
        .collect();

    c.bench_function("kennytm_batch_100", |b| {
        b.iter(|| {
            for text in &texts {
                let qr = QrCode::new(text).unwrap();
                black_box(qr.render::<char>().quiet_zone(false).build());
            }
        });
    });
}

fn benchmark_kennytm_svg_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    let qr = QrCode::new(text).unwrap();

    c.bench_function("kennytm_svg_generation", |b| {
        b.iter(|| {
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });
}

fn benchmark_kennytm_error_levels(c: &mut Criterion) {
    let text = "https://example.com";

    let mut group = c.benchmark_group("kennytm_error_levels");

    group.bench_function("L", |b| {
        b.iter(|| {
            let qr = QrCode::with_error_correction_level(text, EcLevel::L).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    group.bench_function("M", |b| {
        b.iter(|| {
            let qr = QrCode::with_error_correction_level(text, EcLevel::M).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    group.bench_function("Q", |b| {
        b.iter(|| {
            let qr = QrCode::with_error_correction_level(text, EcLevel::Q).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    group.bench_function("H", |b| {
        b.iter(|| {
            let qr = QrCode::with_error_correction_level(text, EcLevel::H).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    group.finish();
}

fn benchmark_kennytm_different_lengths(c: &mut Criterion) {
    let mut group = c.benchmark_group("kennytm_text_lengths");

    // 短文本
    let short = "https://a.co";
    group.bench_function("short_12chars", |b| {
        b.iter(|| {
            let qr = QrCode::new(short).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    // 中等文本
    let medium = "https://github.com/veaba/qrcodes";
    group.bench_function("medium_36chars", |b| {
        b.iter(|| {
            let qr = QrCode::new(medium).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    // 长文本
    let long = "https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3";
    group.bench_function("long_98chars", |b| {
        b.iter(|| {
            let qr = QrCode::new(long).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    group.finish();
}

// ========== qrcode-fast 基准测试 ==========

fn benchmark_fast_single_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";

    c.bench_function("fast_single_generation", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
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
                let mut qr = FastQRCode::new();
                qr.make_code(text);
                black_box(qr.get_svg());
            }
        });
    });
}

fn benchmark_fast_svg_generation(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    let mut qr = FastQRCode::new();
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
            let mut qr = FastQRCode::new();
            qr.options.correct_level = FastQRErrorCorrectLevel::L;
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("M", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
            qr.options.correct_level = FastQRErrorCorrectLevel::M;
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("Q", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
            qr.options.correct_level = FastQRErrorCorrectLevel::Q;
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("H", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
            qr.options.correct_level = FastQRErrorCorrectLevel::H;
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
            let mut qr = FastQRCode::new();
            qr.make_code(short);
            black_box(qr.get_svg());
        });
    });

    // 中等文本
    let medium = "https://github.com/veaba/qrcodes";
    group.bench_function("medium_36chars", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
            qr.make_code(medium);
            black_box(qr.get_svg());
        });
    });

    // 长文本
    let long = "https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3";
    group.bench_function("long_98chars", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
            qr.make_code(long);
            black_box(qr.get_svg());
        });
    });

    group.finish();
}

// ========== 对比测试：相同场景 ==========

fn benchmark_comparison_same_text(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";

    let mut group = c.benchmark_group("comparison_same_text");

    group.bench_function("veaba_rust", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("veaba_fast", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("kennytm", |b| {
        b.iter(|| {
            let qr = QrCode::new(text).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    group.finish();
}

fn benchmark_comparison_three_way(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";

    let mut group = c.benchmark_group("comparison_three_way");

    // 单条生成对比
    group.bench_function("single_veaba_rust", |b| {
        b.iter(|| {
            let mut qr = QRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("single_veaba_fast", |b| {
        b.iter(|| {
            let mut qr = FastQRCode::new();
            qr.make_code(text);
            black_box(qr.get_svg());
        });
    });

    group.bench_function("single_kennytm", |b| {
        b.iter(|| {
            let qr = QrCode::new(text).unwrap();
            black_box(qr.render::<char>().quiet_zone(false).build());
        });
    });

    group.finish();
}

criterion_group!(
    veaba_benches,
    benchmark_veaba_single_generation,
    benchmark_veaba_batch_generation,
    benchmark_veaba_svg_generation,
    benchmark_veaba_svg_only,
    benchmark_veaba_error_levels,
    benchmark_veaba_different_lengths
);

criterion_group!(
    fast_benches,
    benchmark_fast_single_generation,
    benchmark_fast_batch_generation,
    benchmark_fast_svg_generation,
    benchmark_fast_error_levels,
    benchmark_fast_different_lengths
);

criterion_group!(
    kennytm_benches,
    benchmark_kennytm_single_generation,
    benchmark_kennytm_batch_generation,
    benchmark_kennytm_svg_generation,
    benchmark_kennytm_error_levels,
    benchmark_kennytm_different_lengths
);

criterion_group!(
    comparison_benches,
    benchmark_comparison_same_text,
    benchmark_comparison_three_way
);

criterion_main!(
    veaba_benches,
    fast_benches,
    kennytm_benches,
    comparison_benches
);
