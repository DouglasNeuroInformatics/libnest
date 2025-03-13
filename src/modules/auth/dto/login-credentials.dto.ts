import type { BaseLoginCredentials } from '../auth.config.js';

export class LoginCredentialsDto implements BaseLoginCredentials {
  [key: string]: any;
  password: string;
}
