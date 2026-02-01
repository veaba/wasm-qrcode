use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};

fn main() {
    let mut qr = QRCode::new();
    let qr_string = "Hello World 11";
    qr.make_code(qr_string);

    let svg = qr.get_svg();
    println!("Generated QR code SVG ({} chars)", svg.len());

    // Save to file
    let filename = format!("{}.svg", qr_string);
    std::fs::write(&filename, svg).expect("Failed to write SVG");
    println!("SVG saved to {}", filename);

    // Also test with different error correction levels
    for level in [
        QRErrorCorrectLevel::L,
        QRErrorCorrectLevel::M,
        QRErrorCorrectLevel::Q,
        QRErrorCorrectLevel::H,
    ] {
        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            color_dark: String::from("#000000"),
            color_light: String::from("#ffffff"),
            correct_level: level,
        });
        qr.make_code("Test");

        let filename = format!("test_qr_{:?}.svg", level);
        let svg = qr.get_svg();
        std::fs::write(&filename, svg).expect("Failed to write SVG");
        println!("SVG saved to {}", filename);
    }
}
