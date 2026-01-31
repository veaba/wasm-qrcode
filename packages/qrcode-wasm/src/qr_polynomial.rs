/**
 * QRCode 多项式
 * 对应 JS 中的 QRPolynomial
 */

use crate::qr_math;

#[derive(Debug, Clone)]
pub struct QRPolynomial {
    num: Vec<i32>,
}

impl QRPolynomial {
    /// 创建新的多项式
    pub fn new(num: &[i32], shift: usize) -> Self {
        let mut offset = 0;
        while offset < num.len() && num[offset] == 0 {
            offset += 1;
        }

        let mut new_num = vec![0; num.len() - offset + shift];
        for i in 0..(num.len() - offset) {
            new_num[i] = num[i + offset];
        }

        QRPolynomial { num: new_num }
    }

    /// 获取指定索引的值
    pub fn get(&self, index: usize) -> i32 {
        self.num[index]
    }

    /// 获取长度
    pub fn get_length(&self) -> usize {
        self.num.len()
    }

    /// 乘法
    pub fn multiply(&self, e: &QRPolynomial) -> QRPolynomial {
        let mut num = vec![0; self.get_length() + e.get_length() - 1];

        for i in 0..self.get_length() {
            for j in 0..e.get_length() {
                let glog_self = qr_math::glog(self.get(i)).unwrap_or(0);
                let glog_e = qr_math::glog(e.get(j)).unwrap_or(0);
                num[i + j] ^= qr_math::gexp(glog_self + glog_e);
            }
        }

        QRPolynomial::new(&num, 0)
    }

    /// 取模
    pub fn modulus(&self, e: &QRPolynomial) -> QRPolynomial {
        if self.get_length() < e.get_length() {
            return self.clone();
        }

        let glog_self = qr_math::glog(self.get(0)).unwrap_or(0);
        let glog_e = qr_math::glog(e.get(0)).unwrap_or(0);
        let ratio = glog_self - glog_e;

        let mut num = vec![0; self.get_length()];
        for i in 0..self.get_length() {
            num[i] = self.get(i);
        }

        for i in 0..e.get_length() {
            let glog_e_i = qr_math::glog(e.get(i)).unwrap_or(0);
            num[i] ^= qr_math::gexp(glog_e_i + ratio);
        }

        QRPolynomial::new(&num, 0).modulus(e)
    }

    /// 为了兼容 JS 的 mod 方法
    pub fn modulo(&self, e: &QRPolynomial) -> QRPolynomial {
        self.modulus(e)
    }
}
