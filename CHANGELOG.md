# Changelog

## [1.0.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.5.1...v1.0.0) (2025-02-12)


### ⚠ BREAKING CHANGES

* update to express v5

### Features

* add boilerplate for virtualization module ([9cf1813](https://github.com/DouglasNeuroInformatics/libnest/commit/9cf1813e1e1aa02948ff6df165970c5784c3909a))
* add conditional modules option to config module ([0599b3b](https://github.com/DouglasNeuroInformatics/libnest/commit/0599b3b3553f8b3d50ed41eadafea33432f9cba2))
* add ConfigModule ([28a17ff](https://github.com/DouglasNeuroInformatics/libnest/commit/28a17ffdcb12e521ba609c79844d82d7d294ba3b))
* add createForModel to mock factory ([1b289c5](https://github.com/DouglasNeuroInformatics/libnest/commit/1b289c57c8063c080aa099c40fcb4336330ce40e))
* add delay middleware ([698499c](https://github.com/DouglasNeuroInformatics/libnest/commit/698499c5cbce9cac17ba6e8b9e3f0d8d41348b07))
* add docs ([c5cd80a](https://github.com/DouglasNeuroInformatics/libnest/commit/c5cd80a503d387adcd0af060248bc1a34ffe574d))
* add getOrThrow to ConfigService ([69c24ee](https://github.com/DouglasNeuroInformatics/libnest/commit/69c24ee472eb8f85c3ca029b46d44a771cee6700))
* add globals option to cli ([cb3e23f](https://github.com/DouglasNeuroInformatics/libnest/commit/cb3e23f535b97ab8aef6a942b09d76b04da35999))
* add new cli tool ([827be75](https://github.com/DouglasNeuroInformatics/libnest/commit/827be75fe6623a6f9c4f24118d6904d446d18d5f))
* add option to disable log and warn level logs ([38ccaf7](https://github.com/DouglasNeuroInformatics/libnest/commit/38ccaf7f30dd7440ea7faf21c14458af6f98bc1f))
* implement virtualization module ([585abe6](https://github.com/DouglasNeuroInformatics/libnest/commit/585abe63ad2519aaf296f41c24bbc09c4d53aa13))
* infer PrismaModelName ([d103169](https://github.com/DouglasNeuroInformatics/libnest/commit/d103169711f54b637b3c3c68a0daff037fdcf4b1))


### Bug Fixes

* add default options for json logger ([de6aab2](https://github.com/DouglasNeuroInformatics/libnest/commit/de6aab2558e8de6d499c83697eec8387ec16295d))
* add watch flag ([e7a3448](https://github.com/DouglasNeuroInformatics/libnest/commit/e7a3448c39309d27d50bef7ac678969e3ec4d347))
* adjust log format ([fb26d00](https://github.com/DouglasNeuroInformatics/libnest/commit/fb26d00ed9a71df35a83598af8a1b5065c3a2834))
* allow key of current user to be undefined ([1046425](https://github.com/DouglasNeuroInformatics/libnest/commit/1046425e645659453e9984f8a479058838abebb6))
* dynamic config ([f5ef9d7](https://github.com/DouglasNeuroInformatics/libnest/commit/f5ef9d7fb714aa44bf67eb5772adc589eab76062))
* error message ([39e7e54](https://github.com/DouglasNeuroInformatics/libnest/commit/39e7e546a37622a9811807971a16fbf897c473d4))
* log issues rather than message ([7106730](https://github.com/DouglasNeuroInformatics/libnest/commit/71067308472b85d8f8364174c93dd00b42dace56))
* make createMock public ([e60cfb1](https://github.com/DouglasNeuroInformatics/libnest/commit/e60cfb1a61ff8533e030beb8dea5266c4f67f4b5))
* missing return statements ([6e8a0dd](https://github.com/DouglasNeuroInformatics/libnest/commit/6e8a0dd88f12fd9276d2c2155cfc017bc7b5d385))
* mock getters ([23a2aad](https://github.com/DouglasNeuroInformatics/libnest/commit/23a2aad64d5e815c74609e00a1171a32f3fe05cb))
* model name inference in dev ([f498e46](https://github.com/DouglasNeuroInformatics/libnest/commit/f498e4659bd71a1e5f30507d4fb2d5b6d46291d6))
* rewrite json logger with method signatures ([1e9200a](https://github.com/DouglasNeuroInformatics/libnest/commit/1e9200a7e2a93ee3bd8955c23f39a0cc66706105))
* set getAllPropertyNames to public ([c20be9a](https://github.com/DouglasNeuroInformatics/libnest/commit/c20be9a188138b93bde0fc9ac89fad9f9d49b825))


### Miscellaneous Chores

* update to express v5 ([5a1d4cc](https://github.com/DouglasNeuroInformatics/libnest/commit/5a1d4ccbfeaad1cc39c47e0819fb50949fa715e9))

## [0.5.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.5.0...v0.5.1) (2025-01-22)


### Bug Fixes

* log error as json ([d5f4277](https://github.com/DouglasNeuroInformatics/libnest/commit/d5f42777b4a56b7dc5ef5ed8cc7290b18dfcce8c))

## [0.5.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.4.0...v0.5.0) (2024-11-27)


### Features

* add exception handler ([b38d708](https://github.com/DouglasNeuroInformatics/libnest/commit/b38d7089fc42621cd4c8db604928ac3d1ddaffb8))


### Bug Fixes

* add exports in logging module ([fc15134](https://github.com/DouglasNeuroInformatics/libnest/commit/fc15134ca44bc94ceca64f90fa6d7c9b07873963))
* export JSONLogger ([b0cc318](https://github.com/DouglasNeuroInformatics/libnest/commit/b0cc3181107552c55aa899701591923048797c0b))
* export logging service ([de7dcc1](https://github.com/DouglasNeuroInformatics/libnest/commit/de7dcc14498c9aeb50b03528acbe312d711b9270))
* handle more logging cases ([f4b0f4e](https://github.com/DouglasNeuroInformatics/libnest/commit/f4b0f4eb8030b5947d8d61589571fbfadc657962))
* remove injectable from json logger ([1c93a5d](https://github.com/DouglasNeuroInformatics/libnest/commit/1c93a5d6e0b4b9270100e2841ff53a515580f810))

## [0.4.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.3.0...v0.4.0) (2024-11-25)


### Features

* rewrite of logging module ([92e53f5](https://github.com/DouglasNeuroInformatics/libnest/commit/92e53f5fce78f651394ce6d381c7404f64c221c0))

## [0.3.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.2.0...v0.3.0) (2024-11-25)

### Features

- add getDbName method to PrismaService ([6059576](https://github.com/DouglasNeuroInformatics/libnest/commit/6059576ccaa0ede295378b6b6c26a7f5b55f406c))

## [0.2.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.1.1...v0.2.0) (2024-11-05)

### Features

- add prisma module ([6bd4df9](https://github.com/DouglasNeuroInformatics/libnest/commit/6bd4df921eea7fe93f611f10e264d72fd0f9c5ec))

## [0.1.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.1.0...v0.1.1) (2024-08-18)

### Bug Fixes

- move zod to peers ([1cbadd5](https://github.com/DouglasNeuroInformatics/libnest/commit/1cbadd51dd9a33f52b00e3726617e961ade5967c))

## [0.1.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v0.0.1...v0.1.0) (2024-07-19)

### Features

- add pbkdf2Params option to CryptoService ([0806e0a](https://github.com/DouglasNeuroInformatics/libnest/commit/0806e0ad067c497265e3ea6e6de155cfb76c272f))
