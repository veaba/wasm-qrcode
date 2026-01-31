//! QR Code Polynomial

use crate::qr_math::QRMath;

pub struct Polynomial {
    pub num: Vec<i32>,
}

impl Polynomial {
    pub fn new(num: Vec<i32>, shift: i32) -> Self {
        let mut offset = 0;
        let mut num = num;
        
        while offset < num.len() && num[offset] == 0 {
            offset += 1;
        }
        
        if offset > 0 && offset < num.len() {
            num = num[offset..].to_vec();
        } else if offset >= num.len() {
            num = vec![0];
        }
        
        if shift > 0 {
            let mut new_num = vec![0; shift as usize];
            new_num.extend(num);
            num = new_num;
        }
        
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

    #[allow(dead_code)]
    pub fn multiply(&self, e: &Polynomial) -> Polynomial {
        let mut num = vec![0; self.len() + e.len() - 1];
        
        for i in 0..self.len() {
            for j in 0..e.len() {
                num[i + j] ^= QRMath::gexp(
                    QRMath::glog(self.get(i)) + QRMath::glog(e.get(j))
                );
            }
        }
        
        Polynomial::new(num, 0)
    }

    pub fn r#mod(&self, e: &Polynomial) -> Polynomial {
        if self.len() < e.len() {
            return Polynomial::new(self.num.clone(), 0);
        }
        
        let ratio = QRMath::glog(self.get(0)) - QRMath::glog(e.get(0));
        let mut num = self.num.clone();
        
        for i in 0..e.len() {
            num[i] ^= QRMath::gexp(QRMath::glog(e.get(i)) + ratio);
        }
        
        Polynomial::new(num, 0).r#mod(e)
    }
}
