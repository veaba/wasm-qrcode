use qrcode_fast::{QRCode, QRErrorCorrectLevel};

fn main() {
    for &text in &["A", "Hello", "Hello World"] {
        for &ec_level in &[QRErrorCorrectLevel::L, QRErrorCorrectLevel::M, QRErrorCorrectLevel::H] {
            let mut qr = QRCode::with_options(ec_level);
            qr.make_code(text);
            
            let filename = format!("test_{}_{}.svg", 
                text.chars().next().unwrap(), 
                match ec_level {
                    QRErrorCorrectLevel::L => "L",
                    QRErrorCorrectLevel::M => "M",
                    QRErrorCorrectLevel::Q => "Q",
                    QRErrorCorrectLevel::H => "H",
                }
            );
            let svg = qr.get_svg();
            std::fs::write(&filename, &svg).unwrap();
            println!("Generated {} ({}x{} modules)", filename, qr.module_count, qr.module_count);
        }
    }
}
