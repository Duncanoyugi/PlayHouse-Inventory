import { of, lastValueFrom } from 'rxjs';
import { CostRedactionInterceptor, stripCostFields } from './cost-redaction.interceptor';

const run = (role: string, payload: unknown) => {
  const ctx: any = { switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }) };
  return lastValueFrom(new CostRedactionInterceptor().intercept(ctx, { handle: () => of(payload) } as any));
};

describe('CostRedactionInterceptor', () => {
  const payload = {
    items: [{ id: 1, name: 'Charger', costPrice: '120.00', product: { sku: 'A', unitCost: 5 }, when: new Date(0) }],
    summary: { totalValue: 1000, totalUnits: 4 },
  };

  it('strips cost and valuation fields (deeply) for storekeepers', async () => {
    const out: any = await run('STOREKEEPER', payload);
    expect(out.items[0]).not.toHaveProperty('costPrice');
    expect(out.items[0].product).not.toHaveProperty('unitCost');
    expect(out.summary).toEqual({ totalUnits: 4 });
    expect(out.items[0].when).toBeInstanceOf(Date);
    expect(out.items[0].name).toBe('Charger');
  });

  it('leaves managers untouched', async () => {
    expect(await run('ADMIN', payload)).toBe(payload);
  });

  it('does not mutate the original object', () => {
    stripCostFields(payload);
    expect(payload.summary.totalValue).toBe(1000);
  });
});
