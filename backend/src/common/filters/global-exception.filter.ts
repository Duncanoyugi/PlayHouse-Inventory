import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let error = 'InternalServerError';
    let details: string[] | undefined;
    let code: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse() as any;
      const raw = typeof body === 'string' ? body : (body?.message ?? exception.message);
      if (Array.isArray(raw)) {
        details = raw.map(String);
        message = details[0] ?? 'Validation failed';
      } else {
        message = String(raw);
      }
      error = (typeof body === 'object' && body?.error) || exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      code = exception.code;
      switch (exception.code) {
        case 'P2002': {
          statusCode = HttpStatus.CONFLICT;
          const rawTarget = exception.meta?.target;
          const target = Array.isArray(rawTarget) ? rawTarget.join(', ') : String(rawTarget ?? 'value');
          message = `A record with this ${target} already exists`;
          error = 'Conflict';
          break;
        }
        case 'P2003':
          statusCode = HttpStatus.CONFLICT;
          message = 'This record is referenced by other data and cannot be changed or removed';
          error = 'Conflict';
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'NotFound';
          break;
        case 'P2034':
          statusCode = HttpStatus.CONFLICT;
          message = 'The system is busy processing a conflicting update. Please try again';
          error = 'Conflict';
          break;
        default:
          this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
          message = 'A database error occurred';
          error = 'DatabaseError';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Invalid data supplied';
      error = 'BadRequest';
      this.logger.warn(exception.message);
    } else {
      this.logger.error(
        exception instanceof Error ? (exception.stack ?? exception.message) : String(exception),
      );
    }

    return response.status(statusCode).json({
      success: false,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
      ...(details && details.length > 1 ? { details } : {}),
      ...(code ? { code } : {}),
    });
  }
}
