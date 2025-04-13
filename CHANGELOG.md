# Changelog

## [4.4.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.3.3...v4.4.0) (2025-04-13)

### Features

* add ValidObjectIdPipe ([3e756eb](https://github.com/DouglasNeuroInformatics/libnest/commit/3e756eb6121b95747b328de5f789222f1e96df0f))

## [4.3.3](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.3.2...v4.3.3) (2025-04-12)

### Bug Fixes

* remove explicit stop of mongo memory server ([0a61c63](https://github.com/DouglasNeuroInformatics/libnest/commit/0a61c63cd0f6113b56928152b3be35912ca71d44))
* use builtin method for db name ([d2ce3d3](https://github.com/DouglasNeuroInformatics/libnest/commit/d2ce3d3a0af600a883681426f86a75d4a4681bbc))

## [4.3.2](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.3.1...v4.3.2) (2025-04-12)

### Bug Fixes

* mark dynamic import of mongodb-memory-server as external in production build ([6d5cc01](https://github.com/DouglasNeuroInformatics/libnest/commit/6d5cc019aa011f30c00a82f3b2f86d2e2f29a123))

## [4.3.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.3.0...v4.3.1) (2025-04-12)

### Bug Fixes

* add log ([3d06b1b](https://github.com/DouglasNeuroInformatics/libnest/commit/3d06b1ba744b3e27dddc52b3d80c77241ccc2378))
* allow overriding log level in test ([24028b0](https://github.com/DouglasNeuroInformatics/libnest/commit/24028b02604363056145b97f8349c363e7ebcd53))
* onApplicationShutdown ([bdda142](https://github.com/DouglasNeuroInformatics/libnest/commit/bdda142cae34449e4706331f780feb5d1f27474c))
* only set NODE_ENV if it is undefined in dev ([34c1346](https://github.com/DouglasNeuroInformatics/libnest/commit/34c13461ed33f240b54ee9f9dedc849c4ea98935))

## [4.3.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.2.1...v4.3.0) (2025-04-02)

### Features

* add --runtime option to libnest ([39a066b](https://github.com/DouglasNeuroInformatics/libnest/commit/39a066b6b53b15cac3180da154354798e74fe737))
* add deno support to libnest-build ([ac8d1eb](https://github.com/DouglasNeuroInformatics/libnest/commit/ac8d1eb12ebb330ae50d83a4aa3e792686a4c0b1))
* add deno support to libnest-dev ([e5ebdd8](https://github.com/DouglasNeuroInformatics/libnest/commit/e5ebdd8108ba715d1e92a432b74e56295975b149))
* support bun ([a96ce85](https://github.com/DouglasNeuroInformatics/libnest/commit/a96ce858f8944df2bffb4d6d36f9b01eae247cdf))
* support bun in libnest-dev ([aa38943](https://github.com/DouglasNeuroInformatics/libnest/commit/aa38943f4d56cf4ac2bda73eca34242680566391))

### Bug Fixes

* no register in build ([b800342](https://github.com/DouglasNeuroInformatics/libnest/commit/b8003421aaeb19faa1e27a4bcb148f81847ab685))
* only register swc/node if process.argv0 is node ([fae938a](https://github.com/DouglasNeuroInformatics/libnest/commit/fae938ae946b5971a23f995df0081f07a75e75fd))

## [4.2.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.2.0...v4.2.1) (2025-04-02)

### Bug Fixes

* update libnest-dev script be be POSIX-compliant ([03b7009](https://github.com/DouglasNeuroInformatics/libnest/commit/03b70098776b7b7a7bc46b2e4b1e6e302b9ae5f3))

## [4.2.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.1.0...v4.2.0) (2025-03-31)

### Features

* add --verbose option to libnest-build ([851f884](https://github.com/DouglasNeuroInformatics/libnest/commit/851f884a9d5def5d2b0c624edf86b58cb0e6042c))

### Bug Fixes

* await lexer init ([0d275be](https://github.com/DouglasNeuroInformatics/libnest/commit/0d275be6ba64476601df1dcdab19ea6d7d92edbb))
* further improve error message if schema is not defined ([95bd298](https://github.com/DouglasNeuroInformatics/libnest/commit/95bd298fb8990c80a6d5426cd07e7316040d38f4))
* improve build logs ([74aaa0c](https://github.com/DouglasNeuroInformatics/libnest/commit/74aaa0cfc57a4a7d424be91b59a564830ce3481f))
* improve error message for missing ValidationSchema ([6a0d6b8](https://github.com/DouglasNeuroInformatics/libnest/commit/6a0d6b8900d69295d1b068d009f8cfa9a9f028cd))
* logging order ([f80b710](https://github.com/DouglasNeuroInformatics/libnest/commit/f80b71063143d25c92d13e5d2c70f9d4a2b9c424))

## [4.1.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v4.0.0...v4.1.0) (2025-03-30)

### Features

* add --no-watch flag to dev command ([c9616d2](https://github.com/DouglasNeuroInformatics/libnest/commit/c9616d222c6140c9d5cffebd7c1a9acf90a68d59))
* add setAccessToken method to test api ([b27df92](https://github.com/DouglasNeuroInformatics/libnest/commit/b27df929befcc11d4cc70724dab0f8bb398bf7cb))
* add vite plugin ([0354963](https://github.com/DouglasNeuroInformatics/libnest/commit/0354963602d0be283fb45af159029254a26192b2))
* implement RuntimePrismaClientOptions ([b2a9ae9](https://github.com/DouglasNeuroInformatics/libnest/commit/b2a9ae93318d79d9661e98649007b9e5a25b5d96))

### Bug Fixes

* improve error logging ([60ae30e](https://github.com/DouglasNeuroInformatics/libnest/commit/60ae30ebce752d89c8d750f3ee78c0516625bf29))
* libnest config resolution in monorepo e2e test ([6c3ab51](https://github.com/DouglasNeuroInformatics/libnest/commit/6c3ab510a9d5bc611eec807aa27de29a7ed37716))
* name of callback in e2e ([75fd981](https://github.com/DouglasNeuroInformatics/libnest/commit/75fd98145bec246c663038c32bda6a043044f74a))
* omit cannot be undefined explicitly ([67d065f](https://github.com/DouglasNeuroInformatics/libnest/commit/67d065ff8a9a055a9b9183845aca9357f1ee78fc))
* passthrough opts to prisma ([a84d914](https://github.com/DouglasNeuroInformatics/libnest/commit/a84d9145d5e7310ea2a608daf04c3e7d6583670f))
* supertest types ([05bfac6](https://github.com/DouglasNeuroInformatics/libnest/commit/05bfac67c260a35c2743389f22c4b035f99e7d2c))
* swc helpers ([31228be](https://github.com/DouglasNeuroInformatics/libnest/commit/31228be4182c7c3b39d7e739b806178be34104f2))
* type errors ([bf2ed44](https://github.com/DouglasNeuroInformatics/libnest/commit/bf2ed4411b106907bef7baa1d3ad971e57b7d330))
* use repl set for mongo memory server ([ad2e86d](https://github.com/DouglasNeuroInformatics/libnest/commit/ad2e86dd37e3884ccbf065fa6e17ccabcd5398da))
* validate db stats ([b82a132](https://github.com/DouglasNeuroInformatics/libnest/commit/b82a132aff98924c8597f465444cf4e75a51699a))

## [4.0.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v3.2.0...v4.0.0) (2025-03-28)

### ⚠ BREAKING CHANGES

* Users now need to call AppFactory.create instead of AppContainer.create

### Features

* implement mongo-memory-server in test ([e156fc5](https://github.com/DouglasNeuroInformatics/libnest/commit/e156fc5b2cd2c61e085ad78b2702707ae427c50f))

### Bug Fixes

* issue where dev server crashed on syntax error ([c1a310e](https://github.com/DouglasNeuroInformatics/libnest/commit/c1a310e2cd1ff9caf7a7c9d0da265021e84807cd))

### Code Refactoring

* adjust AppContainer implementation ([f479516](https://github.com/DouglasNeuroInformatics/libnest/commit/f47951636ea881dce4075170b5ddea2487af613a))

## [3.2.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v3.1.1...v3.2.0) (2025-03-26)

### Features

* implement mail module ([7d7bf3d](https://github.com/DouglasNeuroInformatics/libnest/commit/7d7bf3d3075bd78c36007705b2eb73d36b75874d))

## [3.1.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v3.1.0...v3.1.1) (2025-03-25)

### Bug Fixes

* move supertest to prod deps ([3194f0b](https://github.com/DouglasNeuroInformatics/libnest/commit/3194f0b9e5cdd96212b316c9985005aa47f78d45))

## [3.1.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v3.0.1...v3.1.0) (2025-03-25)

### Features

* add InjectPrismaClient ([3a8026b](https://github.com/DouglasNeuroInformatics/libnest/commit/3a8026bdc152dabdabb119d4fb0048dc76ba0b17))

## [3.0.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v3.0.0...v3.0.1) (2025-03-20)

### Bug Fixes

* copy assets to build dir ([860b37f](https://github.com/DouglasNeuroInformatics/libnest/commit/860b37f59f6a106416762f48bb3e2273a9d0d34a))

## [3.0.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v2.3.1...v3.0.0) (2025-03-20)

### ⚠ BREAKING CHANGES

* Adjust docs config

### Features

* add title to html template ([22efd2b](https://github.com/DouglasNeuroInformatics/libnest/commit/22efd2b40e24d6eeabb2ebc3ba32f3c63bf89986))
* copy assets on build ([501a488](https://github.com/DouglasNeuroInformatics/libnest/commit/501a48805c1eba53eea0aa902086f68f7ccc4e58))
* implement static assets in docs ([40265da](https://github.com/DouglasNeuroInformatics/libnest/commit/40265da0d7479dc20320039b14e678f5e4bfe4f0))

## [2.3.1](https://github.com/DouglasNeuroInformatics/libnest/compare/v2.3.0...v2.3.1) (2025-03-20)

### Bug Fixes

* register swc ([a06bdac](https://github.com/DouglasNeuroInformatics/libnest/commit/a06bdaca81cc32c2ff28a2024e59498e5b08124a))
* specify exe ([243be15](https://github.com/DouglasNeuroInformatics/libnest/commit/243be158d002438ab5d1e9bfbfb9bc881c27bb34))
* use shell script for libnest ([52cd37d](https://github.com/DouglasNeuroInformatics/libnest/commit/52cd37d1dc76237eed58da0e154ced78e4a513a3))
* use shell script for libnest build ([90f88fd](https://github.com/DouglasNeuroInformatics/libnest/commit/90f88fdd16024733eb8cd2fb537d32b0283a6f8d))
* use shell script for libnest-dev ([e6afee3](https://github.com/DouglasNeuroInformatics/libnest/commit/e6afee3a5e10a62a63b6ec9078dabfd000ebc2ae))

## [2.3.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v2.2.0...v2.3.0) (2025-03-19)

### Features

* add onComplete callback function to build config ([b176655](https://github.com/DouglasNeuroInformatics/libnest/commit/b176655222221987ca1a74cd5a905e00cf779828))

## [2.2.0](https://github.com/DouglasNeuroInformatics/libnest/compare/v2.1.0...v2.2.0) (2025-03-19)

### Features

* add build function ([eccd804](https://github.com/DouglasNeuroInformatics/libnest/commit/eccd804f4c172897a5fac7797304659a9a1cfbae))
* add build mode option ([6547616](https://github.com/DouglasNeuroInformatics/libnest/commit/654761629d48ade23918e83a9e1d510f8d448fde))
* add build to libnest options ([fa41330](https://github.com/DouglasNeuroInformatics/libnest/commit/fa4133096b4fe14a4346d602514424ec0bbfc2a4))
* add e2e helper ([aeeb8f2](https://github.com/DouglasNeuroInformatics/libnest/commit/aeeb8f277e2238d5a2a66bc0b5dabd44e30a7bc8))
* add esbuildOptions for build ([24dec97](https://github.com/DouglasNeuroInformatics/libnest/commit/24dec9768b83f3df9da0eaacb724a94920fb2ef1))
* add globals to build ([a0a67ec](https://github.com/DouglasNeuroInformatics/libnest/commit/a0a67ec93b4fdf7da1634e54a184e6a826a50fb8))
* add source map support in cli ([78ed3b7](https://github.com/DouglasNeuroInformatics/libnest/commit/78ed3b73f8fe1faa4f41827175a1727146274b8e))

### Bug Fixes

* add baseDir to load ([7e5cca8](https://github.com/DouglasNeuroInformatics/libnest/commit/7e5cca8ac6a3f7a8e452c0f9c6ecfe0ff29f3c53))
* add dynamic app container load method ([db07c86](https://github.com/DouglasNeuroInformatics/libnest/commit/db07c865eca48d3919fede1ad17d7d25b2ec68fd))
* auto init app in test ([95a4e64](https://github.com/DouglasNeuroInformatics/libnest/commit/95a4e64027a84bfa32357d88589db69f58ff2837))
* await of appContainer if promise ([e0b06c2](https://github.com/DouglasNeuroInformatics/libnest/commit/e0b06c26a462c4c9654e77485dcbd7ea035fede3))
* build based on entry ([b9098ba](https://github.com/DouglasNeuroInformatics/libnest/commit/b9098ba27b2cafe730c77caf5a0678fca2a4153d))
* check for absolute path ([2934647](https://github.com/DouglasNeuroInformatics/libnest/commit/293464772407254cc636988c9d10377bab0109b9))
* entry wrapper ([0f1d603](https://github.com/DouglasNeuroInformatics/libnest/commit/0f1d603249055d261d7270742dc285d47bf06130))
* export referenced tokens ([13d2be8](https://github.com/DouglasNeuroInformatics/libnest/commit/13d2be8e431ccca8c516c4dbe73b22aed96ed70c))
* forgot to remove tmp hardcoded outfile ([89e4b94](https://github.com/DouglasNeuroInformatics/libnest/commit/89e4b94fdfe8cd7a28d3c26699d431affbe3cf40))
* handle change in prisma types ([3d6e0b2](https://github.com/DouglasNeuroInformatics/libnest/commit/3d6e0b2ccf96633fb7ea46ab021a8b5e608da88a))
* inject PRISMA_QUERY_ENGINE_LIBRARY token ([4cc521f](https://github.com/DouglasNeuroInformatics/libnest/commit/4cc521f3c58569d0986ff8903b53b34db812b3b1))
* inject query path at build ([cc68c99](https://github.com/DouglasNeuroInformatics/libnest/commit/cc68c991d1faa67779a562d7aaec1d8359705a7a))
* inject query path in banner ([37378e0](https://github.com/DouglasNeuroInformatics/libnest/commit/37378e0369aa7bf7a72334044e214cb2db80f187))
* kill on end ([f07e7b3](https://github.com/DouglasNeuroInformatics/libnest/commit/f07e7b3f53fc19dff98e6c8d5daeb4a022a4b143))
* outdir ([fe8c45f](https://github.com/DouglasNeuroInformatics/libnest/commit/fe8c45f96e7edd9551b3aa674636e3cf0835f236))
* permissions issue during test on github runner ([7464500](https://github.com/DouglasNeuroInformatics/libnest/commit/7464500f6aae266bc81e101d1b6b359b998b5f46))
* remove broken link ([7df8ff0](https://github.com/DouglasNeuroInformatics/libnest/commit/7df8ff033dd9d1bc58dbdd381ffd9600c47c04d7))
* typo in param name ([180cb15](https://github.com/DouglasNeuroInformatics/libnest/commit/180cb15eb55eba6cdfc50d0bae917c0b0efbbd57))
* update user config schema for esbuild options ([f3fe204](https://github.com/DouglasNeuroInformatics/libnest/commit/f3fe20494dd0a8e05048abce5a9b82fd711fb4f6))
* use prefix for tmpdir to fix tests on linux ([95ab6a8](https://github.com/DouglasNeuroInformatics/libnest/commit/95ab6a85760e0b645116004f63ec8cb05ee2797e))

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
