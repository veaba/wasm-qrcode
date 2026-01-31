//! QR Code Math utilities

/// Galois Field 数学运算
pub struct QRMath;

static mut EXP_TABLE: [i32; 256] = [0; 256];
static mut LOG_TABLE: [i32; 256] = [0; 256];
static INIT: std::sync::Once = std::sync::Once::new();

fn init_tables() {
    INIT.call_once(|| {
        unsafe {
            for i in 0..8 {
                EXP_TABLE[i] = 1 << i;
            }
            for i in 8..256 {
                EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^
                    EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
            }
            for i in 0..255 {
                LOG_TABLE[EXP_TABLE[i] as usize] = i as i32;
            }
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
