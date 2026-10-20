import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, ERROR_MESSAGES, PUBLIC_KEY } from '../constants';

/**
 * Role based access control. Registered globally (after JwtAuthGuard).
 *
 * Every non-public route MUST declare its allowed roles with @Roles(...). A route
 * without @Roles is rejected (default deny) so a forgotten decorator can never
 * silently expose an endpoint.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, targets)) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, targets);
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN);
    }

    return true;
  }
}
