import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((payload: any) => ({
        success: true,
        data: payload,
        message:
          payload && typeof payload === 'object' && typeof payload.message === 'string'
            ? payload.message
            : 'Operation successful',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
