//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

use wasm_qrcode::{version, CorrectLevel, QRCodeWasm};

#[wasm_bindgen_test]
fn test_version() {
    assert_eq!(version(), "v0.1.0");
}

#[wasm_bindgen_test]
fn test_qrcode_creation() {
    let qr = QRCodeWasm::new();
    qr.make_code("Hello World");

    let count = qr.get_module_count();
    assert!(count > 0);

    let svg = qr.get_svg();
    assert!(!svg.is_empty());
    assert!(svg.contains("<svg"));
    assert!(svg.contains("</svg>"));
}

#[wasm_bindgen_test]
fn test_qrcode_is_dark() {
    let qr = QRCodeWasm::new();
    qr.make_code("Test");

    let count = qr.get_module_count();

    // Check corners (should have finder patterns)
    let top_left = qr.is_dark(0, 0);
    let top_right = qr.is_dark(0, count - 1);
    let bottom_left = qr.is_dark(count - 1, 0);

    // Finder patterns should be dark
    assert!(top_left);
}

#[wasm_bindgen_test]
fn test_qrcode_with_options() {
    let qr = QRCodeWasm::with_options(256, 256, CorrectLevel::H);
    qr.make_code("https://example.com");

    let count = qr.get_module_count();
    assert!(count > 0);
}
