// Compare implementations between qrcode-rust and qrcode-fast
//
// Usage:
//   cargo run --release --bin compare-impls -- [mode] ["text"]
//
// Modes:
//   modules  - Compare module patterns (default)
//   full     - Full module comparison with visual output
//
// Examples:
//   cargo run --release --bin compare-impls
//   cargo run --release --bin compare-impls -- modules "Hello World"
//   cargo run --release --bin compare-impls -- full "Test"

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as QRErrorCorrectLevelRust};
use qrcode_fast::{QRCode as QRCodeFast, QRErrorCorrectLevel as QRErrorCorrectLevelFast};
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let mode = if args.len() > 1 { args[1].clone() } else { "modules".to_string() };
    let text = if args.len() > 2 { args[2].clone() } else { "Hello World".to_string() };
    
    match mode.as_str() {
        "full" => compare_full(&text),
        "modules" => compare_modules(&text),
        _ => compare_modules(&text),
    }
}

fn compare_modules(text: &str) {
    println!("🔍 Comparing Module Patterns");
    println!("═══════════════════════════════════════");
    println!("Text: {}\n", text);

    let mut qr_rust = QRCodeRust::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevelRust::M,
    });
    qr_rust.make_code(text);

    let mut qr_fast = QRCodeFast::with_options(QRErrorCorrectLevelFast::M);
    qr_fast.make_code(text);

    println!("Module counts:");
    println!("  qrcode-rust: {}x{}", qr_rust.module_count, qr_rust.module_count);
    println!("  qrcode-fast: {}x{}\n", qr_fast.module_count, qr_fast.module_count);

    // Check finder patterns
    println!("Top-left finder pattern (7x7):");
    println!("───────────────────────────────────────");
    for r in 0..7 {
        print!("  Row {}: ", r);
        for c in 0..7 {
            let rust_dark = qr_rust.is_dark(r, c);
            let fast_dark = qr_fast.is_dark(r, c);
            if rust_dark != fast_dark {
                print!("[{}] ", if fast_dark { "X" } else { "x" });
            } else {
                print!(" {} ", if fast_dark { "█" } else { "░" });
            }
        }
        println!();
    }

    // Check timing patterns
    println!("\nTiming pattern (row 6, columns 8-13):");
    println!("───────────────────────────────────────");
    print!("  Expected: ");
    for c in 8..14 {
        print!("{}", if c % 2 == 0 { "█" } else { "░" });
    }
    println!();
    print!("  Rust:     ");
    for c in 8..14 {
        print!("{}", if qr_rust.is_dark(6, c) { "█" } else { "░" });
    }
    println!();
    print!("  Fast:     ");
    for c in 8..14 {
        print!("{}", if qr_fast.is_dark(6, c) { "█" } else { "░" });
    }
    println!();

    // Count differences
    let mut diff_count = 0;
    for r in 0..qr_rust.module_count {
        for c in 0..qr_rust.module_count {
            if qr_rust.is_dark(r, c) != qr_fast.is_dark(r, c) {
                diff_count += 1;
            }
        }
    }

    println!("\nTotal differences: {} out of {} modules",
             diff_count, qr_rust.module_count * qr_rust.module_count);
}

fn compare_full(text: &str) {
    println!("🔍 Full Module Comparison");
    println!("═══════════════════════════════════════");
    println!("Text: {}\n", text);

    let mut qr_rust = QRCodeRust::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevelRust::M,
    });
    qr_rust.make_code(text);

    let mut qr_fast = QRCodeFast::with_options(QRErrorCorrectLevelFast::M);
    qr_fast.make_code(text);

    println!("Full QR Code (D=Rust dark, d=Fast dark only, .=Rust light only, space=both light):");
    println!("════════════════════════════════════════════════════════════════════════════════");

    for r in 0..21 {
        print!("Row {:2}: ", r);
        for c in 0..21 {
            let rust_dark = qr_rust.is_dark(r, c);
            let fast_dark = qr_fast.is_dark(r, c);

            let ch = if rust_dark && fast_dark {
                '█'
            } else if rust_dark {
                'R'
            } else if fast_dark {
                'F'
            } else {
                '░'
            };
            print!("{}", ch);
        }
        println!();
    }

    let mut diff_count = 0;
    let mut rust_only_dark = 0;
    let mut fast_only_dark = 0;

    for r in 0..21 {
        for c in 0..21 {
            let rust_dark = qr_rust.is_dark(r, c);
            let fast_dark = qr_fast.is_dark(r, c);

            if rust_dark != fast_dark {
                diff_count += 1;
                if rust_dark {
                    rust_only_dark += 1;
                } else {
                    fast_only_dark += 1;
                }
            }
        }
    }

    println!("\nTotal differences: {} out of 441", diff_count);
    println!("  Rust-only dark: {}", rust_only_dark);
    println!("  Fast-only dark: {}", fast_only_dark);
}
