use qrcode_fast::{QRCode, QRErrorCorrectLevel};

fn main() {
    let text = "Hello World";
    
    let mut qr = QRCode::with_options(QRErrorCorrectLevel::M);
    qr.make_code(text);
    
    let svg = qr.get_svg();
    
    println!("Module count: {}", qr.module_count);
    
    // Save SVG
    std::fs::write("test_fast.svg", &svg).unwrap();
    println!("Saved to test_fast.svg");
    
    // Print first 500 chars
    println!("\nSVG preview:\n{}", &svg[..svg.len().min(500)]);
}
