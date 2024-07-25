import process from "node:process"
import { ConfirmPrompt, SelectPrompt, isCancel } from "@clack/core"
import createDebug from "debug"
import c from "picocolors"
import {
    S_RADIO_ACTIVE, S_RADIO_INACTIVE, S_STEP_ACTIVE, S_STEP_CANCEL, S_STEP_ERROR, S_STEP_SUBMIT,
    SYMBOLS,
} from "../consts"
import type {
    ConfirmOptions, LimitOptionsParams, Option, SelectOptions,
} from "./types"
import type { State } from "@clack/core"


export function symbol(state: State) {
    switch (state) {
        case "initial":
        case "active": {
            return c.cyan(S_STEP_ACTIVE)
        }
        case "cancel": {
            return c.red(S_STEP_CANCEL)
        }
        case "error": {
            return c.yellow(S_STEP_ERROR)
        }
        case "submit": {
            return c.green(S_STEP_SUBMIT)
        }
    }
}

export async function confirm(opts: ConfirmOptions | string): Promise<string> {
    const {
        active = "Yes",
        exitCode = 0,
        inactive = "No",
        initialValue = true,
        message,
    } = typeof opts === "string" ? { message: opts } : opts
    const result = await new ConfirmPrompt({
        active,
        inactive,
        initialValue,
        render() {
            const title = `${symbol(this.state)} ${message}`
            const value = c.dim(this.value ? active : inactive)
            const toggle = this.value
                ? `${c.green(S_RADIO_ACTIVE)} ${active} / ${c.gray(S_RADIO_INACTIVE)} ${inactive}`
                : `${c.gray(S_RADIO_INACTIVE)} ${active} / ${c.green(S_RADIO_ACTIVE)} ${inactive}`
            switch (this.state) {
                case "submit": {
                    return `${title} ${value}`
                }
                case "cancel": {
                    return `${title} ${c.strikethrough(value)}`
                }
                default: {
                    return `${title} \n${toggle}`
                }
            }
        },
    }).prompt()

    if (isCancel(result)) {
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(exitCode)
    }

    return result
}


function limitOptions<TOption>(params: LimitOptionsParams<TOption>): string[] {
    const { cursor, options, style } = params

    const paramMaxItems = params.maxItems ?? Infinity
    const outputMaxItems = Math.max(process.stdout.rows - 4, 0)
    // We clamp to minimum 5 because anything less doesn't make sense UX wise
    const maxItems = Math.min(outputMaxItems, Math.max(paramMaxItems, 5))
    let slidingWindowLocation = 0

    if (cursor >= slidingWindowLocation + maxItems - 3) {
        slidingWindowLocation = Math.max(Math.min(cursor - maxItems + 3, options.length - maxItems), 0)
    } else if (cursor < slidingWindowLocation + 2) {
        slidingWindowLocation = Math.max(cursor - 2, 0)
    }

    const shouldRenderTopEllipsis = maxItems < options.length && slidingWindowLocation > 0
    const shouldRenderBottomEllipsis
		= maxItems < options.length && slidingWindowLocation + maxItems < options.length

    return options
        .slice(slidingWindowLocation, slidingWindowLocation + maxItems)
        .map<string>((option, i, arr) => {
            const isTopLimit = i === 0 && shouldRenderTopEllipsis
            const isBottomLimit = i === arr.length - 1 && shouldRenderBottomEllipsis
            return isTopLimit || isBottomLimit
                ? c.dim("...")
                : style(option, i + slidingWindowLocation === cursor)
        })
}

export async function select<Value>(opts: SelectOptions<Value>): Promise<string> {
    const {
        exitCode = 0,
    } = opts
    const opt = (option: Option<Value>, state: "active" | "cancelled" | "inactive" | "selected") => {
        const label = option.label ?? String(option.value)
        switch (state) {
            case "selected": {
                return `${c.dim(label)}`
            }
            case "active": {
                return `${c.green(S_RADIO_ACTIVE)} ${label} ${
                    option.hint ? c.dim(`(${option.hint})`) : ""
                }`
            }
            case "cancelled": {
                return `${c.strikethrough(c.dim(label))}`
            }
            default: {
                return `${c.dim(S_RADIO_INACTIVE)} ${c.dim(label)}`
            }
        }
    }

    const result = await new SelectPrompt({
        initialValue: opts.initialValue,
        options: opts.options,
        placeholder: "Select an option",
        render() {
            const title = `${symbol(this.state)} ${opts.message}`

            switch (this.state) {
                case "submit": {
                    return `${title} ${opt(this.options[this.cursor], "selected")}`
                }
                case "cancel": {
                    return `${title} ${opt(
                        this.options[this.cursor],
                        "cancelled",
                    )}\n`
                }
                default: {
                    return `${title}\n${limitOptions({
                        cursor: this.cursor,
                        maxItems: opts.maxItems,
                        options: this.options,
                        style: (item, active) => opt(item, active ? "active" : "inactive"),
                    }).join("\n")}`
                }
            }
        },
    }).prompt()

    if (isCancel(result)) {
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(exitCode)
    } else {
        return result
    }
}

const debug = createDebug("wasmup")

export const log = {
    debug: (...messages: any[]) => {
        const msg = resolveMsgArr(messages)
        debug(msg)
    },
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
            // eslint-disable-next-line ts/no-unsafe-return
            return m
        }
    }).join(" ")
}
