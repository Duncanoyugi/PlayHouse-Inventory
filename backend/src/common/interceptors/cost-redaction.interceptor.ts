import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { COST_SENSITIVE_KEYS, ROLE } from '../constants';

const SENSITIVE = new Set<string>(COST_SENSITIVE_KEYS);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Recursively copies a payload without the cost / valuation fields. */
export function stripCostFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripCostFields);
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (!SENSITIVE.has(key)) out[key] = stripCostFields(val);
    }
    return out;
  }
  return value;
}

/**
 * Storekeepers record stock movements; they have no business seeing purchase
 * costs or valuations. Enforced server-side so it cannot be bypassed from the UI.
 */
@Injectable()
export class CostRedactionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const role = context.switchToHttp().getRequest()?.user?.role;
    if (role !== ROLE.STOREKEEPER) return next.handle();
    return next.handle().pipe(map(stripCostFields));
  }
}
