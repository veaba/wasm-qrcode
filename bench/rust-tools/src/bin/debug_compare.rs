// Debug tool to compare qrcode-fast with kennytm reference
//
// Usage:
//   cargo run --release --bin debug-compare -- [mode]
//
// Modes:
//   basic    - Basic module comparison (default)
//   detail   - Detailed difference analysis

use qrcode_fast::{QRCode, QRErrorCorrectLevel};
use qrcode_kennytm::QrCode as KennytmQRCode;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let mode = if args.len() > 1 { args[1].clone() } else { "basic".to_string() };
    
    match mode.as_str() {
        "detail" => debug_detail(),
        "basic" => debug_basic(),
        _ => debug_basic(),
    }
}

fn debug_basic() {
    let text = "Hello World";

    println!("🔍 Debug QR Code Module Comparison");
    println!("═══════════════════════════════════════");
    println!("Text: {}\n", text);

    let mut qr_fast = QRCode::with_options(QRErrorCorrectLevel::H);
    qr_fast.make_code(text);
    let count_fast = qr_fast.module_count;

    let qr_kennytm = KennytmQRCode::with_error_correction_level(text, qrcode_kennytm::EcLevel::H).unwrap();
    let count_kennytm = qr_kennytm.width();

    println!("📦 qrcode-fast: {}x{} modules", count_fast, count_fast);
    println!("📦 kennytm:     {}x{} modules\n", count_kennytm, count_kennytm);

    if count_fast as usize != count_kennytm {
        println!("⚠️  Module count mismatch!");
        return;
    }

    println!("🔍 Top-left finder pattern (7x7):");
    println!("═══════════════════════════════════════");
    println!("  qrcode-fast:");
    print_finder_pattern(&qr_fast, 0, 0);
    println!("  kennytm:");
    print_finder_pattern_kennytm(&qr_kennytm, 0, 0);

    println!("⏱️  Timing patterns:");
    println!("═══════════════════════════════════════");
    print_timing_pattern(&qr_fast, "qrcode-fast");
    print_timing_pattern_kennytm(&qr_kennytm, "kennytm");

    println!("📊 Sample modules (row 8, cols 0-14):");
    println!("═══════════════════════════════════════");
    print!("  qrcode-fast: ");
    for col in 0..15 {
        let dark = qr_fast.is_dark(8, col);
        print!("{}", if dark { "█" } else { "░" });
    }
    println!();
    print!("  kennytm:     ");
    for col in 0..15 {
        let dark = matches!(qr_kennytm[(8, col)], qrcode_kennytm::Color::Dark);
        print!("{}", if dark { "█" } else { "░" });
    }
    println!();
}

