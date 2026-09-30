import * as http from 'node:http';

import { Logger, RequestMethod } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import {
  HTTP_CODE_METADATA,
  MODULE_PATH,
  PARAMTYPES_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
  VERSION_METADATA
} from '@nestjs/common/constants.js';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum.js';
import type { VersionValue } from '@nestjs/common/interfaces/version-options.interface.js';
import { addLeadingSlash } from '@nestjs/common/utils/shared.utils.js';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import type { ApplicationConfig } from '@nestjs/core';
import { PathsExplorer } from '@nestjs/core/router/paths-explorer.js';
import { RoutePathFactory } from '@nestjs/core/router/route-path-factory.js';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { z } from 'zod/v4';

import { API_OPERATION_METADATA_KEY } from '../decorators/api-operation.decorator.js';

import type { ApiOperationOptions } from '../decorators/api-operation.decorator.js';

type JsonSchema = { [key: string]: unknown };

type OpenApiParameter = {
  in: 'header' | 'path' | 'query';
  name: string;
  required: boolean;
  schema: JsonSchema;
};

type OpenApiOperation = ApiOperationOptions & {
  operationId: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    content: { 'application/json': { schema: JsonSchema } };
    required: true;
  };
  responses: { [status: string]: { description: string } };
  tags: string[];
};

type OpenApiPaths = { [path: string]: { [method: string]: OpenApiOperation } };

type RouteDefinition = ReturnType<PathsExplorer['scanForPaths']>[number];

const REF_PREFIX = '#/components/schemas/';

const OPENAPI_METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put']);

const PARAMETER_LOCATIONS: { [K in RouteParamtypes]?: OpenApiParameter['in'] } = {
  [RouteParamtypes.HEADERS]: 'header',
  [RouteParamtypes.PARAM]: 'path',
  [RouteParamtypes.QUERY]: 'query'
};

/**
 * Generates the paths and component schemas of an OpenAPI 3.1 document from the routes registered in
 * a Nest application. Parameters typed as Zod schemas are documented from those schemas, while all
 * other types are documented as unknown (other than primitives for named parameters).
 */
export class DocsGenerator {
  private anonymousSchemaCount = 0;
  private readonly components: { [name: string]: JsonSchema } = {};
  private readonly config: ApplicationConfig;
  private readonly logger = new Logger(DocsGenerator.name);
  private readonly operationIds = new Set<string>();
  private readonly paths: OpenApiPaths = {};
  private readonly pathsExplorer = new PathsExplorer(new MetadataScanner());
  private readonly routePathFactory: RoutePathFactory;

  constructor(private readonly app: NestFastifyApplication) {
    // the application config is not public, but this is what @nestjs/swagger reads as well
    this.config = (app as unknown as { config: ApplicationConfig }).config;
    this.routePathFactory = new RoutePathFactory(this.config);
  }

  generate(): { components: { schemas: { [name: string]: JsonSchema } }; paths: OpenApiPaths } {
    const modulesContainer = this.app.get(ModulesContainer);
    for (const module of modulesContainer.values()) {
      const modulePath = Reflect.getMetadata(MODULE_PATH + modulesContainer.applicationId, module.metatype) as
        | string
        | undefined;
      for (const { metatype } of module.controllers.values()) {
        this.addController(metatype as Type, modulePath);
      }
    }
    return { components: { schemas: this.components }, paths: this.paths };
  }

  /** This mirrors how the Nest router resolves the paths it registers (see RoutesResolver and RouterExplorer) */
  private addController(controller: Type, modulePath: string | undefined): void {
    const versioningOptions = this.config.getVersioning();
    const globalPrefix = addLeadingSlash(this.config.getGlobalPrefix());
    const controllerVersion =
      versioningOptions &&
      ((Reflect.getMetadata(VERSION_METADATA, controller) as undefined | VersionValue) ??
        versioningOptions.defaultVersion);
    const controllerPaths = [Reflect.getMetadata(PATH_METADATA, controller) as string | string[]].flat();
    const prototype = controller.prototype as object;
    for (const ctrlPath of controllerPaths.map(addLeadingSlash)) {
      for (const route of this.pathsExplorer.scanForPaths(prototype, prototype)) {
        for (const methodPath of route.path) {
          const paths = this.routePathFactory.create(
            {
              controllerVersion,
              ctrlPath,
              globalPrefix,
              methodPath,
              methodVersion: route.version,
              modulePath,
              versioningOptions
            },
            route.requestMethod
          );
          paths.forEach((path) => this.addOperation(controller, route, path));
        }
      }
    }
  }

