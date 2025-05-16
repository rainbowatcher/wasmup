import fs from "node:fs"
import init, { hello_world } from "../../wasm-dist/index.js"

await init({ module_or_path: fs.readFileSync("wasm-dist/index_bg.wasm") })
const str = hello_world()
console.log(str)
