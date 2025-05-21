## <small>0.9.1 (2025-05-21)</small>

* refactor: refactor filesystem and DTS handling to use namespaced imports ([045970c](https://github.com/rainbowatcher/wasmup/commit/045970c))



## 0.9.0 (2025-05-16)

* refactor: standardize WebAssembly initialization and environment detection ([7b9957e](https://github.com/rainbowatcher/wasmup/commit/7b9957e))



## <small>0.8.6 (2025-05-15)</small>

* chore: update configuration, dependencies, and validation logic ([a94592c](https://github.com/rainbowatcher/wasmup/commit/a94592c))



## <small>0.8.5 (2025-05-15)</small>

* refactor: improve WebAssembly bindings and type handling robustness ([43dea59](https://github.com/rainbowatcher/wasmup/commit/43dea59))
* chore: fix wasmup executable path in package.json ([48c07c5](https://github.com/rainbowatcher/wasmup/commit/48c07c5))



## <small>0.8.4 (2025-05-15)</small>

* test: add wasm-opt options in cargo config ([163529c](https://github.com/rainbowatcher/wasmup/commit/163529c))
* test: refactor test setup and execution for cross-environment compatibility ([8623414](https://github.com/rainbowatcher/wasmup/commit/8623414))
* refactor: enhance type handling and include null/undefined in constants ([167ba60](https://github.com/rainbowatcher/wasmup/commit/167ba60))
* chore: update TypeScript target to ESNext for modern syntax support ([848aeb4](https://github.com/rainbowatcher/wasmup/commit/848aeb4))



## <small>0.8.3 (2025-05-14)</small>

* fix: fix shims generate error ([bd5e522](https://github.com/rainbowatcher/wasmup/commit/bd5e522))
* chore: update release script ([f0e4903](https://github.com/rainbowatcher/wasmup/commit/f0e4903))



## <small>0.8.2 (2025-05-14)</small>

* fix: should handle union type ([26b8665](https://github.com/rainbowatcher/wasmup/commit/26b8665))



## <small>0.8.1 (2025-05-14)</small>

* fix: property in config should optional ([92dc89b](https://github.com/rainbowatcher/wasmup/commit/92dc89b))
* fix: remove question symbol in param name ([20480cf](https://github.com/rainbowatcher/wasmup/commit/20480cf))
* fix: types should be shims.d.ts when shims enabled ([aaab7c8](https://github.com/rainbowatcher/wasmup/commit/aaab7c8))
* fix: use shims as default entry when shims is enable ([3febaa3](https://github.com/rainbowatcher/wasmup/commit/3febaa3))
* chore: add changelog ([58e9d81](https://github.com/rainbowatcher/wasmup/commit/58e9d81))
* chore: enable shims by default ([7b84281](https://github.com/rainbowatcher/wasmup/commit/7b84281))



## 0.8.0 (2025-05-14)

* chore: add tailing comma ([90e2e65](https://github.com/rainbowatcher/wasmup/commit/90e2e65))
* chore: clean up code and improve configuration handling ([8802c43](https://github.com/rainbowatcher/wasmup/commit/8802c43))
* chore: remove cross-release configuration file and update TypeScript settings ([1b7c59b](https://github.com/rainbowatcher/wasmup/commit/1b7c59b))
* chore: remove dependency tar ([580c922](https://github.com/rainbowatcher/wasmup/commit/580c922))
* chore: remove lint-staged ([5d25bc0](https://github.com/rainbowatcher/wasmup/commit/5d25bc0))
* chore: remove main and module field in generated package.json ([2934e74](https://github.com/rainbowatcher/wasmup/commit/2934e74))
* chore(deps): bump deps ([1f63ea2](https://github.com/rainbowatcher/wasmup/commit/1f63ea2))
* chore(deps): bump deps ([59035a6](https://github.com/rainbowatcher/wasmup/commit/59035a6))
* chore(deps): bump deps ([0c5425d](https://github.com/rainbowatcher/wasmup/commit/0c5425d))
* chore(deps): bump deps ([700ddd9](https://github.com/rainbowatcher/wasmup/commit/700ddd9))
* chore(deps): bump deps ([5417173](https://github.com/rainbowatcher/wasmup/commit/5417173))
* chore(deps): bump deps ([d7d1314](https://github.com/rainbowatcher/wasmup/commit/d7d1314))
* chore(deps): bump deps ([5882676](https://github.com/rainbowatcher/wasmup/commit/5882676))
* fix: ensure `initSync` is only called once ([0e1e1d0](https://github.com/rainbowatcher/wasmup/commit/0e1e1d0))
* fix: remove defu, avoid convert config path to absolute in config.ts ([e24a09b](https://github.com/rainbowatcher/wasmup/commit/e24a09b))
* fix: update lock file ([8391bf9](https://github.com/rainbowatcher/wasmup/commit/8391bf9))
* fix: update lock file ([bfecd29](https://github.com/rainbowatcher/wasmup/commit/bfecd29))
* build: add cross-release for push behaviours ([8e2e4b4](https://github.com/rainbowatcher/wasmup/commit/8e2e4b4))
* build: improve project structure and hello world call ([0a18f42](https://github.com/rainbowatcher/wasmup/commit/0a18f42))
* build: migrate tsup to tsdown ([bdfffcd](https://github.com/rainbowatcher/wasmup/commit/bdfffcd))
* ci: remove pnpm setup in release workflow ([e45ec2f](https://github.com/rainbowatcher/wasmup/commit/e45ec2f))
* feat: add non_web.js to support platform except web ([d8ae15b](https://github.com/rainbowatcher/wasmup/commit/d8ae15b))
* feat: generate and add shims to the CLI ([76c923b](https://github.com/rainbowatcher/wasmup/commit/76c923b))
* feat: remove optimize step in build command ([40e7b80](https://github.com/rainbowatcher/wasmup/commit/40e7b80))
* feat: remove wasm-opt in info command ([75c262c](https://github.com/rainbowatcher/wasmup/commit/75c262c))
* feat: remove wasm-opt in install command ([f22b10b](https://github.com/rainbowatcher/wasmup/commit/f22b10b))
* test: add more project in fixture ([2c07939](https://github.com/rainbowatcher/wasmup/commit/2c07939))
* test: add timeout for browser test ([d2570e6](https://github.com/rainbowatcher/wasmup/commit/d2570e6))
* test: add wasm-pack metadata in Cargo.toml ([7546a90](https://github.com/rainbowatcher/wasmup/commit/7546a90))
* test: bump wasm-bindgen version to 0.2.100 ([6396861](https://github.com/rainbowatcher/wasmup/commit/6396861))
* style: align code indent ([b7803f3](https://github.com/rainbowatcher/wasmup/commit/b7803f3))
* style: apply eslint style rule ([7a736da](https://github.com/rainbowatcher/wasmup/commit/7a736da))
* refactor: restructure resolveOptions function ([e8b3ae0](https://github.com/rainbowatcher/wasmup/commit/e8b3ae0))
* refactor!: restructure project files and improve configuration handling ([cac46fe](https://github.com/rainbowatcher/wasmup/commit/cac46fe))
* docs: add wasm-opt options section in readme ([d575899](https://github.com/rainbowatcher/wasmup/commit/d575899))



## 0.7.0 (2024-09-06)

* test: add test case for node to run wasm ([1754d08](https://github.com/rainbowatcher/wasmup/commit/1754d08))
* test: fix windows compability issue ([103b65a](https://github.com/rainbowatcher/wasmup/commit/103b65a))
* test: normalize path in expect object ([276fe07](https://github.com/rainbowatcher/wasmup/commit/276fe07))
* test: re-organize tests ([f914e3f](https://github.com/rainbowatcher/wasmup/commit/f914e3f))
* test: skip test in ci, because this test case need run wasmup build first ([3d4eddf](https://github.com/rainbowatcher/wasmup/commit/3d4eddf))
* chore: add fast-glob as dev dep ([5a645f3](https://github.com/rainbowatcher/wasmup/commit/5a645f3))
* chore: move validateOptions out of resolveOptions ([18ff4ea](https://github.com/rainbowatcher/wasmup/commit/18ff4ea))
* chore: optimize log print and not throw error when js not match ([cb02926](https://github.com/rainbowatcher/wasmup/commit/cb02926))
* chore: update wasm-bindgen for less project in fixture ([21bcc71](https://github.com/rainbowatcher/wasmup/commit/21bcc71))
* feat: add info command ([99c1ce2](https://github.com/rainbowatcher/wasmup/commit/99c1ce2))
* feat: make clean only remove items in dist ([227d7ab](https://github.com/rainbowatcher/wasmup/commit/227d7ab))
* fix: wasm-bindgen@0.2.93 has modify the output js content ([123d7c4](https://github.com/rainbowatcher/wasmup/commit/123d7c4))



## 0.6.0 (2024-09-05)

* chore: bump deps ([76bd7fc](https://github.com/rainbowatcher/wasmup/commit/76bd7fc))
* chore: remove husky ([76cd447](https://github.com/rainbowatcher/wasmup/commit/76cd447))
* chore: use @commitlint/config-conventional instead of custom rules ([6f0830f](https://github.com/rainbowatcher/wasmup/commit/6f0830f))
* chore: use simple-git-hooks instead of husky ([b802b80](https://github.com/rainbowatcher/wasmup/commit/b802b80))
* chore(deps): bump deps ([5d1cda1](https://github.com/rainbowatcher/wasmup/commit/5d1cda1))
* chore(deps): bump deps ([fe149d7](https://github.com/rainbowatcher/wasmup/commit/fe149d7))
* test: add test case for build command ([8415c8e](https://github.com/rainbowatcher/wasmup/commit/8415c8e))
* test: use eslint rule for tests ([cd43d05](https://github.com/rainbowatcher/wasmup/commit/cd43d05))
* feat: can resolve cargo workspace properties ([62c5a8e](https://github.com/rainbowatcher/wasmup/commit/62c5a8e))
* feat: use extra util for path and fs ([cd13fb9](https://github.com/rainbowatcher/wasmup/commit/cd13fb9))
* fix: correctly handle entry option ([2c03cb6](https://github.com/rainbowatcher/wasmup/commit/2c03cb6))
* revert: distinguish between publish and release ([86fc9e1](https://github.com/rainbowatcher/wasmup/commit/86fc9e1))



## <small>0.5.5 (2024-08-05)</small>

* chore: distinguish between publish and release ([7b1b694](https://github.com/rainbowatcher/wasmup/commit/7b1b694))
* chore: use constant ([a555efa](https://github.com/rainbowatcher/wasmup/commit/a555efa))
* fix: error when entries not provide in cli ([eadc93b](https://github.com/rainbowatcher/wasmup/commit/eadc93b))
* test: add test case for build ([2d5245b](https://github.com/rainbowatcher/wasmup/commit/2d5245b))



## <small>0.5.4 (2024-08-01)</small>

* fix: forget replace spawn to execa ([b67e788](https://github.com/rainbowatcher/wasmup/commit/b67e788))



## <small>0.5.3 (2024-08-01)</small>

* chore: use execa ([232326e](https://github.com/rainbowatcher/wasmup/commit/232326e))



## <small>0.5.2 (2024-08-01)</small>

* fix: spawn not block main process, use promise and await to block ([70b4fe1](https://github.com/rainbowatcher/wasmup/commit/70b4fe1))



## <small>0.5.1 (2024-08-01)</small>

* feat: update install command ([e3ad10b](https://github.com/rainbowatcher/wasmup/commit/e3ad10b))
* fix: hide help message when command is provided ([1600f77](https://github.com/rainbowatcher/wasmup/commit/1600f77))
* fix: throw a error when no entry provided ([c68d43c](https://github.com/rainbowatcher/wasmup/commit/c68d43c))



## 0.5.0 (2024-08-01)

* chore: bump deps ([8e1c0eb](https://github.com/rainbowatcher/wasmup/commit/8e1c0eb))
* feat: install pre-requisites through package manager in ci ([8f62b54](https://github.com/rainbowatcher/wasmup/commit/8f62b54))



## <small>0.4.1 (2024-07-31)</small>

* feat: remove toAbsolute in isFileSync ([f67600e](https://github.com/rainbowatcher/wasmup/commit/f67600e))
* feat: replace index_bg.wasm to index.wasm ([4c96c41](https://github.com/rainbowatcher/wasmup/commit/4c96c41))
* style: apply eslint rules ([abc2e19](https://github.com/rainbowatcher/wasmup/commit/abc2e19))
* test: use dedent for multiline string ([a1fe3d8](https://github.com/rainbowatcher/wasmup/commit/a1fe3d8))
* chore: add dedent ([407d37e](https://github.com/rainbowatcher/wasmup/commit/407d37e))
* chore: bump deps ([6ce5e32](https://github.com/rainbowatcher/wasmup/commit/6ce5e32))
* chore: bump deps ([63bbd67](https://github.com/rainbowatcher/wasmup/commit/63bbd67))
* chore: clear build log message ([ebf431f](https://github.com/rainbowatcher/wasmup/commit/ebf431f))
* chore: tweaks ([e2b54a3](https://github.com/rainbowatcher/wasmup/commit/e2b54a3))



## 0.4.0 (2024-07-29)

* test: reset config file after test, add array option test, remove unused import ([b0b43f2](https://github.com/rainbowatcher/wasmup/commit/b0b43f2))
* test: tweak cli test ([4778620](https://github.com/rainbowatcher/wasmup/commit/4778620))
* feat: support multientry ([d75b6cb](https://github.com/rainbowatcher/wasmup/commit/d75b6cb))
* fix: regexp to test windows add line begin match symbol ([06fdeb3](https://github.com/rainbowatcher/wasmup/commit/06fdeb3))
* chore: use dist/cli.js as bin ([bd4441b](https://github.com/rainbowatcher/wasmup/commit/bd4441b))



## 0.3.0 (2024-07-27)

* feat: add scope option ([d168f2b](https://github.com/rainbowatcher/wasmup/commit/d168f2b))
* feat: add warning when call commandExists in windows ([1aea894](https://github.com/rainbowatcher/wasmup/commit/1aea894))
* test: add concurrent for tests ([d8bfff9](https://github.com/rainbowatcher/wasmup/commit/d8bfff9))
* test: add timeout param for scope test ([da7df82](https://github.com/rainbowatcher/wasmup/commit/da7df82))
* test: increase the timeout limit ([639fe33](https://github.com/rainbowatcher/wasmup/commit/639fe33))
* test: make command check work in windows ([f8808f5](https://github.com/rainbowatcher/wasmup/commit/f8808f5))
* test: remove unused import ([1b825fa](https://github.com/rainbowatcher/wasmup/commit/1b825fa))
* test: skip test case that need compiler rust ([896c042](https://github.com/rainbowatcher/wasmup/commit/896c042))
* test: timeout in windows, skip now ([cc53ce2](https://github.com/rainbowatcher/wasmup/commit/cc53ce2))
* test: try fix test fail ([8f0687d](https://github.com/rainbowatcher/wasmup/commit/8f0687d))
* test: try fix test fail in windows ([703582a](https://github.com/rainbowatcher/wasmup/commit/703582a))
* test: use absolute path ([09bcaac](https://github.com/rainbowatcher/wasmup/commit/09bcaac))
* ci: add no confirm option ([4ddc03b](https://github.com/rainbowatcher/wasmup/commit/4ddc03b))
* ci: test for cargo binstall ([eb5074e](https://github.com/rainbowatcher/wasmup/commit/eb5074e))
* ci: try use taiki-e/install-action ([855d085](https://github.com/rainbowatcher/wasmup/commit/855d085))
* ci: turn on the verbose log and pass the github token ([8403c8a](https://github.com/rainbowatcher/wasmup/commit/8403c8a))
* ci: use pnpm install wasm-pack and wasm-opt ([bd0ef17](https://github.com/rainbowatcher/wasmup/commit/bd0ef17))
* chore: adjust function toAbsolute ([81a8dee](https://github.com/rainbowatcher/wasmup/commit/81a8dee))
* docs: add doc comment for options ([7ba27ba](https://github.com/rainbowatcher/wasmup/commit/7ba27ba))
* fix: there has't a field named author, only authors in Cargo.toml ([43b6766](https://github.com/rainbowatcher/wasmup/commit/43b6766))



## 0.2.0 (2024-07-27)

* docs: update ([4621e92](https://github.com/rainbowatcher/wasmup/commit/4621e92))
* feat: add comparison function for package.json ([5e5d101](https://github.com/rainbowatcher/wasmup/commit/5e5d101))
* feat: add config and ignore-output option ([9ff41fd](https://github.com/rainbowatcher/wasmup/commit/9ff41fd))
* feat: add coverage script ([d1aeb6a](https://github.com/rainbowatcher/wasmup/commit/d1aeb6a))
* feat: make param optional, throw error when it missing ([b70b7ae](https://github.com/rainbowatcher/wasmup/commit/b70b7ae))
* feat: show help when no arg passed ([df85157](https://github.com/rainbowatcher/wasmup/commit/df85157))
* feat: sort genrerated package.json ([2acc344](https://github.com/rainbowatcher/wasmup/commit/2acc344))
* test: add build test ([2dec788](https://github.com/rainbowatcher/wasmup/commit/2dec788))
* test: add cli test cases ([2945521](https://github.com/rainbowatcher/wasmup/commit/2945521))
* test: add edge test case ([7d153a3](https://github.com/rainbowatcher/wasmup/commit/7d153a3))
* chore: add eslint ignore ([e87f082](https://github.com/rainbowatcher/wasmup/commit/e87f082))
* chore: move types ([9a03d8a](https://github.com/rainbowatcher/wasmup/commit/9a03d8a))
* chore: remove file ([d106106](https://github.com/rainbowatcher/wasmup/commit/d106106))
* chore: remove fix options for lint-staged ([b4edb8b](https://github.com/rainbowatcher/wasmup/commit/b4edb8b))
* ci: add windows and macos environment ([c78972e](https://github.com/rainbowatcher/wasmup/commit/c78972e))



## <small>0.1.2 (2024-07-25)</small>

* fix: missing dash in release script ([ff627ce](https://github.com/rainbowatcher/wasmup/commit/ff627ce))
* feat: add cli.ts into build entry list ([49bf043](https://github.com/rainbowatcher/wasmup/commit/49bf043))
* docs: update changelog ([8623b64](https://github.com/rainbowatcher/wasmup/commit/8623b64))
* docs: use npm version badge ([6ac3f82](https://github.com/rainbowatcher/wasmup/commit/6ac3f82))



## <small>0.1.1 (2024-07-25)</small>

* ci: reduce env matrix ([b1d13bf](https://github.com/rainbowatcher/wasmup/commit/b1d13bf))
* ci: update pnpm action version ([2b38f57](https://github.com/rainbowatcher/wasmup/commit/2b38f57))
* style: apply eslint rule ([2301f1f](https://github.com/rainbowatcher/wasmup/commit/2301f1f))
* test: remove unused import ([9bef78d](https://github.com/rainbowatcher/wasmup/commit/9bef78d))
* chore: add changelog ([64bd261](https://github.com/rainbowatcher/wasmup/commit/64bd261))
* chore: bump deps ([34c07e9](https://github.com/rainbowatcher/wasmup/commit/34c07e9))
* fix: build before publish ([704a508](https://github.com/rainbowatcher/wasmup/commit/704a508))



## 0.1.0 (2024-07-25)

* fix: typo in command release ([d042ad7](https://github.com/rainbowatcher/wasmup/commit/d042ad7))
* docs: clear reademe ([b82c3ac](https://github.com/rainbowatcher/wasmup/commit/b82c3ac))
* feat: ok it work now ([c3adf6c](https://github.com/rainbowatcher/wasmup/commit/c3adf6c))
* chore: bump deps and replace pkgroll to tsup ([be8d312](https://github.com/rainbowatcher/wasmup/commit/be8d312))
* Initial commit ([794297c](https://github.com/rainbowatcher/wasmup/commit/794297c))



