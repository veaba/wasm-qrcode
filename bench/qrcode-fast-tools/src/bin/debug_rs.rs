use qrcode_kennytm::{EcLevel, QrCode, Version};
use qrcode_rust::{QRCode, qr_code::QRCodeOptions, qr_code_model::QRErrorCorrectLevel};

fn main() {
    let text = "Hello World";
    
    // 使用 kennytm 的 qrcode 生成参考数据
    let qr_kenny = QrCode::new(text.as_bytes()).unwrap();
    let version = qr_kenny.version();
    let ec_level = qr_kenny.ec_level();
    
    println!("参考实现 (kennytm/qrcode):");
    println!("  版本: {:?}", version);
    println!("  纠错级别: {:?}", ec_level);
    
    // 使用我们的实现
    let mut qr = QRCode::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevel::M, // 使用 M 级别与参考对比
    });
    qr.make_code(text);
    
    println!("\n我们的实现 (@veaba/qrcode-rust):");
    println!("  版本: {}", qr.type_number);
    println!("  模块数: {}", qr.get_module_count());
    
    // 比较两个二维码的模块
    let count = qr.get_module_count() as usize;
    let kenny_modules: Vec<Vec<bool>> = (0..count)
        .map(|r| (0..count).map(|c| qr_kenny[(c, r)] == qrcode_kennytm::Color::Dark).collect())
        .collect();
    
    let our_modules: Vec<Vec<bool>> = (0..count)
        .map(|r| (0..count).map(|c| qr.is_dark(r as i32, c as i32)).collect())
        .collect();
    
    // 找出差异
    let mut diff_count = 0;
    for r in 0..count {
        for c in 0..count {
            if kenny_modules[r][c] != our_modules[r][c] {
                diff_count += 1;
                if diff_count <= 20 {
                    println!("  差异 at ({}, {}): 参考={}, 我们={}", 
                        r, c, kenny_modules[r][c], our_modules[r][c]);
                }
            }
        }
    }
    println!("\n总差异模块数: {}", diff_count);
}
