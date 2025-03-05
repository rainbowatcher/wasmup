import { readdir } from "node:fs/promises"
import path from "node:path"
import { parseProjectFile } from "../cargo"
import type { BuildContext } from "../types"
import type { CompareFunction } from "../util"

export async function generatePkgJson({ entry, opts, outputDir }: BuildContext) {
    const projectConfig = await parseProjectFile(entry)
    const {
        package: {
            authors,
            description,
            homepage: customHomepage,
            keywords,
            license,
            name: cargoPkgName,
            repository,
            version,
        },
    } = projectConfig

    const files = await readdir(outputDir)
    const validFiles = files.filter(f => opts.extensions.includes(path.extname(f).slice(1)))

    return {
        author: authors?.[0],
        bugs: typeof repository === "string" ? `${repository}/issues` : undefined,
        contributors: authors?.length > 1 ? authors.slice(1) : undefined,
        description,
        exports: {
            ".": {
                import: "./index.js",
                require: "./index.js",
            },
            "./non-web": {
                import: "./non_web.js",
                require: "./non_web.js",
            },
        },
        files: validFiles,
        homepage: customHomepage ?? (typeof repository === "string" ? `${repository}#readme` : undefined),
        keywords,
        license,
                name: opts.scope ? `@${opts.scope}/${cargoPkgName}` : cargoPkgName,
        repository,
        type: "module",
        types: "index.d.ts",
        version,
    }
}


export const pkgJsonComparator: CompareFunction = (a, b) => {
    const order = [
        "publisher",
        "name",
        "displayName",
        "type",
        "version",
        "private",
        "packageManager",
        "description",
        "author",
        "license",
        "funding",
        "homepage",
        "repository",
        "bugs",
        "keywords",
        "categories",
        "sideEffects",
        "exports",
        "main",
        "module",
        "unpkg",
        "jsdelivr",
        "types",
        "typesVersions",
        "bin",
        "icon",
        "files",
        "engines",
        "activationEvents",
        "contributes",
        "scripts",
        "peerDependencies",
        "peerDependenciesMeta",
        "dependencies",
        "optionalDependencies",
        "devDependencies",
        "pnpm",
        "overrides",
        "resolutions",
        "husky",
        "simple-git-hooks",
        "lint-staged",
        "eslintConfig",
    ]
    const idxPre = order.includes(a.key) ? order.indexOf(a.key) : 99
    const idxNext = order.includes(b.key) ? order.indexOf(b.key) : 99
    return idxPre - idxNext
}
