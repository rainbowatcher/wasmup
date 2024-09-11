import { hello_world } from "../../wasm-dist/non_web.js"

const str = hello_world()
console.log(str)
