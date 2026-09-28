import {
  All,
  Body,
  Controller,
  createParamDecorator,
  Delete,
  Get,
  Headers,
  HttpCode,
  Logger,
  Module,
  Param,
  Post,
  Put,
  Query,
  Req,
  Version,
  VERSION_NEUTRAL,
  VersioningType
} from '@nestjs/common';
import type { ModuleMetadata, Type } from '@nestjs/common';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants.js';
import { RouterModule } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { DocsGenerator } from '../docs.generator.js';

import type { OpenApiParameter } from '../docs.generator.js';

type $CreateCatData = z.infer<typeof $CreateCatData>;
const $CreateCatData = z.object({
  age: z.int(),
  born: z.date(),
  kind: z.enum(['siamese', 'tabby']),
  name: z.string().describe('The name of the cat'),
  nickname: z.string().nullable().default(null)
});

type $CatParams = z.infer<typeof $CatParams>;
const $CatParams = z.object({ catId: z.string() });

type $CatHeaders = z.infer<typeof $CatHeaders>;
const $CatHeaders = z.object({ 'x-api-key': z.string(), 'x-trace-id': z.string().optional() });

type $CatSearchParams = z.infer<typeof $CatSearchParams>;
const $CatSearchParams = z.object({ limit: z.coerce.number().optional(), q: z.string() });

type $SearchTerm = z.infer<typeof $SearchTerm>;
const $SearchTerm = z.string();

type $SortOrder = z.infer<typeof $SortOrder>;
const $SortOrder = z.enum(['asc', 'desc']).optional();

type $Owner = z.infer<typeof $Owner>;
const $Owner = z.object({ name: z.string() }).meta({ id: 'Owner' });

type $CreateCatWithOwnerData = z.infer<typeof $CreateCatWithOwnerData>;
const $CreateCatWithOwnerData = z.object({ name: z.string(), owner: $Owner });

type $OwnerSearchParams = z.infer<typeof $OwnerSearchParams>;
const $OwnerSearchParams = z.object({ name: z.string().optional() }).meta({ id: 'OwnerSearchParams' });

type $RefPropertyData = z.infer<typeof $RefPropertyData>;
const $RefPropertyData = z.object({ $ref: z.string() });

type $TreeNode = { children: $TreeNode[]; parent?: $TreeNode; value: number };
const $TreeNode: z.ZodType<$TreeNode> = z.object({
  get children() {
    return z.array($TreeNode);
  },
  get parent() {
    return $TreeNode.optional();
  },
  value: z.number()
});

type $Forest = z.infer<typeof $Forest>;
const $Forest = z.object({ tree: $TreeNode });

type $Broken = z.infer<typeof $Broken>;
const $Broken = z.lazy((): z.ZodString => {
  throw new Error('Cannot convert schema');
});

type Slug = { value: string };

class LegacyDto {
  declare name: string;
}

const CurrentThing = createParamDecorator(() => 'thing');

// same as the `@SearchParams()` decorator in Clinivance, which passes a pipe rather than a name to @Query()
const SearchParams = (): ParameterDecorator => Query({ transform: (value: unknown) => value });

@Controller('cats')
class CatsController {
  @Post()
  create(@Body() data: $CreateCatData) {
    return data;
  }

  @Post('named')
  createNamed(@Body('name') name: $SearchTerm, @Body('age') age: number) {
    return { age, name };
  }

  @Get()
  find() {
    return [];
  }
}

@Controller('owners/:ownerId/cats')
class OwnerCatsController {
  @Get(':catId')
  find(@Param() params: $CatParams, @Headers() headers: $CatHeaders, @SearchParams() searchParams: $CatSearchParams) {
    return { headers, params, searchParams };
  }
}

@Controller('named')
class NamedController {
  @Get(':id/:slug')
  find(
    @Param('id') id: number,
    @Param('slug') slug: Slug,
    @Query('q') q: $SearchTerm,
    @Query('sort') sort: $SortOrder,
    @Query('flag') flag: boolean,
    @Query('name') name: string,
    @Query('filter') filter: Slug,
    @Headers('x-lang') lang: string
  ) {
    return { filter, flag, id, lang, name, q, slug, sort };
  }
}

