import fs from "node:fs"
import { hello_world, initSync } from "../../wasm-dist/index.js"

initSync({ module: fs.readFileSync("wasm-dist/index_bg.wasm") })
const str = hello_world()
console.log(str)
