import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import {
  JwtPayload,
  AuthenticatedUser,
} from '../../common/interfaces/auth.interface';
import { UserService } from '../user/user.service';
import { ENV } from 'src/utils/config/env.enum';
import { SERVER_COOKIE_NAME } from 'src/utils/config/constants.config';
import { User } from '@prisma/client';
import { DataFormatter } from 'src/utils/helpers/data-formatter';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract JWT from Cookie
        JwtStrategy.extractJWTFromCookie,
        // Extract JWT from Authorization Header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ENV.JWT_SECRET)!,
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (
      req.cookies &&
      SERVER_COOKIE_NAME in req.cookies &&
      req.cookies[SERVER_COOKIE_NAME].length > 0
    ) {
      return req.cookies[SERVER_COOKIE_NAME];
    }
    return null;
  }

  async validate(payload: JwtPayload): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }
}
