// 调试数据编码

use qrcode_rust::{QRCode as QRCodeRust, QRCodeOptions, QRErrorCorrectLevel as LevelRust, get_rs_blocks};

fn main() {
    let text = "Test QR Code 123";
    
    println!("🔍 调试数据编码");
    println!("═══════════════════════════════════════════════════════════════════");
    println!("文本: '{}'", text);
    println!("文本长度: {} 字节", text.len());
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
    let rs_blocks = get_rs_blocks(type_number, LevelRust::M);
    
    println!("类型号: {}", type_number);
    println!("纠错级别: M");
    println!();
    
    // 计算数据长度位
    let length_bits = if type_number >= 1 && type_number < 10 { 8 } else { 16 };
    println!("数据长度位数: {}", length_bits);
    println!();
    
    // 手动计算预期的数据
    println!("手动计算数据编码:");
    println!("───────────────────────────────────────────────────────────────────");
    
    // 模式指示符 (4 bits): 0100 (8-bit byte mode)
    println!("模式指示符 (4 bits): 0100");
    
    // 数据长度 (8 bits for version 1-9)
    let data_len = text.len();
    println!("数据长度 ({} bits): {:08b} = {}", length_bits, data_len, data_len);
    
    // 数据字节
    println!("数据字节:");
    for (i, byte) in text.bytes().enumerate() {
        println!("  [{}] 0x{:02X} = {:08b} = '{}'", i, byte, byte, byte as char);
    }
    
    // 计算总位数
    let total_bits = 4 + length_bits + data_len * 8;
    println!();
    println!("总位数 (不含填充): {}", total_bits);
    
    // 计算数据容量
    let total_data_count: i32 = rs_blocks.iter().map(|b| b.data_count).sum();
    println!("总数据容量: {} 字节 = {} 位", total_data_count, total_data_count * 8);
    
    // 计算需要的填充
    let padding_needed = (total_data_count as usize * 8).saturating_sub(total_bits);
    println!("需要填充的位数: {}", padding_needed);
    
    // 打印实际生成的数据
    if let Some(ref data) = qr.data_cache {
        println!();
        println!("实际生成的数据 ({} 字节):", data.len());
        for (i, byte) in data.iter().enumerate() {
            print!("{:02X} ", byte);
            if (i + 1) % 16 == 0 {
                println!();
            }
        }
        println!();
        
        // 打印二进制
        println!();
        println!("二进制表示:");
        for (i, byte) in data.iter().enumerate() {
            print!("{:08b} ", byte);
            if (i + 1) % 8 == 0 {
                println!();
            }
        }
        println!();
        
        // 解析前几个字节
        println!();
        println!("解析:");
        let mode = (data[0] >> 4) & 0x0F;
        println!("  字节0高4位 (模式): {:04b} = {} (4=8-bit byte)", mode, mode);
        
        let len_high = data[0] & 0x0F;
        let len_low = (data[1] >> 4) & 0x0F;
        let len = (len_high << 4) | len_low;
        println!("  字节0低4位 + 字节1高4位 (长度): {:04b} {:04b} = {}", len_high, len_low, len);
        
        // 数据
        println!("  数据部分:");
        for i in 0..text.len() {
            let byte_idx = 1 + i; // 跳过模式(4bits) + 长度(8bits) = 12bits = 1.5 bytes
            let bit_offset = 4; // 从字节1的第4位开始
            
            // 简化：直接打印从字节1开始的交叉字节数据
            if i < 5 {
                let b1 = data[1 + i/2];
                let b2 = data[2 + i/2];
                let shift = if i % 2 == 0 { 4 } else { 0 };
                let val = if i % 2 == 0 {
                    ((b1 & 0x0F) << 4) | ((b2 >> 4) & 0x0F)
                } else {
                    ((b1 & 0x0F) << 4) | (b2 & 0x0F)
                };
                println!("    [{}] 0x{:02X} = '{}'", i, val, val as u8 as char);
            }
        }
    }
}
