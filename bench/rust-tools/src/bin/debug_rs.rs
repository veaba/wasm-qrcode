// 调试 Reed-Solomon 纠错码计算
//
// 对比 qrcode-rust 的 RS 计算结果

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust, get_rs_blocks};

fn main() {
    let text = "Test QR Code 123";
    
    println!("🔍 调试 Reed-Solomon 纠错码计算");
    println!("═══════════════════════════════════════════════════════════════════");
    println!("文本: {}", text);
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
    
    let type_number = qr.type_number;
    let correct_level = LevelRust::M;
    
    println!("类型号: {}", type_number);
    println!("模块数: {}x{}", qr.module_count, qr.module_count);
    println!("纠错级别: M");
    println!();
    
    // 获取 RS 块信息
    let rs_blocks = get_rs_blocks(type_number, correct_level);
    println!("RS 块信息:");
    for (i, block) in rs_blocks.iter().enumerate() {
        let ec_count = block.total_count - block.data_count;
        println!("  块 {}: data_count={}, ec_count={}, total_count={}", 
                 i, block.data_count, ec_count, block.total_count);
    }
    println!();
    
    // 分析实际生成的数据
    if let Some(ref data) = qr.data_cache {
        println!("实际生成的数据:");
        println!("总长度: {} 字节", data.len());
        
        // 分析数据块
        let mut offset = 0;
        for (i, block) in rs_blocks.iter().enumerate() {
            let dc_count = block.data_count as usize;
            let ec_count = (block.total_count - block.data_count) as usize;
            
            println!("\n═══════════════════════════════════════════════════════════════════");
            println!("块 {}:", i);
            println!("───────────────────────────────────────────────────────────────────");
            
            println!("数据部分 ({} 字节, 偏移 {}):", dc_count, offset);
            for j in 0..dc_count {
                print!("{:02X} ", data[offset + j]);
                if (j + 1) % 16 == 0 || j == dc_count - 1 {
                    println!();
                }
            }
            
            println!("纠错部分 ({} 字节, 偏移 {}):", ec_count, offset + dc_count);
            let ec_start = offset + dc_count;
            for j in 0..ec_count {
                print!("{:02X} ", data[ec_start + j]);
                if (j + 1) % 16 == 0 || j == ec_count - 1 {
                    println!();
                }
            }
            
            // 验证：用 Python 的 reedsolo 库计算预期的纠错码
            println!("\n--- 预期纠错码 (参考) ---");
            println!("数据: {:?}", &data[offset..offset + dc_count]);
            println!("实际纠错码: {:?}", &data[ec_start..ec_start + ec_count]);
            
            offset += block.total_count as usize;
        }
        
        // 打印完整数据
        println!("\n═══════════════════════════════════════════════════════════════════");
        println!("完整数据 ({} 字节):", data.len());
        for (i, byte) in data.iter().enumerate() {
            print!("{:02X} ", byte);
            if (i + 1) % 16 == 0 {
                println!();
            }
        }
        println!();
    }
}
