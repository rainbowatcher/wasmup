import fs from "node:fs"
import path from "node:path"
import express from "express"
import mime from "mime"

export function _startServer(name, port) {
    const app = express()

    app.use("/wasm-dist", express.static(path.join(import.meta.dirname, "../../wasm-dist"), {
        setHeaders(res, path) {
            res.setHeader("Content-Type", mime.getType(path))
        },
    }))

    app.get("/", (_, res) => {
        const indexHtml = fs.readFileSync(`tests/__util__/${name}.html`, "utf8")
        res.setHeader("Content-Type", "text/html")
        res.send(indexHtml)
    })

    app.listen(port)
}

export function startIndexServer() {
    _startServer("index", 13_000)
}

export function startIndexSyncServer() {
    _startServer("index_sync", 13_001)
}

export function startShimsServer() {
    _startServer("shims", 13_002)
}

export function startShimsSyncServer() {
    _startServer("shims_sync", 13_003)
}
