import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "../enums/role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException("User not authenticated");

    // Super admin bypass
    const userRole = (user.role || (Array.isArray(user.roles) ? user.roles[0] : "") || "").toLowerCase();
    if (userRole === "super_admin") return true;

    const hasRole = requiredRoles.some((role) => {
      const targetRole = String(role).toLowerCase();
      if (userRole === targetRole) return true;
      if (Array.isArray(user.roles)) {
        return user.roles.some((r: string) => String(r).toLowerCase() === targetRole);
      }
      return false;
    });

    if (!hasRole) {
      throw new ForbiddenException("Insufficient permissions for this resource");
    }

    return true;
  }
}
