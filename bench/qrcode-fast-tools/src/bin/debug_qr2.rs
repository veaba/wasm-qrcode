// 深度调试 Reed-Solomon 实现

use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let text = if args.len() > 1 {
        args[1].clone()
    } else {
        "Hello World".to_string()
    };
    
    println!("🔍 Reed-Solomon 调试");
    println!("═══════════════════════════════════════");
    println!("文本: {}", text);
    println!();

    // 测试 Galois Field
    println!("📐 Galois Field 测试");
    println!("───────────────────────────────────────");
    test_galois_field();
    println!();

    // 测试 Reed-Solomon 生成多项式
    println!("📐 Reed-Solomon 生成多项式");
    println!("───────────────────────────────────────");
    test_rs_poly();
    println!();

    // 对比两个实现的模块数据
    println!("📐 对比模块数据");
    println!("───────────────────────────────────────");
    compare_modules(&text);
}

fn test_galois_field() {
    use qrcode_rust::qr_math::QRMath;
    
    // 测试一些基本的 GF 运算
    println!("gexp(0) = {} (应为 1)", QRMath::gexp(0));
    println!("gexp(1) = {} (应为 2)", QRMath::gexp(1));
    println!("gexp(2) = {} (应为 4)", QRMath::gexp(2));
    println!("gexp(8) = {} (应为 29)", QRMath::gexp(8));
    
    println!("glog(1) = {} (应为 0)", QRMath::glog(1));
    println!("glog(2) = {} (应为 1)", QRMath::glog(2));
    println!("glog(4) = {} (应为 2)", QRMath::glog(4));
    
    // 验证 gexp(glog(x)) == x
    let test_val = 42;
    let exp_log = QRMath::gexp(QRMath::glog(test_val));
    println!("gexp(glog({})) = {} (应为 {})", test_val, exp_log, test_val);
}

fn test_rs_poly() {
    use qrcode_rust::qr_polynomial::Polynomial;
    
    // 生成 ec_count=2 的 RS 生成多项式
    let poly = Polynomial::generate_rs_poly(2);
    println!("RS 生成多项式 (ec_count=2):");
    print!("  系数: [");
    for i in 0..poly.len() {
        if i > 0 {
            print!(", ");
        }
        print!("{}", poly.get(i));
    }
    println!("]");
    println!("  长度: {} (应为 ec_count+1 = 3)", poly.len());
}

fn compare_modules(text: &str) {
    use qrcode_rust::{QRCode, QRCodeOptions, QRErrorCorrectLevel};
    use qrcode_kennytm::QrCode as KennyQrCode;
    
    // 我们的实现
    let mut qr_rust = QRCode::with_options(QRCodeOptions {
        width: 256,
        height: 256,
        color_dark: String::from("#000000"),
        color_light: String::from("#ffffff"),
        correct_level: QRErrorCorrectLevel::H,
    });
    qr_rust.make_code(text);
    
    // kennytm 的实现
    let qr_kennytm = KennyQrCode::new(text).unwrap();
    
    println!("我们的类型号: {}", qr_rust.type_number);
    println!("kennytm 版本: {}", (qr_kennytm.width() - 17) / 4);
    println!();
    
    // 打印数据区域的一些位
    println!("数据区域对比 (行 9-15, 列 9-15):");
    for row in 9..16 {
        print!("行 {:2}: ", row);
        for col in 9..16 {
            let our_dark = qr_rust.is_dark(row, col);
            let c = if our_dark { "█" } else { "░" };
            print!("{}", c);
        }
        print!(" | ");
        for col in 9..16 {
            let k_dark = matches!(qr_kennytm[(col, row)], qrcode_kennytm::Color::Dark);
            let c = if k_dark { "█" } else { "░" };
            print!("{}", c);
        }
        println!();
    }
}
