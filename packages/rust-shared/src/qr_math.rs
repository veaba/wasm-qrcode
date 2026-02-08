//! QR Code Math utilities - Galois Field operations

/// Galois Field 数学运算
pub struct QRMath;

static mut EXP_TABLE: [i32; 256] = [0; 256];
static mut LOG_TABLE: [i32; 256] = [0; 256];
static INIT: std::sync::Once = std::sync::Once::new();

fn init_tables() {
    INIT.call_once(|| {
        unsafe {
            // Galois Field 指数表初始化
            // 生成多项式: x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
            EXP_TABLE[0] = 1;
            for i in 1..256 {
                let mut v = EXP_TABLE[i - 1] << 1;
                if v > 255 {
                    v ^= 0x11d; // 异或生成多项式
                }
                EXP_TABLE[i] = v;
            }

            // 构建对数表
            for i in 0..255 {
                LOG_TABLE[EXP_TABLE[i] as usize] = i as i32;
            }
            LOG_TABLE[0] = 0; // log(0) 未定义，设为 0
        }
    });
}

impl QRMath {
    /// Galois Field 对数
    pub fn glog(n: i32) -> i32 {
        init_tables();
        if n < 1 {
            panic!("glog({})", n);
        }
        unsafe { LOG_TABLE[n as usize] }
    }

    /// Galois Field 指数
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gexp_basic() {
        assert_eq!(QRMath::gexp(0), 1);
        assert_eq!(QRMath::gexp(1), 2);
        assert_eq!(QRMath::gexp(2), 4);
    }

    #[test]
    fn test_gexp_overflow() {
        assert_eq!(QRMath::gexp(255), 1);
        assert_eq!(QRMath::gexp(256), 2);
    }

    #[test]
    fn test_gexp_negative() {
        assert_eq!(QRMath::gexp(-1), QRMath::gexp(254));
    }

    #[test]
    fn test_glog_basic() {
        assert_eq!(QRMath::glog(1), 0);
        assert_eq!(QRMath::glog(2), 1);
        assert_eq!(QRMath::glog(4), 2);
    }

    #[test]
    fn test_glog_gexp_inverse() {
        for i in 0..255 {
            let exp = QRMath::gexp(i);
            let log = QRMath::glog(exp);
            assert_eq!(log, i, "glog(gexp({})) failed", i);
        }
    }

    #[test]
    fn test_gexp_glog_inverse() {
        for i in 1..256 {
            let log = QRMath::glog(i);
            let exp = QRMath::gexp(log);
            assert_eq!(exp, i, "gexp(glog({})) failed", i);
        }
    }

    #[test]
    #[should_panic(expected = "glog(0)")]
    fn test_glog_zero_panics() {
        QRMath::glog(0);
    }
}
