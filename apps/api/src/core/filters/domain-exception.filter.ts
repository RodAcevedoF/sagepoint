import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UserAlreadyExistsError } from '@/features/auth/app/usecases/register.usecase';
import {
  InvalidVerificationTokenError,
  UserNotFoundError,
} from '@/features/auth/app/usecases/verify-email.usecase';
import { EmailNotVerifiedError } from '@/features/auth/app/usecases/validate-user.usecase';
import { InvalidRefreshTokenError } from '@/features/auth/app/usecases/refresh-token.usecase';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(DomainExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // Domain Error Mappings
    if (exception instanceof UserAlreadyExistsError) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: 'Conflict',
      });
    }

    if (
      exception instanceof InvalidVerificationTokenError ||
      exception instanceof UserNotFoundError ||
      exception instanceof EmailNotVerifiedError ||
      exception instanceof InvalidRefreshTokenError
    ) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message,
        error: 'Unauthorized',
      });
    }

    // Default 500
    this.logger.error({ err: exception }, 'Unhandled exception');
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
