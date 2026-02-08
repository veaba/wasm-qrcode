//! QR Code Polynomial - Galois Field polynomial operations

use crate::qr_math::QRMath;

/// Polynomial with coefficients in GF(256)
/// Coefficients are stored in **descending order** (num[0] = highest degree)
pub struct Polynomial {
    pub num: Vec<i32>,
}

impl Polynomial {
    /// Create a polynomial from coefficients
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

    pub fn is_empty(&self) -> bool {
        self.num.is_empty()
    }

    /// Multiply two polynomials in GF(256)
    pub fn multiply(&self, e: &Polynomial) -> Polynomial {
        let mut num = vec![0; self.len() + e.len() - 1];

        for i in 0..self.len() {
            for j in 0..e.len() {
                // In GF(256), addition is XOR
                num[i + j] ^= QRMath::gexp(QRMath::glog(self.get(i)) + QRMath::glog(e.get(j)));
            }
        }

        Polynomial::new(num, 0)
    }

    /// Generate Reed-Solomon error correction polynomial
    /// g(x) = (x + α^0)(x + α^1)...(x + α^(ec_count-1))
    pub fn generate_rs_poly(ec_count: i32) -> Polynomial {
        let mut result = Polynomial::new(vec![1], 0);

        for i in 0..ec_count {
            let factor = Polynomial::new(vec![1, QRMath::gexp(i)], 0);
            result = result.multiply(&factor);
        }

        result
    }

    /// Polynomial modulo operation (descending order)
    pub fn r#mod(&self, e: &Polynomial) -> Polynomial {
        if (self.len() as i32 - e.len() as i32) < 0 {
            return Polynomial::new(self.num.clone(), 0);
        }

        let ratio = QRMath::glog(self.get(0)) - QRMath::glog(e.get(0));

        let mut num = self.num.clone();
        for (i, item) in num.iter_mut().enumerate().take(e.len()) {
            *item ^= QRMath::gexp(QRMath::glog(e.get(i)) + ratio);
        }

        Polynomial::new(num, 0).r#mod(e)
    }

    /// Modulo with shift (for RS error correction calculation)
    pub fn r#mod_with_shift(&self, e: &Polynomial, shift: i32) -> Polynomial {
        let mut extended = self.num.clone();
        extended.extend(std::iter::repeat_n(0, shift as usize));

        let shifted_poly = Polynomial::new(extended, 0);
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
    fn test_multiply_simple() {
        let p1 = Polynomial::new(vec![1, 2], 0);
        let p2 = Polynomial::new(vec![1, 3], 0);
        let result = p1.multiply(&p2);

        assert_eq!(result.get(0), 1);
        assert_eq!(result.get(1), 1); // 3 ^ 2 = 1
        assert_eq!(result.get(2), 6);
    }

    #[test]
    fn test_generate_rs_poly() {
        let poly = Polynomial::generate_rs_poly(2);
        assert_eq!(poly.len(), 3);
        assert_eq!(poly.get(0), 1);
    }

    #[test]
    fn test_mod_result_degree() {
        let divisor = Polynomial::generate_rs_poly(4);

        for test_data in [
            vec![1, 2, 3, 4, 5, 6, 7, 8],
            vec![1, 0, 0, 0, 0, 0, 0, 0],
            vec![255, 254, 253, 252],
        ] {
            let dividend = Polynomial::new(test_data, 0);
            let remainder = dividend.r#mod(&divisor);
            assert!(remainder.len() <= 4);
        }
    }

    #[test]
    fn test_mod_with_shift() {
        let p = Polynomial::new(vec![1, 2, 3], 0);
        let divisor = Polynomial::generate_rs_poly(4);
        let result = p.r#mod_with_shift(&divisor, 4);
        assert!(result.len() <= 4);
    }
}
