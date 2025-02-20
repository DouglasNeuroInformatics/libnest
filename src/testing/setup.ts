import * as path from 'node:path';

import 'reflect-metadata';

process.loadEnvFile(path.resolve(import.meta.dirname, '../../.env.example'));
