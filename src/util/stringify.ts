// modify from https://github.com/ljharb/json-stable-stringify/blob/main/index.js
export type KVPair = { key: string; value: any }

type ReplacerFunction<T extends any = any> = (key: string, value: T) => T

type CompareFunction = (a: KVPair, b: KVPair) => number

type StringifyOptions = {
    cmp?: CompareFunction
    cycles?: boolean
    replacer?: ReplacerFunction
    space?: number | string
}


// eslint-disable-next-line ts/no-unsafe-return
const defaultReplacer: ReplacerFunction = (_, value) => value

export function stableStringify(obj: any, options: StringifyOptions = {}): string {
    const {
        cmp,
        cycles = false,
        replacer = defaultReplacer,
        space = "",
    } = options

    const indent = typeof space === "number" ? " ".repeat(space) : space

    const seen: any[] = []

    function stringify(parent: any, key: string, node: any, level: number): string | undefined {
        const lineBreak = indent ? "\n" : ""
        const levelIndent = lineBreak + indent.repeat(level)
        const nextIndent = lineBreak + indent.repeat(level + 1)
        const colonSeparator = indent ? ": " : ":"

        if (node && typeof node.toJSON === "function") {
            node = node.toJSON()
        }

        node = replacer.call(parent, key, node)

        if (node === undefined) {
            return undefined
        }

        if (typeof node !== "object" || node === null) {
            return JSON.stringify(node)
        }

        if (Array.isArray(node)) {
            const items = node.map((item, index) => stringify(node, index.toString(), item, level + 1) ?? "null")
            return `[${items.map(v => `${nextIndent}${v}`).join(",")}${levelIndent}]`
        }

        if (seen.includes(node)) {
            if (cycles) return JSON.stringify("__cycle__")
            throw new TypeError("Converting circular structure to JSON")
        }

        seen.push(node)

        const keys = Object.keys(node).sort(cmp
            ? (a, b) => cmp(
                { key: a, value: node[a] },
                { key: b, value: node[b] },
            )
            : undefined)

        const properties = keys
            .map((k) => {
                const value = stringify(node, k, node[k], level + 1)
                if (value === undefined) return
                return `${nextIndent}${JSON.stringify(k)}${colonSeparator}${value}`
            })
            .filter((v): v is string => v !== undefined)

        seen.pop()

        return `{${properties.join(",")}${levelIndent}}`
    }

    return stringify({ "": obj }, "", obj, 0) ?? "null"
}

export default stableStringify
