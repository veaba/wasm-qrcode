pub fn a1() -> &'static str {
    println!("a1");
    "a1"
}

// impl RSBlock2 {
pub fn ab() -> &'static str {
    println!("222");
    "ddd"
}

pub(crate) struct StructRsBlock {
    total_count: i32,
    data_count: i32,
}

// 相当于 interface
pub(crate) trait RsBlockFns {
    fn get_rs_blocks(&self) -> &'static str;
    fn get_rs_block_table(&self) {}
}

impl RsBlockFns for StructRsBlock {
    fn get_rs_blocks(&self) -> &'static str {
        println!("222");
        "ddd"
    }
    fn get_rs_block_table(&self) {}
}

// 某个结构体实现特质(trait), 需要用 impl for
