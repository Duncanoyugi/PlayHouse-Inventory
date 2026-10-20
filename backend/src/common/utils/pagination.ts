import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants';

export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

/** Clamp untrusted page / limit values into a safe range. */
export function normalizePagination(page?: unknown, limit?: unknown): PageParams {
  const p = Math.floor(Number(page));
  const l = Math.floor(Number(limit));
  const safePage = Number.isFinite(p) && p >= 1 ? p : 1;
  const safeLimit =
    Number.isFinite(l) && l >= 1 ? Math.min(l, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export function buildPage<T>(items: T[], total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page * limit < total,
    hasPrevious: page > 1,
  };
}

/** Build a createdAt range filter from optional ISO date strings. */
export function dateRange(fromDate?: string, toDate?: string) {
  if (!fromDate && !toDate) return undefined;
  const range: { gte?: Date; lte?: Date } = {};
  if (fromDate) range.gte = new Date(fromDate);
  if (toDate) {
    const end = new Date(toDate);
    // A bare date (YYYY-MM-DD) should include the whole day.
    if (/^\d{4}-\d{2}-\d{2}$/.test(toDate)) end.setUTCHours(23, 59, 59, 999);
    range.lte = end;
  }
  return range;
}
