//! QR Code Math utilities

/// Galois Field 数学运算
pub struct QRMath;

static mut EXP_TABLE: [i32; 256] = [0; 256];
static mut LOG_TABLE: [i32; 256] = [0; 256];
static INIT: std::sync::Once = std::sync::Once::new();

fn init_tables() {
    INIT.call_once(|| {
        unsafe {
            // 正确的 Galois Field 指数表初始化
            // 生成多项式: x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
            EXP_TABLE[0] = 1;
            for i in 1..256 {
                let mut v = EXP_TABLE[i - 1] << 1;
                if v > 255 {
                    v ^= 0x11d;  // 异或生成多项式
                }
                EXP_TABLE[i] = v;
            }
            // 扩展表以处理溢出
            for i in 256..512 {
                EXP_TABLE[i - 256] = EXP_TABLE[i - 256];
            }
            
            // 构建对数表
            for i in 0..255 {
                LOG_TABLE[EXP_TABLE[i] as usize] = i as i32;
            }
            LOG_TABLE[0] = 0;  // log(0) 未定义，设为 0
        }
    });
}

impl QRMath {
    pub fn glog(n: i32) -> i32 {
        init_tables();
        if n < 1 {
            panic!("glog({})", n);
        }
        unsafe { LOG_TABLE[n as usize] }
    }

    pub fn gexp(n: i32) -> i32 {
        init_tables();
        let mut n = n;
        while n < 0 {
            n += 255;
        }
        while n >= 256 {
            n -= 255;
        }
        unsafe { EXP_TABLE[n as usize] }
    }
}
