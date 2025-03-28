export type { ConditionalImport, ImportedModule } from './app/app.base.js';
export { AppFactory } from './app/app.factory.js';
export { CurrentUser } from './decorators/current-user.decorator.js';
export { RouteAccess } from './decorators/route-access.decorator.js';
export type {
  ProtectedRouteAccess,
  ProtectedRoutePermissionSet,
  PublicRouteAccess,
  RouteAccessType
} from './decorators/route-access.decorator.js';
export { ValidationSchema } from './decorators/validation-schema.decorator.js';
export type { AppVersion, DocsConfig } from './docs/docs.factory.js';
export { DataTransferObject } from './mixins/data-transfer-object.mixin.js';
export type {
  AppAbility,
  AppAction,
  AppSubjectName,
  AuthModuleOptions,
  BaseLoginCredentials,
  BaseLoginCredentialsSchema,
  UserQuery,
  UserQueryResult
} from './modules/auth/auth.config.js';
export { AuthModule } from './modules/auth/auth.module.js';
export { ConfigService } from './modules/config/config.service.js';
export type { CryptoOptions } from './modules/crypto/crypto.config.js';
export { CryptoService } from './modules/crypto/crypto.service.js';
export type { LoggingOptions } from './modules/logging/logging.config.js';
export { LoggingService } from './modules/logging/logging.service.js';
export type { MailModuleOptions } from './modules/mail/mail.config.js';
export { MailModule } from './modules/mail/mail.module.js';
export { MailService } from './modules/mail/mail.service.js';
export type { PrismaModuleOptions } from './modules/prisma/prisma.config.js';
export { InjectModel, InjectPrismaClient } from './modules/prisma/prisma.decorators.js';
export type { ExtendedPrismaClient } from './modules/prisma/prisma.factory.js';
export { PrismaService } from './modules/prisma/prisma.service.js';
export type { Model, PrismaModelName } from './modules/prisma/prisma.types.js';
export { accessibleQuery, getModelToken } from './modules/prisma/prisma.utils.js';
export type { VirtualizationModuleOptions } from './modules/virtualization/virtualization.config.js';
export { VirtualizationModule } from './modules/virtualization/virtualization.module.js';
export { VirtualizationService } from './modules/virtualization/virtualization.service.js';
export { ParseSchemaPipe } from './pipes/parse-schema.pipe.js';
export { $BaseEnv } from './schemas/env.schema.js';
export type { BaseEnv } from './schemas/env.schema.js';
export type { BaseEnvSchema } from './utils/env.utils.js';
