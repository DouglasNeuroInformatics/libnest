import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '../../config/config.service.js';
import { AbilityFactory } from '../ability.factory.js';

import type { AppAbility, JwtPayload } from '../auth.config.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly abilityFactory: AbilityFactory
  ) {
    super({
      ignoreExpiration: configService.getOrThrow('NODE_ENV') === 'development',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('SECRET_KEY')
    });
  }

  validate(payload: JwtPayload): { ability: AppAbility } {
    const ability = this.abilityFactory.createForPermissions(payload.permissions);
    return { ability, ...payload };
  }
}
