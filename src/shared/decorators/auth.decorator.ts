import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { Role } from '../enums';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

export function Auth(...roles: Role[]) {
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
