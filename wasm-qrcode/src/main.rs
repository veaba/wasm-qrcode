use crate::rs_block::Tweet;

mod rs_block;

fn main() {
    let code = Tweet {
        username: String::from("Alice")
    };
    println!("code=>{}", code.get_name())
}
