use crate::rs_block::RsBlockFns;

// mod rs_block;
// mod shared;
mod rs_block;

// use crate::block::{a};
// use crate::shared::QRErrorCorrectLevel;

fn main() {
    // println!(" ============ {:}", QRErrorCorrectLevel::H);

    const G15: i32 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);

    println!(" 与或非操作= {}", G15);
    // <RSBlock2 as Trait>::new
    let bar = RsBlockFns::get_rs_blocks(&());
    // let bar = RSBlock2::ab();
    println!(" rs_block_class 私有属性= {:?}", bar);
}
