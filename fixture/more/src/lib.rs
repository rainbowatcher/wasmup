use wasm_bindgen::prelude::*;
use serde::Serialize;
use serde_wasm_bindgen::to_value;

#[wasm_bindgen]
pub fn hello_world() -> String {
    "Hello, World!".to_string()
}

#[wasm_bindgen(js_name = "helloWorld")]
pub fn hello_world_rename() -> String {
    "Hello, World!".to_string()
}

#[wasm_bindgen(js_name = "u64")]
pub fn u64(a: u64) -> u64 {
    a
}

#[wasm_bindgen(js_name = "u32")]
pub fn u32(a: u32) -> u32 {
    a
}

#[wasm_bindgen(js_name = "u16")]
pub fn u16(a: u16) -> u16 {
    a
}

#[wasm_bindgen(js_name = "u8")]
pub fn u8(a: u8) -> u8 {
    a
}   

#[wasm_bindgen(js_name = "i64")]
pub fn i64(a: i64) -> i64 {
    a
}

#[wasm_bindgen(js_name = "i32")]
pub fn i32(a: i32) -> i32 {
    a
}   

#[wasm_bindgen(js_name = "i16")]
pub fn i16(a: i16) -> i16 {
    a
}

#[wasm_bindgen(js_name = "i8")]
pub fn i8(a: i8) -> i8 {
    a
}

#[wasm_bindgen(js_name = "f32")]
pub fn f32(a: f32) -> f32 {
    a
}

#[wasm_bindgen(js_name = "f64")] 
pub fn f64(a: f64) -> f64 {
    a
}

#[wasm_bindgen(js_name = "str")]
pub fn str(a: &str) -> String {
    a.to_string()
}

#[wasm_bindgen(js_name = "stringFn")]
pub fn string_fn(a: String) -> String {
    a
}

#[wasm_bindgen(js_name = "jsValue")]
pub fn js_value(a: &JsValue) -> JsValue {
    a.clone()
}

// array params
#[wasm_bindgen(js_name = "u64Sum")]
pub fn u64_sum(arr: Vec<u64>) -> u64 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "u32Sum")]
pub fn u32_sum(arr: Vec<u32>) -> u32 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "u16Sum")]
pub fn u16_sum(arr: Vec<u16>) -> u16 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "u8Sum")]
pub fn u8_sum(arr: Vec<u8>) -> u8 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "i64Sum")]
pub fn i64_sum(arr: Vec<i64>) -> i64 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "i32Sum")]
pub fn i32_sum(arr: Vec<i32>) -> i32 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "i16Sum")] 
pub fn i16_sum(arr: Vec<i16>) -> i16 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "i8Sum")]
pub fn i8_sum(arr: Vec<i8>) -> i8 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "f32Sum")]
pub fn f32_sum(arr: Vec<f32>) -> f32 {
    arr.iter().sum()
}

#[wasm_bindgen(js_name = "f64Sum")]
pub fn f64_sum(arr: Vec<f64>) -> f64 {
    arr.iter().sum()
}

// the trait `JsObject` is not implemented for `&str`
// #[wasm_bindgen(js_name = "stringArrConcat")]
// pub fn string_arr_concat(arr: Vec<&str>) -> String {
//     arr.join("")
// }

#[wasm_bindgen(js_name = "charPrint")]
pub fn char_print(c: char) -> char {
    c
}

// the trait `JsObject` is not implemented for `char
// #[wasm_bindgen(js_name = "charArrConcat")]
// pub fn char_arr_concat(arr: Vec<char>) -> String {
//     arr.iter().collect()
// }


#[wasm_bindgen(js_name = "boolPrint")]
pub fn bool_print(a: bool) -> bool {
    a
}


// struct params
#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Serialize)]
pub struct Person {
    pub name: String,
    pub age: u64,
}

#[wasm_bindgen]
impl Person {
    #[wasm_bindgen(constructor)]
    pub fn new(name: String, age: u64) -> Person {
        Person { name, age }
    }
}

#[wasm_bindgen(js_name = "person")]
pub fn person(person: &Person) -> JsValue {
    to_value(person).unwrap()
}
