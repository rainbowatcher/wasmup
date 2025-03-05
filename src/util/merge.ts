import type { MaybeUndefined } from "../types"

type MergeFunction<T = any, S = any> = (targetValue: T[keyof T], sourceValue: S[keyof S], key: PropertyKey, target: T, source: S) => T[keyof T] extends undefined ? S[keyof S] : T[keyof T]

/**
 * Merges the properties of the source object into the target object.
 *
 * This function is modified from <https://github.com/toss/es-toolkit/blob/main/src/object/mergeWith.ts>
 *
 * @param {T} target - The target object into which the source object properties will be merged. This object is modified in place.
 * @param {S} source - The source object whose properties will be merged into the target object.
 * @param {(targetValue: any, sourceValue: any, key: string, target: T, source: S) => any} merge - A custom merge function that defines how properties should be combined. It receives the following arguments:
 *   - `targetValue`: The current value of the property in the target object.
 *   - `sourceValue`: The value of the property in the source object.
 *   - `key`: The key of the property being merged.
 *   - `target`: The target object.
 *   - `source`: The source object.
 *
 * @returns {T & S} The updated target object with properties from the source object merged in.
 *
 * @template T - Type of the target object.
 * @template S - Type of the source object.
 *
 * @example
 * const target = { a: 1, b: 2 };
 * const source = { b: 3, c: 4 };
 *
 * mergeWith(target, source, (targetValue, sourceValue) => {
 *   if (typeof targetValue === 'number' && typeof sourceValue === 'number') {
 *     return targetValue + sourceValue;
 *   }
 * });
 * // Returns { a: 1, b: 5, c: 4 }
 * @example
 * const target = { a: [1], b: [2] };
 * const source = { a: [3], b: [4] };
 *
 * const result = mergeWith(target, source, (objValue, srcValue) => {
 *   if (Array.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * });
 *
 * expect(result).toEqual({ a: [1, 3], b: [2, 4] });
 */
export function mergeWith<T extends Record<PropertyKey, any>, S extends Record<PropertyKey, any>>(
    target: T,
    source: S,
    merge?: MergeFunction,
): S & T {
    if (source === undefined) {
        return target
    }
    if (target === undefined) {
        return source
    }
    const sourceKeys = Object.keys(source) as Array<keyof S>

    for (const key of sourceKeys) {

        const targetValue = target[key]
        const sourceValue = source[key]

        const merged = merge?.(targetValue, sourceValue, key, target, source)

        if (merged != null) {
            target[key] = merged
        } else if (Array.isArray(sourceValue)) {
            target[key] ??= sourceValue
        } else if (isObjectLike(targetValue) && isObjectLike(sourceValue)) {
            target[key] = mergeWith(targetValue ?? {}, sourceValue, merge)
        } else if (targetValue === undefined && sourceValue !== undefined) {
            target[key] = sourceValue
        }
    }

    return target
}

/**
 * Checks if the given value is object-like.
 *
 * A value is object-like if its type is object and it is not null.
 *
 * This function can also serve as a type predicate in TypeScript, narrowing the type of the argument to an object-like value.
 *
 * @template T - The type of value.
 * @param {T} value - The value to test if it is an object-like.
 * @returns {value is object} `true` if the value is an object-like, `false` otherwise.
 *
 * @example
 * const value1 = { a: 1 };
 * const value2 = [1, 2, 3];
 * const value3 = 'abc';
 * const value4 = () => {};
 * const value5 = null;
 *
 * console.log(isObjectLike(value1)); // true
 * console.log(isObjectLike(value2)); // true
 * console.log(isObjectLike(value3)); // false
 * console.log(isObjectLike(value4)); // false
 * console.log(isObjectLike(value5)); // false
 */

export function isObjectLike(value?: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

export function arrayComposer<T>(objValue: MaybeUndefined<T>, sourceValue: MaybeUndefined<T>) {
    const objValIsArray = Array.isArray(objValue)
    const sourceValIsArray = Array.isArray(sourceValue)
    if (sourceValIsArray && objValIsArray) {
        return [...new Set([...sourceValue, ...objValue])]
    } else if (objValIsArray) {
        return objValue
    } else if (sourceValIsArray) {
        return sourceValue
    }
}

export function merge<T extends Record<PropertyKey, any>, S extends Record<PropertyKey, any>>(target: T, ...sources: S[]): T {
    let result = target
    for (const source of sources) {
        result = mergeWith(result, source)
    }
    return result
}
