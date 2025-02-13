/**
 * This module provides a global service for reading environment variables and defines the
 * base Zod runtime schema required by all libnest applications at runtime.
 * @module config
 */

export { $BaseRuntimeConfig } from './config.schema.js';
export type { BaseRuntimeConfig } from './config.schema.js';
export { ConfigService } from './config.service.js';
