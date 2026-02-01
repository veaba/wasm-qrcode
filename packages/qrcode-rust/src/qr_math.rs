//! QR Code Math utilities

/// Galois Field 数学运算
pub struct QRMath;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gexp_basic() {
        // gexp(0) 应该等于 1
        assert_eq!(QRMath::gexp(0), 1);
        // gexp(1) 应该等于 2 (α^1)
        assert_eq!(QRMath::gexp(1), 2);
        // gexp(2) 应该等于 4 (α^2)
        assert_eq!(QRMath::gexp(2), 4);
    }

    #[test]
    fn test_gexp_overflow() {
        // gexp(255) 应该等于 1 (α^255 = 1)
        assert_eq!(QRMath::gexp(255), 1);
        // gexp(256) 应该等于 2 (α^256 = α^1)
        assert_eq!(QRMath::gexp(256), 2);
    }

    #[test]
    fn test_gexp_negative() {
        // gexp(-1) 应该等于 α^254
        assert_eq!(QRMath::gexp(-1), QRMath::gexp(254));
    }

    #[test]
    fn test_glog_basic() {
        // glog(1) 应该等于 0
        assert_eq!(QRMath::glog(1), 0);
        // glog(2) 应该等于 1
        assert_eq!(QRMath::glog(2), 1);
        // glog(4) 应该等于 2
        assert_eq!(QRMath::glog(4), 2);
    }

    #[test]
    fn test_glog_gexp_inverse() {
        // glog(gexp(x)) == x (mod 255)
        for i in 0..255 {
            let exp = QRMath::gexp(i);
            let log = QRMath::glog(exp);
            assert_eq!(log, i, "glog(gexp({})) failed", i);
        }
    }

    #[test]
    fn test_gexp_glog_inverse() {
        // gexp(glog(x)) == x (for x != 0)
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

static mut EXP_TABLE: [i32; 256] = [0; 256];
static mut LOG_TABLE: [i32; 256] = [0; 256];
static INIT: std::sync::Once = std::sync::Once::new();

fn init_tables() {
    INIT.call_once(|| {
        unsafe {
            // Galois Field 指数表初始化 - 匹配 JavaScript 实现
            // 算法: EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8]
            // 前 8 个值: 1, 2, 4, 8, 16, 32, 64, 128
            for i in 0..8 {
                EXP_TABLE[i] = 1 << i;
            }
            for i in 8..256 {
                EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
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
