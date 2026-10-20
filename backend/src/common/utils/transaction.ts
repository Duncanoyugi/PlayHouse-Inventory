import { Prisma, PrismaClient } from '@prisma/client';

const RETRYABLE_CODES = new Set([
  'P2002', // unique constraint (concurrent create of the same balance / document number)
  'P2034', // write conflict / deadlock
]);

export interface TxOptions {
  attempts?: number;
  timeout?: number;
  maxWait?: number;
}

/**
 * Runs an interactive transaction and transparently retries it when it fails
 * because of a concurrent writer (unique race, deadlock, serialization failure).
 * Business errors (HttpException etc.) are never retried.
 */
export async function runInTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TxOptions = {},
): Promise<T> {
  const { attempts = 3, timeout = 20_000, maxWait = 10_000 } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await prisma.$transaction(fn, { timeout, maxWait });
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        RETRYABLE_CODES.has(error.code);
      if (!retryable || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25 * attempt));
    }
  }
  throw lastError;
}

/** Next sequential document number such as PO-2026-10-0007 for a given prefix. */
export function nextSequence(lastNumber: string | null | undefined): number {
  if (!lastNumber) return 1;
  const parsed = parseInt(lastNumber.split('-').pop() ?? '0', 10);
  return Number.isFinite(parsed) ? parsed + 1 : 1;
}

export function monthPrefix(code: string, date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${code}-${date.getFullYear()}-${month}-`;
}