@Controller('legacy')
class LegacyController {
  @Post()
  create(
    @Body() data: LegacyDto,
    @Query() query: LegacyDto,
    @Query() term: $SearchTerm,
    @CurrentThing() thing: string,
    @Req() req: unknown
  ) {
    return { data, query, req, term, thing };
  }
}

@Controller('owners')
class OwnersController {
  @Post()
  create(@Body() data: $Owner) {
    return data;
  }

  @Post('cats')
  createCat(@Body() data: $CreateCatWithOwnerData) {
    return data;
  }

  @Post('refs')
  createRef(@Body() data: $RefPropertyData) {
    return data;
  }

  @Get()
  find(@Query() query: $OwnerSearchParams) {
    return query;
  }

  @Put()
  replace(@Body() data: $Owner) {
    return data;
  }
}

@Controller('trees')
class TreesController {
  @Post('forests')
  createForest(@Body() data: $Forest) {
    return data;
  }

  @Post()
  createTree(@Body() data: $TreeNode) {
    return data;
  }
}

@Controller('codes')
class CodesController {
  @Get()
  find() {
    return null;
  }

  @HttpCode(299)
  @Post()
  nonstandard() {
    return null;
  }

  @Delete()
  @HttpCode(204)
  remove() {
    return null;
  }
}

@Controller(['a', 'b'])
class MultiPathController {
  @All('any')
  any() {
    return null;
  }

  @Get(['x', 'y'])
  find() {
    return null;
  }
}

@Controller('versioned')
class VersionedController {
  @Get()
  find() {
    return null;
  }

  @Get('both')
  @Version(['1', '2'])
  findBoth() {
    return null;
  }

  @Get('two')
  @Version('2')
  findTwo() {
    return null;
  }
}

@Controller({ path: 'neutral', version: VERSION_NEUTRAL })
class NeutralController {
  @Get()
  find() {
    return null;
  }
}

@Controller({ path: 'three', version: '3' })
class ThreeController {
  @Get()
  find() {
    return null;
  }
}

@Controller('users')
class AdminUsersController {
  @Get(':id')
  find(@Param('id') id: string) {
    return id;
  }
}

@Module({ controllers: [AdminUsersController] })
class AdminModule {}

@Controller('broken')
class BrokenController {
  @Post()
  create(@Body() data: $Broken) {
    return data;
  }
}

@Controller('untyped')
class UntypedController {
  @Post(':id')
  create(@Body() data: $CreateCatData, @Param('id') id: number) {
    return { data, id };
  }
}

Reflect.deleteMetadata(PARAMTYPES_METADATA, UntypedController.prototype, 'create');

const apps: NestFastifyApplication[] = [];

async function createApp(
  metadata: ModuleMetadata,
  configure?: (app: NestFastifyApplication) => void
): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule(metadata).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), { logger: false });
  configure?.(app);
  apps.push(app);
  return app;
}

async function generate(controllers: Type[], configure?: (app: NestFastifyApplication) => void) {
  const app = await createApp({ controllers }, configure);
  return new DocsGenerator(app).generate();
}

function sortParameters(parameters: OpenApiParameter[] = []) {
  return [...parameters].sort((a, b) => `${a.in}:${a.name}`.localeCompare(`${b.in}:${b.name}`));
}

