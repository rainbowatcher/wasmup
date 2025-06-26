import createDebug from "debug"
import c from "picocolors"
import { SYMBOLS } from "../consts"

const debug = createDebug("wasmup")

export const log = {
    debug,
    error: (...messages: any[]) => { console.log(`${c.red(SYMBOLS.error)} ${resolveMsgArr(messages)}`) },
    info: (...messages: any[]) => { console.log(`${c.cyan(SYMBOLS.info)} ${resolveMsgArr(messages)}`) },
    success: (...messages: any[]) => { console.log(`${c.green(SYMBOLS.success)} ${resolveMsgArr(messages)}`) },
    warn: (...messages: any[]) => { console.log(`${c.yellow(SYMBOLS.warn)} ${resolveMsgArr(messages)}`) },
}

function resolveMsgArr(messages: any[]) {
    return messages.map((m: any) => {
        if (typeof m === "object") {
            return JSON.stringify(m)
        } else {
            return m
        }
    }).join(" ")
}
