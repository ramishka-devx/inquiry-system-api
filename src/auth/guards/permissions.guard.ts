// src/auth/guards/permissions.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
  
  @Injectable()
  export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()]
      );
  
      if (!requiredPermissions) return true;
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      const userPermissions: string[] = user.permissions || [];
 
      const hasPermission = requiredPermissions.every(p =>
        userPermissions.includes(p)
      );
  
      if (!hasPermission) {
        throw new ForbiddenException('You do not have permission');
      }
  
      return true;
    }
  }