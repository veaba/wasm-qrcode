use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};

fn main() {
    let text = "A";
    println!("=== 调试单字符 '{}' ===", text);
    println!("文本字节数: {}", text.bytes().count());

    let mut qr = QRCode::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevel::M,
    });
    qr.make_code(text);

    println!("\ntype_number: {}", qr.type_number);
    println!("module_count: {}", qr.module_count);

    if let Some(ref data) = qr.data_cache {
        println!("\ndata_cache 长度: {}", data.len());
        println!("data_cache 内容:");
        for (i, byte) in data.iter().enumerate() {
            print!("{:02X} ", byte);
            if (i + 1) % 16 == 0 {
                println!();
            }
        }
        println!();
    }

    // 保存 SVG
    let svg = qr.get_svg();
    std::fs::write("debug_A.svg", &svg).expect("无法写入文件");
    println!("\nSVG 已保存到 debug_A.svg");
}
