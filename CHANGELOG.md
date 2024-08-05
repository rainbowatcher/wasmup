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



