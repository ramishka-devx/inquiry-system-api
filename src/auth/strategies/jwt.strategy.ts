// src/auth/strategies/jwt.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  async validate(payload: { id: number }) {
    try {
      const user = await this.usersService.findOneWithPermissions(payload.id);
      return {
        id: user.id,
        email: user.email,
        permissions: user.permissions,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
