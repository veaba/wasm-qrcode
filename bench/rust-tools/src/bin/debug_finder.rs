// Debug finder pattern implementation
//
// Usage:
//   cargo run --release --bin debug-finder -- [mode]
//
// Modes:
//   basic    - Show finder pattern visualization (default)
//   logic    - Detailed logic analysis and tracing

use qrcode_fast::{QRCode, QRErrorCorrectLevel};
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let mode = if args.len() > 1 { args[1].clone() } else { "basic".to_string() };
    
    match mode.as_str() {
        "logic" => debug_logic(),
        "basic" => debug_basic(),
        _ => debug_basic(),
    }
}

fn debug_basic() {
    let mut qr = QRCode::with_options(QRErrorCorrectLevel::H);
    qr.make_code("Hello World");

    println!("🔍 Finder Pattern Test");
    println!("═══════════════════════════════════════");
    println!("Module count: {}x{}\n", qr.module_count, qr.module_count);

    println!("Top-left finder pattern (should be 7x7):");
    println!("═══════════════════════════════════════");
    println!("Expected pattern:");
    println!("  ███████");
    println!("  █░░░░░█");
    println!("  █░███░█");
    println!("  █░███░█");
    println!("  █░███░█");
    println!("  █░░░░░█");
    println!("  ███████");
    println!();
    println!("Actual pattern from qrcode-fast:");
    for r in 0..7 {
        print!("  ");
        for c in 0..7 {
            let dark = qr.is_dark(r, c);
            print!("{}", if dark { "█" } else { "░" });
        }
        println!();
    }

    println!();
    println!("Checking individual positions:");
    println!("═══════════════════════════════════════");
    for r in 0..7 {
        for c in 0..7 {
            let dark = qr.is_dark(r, c);
            let expected = is_expected_finder_dark(r, c);
            let status = if dark == expected { "✓" } else { "✗" };
            println!("  ({},{}) expected={}, actual={} {}", r, c,
                     if expected { "█" } else { "░" },
                     if dark { "█" } else { "░" },
                     status);
        }
    }

    println!();
    println!("Row 1 columns 0-6 (should be: █░░░░░█):");
    for c in 0..7 {
        let dark = qr.is_dark(1, c);
        print!("{}", if dark { "█" } else { "░" });
    }
    println!();
}

fn debug_logic() {
    let text = "Hello World";

    println!("🔍 Debugging Finder Pattern Logic");
    println!("═══════════════════════════════════════");

    let mut qr = QRCode::with_options(QRErrorCorrectLevel::M);
    qr.make_code(text);

    println!("Module count: {}x{}\n", qr.module_count, qr.module_count);

    println!("Top-left finder pattern analysis:");
    println!("───────────────────────────────────────");
    for r in 0..7 {
        for c in 0..7 {
            let dark = qr.is_dark(r, c);

            let is_outer = r == 0 || r == 6 || c == 0 || c == 6;
            let is_center = (2..=4).contains(&r) && (2..=4).contains(&c);
            let expected = is_outer || is_center;

            let status = if dark == expected { "✓" } else { "✗" };

            println!("  ({},{}): dark={}, expected={}, outer={}, center={} {}",
                     r, c, dark, expected, is_outer, is_center, status);
        }
    }

    println!("\nManual trace of setup_position_probe_pattern(0, 0):");
    println!("───────────────────────────────────────");
    for r in -1i32..=7 {
        for c in -1i32..=7 {
            if r < 0 || c < 0 || r >= 7 || c >= 7 {
                continue;
            }

            let is_dark = ((0..=6).contains(&r) && (c == 0 || c == 6))
                || ((0..=6).contains(&c) && (r == 0 || r == 6))
                || ((2..=4).contains(&r) && (2..=4).contains(&c));

            let actual_dark = qr.is_dark(r, c);
            let status = if is_dark == actual_dark { "✓" } else { "✗" };

            if is_dark != actual_dark {
                println!("  ({},{}): formula={}, actual={} {}",
                         r, c, is_dark, actual_dark, status);
            }
        }
    }
}

fn is_expected_finder_dark(r: i32, c: i32) -> bool {
    (r == 0 || r == 6 || c == 0 || c == 6) ||
    ((2..=4).contains(&r) && (2..=4).contains(&c))
}
