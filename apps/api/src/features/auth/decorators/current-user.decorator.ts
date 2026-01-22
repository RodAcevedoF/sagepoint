import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '@/features/auth/domain/request-user';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
