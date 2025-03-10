use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello_world(a: &JsValue) -> String {
    format!("Hello, {:?}!", a)
}