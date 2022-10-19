use crate::rs_block::Tweet;

mod rs_block;
mod drawing_class;
mod QR8bitByte_class;
mod shared;

fn main() {
    let code = Tweet {
        username: String::from("Alice")
    };
    println!("code=>{}", code.get_name())
}
