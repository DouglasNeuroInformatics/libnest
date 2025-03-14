# Changelog

## [2.1.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v2.0.1...v2.1.0) (2025-03-14)

### Features

* add accessibleQuery ([9020a5c](https://github.com/DouglasNeuroInformatics/libnest/commit/9020a5c42ee76c8e4a3d99c6470ec5d92aeb5cb9))
* add PrismaModelWhereInput ([7011547](https://github.com/DouglasNeuroInformatics/libnest/commit/7011547db16e1d454cb8fb18de535b221404aab1))

## [2.0.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v2.0.0...v2.0.1) (2025-03-14)

### Bug Fixes

* add explicit schema for token payload ([1bc1aeb](https://github.com/DouglasNeuroInformatics/libnest/commit/1bc1aeb9764bda1ee7f7e69b63429b3906c0f5bb))

## [2.0.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v1.0.0...v2.0.0) (2025-03-13)

### ⚠ BREAKING CHANGES

* Total rewrite of many things

### Features

* add __modelName to prisma ([55cca81](https://github.com/DouglasNeuroInformatics/libnest/commit/55cca81250749ab32b1ebdbd83e514fe192199bb))
* add add error mixin ([05fdfc2](https://github.com/DouglasNeuroInformatics/libnest/commit/05fdfc25e798b2c7d6c714189e1603bb1a7529c5))
* add API_PROD_SERVER_PORT to config ([3400017](https://github.com/DouglasNeuroInformatics/libnest/commit/340001714530f42611e1add9d9c114c1a19c1e73))
* add conditional imports ([51bf420](https://github.com/DouglasNeuroInformatics/libnest/commit/51bf420cbb73c7f2acccc5ea02bb62a3cbdeb17c))
* add details to app error ([3eaf073](https://github.com/DouglasNeuroInformatics/libnest/commit/3eaf07341bf5a4527f6e7f2ad3dedf7cba898608))
* add getValidationSchema ([5c98c2f](https://github.com/DouglasNeuroInformatics/libnest/commit/5c98c2fa75d95e6ec9c266636ff4fa2eb99cf2b5))
* add JwtStrategy ([174aec3](https://github.com/DouglasNeuroInformatics/libnest/commit/174aec30d4701c5c329b9a1f68f2f29720d323a5))
* add new infer type ([d674010](https://github.com/DouglasNeuroInformatics/libnest/commit/d6740101e6fd45e3c9e288f2a29dc2c4ef5d361f))
* add param overload to app error ([62e808c](https://github.com/DouglasNeuroInformatics/libnest/commit/62e808c6175a78d46872383ef553e6cce2026955))
* add providers option to AppFactory ([d81ec5f](https://github.com/DouglasNeuroInformatics/libnest/commit/d81ec5f29a8f8fd078933adc9e3281fe54de5056))
* add RouteAccess decorator ([69d01ea](https://github.com/DouglasNeuroInformatics/libnest/commit/69d01ea40338895312d86630ffa6a50fb61cc0dc))
* add throttler ([047c0a2](https://github.com/DouglasNeuroInformatics/libnest/commit/047c0a2f3332662e14f927dd4ceb1969bd2b9afc))
* add validation service ([2b0217b](https://github.com/DouglasNeuroInformatics/libnest/commit/2b0217bf0c819db57b82c8b2cb94cf96c2ddf628))
* configure delay middleware ([c902a58](https://github.com/DouglasNeuroInformatics/libnest/commit/c902a583512ff5670d7011b677c0b76933b57697))
* dynamically apply login credentials schema ([2e42a10](https://github.com/DouglasNeuroInformatics/libnest/commit/2e42a10d9611a356dee8c3ae5421131730459bfd))
* implement auth guard and route access decorator ([e3c7d62](https://github.com/DouglasNeuroInformatics/libnest/commit/e3c7d627a2c0f5d7797f670b35d767abfd185f6c))
* implement authentication guard ([e456fe2](https://github.com/DouglasNeuroInformatics/libnest/commit/e456fe2fd8f23b81958832cb381d9ef28d69e5bd))
* implement working auth module ([143292b](https://github.com/DouglasNeuroInformatics/libnest/commit/143292b6b2776794081f21ce669028985e9302e9))
* integrate crypto module ([bc34122](https://github.com/DouglasNeuroInformatics/libnest/commit/bc3412287c2d4ad8a97857ece52d34b09d8c846f))

### Bug Fixes

* add all as subject ([7254987](https://github.com/DouglasNeuroInformatics/libnest/commit/7254987c46b9b814568b8f9353a28ef9b1287e74))
* add dbPrefix option for prisma ([575f154](https://github.com/DouglasNeuroInformatics/libnest/commit/575f1548d7bc04ab0928c2b553bb4e646797edd0))
* add fallback for never ability ([5508624](https://github.com/DouglasNeuroInformatics/libnest/commit/55086247682ad62ecef33894387d6e0384c09d43))
* allow passing context options ([37d371b](https://github.com/DouglasNeuroInformatics/libnest/commit/37d371ba9374e127b41f2a8b4e3a09febd5cf598))
* app error ([8cf0cf6](https://github.com/DouglasNeuroInformatics/libnest/commit/8cf0cf6675e4d0b81d0cabfbce7fc54621579f6b))
* circular type ref ([2f04ff8](https://github.com/DouglasNeuroInformatics/libnest/commit/2f04ff84ec939745a3d389759b180d86c1393e24))
* conditional import ([a5d27a4](https://github.com/DouglasNeuroInformatics/libnest/commit/a5d27a4f6c4f0d5f341907ed5356050db7d0af1f))
* export logging service ([a73f4e6](https://github.com/DouglasNeuroInformatics/libnest/commit/a73f4e6beae50033e515a310dd78b5e9570ca530))
* modelName types ([c7560bc](https://github.com/DouglasNeuroInformatics/libnest/commit/c7560bce59bbfbff7861fecb75f1bd86d6471322))
* move env setter ([9d02a8e](https://github.com/DouglasNeuroInformatics/libnest/commit/9d02a8e5098a0ecd64b9ecee103d780a4f0c1196))
* move swc to prod deps ([f8fd737](https://github.com/DouglasNeuroInformatics/libnest/commit/f8fd737c88ab7e574be97cbb980376dbef65ae54))
* narrow types ([c5884d1](https://github.com/DouglasNeuroInformatics/libnest/commit/c5884d1c638f1c4505dd6b9ba005068cc9e39bed))
* remove empty strings from env ([ef2fd12](https://github.com/DouglasNeuroInformatics/libnest/commit/ef2fd1241e90a2ec9a97baf2fdc6e6ca32e0d3bd))
* set virtualization context public ([e3f9741](https://github.com/DouglasNeuroInformatics/libnest/commit/e3f97411a03080b29aa79ced2f03986f3c8f1931))
* setup dependency injection for JSONLogger ([ca92108](https://github.com/DouglasNeuroInformatics/libnest/commit/ca921085918973b69af8177c09bbe29ce9f93312))
* somewhat improve type ([3c93e54](https://github.com/DouglasNeuroInformatics/libnest/commit/3c93e54eb2a1b04e2d0e71df3416b657336d3a29))
* standardize schema ([34e1b32](https://github.com/DouglasNeuroInformatics/libnest/commit/34e1b327ecc34f9ce74b30219175a61184ddb0b3))
* type error ([d7e6843](https://github.com/DouglasNeuroInformatics/libnest/commit/d7e684394462312560a3f3d049322fc08ea46ae8))
* type error ([7ee855f](https://github.com/DouglasNeuroInformatics/libnest/commit/7ee855fc4c7dbf7995bebf2cc2af7708c32167c7))
* type error ([9b069b5](https://github.com/DouglasNeuroInformatics/libnest/commit/9b069b5a2853fd2cb9ce2965bc40d4438fc17684))
* type import ([5f553e8](https://github.com/DouglasNeuroInformatics/libnest/commit/5f553e8b06a2117c072b9472819fee8dd0d26215))
* typing ([fd00199](https://github.com/DouglasNeuroInformatics/libnest/commit/fd00199167af0c28bcf5904cd8e458b4f4b110a8))
* typo ([69a4037](https://github.com/DouglasNeuroInformatics/libnest/commit/69a40372f28378005adb063287deb4e50c1242e2))
* use correct key ([47f2446](https://github.com/DouglasNeuroInformatics/libnest/commit/47f2446cd19928210fd5b34a634e673984cb21cf))
* use url like to MONGO_URI ([b9a1328](https://github.com/DouglasNeuroInformatics/libnest/commit/b9a1328386066af4cd8c99c4c3f4ac68876bf455))
* userQuery payload infer ([7c3a22f](https://github.com/DouglasNeuroInformatics/libnest/commit/7c3a22f0dc8d6deb471752ccd650c71aab227ae7))
* virtualization module export path ([4f772b8](https://github.com/DouglasNeuroInformatics/libnest/commit/4f772b8dd067fb0a69dfd5032cd75d066a634851))
* zod namespace ([33222b3](https://github.com/DouglasNeuroInformatics/libnest/commit/33222b3c59f70c12c0f138f091d8b029bdd3f61f))

### Miscellaneous Chores

* release v2 ([a745c9c](https://github.com/DouglasNeuroInformatics/libnest/commit/a745c9c55281cf7caed4ef029aab19585ad1a16f))

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
