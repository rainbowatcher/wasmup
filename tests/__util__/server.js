import fs from "node:fs"
import path from "node:path"
import express from "express"
import mime from "mime"

export function startServer() {
    const app = express()

    app.use("/wasm-dist", express.static(path.join(import.meta.dirname, "../../wasm-dist"), {
        setHeaders(res, path) {
            res.setHeader("Content-Type", mime.getType(path))
        },
    }))

    app.get("/", (_, res) => {
        const indexHtml = fs.readFileSync("tests/__util__/index.html", "utf8")
        res.setHeader("Content-Type", "text/html")
        res.send(indexHtml)
    })

    app.listen(3000)
}

export function startSyncServer() {
    const app = express()

    app.use("/wasm-dist", express.static(path.join(import.meta.dirname, "../../wasm-dist"), {
        setHeaders(res, path) {
            res.setHeader("Content-Type", mime.getType(path))
        },
    }))

    app.get("/", (_, res) => {
        const indexHtml = fs.readFileSync("tests/__util__/index_sync.html", "utf8")
        res.setHeader("Content-Type", "text/html")
        res.send(indexHtml)
    })

    app.listen(3001)
}
