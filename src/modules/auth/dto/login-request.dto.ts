import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

import { ValidationSchema } from '../../../decorators/validation-schema.decorator.js';

@ValidationSchema({
  password: z.string().min(1),
  username: z.string().min(1)
})
export class LoginRequestDto {
  @ApiProperty({ example: 'password' })
  password: string;

  @ApiProperty({ example: 'admin' })
  username: string;
}
