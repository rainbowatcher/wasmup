import init, { hello_world } from "../../wasm-dist/index.js"

await init()
const str = hello_world()
console.log(str)
