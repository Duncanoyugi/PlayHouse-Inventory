import { buildPage, dateRange, normalizePagination } from './pagination';
import { monthPrefix, nextSequence } from './transaction';

describe('pagination helpers', () => {
  it('clamps junk and oversized values', () => {
    expect(normalizePagination('abc', '-4')).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(normalizePagination(3, 9999)).toEqual({ page: 3, limit: 100, skip: 200 });
  });
  it('builds page metadata', () => {
    expect(buildPage([1], 45, 2, 20)).toMatchObject({ totalPages: 3, hasNext: true, hasPrevious: true });
    expect(buildPage([], 0, 1, 20)).toMatchObject({ totalPages: 1, hasNext: false });
  });
  it('treats a bare toDate as end of day', () => {
    const range = dateRange('2026-10-01', '2026-10-17')!;
    expect(range.lte!.toISOString()).toBe('2026-10-17T23:59:59.999Z');
    expect(dateRange()).toBeUndefined();
  });
  it('derives the next document number from the last one', () => {
    expect(nextSequence(undefined)).toBe(1);
    expect(nextSequence('PO-2026-10-0009')).toBe(10);
    expect(monthPrefix('PO', new Date(2026, 9, 1))).toBe('PO-2026-10-');
  });
});
