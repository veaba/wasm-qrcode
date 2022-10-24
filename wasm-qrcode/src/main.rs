use crate::rs_block::Tweet;
use crate::QR8bitByte_class::QR8BitByte;

mod QR8bitByte_class;
mod drawing_class;
mod rs_block;
mod shared;

fn main() {
    let code = Tweet {
        username: String::from("Alice"),
    };
    println!("code=>{}", code.get_name());

    //

    // let x = QR8BitByte::new();
    // println!("x=>{}", x.get_length());
}
