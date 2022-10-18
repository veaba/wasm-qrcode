mod utils;
mod code;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    // import console
    #[wasm_bindgen(js_namespace=console,js_name=log)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-test！哈哈哈");
}

#[wasm_bindgen]
pub fn echo(s: &str) {
    log(s)
}

#[wasm_bindgen]
pub fn version() -> String {
    let ver: String = String::from("v0.0.1");
    ver
}
