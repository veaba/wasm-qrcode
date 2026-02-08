// 调试格式信息

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust};

fn main() {
    let text = "Test QR Code 123";

    println!("🔍 调试格式信息");
    println!("═══════════════════════════════════════════════════════════════════");
    println!("文本: '{}'", text);
    println!();

    // 创建 qrcode-rust 实例
    let mut qr = QRCodeRust::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: LevelRust::M,
    });
    qr.make_code(text);

    let module_count = qr.module_count as usize;

    // 打印第8行（水平格式信息）
    println!("第8行（水平格式信息）:");
    print!("  列 0-14: ");
    for col in 0..15 {
        let val = qr.is_dark(8, col);
        print!("{}", if val { '1' } else { '0' });
    }
    println!();

    print!("  列 {}-{}: ", module_count - 15, module_count - 1);
    for col in (module_count - 15)..module_count {
        let val = qr.is_dark(8, col as i32);
        print!("{}", if val { '1' } else { '0' });
    }
    println!();

    // 打印第8列（垂直格式信息）
    println!();
    println!("第8列（垂直格式信息）:");
    print!("  行 0-14: ");
    for row in 0..15 {
        let val = qr.is_dark(row, 8);
        print!("{}", if val { '1' } else { '0' });
    }
    println!();

    print!("  行 {}-{}: ", module_count - 15, module_count - 1);
    for row in (module_count - 15)..module_count {
        let val = qr.is_dark(row as i32, 8);
        print!("{}", if val { '1' } else { '0' });
    }
    println!();

    // 打印第8行和第8列的完整状态
    println!();
    println!("第8行完整状态:");
    for col in 0..module_count {
        let val = qr.is_dark(8, col as i32);
        print!("{}", if val { '1' } else { '0' });
    }
    println!();

    println!();
    println!("第8列完整状态:");
    for row in 0..module_count {
        let val = qr.is_dark(row as i32, 8);
        print!("{}", if val { '1' } else { '0' });
    }
    println!();
}