fn debug_detail() {
    let text = "Hello World";

    println!("🔍 Detailed Module Difference Analysis");
    println!("═══════════════════════════════════════");
    println!("Text: {}\n", text);

    let mut qr_fast = QRCode::with_options(QRErrorCorrectLevel::H);
    qr_fast.make_code(text);
    let count = qr_fast.module_count as usize;

    let qr_kennytm = KennytmQRCode::with_error_correction_level(text, qrcode_kennytm::EcLevel::H).unwrap();

    println!("Module count: {}x{}\n", count, count);

    let mut differences = Vec::new();
    for row in 0..count {
        for col in 0..count {
            let fast_dark = qr_fast.is_dark(row as i32, col as i32);
            let kennytm_dark = matches!(qr_kennytm[(row, col)], qrcode_kennytm::Color::Dark);
            if fast_dark != kennytm_dark {
                differences.push((row, col, fast_dark, kennytm_dark));
            }
        }
        if differences.len() >= 50 {
            break;
        }
    }

    println!("📊 First {} module differences:", differences.len());
    println!("═══════════════════════════════════════");
    for (i, (row, col, fast, kennytm)) in differences.iter().enumerate() {
        println!("  [{}] ({},{:2}): fast={}, kennytm={}",
                 i + 1, row, col,
                 if *fast { "██" } else { "░░" },
                 if *kennytm { "██" } else { "░░" });
    }

    println!("\n🔍 Region: Finder pattern area (0-8, 0-8)");
    println!("═══════════════════════════════════════");
    for row in 0..9.min(count) {
        print!("  {:2}: ", row);
        for col in 0..9.min(count) {
            let fast = qr_fast.is_dark(row as i32, col as i32);
            let ken = matches!(qr_kennytm[(row, col)], qrcode_kennytm::Color::Dark);
            if fast != ken {
                print!("{} ", if fast { "▓▓" } else { "░░" });
            } else {
                print!("{} ", if fast { "██" } else { "░░" });
            }
        }
        println!();
    }

    println!("\n🔍 Checking specific modules around timing patterns");
    println!("═══════════════════════════════════════");

    println!("Row 8 (should have timing pattern at col 6):");
    print!("  cols 4-10: ");
    for col in 4..11.min(count) {
        let fast = qr_fast.is_dark(8, col as i32);
        let ken = matches!(qr_kennytm[(8, col)], qrcode_kennytm::Color::Dark);
        print!("{}", if fast == ken {
            if fast { "█" } else { "░" }
        } else if fast { "F" } else { "f" });
    }
    println!();

    println!("Col 8 (should have timing pattern at row 6):");
    print!("  rows 4-10: ");
    for row in 4..11.min(count) {
        let fast = qr_fast.is_dark(row as i32, 8);
        let ken = matches!(qr_kennytm[(row, 8)], qrcode_kennytm::Color::Dark);
        print!("{}", if fast == ken {
            if fast { "█" } else { "░" }
        } else if fast { "F" } else { "f" });
    }
    println!();

    println!("Col 6 (vertical timing pattern):");
    print!("  rows 4-10: ");
    for row in 4..11.min(count) {
        let fast = qr_fast.is_dark(row as i32, 6);
        let ken = matches!(qr_kennytm[(row, 6)], qrcode_kennytm::Color::Dark);
        print!("{}", if fast == ken {
            if fast { "█" } else { "░" }
        } else if fast { "F" } else { "f" });
    }
    println!();

    println!("Row 6 (horizontal timing pattern):");
    print!("  cols 4-10: ");
    for col in 4..11.min(count) {
        let fast = qr_fast.is_dark(6, col as i32);
        let ken = matches!(qr_kennytm[(6, col)], qrcode_kennytm::Color::Dark);
        print!("{}", if fast == ken {
            if fast { "█" } else { "░" }
        } else if fast { "F" } else { "f" });
    }
    println!();
}

fn print_finder_pattern(qr: &QRCode, offset_row: i32, offset_col: i32) {
    for r in 0..7 {
        print!("    ");
        for c in 0..7 {
            let dark = qr.is_dark(offset_row + r, offset_col + c);
            print!("{}", if dark { "█" } else { "░" });
        }
        println!();
    }
}

fn print_finder_pattern_kennytm(qr: &KennytmQRCode, offset_row: usize, offset_col: usize) {
    for r in 0..7 {
        print!("    ");
        for c in 0..7 {
            let dark = matches!(qr[(offset_row + r, offset_col + c)], qrcode_kennytm::Color::Dark);
            print!("{}", if dark { "█" } else { "░" });
        }
        println!();
    }
}

fn print_timing_pattern(qr: &QRCode, name: &str) {
    print!("  {} row 6: ", name);
    for c in 8..14 {
        let dark = qr.is_dark(6, c);
        print!("{}", if dark { "█" } else { "░" });
    }
    println!();
    print!("  {} col 6: ", name);
    for r in 8..14 {
        let dark = qr.is_dark(r, 6);
        print!("{}", if dark { "█" } else { "░" });
    }
    println!();
}

fn print_timing_pattern_kennytm(qr: &KennytmQRCode, name: &str) {
    print!("  {} row 6: ", name);
    for c in 8..14 {
        let dark = matches!(qr[(6, c)], qrcode_kennytm::Color::Dark);
        print!("{}", if dark { "█" } else { "░" });
    }
    println!();
    print!("  {} col 6: ", name);
    for r in 8..14 {
        let dark = matches!(qr[(r, 6)], qrcode_kennytm::Color::Dark);
        print!("{}", if dark { "█" } else { "░" });
    }
    println!();
}