describe('DocsGenerator', () => {
  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
    vi.restoreAllMocks();
  });

  it('should document a zod schema as the request body', async () => {
    const { paths } = await generate([CatsController]);
    expect(paths['/cats']).toEqual({
      get: {
        operationId: 'CatsController_find',
        responses: { 200: { description: 'OK' } },
        tags: ['Cats']
      },
      post: {
        operationId: 'CatsController_create',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                properties: {
                  age: { type: 'integer' },
                  born: { format: 'date-time', type: 'string' },
                  kind: { enum: ['siamese', 'tabby'] },
                  name: { description: 'The name of the cat', type: 'string' },
                  nickname: { anyOf: [{ type: 'string' }, { type: 'null' }], default: null }
                },
                required: ['age', 'born', 'kind', 'name'],
                type: 'object'
              }
            }
          },
          required: true
        },
        responses: { 201: { description: 'Created' } },
        tags: ['Cats']
      }
    });
  });

  it('should document named body parameters as the properties of the request body', async () => {
    const { paths } = await generate([CatsController]);
    expect(paths['/cats/named']!.post!.requestBody!.content['application/json'].schema).toEqual({
      properties: { age: { type: 'number' }, name: { type: 'string' } },
      required: ['name'],
      type: 'object'
    });
  });

  it('should document unnamed zod parameters as one parameter per property', async () => {
    const { paths } = await generate([OwnerCatsController]);
    expect(sortParameters(paths['/owners/{ownerId}/cats/{catId}']!.get!.parameters)).toEqual([
      { in: 'header', name: 'x-api-key', required: true, schema: { type: 'string' } },
      { in: 'header', name: 'x-trace-id', required: false, schema: { type: 'string' } },
      { in: 'path', name: 'catId', required: true, schema: { type: 'string' } },
      { in: 'path', name: 'ownerId', required: true, schema: { type: 'string' } },
      { in: 'query', name: 'limit', required: false, schema: { type: 'number' } },
      { in: 'query', name: 'q', required: true, schema: { type: 'string' } }
    ]);
  });

  it('should document named parameters from their zod schema or primitive type', async () => {
    const { paths } = await generate([NamedController]);
    expect(sortParameters(paths['/named/{id}/{slug}']!.get!.parameters)).toEqual([
      { in: 'header', name: 'x-lang', required: false, schema: { type: 'string' } },
      { in: 'path', name: 'id', required: true, schema: { type: 'number' } },
      { in: 'path', name: 'slug', required: true, schema: { type: 'string' } },
      { in: 'query', name: 'filter', required: false, schema: {} },
      { in: 'query', name: 'flag', required: false, schema: { type: 'boolean' } },
      { in: 'query', name: 'name', required: false, schema: { type: 'string' } },
      { in: 'query', name: 'q', required: true, schema: { type: 'string' } },
      { in: 'query', name: 'sort', required: false, schema: { enum: ['asc', 'desc'] } }
    ]);
  });

  it('should document parameters that are not zod schemas as unknown, and skip custom decorators', async () => {
    const { paths } = await generate([LegacyController]);
    expect(paths['/legacy']).toEqual({
      post: {
        operationId: 'LegacyController_create',
        requestBody: { content: { 'application/json': { schema: {} } }, required: true },
        responses: { 201: { description: 'Created' } },
        tags: ['Legacy']
      }
    });
  });

  it('should document parameters as unknown if there is no design metadata', async () => {
    const { paths } = await generate([UntypedController]);
    expect(paths['/untyped/{id}']!.post).toMatchObject({
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
      requestBody: { content: { 'application/json': { schema: {} } } }
    });
  });

  it('should reference schemas with an id as shared components', async () => {
    const { components, paths } = await generate([OwnersController]);
    const getBodySchema = (path: string, method: string) => {
      return paths[path]![method]!.requestBody!.content['application/json'].schema;
    };
    expect(getBodySchema('/owners', 'post')).toEqual({ $ref: '#/components/schemas/Owner' });
    expect(getBodySchema('/owners', 'put')).toEqual({ $ref: '#/components/schemas/Owner' });
    expect(getBodySchema('/owners/cats', 'post')).toEqual({
      properties: { name: { type: 'string' }, owner: { $ref: '#/components/schemas/Owner' } },
      required: ['name', 'owner'],
      type: 'object'
    });
    expect(getBodySchema('/owners/refs', 'post')).toEqual({
      properties: { $ref: { type: 'string' } },
      required: ['$ref'],
      type: 'object'
    });
    expect(paths['/owners']!.get!.parameters).toEqual([
      { in: 'query', name: 'name', required: false, schema: { type: 'string' } }
    ]);
    expect(components.schemas).toEqual({
      Owner: { properties: { name: { type: 'string' } }, required: ['name'], type: 'object' },
      OwnerSearchParams: { properties: { name: { type: 'string' } }, type: 'object' }
    });
  });

  it('should give recursive schemas unique component names', async () => {
    const { components, paths } = await generate([TreesController]);
    const createTreeNode = (name: string) => ({
      properties: {
        children: { items: { $ref: `#/components/schemas/${name}` }, type: 'array' },
        parent: { $ref: `#/components/schemas/${name}` },
        value: { type: 'number' }
      },
      required: ['children', 'value'],
      type: 'object'
    });
    expect(paths['/trees/forests']!.post!.requestBody!.content['application/json'].schema).toEqual({
      properties: { tree: { $ref: '#/components/schemas/AnonymousSchema1' } },
      required: ['tree'],
      type: 'object'
    });
    expect(paths['/trees']!.post!.requestBody!.content['application/json'].schema).toEqual({
      $ref: '#/components/schemas/AnonymousSchema2'
    });
    expect(components.schemas).toEqual({
      AnonymousSchema1: createTreeNode('AnonymousSchema1'),
      AnonymousSchema2: createTreeNode('AnonymousSchema2')
    });
  });

  it('should use the status code set with @HttpCode', async () => {
    const { paths } = await generate([CodesController]);
    expect(paths['/codes']).toMatchObject({
      delete: { responses: { 204: { description: 'No Content' } } },
      get: { responses: { 200: { description: 'OK' } } },
      post: { responses: { 299: { description: '299' } } }
    });
  });

  it('should document every path of a route, and skip routes for every method', async () => {
    const { paths } = await generate([MultiPathController]);
    expect(Object.keys(paths)).toEqual(['/a/x', '/a/y', '/b/x', '/b/y']);
    expect(Object.values(paths).map(({ get }) => get!.operationId)).toEqual([
      'MultiPathController_find',
      'MultiPathController_find_2',
      'MultiPathController_find_3',
      'MultiPathController_find_4'
    ]);
  });

  it('should include the version in paths when versioning is enabled', async () => {
    const { paths } = await generate([VersionedController, NeutralController, ThreeController], (app) => {
      app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });
    });
    expect(Object.keys(paths)).toEqual([
      '/v1/versioned',
      '/v1/versioned/both',
      '/v2/versioned/both',
      '/v2/versioned/two',
      '/neutral',
      '/v3/three'
    ]);
  });

  it('should include the global prefix and module path', async () => {
    const app = await createApp(
      { imports: [AdminModule, RouterModule.register([{ module: AdminModule, path: 'admin' }])] },
      (app) => app.setGlobalPrefix('api')
    );
    const { paths } = new DocsGenerator(app).generate();
    expect(Object.keys(paths)).toEqual(['/api/admin/users/{id}']);
  });

  it('should log a warning and still document the route if its request cannot be documented', async () => {
    const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const { paths } = await generate([BrokenController]);
    expect(warn).toHaveBeenCalledWith(
      "Failed to document request for 'BrokenController.create': Error: Cannot convert schema"
    );
    expect(paths['/broken']).toEqual({
      post: {
        operationId: 'BrokenController_create',
        responses: { 201: { description: 'Created' } },
        tags: ['Broken']
      }
    });
  });

  it('should document exactly the routes that are registered with the router', async () => {
    const registered: string[] = [];
    const app = await createApp(
      {
        controllers: [
          CatsController,
          CodesController,
          LegacyController,
          MultiPathController,
          NamedController,
          NeutralController,
          OwnerCatsController,
          OwnersController,
          ThreeController,
          TreesController,
          VersionedController
        ],
        imports: [AdminModule, RouterModule.register([{ module: AdminModule, path: 'admin' }])]
      },
      (app) => {
        app.setGlobalPrefix('api');
        app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });
        app
          .getHttpAdapter()
          .getInstance()
          .addHook('onRoute', ({ method, url }) => {
            // fastify adds a HEAD route for every GET route, and routes for every method (@All) are not documented
            if (typeof method === 'string' && method !== 'HEAD') {
              registered.push(`${method} ${url.replace(/:(\w+)/g, '{$1}')}`);
            }
          });
      }
    );
    const { paths } = new DocsGenerator(app).generate();
    await app.init();
    const documented = Object.entries(paths).flatMap(([path, operations]) => {
      return Object.keys(operations).map((method) => `${method.toUpperCase()} ${path}`);
    });
    expect([...documented].sort()).toEqual([...registered].sort());
    expect(documented).toHaveLength(27);
  });
});
