// Test existing SVG files
use qrcode_fast_tools::validation::validate_qr_code;
use std::fs;

fn main() {
    // Test qrcode-fast output
    let fast_svg = fs::read_to_string("bench/rust-tools/veaba_qrcode_fast.svg");
    if let Ok(svg) = fast_svg {
        println!("Testing qrcode-fast SVG...");
        match validate_qr_code(&svg, "Hello World") {
            Ok(()) => println!("✅ qrcode-fast validation PASSED"),
            Err(e) => println!("❌ qrcode-fast validation FAILED: {}", e),
        }
    } else {
        println!("⚠️  veaba_qrcode_fast.svg not found - run veaba-qr first");
    }

    // Test qrcode-rust output
    let rust_svg = fs::read_to_string("bench/rust-tools/veaba_qrcode_rust.svg");
    if let Ok(svg) = rust_svg {
        println!("\nTesting qrcode-rust SVG...");
        match validate_qr_code(&svg, "Hello World") {
            Ok(()) => println!("✅ qrcode-rust validation PASSED"),
            Err(e) => println!("❌ qrcode-rust validation FAILED: {}", e),
        }
    } else {
        println!("⚠️  veaba_qrcode_rust.svg not found - run veaba-qr first");
    }
}
