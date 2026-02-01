//! QR Code Polynomial

use crate::qr_math::QRMath;

pub struct Polynomial {
    pub num: Vec<i32>,
}

impl Polynomial {
    /// Create a polynomial from coefficients
    /// Coefficients are stored in **descending order** (num[0] = highest degree)
    /// This matches the JavaScript implementation
    pub fn new(num: Vec<i32>, _shift: i32) -> Self {
        // Remove leading zeros
        let mut start = 0;
        let len = num.len();
        while start < len - 1 && num[start] == 0 {
            start += 1;
        }

        let num = if start > 0 {
            num[start..].to_vec()
        } else {
            num
        };

        Polynomial { num }
    }

    pub fn get(&self, index: usize) -> i32 {
        self.num.get(index).copied().unwrap_or(0)
    }

    pub fn len(&self) -> usize {
        self.num.len()
    }

    #[allow(dead_code)]
    pub fn is_empty(&self) -> bool {
        self.num.is_empty()
    }

    pub fn multiply(&self, e: &Polynomial) -> Polynomial {
        let mut num = vec![0; self.len() + e.len() - 1];

        for i in 0..self.len() {
            for j in 0..e.len() {
                // In GF(256), addition is XOR
                num[i + j] ^= QRMath::gexp(
                    QRMath::glog(self.get(i)) + QRMath::glog(e.get(j))
                );
            }
        }

        Polynomial::new(num, 0)
    }

    /// 生成 Reed-Solomon 纠错码生成多项式
    /// g(x) = (x + α^0)(x + α^1)...(x + α^(ec_count-1))
    /// Note: In GF(256), subtraction = addition, so (x - α^i) = (x + α^i)
    pub fn generate_rs_poly(ec_count: i32) -> Polynomial {
        let mut result = Polynomial::new(vec![1], 0);

        for i in 0..ec_count {
            // (x + α^i) in descending order: [α^i, 1] means α^i*x^1 + 1*x^0
            // But wait, in descending order: [1, α^i] would be x^1 + α^i
            // Let me check JS: poly.multiply(new Polynomial([1, QRMath.gexp(i)]))
            // [1, gexp(i)] in descending order = 1*x^1 + gexp(i)*x^0 = x + α^i
            let factor = Polynomial::new(vec![1, QRMath::gexp(i)], 0);
            result = result.multiply(&factor);
        }

        result
    }

    /// Polynomial modulo operation (descending order)
    /// Matches JavaScript implementation
    pub fn r#mod(&self, e: &Polynomial) -> Polynomial {
        if (self.len() as i32 - e.len() as i32) < 0 {
            return Polynomial::new(self.num.clone(), 0);
        }

        // Ratio of leading coefficients
        let ratio = QRMath::glog(self.get(0)) - QRMath::glog(e.get(0));

        // Subtract (e * ratio * x^(degree_diff))
        let mut num = self.num.clone();
        for i in 0..e.len() {
            num[i] ^= QRMath::gexp(QRMath::glog(e.get(i)) + ratio);
        }

        Polynomial::new(num, 0).r#mod(e)
    }

    /// 计算多项式模运算（带位移，用于 RS 纠错码计算）
    /// 注意：由于系数按降序排列，位移操作需要特殊处理
    pub fn r#mod_with_shift(&self, e: &Polynomial, shift: i32) -> Polynomial {
        // 首先扩展 self 的系数（在末尾添加 shift 个零）
        // 在降序表示中，在末尾添加零相当于乘以 x^shift
        // 例如: [d0, d1] (d0*x + d1) * x^2 = [d0, d1, 0, 0] (d0*x^3 + d1*x^2)
        let mut extended = self.num.clone();
        for _ in 0..shift {
            extended.push(0);
        }

        let shifted_poly = Polynomial::new(extended, 0);

        // 使用普通的 mod 运算
        shifted_poly.r#mod(e)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_polynomial_new() {
        let p = Polynomial::new(vec![1, 2, 3], 0);
        assert_eq!(p.len(), 3);
        assert_eq!(p.get(0), 1);
        assert_eq!(p.get(1), 2);
        assert_eq!(p.get(2), 3);
    }

    #[test]
    fn test_polynomial_new_removes_leading_zeros() {
        let p = Polynomial::new(vec![0, 0, 1, 2], 0);
        assert_eq!(p.len(), 2);
        assert_eq!(p.get(0), 1);
        assert_eq!(p.get(1), 2);
    }

    #[test]
    fn test_polynomial_new_all_zeros() {
        let p = Polynomial::new(vec![0, 0, 0], 0);
        assert_eq!(p.len(), 1);
        assert_eq!(p.get(0), 0);
    }

    #[test]
    fn test_multiply_simple() {
        // (x + 2) * (x + 3) = x^2 + 5x + 6
        // 在 GF(256) 中，加法是异或
        let p1 = Polynomial::new(vec![1, 2], 0);  // x + 2
        let p2 = Polynomial::new(vec![1, 3], 0);  // x + 3
        let result = p1.multiply(&p2);

        // 1*1 = 1 (x^2 term)
        // 1*3 + 2*1 = 3 + 2 = 1 (x term, 异或)
        // 2*3 = 6 (constant term)
        assert_eq!(result.get(0), 1);  // x^2
        assert_eq!(result.get(1), 1);  // x term (3 ^ 2 = 1)
        assert_eq!(result.get(2), 6);  // constant
    }

    #[test]
    fn test_generate_rs_poly() {
        // 生成 ec_count=2 的 RS 生成多项式
        // g(x) = (x + 1)(x + α) = x^2 + (1+α)x + α
        let poly = Polynomial::generate_rs_poly(2);

        // 结果应该是 3 个系数（次数为 2）
        assert_eq!(poly.len(), 3);

        // 最高次项系数应该是 1（在索引 0 处，降序排列）
        assert_eq!(poly.get(0), 1);
    }

    #[test]
    fn test_generate_rs_poly_increasing_degree() {
        for ec_count in 1..=10 {
            let poly = Polynomial::generate_rs_poly(ec_count);
            assert_eq!(poly.len(), ec_count as usize + 1,
                "ec_count={} 应该产生次数为 {} 的多项式", ec_count, ec_count);
            // 最高次项系数总是 1（在第一个索引处）
            assert_eq!(poly.get(0), 1);
        }
    }

    #[test]
    fn test_mod_simple() {
        // 简单测试
        let dividend = Polynomial::new(vec![1, 0, 0], 0);  // x^2
        let divisor = Polynomial::new(vec![1, 1], 0);      // x + 1
        let remainder = dividend.r#mod(&divisor);

        // 余数的次数应该小于除数的次数
        assert!(remainder.len() <= divisor.len());
    }

    #[test]
    fn test_mod_result_degree() {
        // 测试余数的次数总是小于除数的次数
        let divisor = Polynomial::generate_rs_poly(4);  // 次数为 4

        for test_data in vec![
            vec![1, 2, 3, 4, 5, 6, 7, 8],  // 次数为 8
            vec![1, 0, 0, 0, 0, 0, 0, 0],
            vec![255, 254, 253, 252],
        ] {
            let dividend = Polynomial::new(test_data, 0);
            let remainder = dividend.r#mod(&divisor);

            // 余数的次数应该小于除数的次数（4）
            assert!(remainder.len() <= 4,
                "余数长度 {} 应该 <= 4", remainder.len());
        }
    }
}
