import { hello_world, initSync } from "../../wasm-dist/shims.js"

initSync()
const str = hello_world()
console.log(str)
