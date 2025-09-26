import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export function JwtAuthGuardFactory(breakExecution: boolean = true) {
  @Injectable()
  class JwtAuthGuardMixin extends AuthGuard('jwt') implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
      if ((err || !user) && breakExecution) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      // If breakExecution is false, just return null for user
      return user || null;
    }
  }
  return mixin(JwtAuthGuardMixin);
}

// Default export for backward compatibility
export const JwtAuthGuard = JwtAuthGuardFactory();
