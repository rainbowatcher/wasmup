use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello_world(a: String) -> String {
    format!("Hello, {}!", a)
}