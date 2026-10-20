import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

const SLOW_REQUEST_MS = 1000;

/**
 * Logs slow requests and genuine server faults. Client errors (4xx: validation,
 * wrong password, forbidden...) are expected traffic and are not logged as errors.
 */
@Injectable()
export class DatabaseLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Http');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { method, url } = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        if (duration > SLOW_REQUEST_MS) {
          this.logger.warn(`Slow request: ${method} ${url} took ${duration}ms`);
        }
      }),
      catchError((error) => {
        const isClientError = error instanceof HttpException && error.getStatus() < 500;
        if (!isClientError) {
          this.logger.error(`Failed request: ${method} ${url} after ${Date.now() - start}ms - ${error?.message}`);
        }
        throw error;
      }),
    );
  }
}