  private addOperation(controller: Type, { methodName, requestMethod }: RouteDefinition, routePath: string): void {
    const method = RequestMethod[requestMethod].toLowerCase();
    // routes registered for every method, such as @All(), cannot be represented in OpenAPI
    if (!OPENAPI_METHODS.has(method)) {
      return;
    }
    const path = routePath.replace(/:(\w+)(\([^)]*\))?\??/g, '{$1}');
    const handler = (controller.prototype as { [key: string]: object })[methodName]!;
    const operation: OpenApiOperation = {
      ...(Reflect.getMetadata(API_OPERATION_METADATA_KEY, handler) as ApiOperationOptions | undefined),
      operationId: this.createOperationId(`${controller.name}_${methodName}`),
      responses: this.getResponses(controller, methodName, requestMethod),
      tags: [controller.name.replace(/Controller$/, '')]
    };
    try {
      const { parameters, requestBody } = this.getRequest(controller, methodName, path);
      if (parameters.length) {
        operation.parameters = parameters;
      }
      if (requestBody) {
        operation.requestBody = requestBody;
      }
    } catch (err) {
      this.logger.warn(`Failed to document request for '${controller.name}.${methodName}': ${String(err)}`);
    }
    (this.paths[path] ??= {})[method] = operation;
  }

  private convertSchema(schema: z.ZodType): JsonSchema {
    const root = z.toJSONSchema(schema, {
      io: 'input',
      override: ({ jsonSchema, zodSchema }) => {
        // JSON has no dates, so these can only be sent as strings
        if (zodSchema._zod.def.type === 'date') {
          Object.assign(jsonSchema, { format: 'date-time', type: 'string' });
        }
        // zod adds the bounds of safe integers to integers, which is just noise in the docs
        if (jsonSchema.minimum === Number.MIN_SAFE_INTEGER) {
          delete jsonSchema.minimum;
        }
        if (jsonSchema.maximum === Number.MAX_SAFE_INTEGER) {
          delete jsonSchema.maximum;
        }
      },
      unrepresentable: 'any'
    }) as JsonSchema;
    const defs = (root.$defs ?? {}) as { [key: string]: JsonSchema };
    delete root.$defs;
    delete root.$schema;

    // defs with an id from `.meta({ id })` are shared components, while the ones zod names itself
    // (e.g., to break cycles) are only unique within this schema, so they are renamed to avoid collisions
    const names = new Map(
      Object.keys(defs).map((key) => [key, key.startsWith('__schema') ? this.createAnonymousSchemaName() : key])
    );
    let rootName = typeof root.id === 'string' ? root.id : undefined;
    const resolveRef = (ref: string): string => {
      // a schema that references itself uses the root of the document
      if (ref === '#') {
        return REF_PREFIX + (rootName ??= this.createAnonymousSchemaName());
      }
      return REF_PREFIX + names.get(ref.slice('#/$defs/'.length))!;
    };
    const rewriteRefs = (value: unknown): unknown => {
      if (Array.isArray(value)) {
        return value.map(rewriteRefs);
      } else if (typeof value !== 'object' || value === null) {
        return value;
      }
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => {
          return [key, key === '$ref' && typeof child === 'string' ? resolveRef(child) : rewriteRefs(child)];
        })
      );
    };

    for (const [key, def] of Object.entries(defs)) {
      delete def.id;
      this.components[names.get(key)!] ??= rewriteRefs(def) as JsonSchema;
    }
    delete root.id;
    const rewrittenRoot = rewriteRefs(root) as JsonSchema;
    if (!rootName) {
      return rewrittenRoot;
    }
    this.components[rootName] ??= rewrittenRoot;
    return { $ref: REF_PREFIX + rootName };
  }

  private createAnonymousSchemaName(): string {
    return `AnonymousSchema${++this.anonymousSchemaCount}`;
  }

  private createOperationId(name: string): string {
    let operationId = name;
    for (let i = 2; this.operationIds.has(operationId); i++) {
      operationId = `${name}_${i}`;
    }
    this.operationIds.add(operationId);
    return operationId;
  }

  private getParameterSchema(type: unknown, location?: OpenApiParameter['in']): JsonSchema {
    if (type instanceof z.ZodType) {
      return this.convertSchema(type);
    } else if (type === Number) {
      return { type: 'number' };
    } else if (type === Boolean) {
      return { type: 'boolean' };
    } else if (type === String || location === 'path') {
      return { type: 'string' };
    }
    return {};
  }

  private getParametersFromSchema(schema: z.ZodType, location: OpenApiParameter['in']): OpenApiParameter[] {
    let jsonSchema = this.convertSchema(schema);
    if (typeof jsonSchema.$ref === 'string') {
      jsonSchema = this.components[jsonSchema.$ref.slice(REF_PREFIX.length)]!;
    }
    const { properties = {}, required = [] } = jsonSchema as {
      properties?: { [name: string]: JsonSchema };
      required?: string[];
    };
    return Object.entries(properties).map(([name, propertySchema]) => ({
      in: location,
      name,
      required: location === 'path' || required.includes(name),
      schema: propertySchema
    }));
  }

  private getRequest(
    controller: Type,
    methodName: string,
    path: string
  ): { parameters: OpenApiParameter[]; requestBody?: OpenApiOperation['requestBody'] } {
    const routeArgs = (Reflect.getMetadata(ROUTE_ARGS_METADATA, controller, methodName) ?? {}) as {
      [key: string]: { data?: unknown; index: number };
    };
    const paramTypes = Reflect.getMetadata(PARAMTYPES_METADATA, controller.prototype as object, methodName) as
      | undefined
      | unknown[];

    const parameters: OpenApiParameter[] = [];
    const bodyProperties: { [name: string]: JsonSchema } = {};
    const requiredBodyProperties: string[] = [];
    let body: JsonSchema | undefined;

    // keys are formatted as `${paramtype}:${index}`, where the paramtype of a custom decorator is not a number
    for (const [key, { data, index }] of Object.entries(routeArgs)) {
      const paramtype: RouteParamtypes = Number(key.split(':')[0]);
      const type = paramTypes?.[index];
      const name = typeof data === 'string' ? data : undefined;
      const isRequired = type instanceof z.ZodType && type._zod.optin !== 'optional';
      if (paramtype === RouteParamtypes.BODY) {
        if (!name) {
          body = this.getParameterSchema(type);
          continue;
        }
        bodyProperties[name] = this.getParameterSchema(type);
        if (isRequired) {
          requiredBodyProperties.push(name);
        }
        continue;
      }
      const location = PARAMETER_LOCATIONS[paramtype];
      if (!location) {
        continue;
      } else if (name) {
        parameters.push({
          in: location,
          name,
          required: location === 'path' || isRequired,
          schema: this.getParameterSchema(type, location)
        });
      } else if (type instanceof z.ZodType) {
        parameters.push(...this.getParametersFromSchema(type, location));
      }
    }

    // OpenAPI requires every parameter in the path to be declared
    for (const [, name] of path.matchAll(/{(\w+)}/g)) {
      if (!parameters.some((parameter) => parameter.in === 'path' && parameter.name === name)) {
        parameters.push({ in: 'path', name: name!, required: true, schema: { type: 'string' } });
      }
    }

    if (!body && Object.keys(bodyProperties).length) {
      body = { properties: bodyProperties, required: requiredBodyProperties, type: 'object' };
    }
    return {
      parameters,
      requestBody: body && { content: { 'application/json': { schema: body } }, required: true }
    };
  }

  private getResponses(
    controller: Type,
    methodName: string,
    requestMethod: RequestMethod
  ): OpenApiOperation['responses'] {
    const handler = (controller.prototype as { [key: string]: unknown })[methodName] as object;
    const status = (Reflect.getMetadata(HTTP_CODE_METADATA, handler) ??
      (requestMethod === RequestMethod.POST ? 201 : 200)) as number;
    return {
      [status]: { description: http.STATUS_CODES[status] ?? String(status) }
    };
  }
}

export type { JsonSchema, OpenApiOperation, OpenApiParameter, OpenApiPaths };
