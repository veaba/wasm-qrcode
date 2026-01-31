/**
 * QRCode Math 数学工具
 * 对应 JS 中的 QRMath
 */

use std::sync::Once;

static INIT: Once = Once::new();
static mut EXP_TABLE: [i32; 256] = [0; 256];
static mut LOG_TABLE: [i32; 256] = [0; 256];

/// 初始化 EXP_TABLE 和 LOG_TABLE
pub fn init_tables() {
    INIT.call_once(|| {
        unsafe {
            for i in 0..8 {
                EXP_TABLE[i] = 1 << i;
            }
            for i in 8..256 {
                EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
            }
            for i in 0..255 {
                LOG_TABLE[EXP_TABLE[i] as usize] = i as i32;
            }
        }
    });
}

/// 获取 glog 值
pub fn glog(n: i32) -> Result<i32, String> {
    if n < 1 {
        return Err(format!("glog({})", n));
    }
    init_tables();
    unsafe { Ok(LOG_TABLE[n as usize]) }
}

/// 获取 gexp 值
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

#[allow(dead_code)]
/// 获取 EXP_TABLE 的副本
pub fn get_exp_table() -> [i32; 256] {
    init_tables();
    unsafe { EXP_TABLE }
}

#[allow(dead_code)]
/// 获取 LOG_TABLE 的副本
pub fn get_log_table() -> [i32; 256] {
    init_tables();
    unsafe { LOG_TABLE }
}
