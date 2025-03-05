import { describe, expect, it } from "vitest"
import { arrayComposer, isObjectLike, mergeWith } from "./merge"

describe("mergeWith", () => {
    it("should correctly merge simple objects", () => {
        const target = { a: 1, b: 2 }
        const source = { b: 3, c: 4 }

        const result = mergeWith(target, source, (targetValue, sourceValue) => {
            if (typeof targetValue === "number" && typeof sourceValue === "number") {
                return targetValue + sourceValue
            }
        })

        expect(result).toStrictEqual({ a: 1, b: 5, c: 4 })
    })

    it("should correctly merge arrays", () => {
        const target = { a: [1], b: [2] }
        const source = { a: [3], b: [4] }

        const result = mergeWith(target, source, (objValue, srcValue) => {
            if (Array.isArray(objValue)) {
                // eslint-disable-next-line ts/no-unsafe-return
                return [...objValue, ...srcValue]
            }
        })

        expect(result).toStrictEqual({ a: [1, 3], b: [2, 4] })
    })

    it("should handle nested objects", () => {
        const target = { a: { x: 1 }, b: { y: 2 } }
        const source = { a: { z: 3 }, b: { y: 4 } }

        const result = mergeWith(target, source, () => undefined)

        expect(result).toStrictEqual({
            a: { x: 1, z: 3 },
            b: { y: 2 },
        })
    })

    it("should handle undefined values", () => {
        const target = { a: 1, b: undefined }
        const source = { b: 2, c: undefined }

        const result = mergeWith(target, source, () => undefined)

        expect(result).toStrictEqual({ a: 1, b: 2 })
    })
})

describe("isObjectLike", () => {
    it("should correctly identify object types", () => {
        expect(isObjectLike({})).toBeTruthy()
        expect(isObjectLike([])).toBeTruthy()
        expect(isObjectLike(new Date())).toBeTruthy()
    })

    it("should correctly identify non-object types", () => {
        expect(isObjectLike(null)).toBeFalsy()
        expect(isObjectLike(undefined)).toBeFalsy()
        expect(isObjectLike("string")).toBeFalsy()
        expect(isObjectLike(123)).toBeFalsy()
        expect(isObjectLike(true)).toBeFalsy()
        expect(isObjectLike(() => {})).toBeFalsy()
    })
})

describe("arrayComposer", () => {
    it("should correctly merge and deduplicate two arrays", () => {
        const arr1 = [1, 2, 3]
        const arr2 = [2, 3, 4]
        expect(arrayComposer(arr1, arr2)).toStrictEqual([2, 3, 4, 1])
    })

    it("should return the array when only one array is provided", () => {
        const arr = [1, 2, 3]
        expect(arrayComposer(arr, undefined)).toStrictEqual(arr)
        expect(arrayComposer(undefined, arr)).toStrictEqual(arr)
    })

    it("should return undefined when inputs are not arrays", () => {
        expect(arrayComposer(1 as any, 2 as any)).toBeUndefined()
    })
})
