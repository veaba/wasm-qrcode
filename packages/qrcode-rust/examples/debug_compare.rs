use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};

fn main() {
    for text in ["A", "AB"] {
        println!("\n=== 调试文本 '{}' ===", text);

        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            color_dark: String::from("#000000"),
            color_light: String::from("#ffffff"),
            correct_level: QRErrorCorrectLevel::M,
        });
        qr.make_code(text);

        println!("type_number: {}, module_count: {}", qr.type_number, qr.module_count);

        if let Some(ref data) = qr.data_cache {
            println!("data_cache ({} 字节):", data.len());

            // 数据部分 (16 字节)
            print!("  数据: ");
            for i in 0..16 {
                print!("{:02X} ", data[i]);
            }
            println!();

            // 纠错码部分 (10 字节)
            print!("  纠错: ");
            for i in 16..26 {
                print!("{:02X} ", data[i]);
            }
            println!();
        }

        let svg = qr.get_svg();
        let filename = format!("debug_{}.svg", text);
        std::fs::write(&filename, &svg).expect("无法写入文件");
        println!("SVG 已保存到 {}", filename);
    }
}
