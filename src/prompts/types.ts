import type { ConfirmPrompt } from "@clack/core"

export type PackageManager = "bun" | "cargo" | "npm" | "pnpm" | "yarn"

export type CancelOptions = {
    exitCode?: number
}

export type ConfirmOptions = {
    message: string
} & CancelOptions & Partial<ConstructorParameters<typeof ConfirmPrompt>[0]>

export type Primitive = Readonly<boolean | number | string>

export type Option<Value> = Value extends Primitive
    ? { hint?: string; label?: string; value: Value }
    : { hint?: string; label: string; value: Value }

export type SelectOptions<Value> = {
    initialValue?: Value
    maxItems?: number
    message: string
    options: Array<Option<Value>>
} & CancelOptions

export type LimitOptionsParams<TOption> = {
    cursor: number
    maxItems: number | undefined
    options: TOption[]
    style: (option: TOption, active: boolean) => string
}
