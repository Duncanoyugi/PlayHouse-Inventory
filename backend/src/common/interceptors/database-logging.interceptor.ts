import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class DatabaseLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('DatabaseQuery');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        // Only log if query took more than 100ms
        if (duration > 100) {
          this.logger.warn(`⚠️ Slow operation: ${method} ${url} - ${duration}ms`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        this.logger.error(`❌ Failed operation: ${method} ${url} - ${duration}ms`);
        this.logger.error(error.message);
        throw error;
      }),
    );
  }
}