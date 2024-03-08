import type { Request } from 'express';

// This should be augmented in the implementation
// See https://stackoverflow.com/questions/66312048/cant-override-express-request-user-type-but-i-can-add-new-properties-to-reques
export type AppRequest = Request & {
  user: Record<string, unknown>;
};
