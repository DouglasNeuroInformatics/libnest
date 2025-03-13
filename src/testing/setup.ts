import * as path from 'node:path';

import { vi } from 'vitest';

import 'reflect-metadata';

process.loadEnvFile(path.resolve(import.meta.dirname, '../../.env.example'));

vi.mock('@prisma/client', () => import('./mocks/prisma.module.mock.js'));
