import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { vi } from 'vitest';
import { ROLES_KEY, PUBLIC_KEY } from '../constants';
import { AppController } from '../../app.controller';
import { AuthController } from '../../auth/auth.controller';
import { UsersController } from '../../users/users.controller';
import { ProductsController } from '../../products/products.controller';
import { CategoriesController } from '../../categories/categories.controller';
import { BrandsController } from '../../brands/brands.controller';
import { LocationsController } from '../../locations/locations.controller';
import { SuppliersController } from '../../suppliers/suppliers.controller';
import { InventoryController } from '../../inventory/inventory.controller';
import { StockMovementsController } from '../../stock-movements/stock-movements.controller';
import { PurchaseOrdersController } from '../../purchase-orders/purchase-orders.controller';
import { GoodsReceiptsController } from '../../goods-receipts/goods-receipts.controller';
import { ReportsController } from '../../reports/reports.controller';
import { AuditController } from '../../audit/audit.controller';
import { RolesGuard } from './roles.guard';

const CONTROLLERS = [
  AppController, AuthController, UsersController, ProductsController, CategoriesController,
  BrandsController, LocationsController, SuppliersController, InventoryController,
  StockMovementsController, PurchaseOrdersController, GoodsReceiptsController,
  ReportsController, AuditController,
];

interface Route { key: string; roles: string[] | undefined; isPublic: boolean }

function collectRoutes(): Route[] {
  const routes: Route[] = [];
  for (const controller of CONTROLLERS) {
    const base: string = Reflect.getMetadata('path', controller) ?? '';
    for (const name of Object.getOwnPropertyNames(controller.prototype)) {
      const handler = (controller.prototype as any)[name];
      if (typeof handler !== 'function' || name === 'constructor') continue;
      const method = Reflect.getMetadata('method', handler);
      if (method === undefined) continue;
      const path = Reflect.getMetadata('path', handler);
      const roles = Reflect.getMetadata(ROLES_KEY, handler) ?? Reflect.getMetadata(ROLES_KEY, controller);
      const isPublic = Boolean(Reflect.getMetadata(PUBLIC_KEY, handler) ?? Reflect.getMetadata(PUBLIC_KEY, controller));
      routes.push({
        key: `${RequestMethod[method]} ${('/' + base + '/' + path).replace(/\/+/g, '/').replace(/(.)\/$/, '$1')}`,
        roles,
        isPublic,
      });
    }
  }
  return routes;
}

describe('RBAC matrix', () => {
  const routes = collectRoutes();

  it('discovers the API surface', () => {
    expect(routes.length).toBeGreaterThan(50);
  });

  it('every non-public route declares its roles explicitly (default deny)', () => {
    const undeclared = routes.filter((r) => !r.isPublic && (!r.roles || r.roles.length === 0));
    expect(undeclared.map((r) => r.key)).toEqual([]);
  });

  it('only login and the health checks are public', () => {
    const publicRoutes = routes.filter((r) => r.isPublic).map((r) => r.key).sort();
    expect(publicRoutes).toEqual(['GET /', 'GET /health', 'POST /auth/login'].sort());
  });

  it('a storekeeper may only record incoming/outgoing stock and read operational data', () => {
    const keeperRoutes = routes
      .filter((r) => !r.isPublic && r.roles?.includes('STOREKEEPER'))
      .map((r) => r.key)
      .sort();

    expect(keeperRoutes).toEqual(
      [
        // session
        'GET /auth/me', 'POST /auth/logout', 'POST /auth/refresh', 'POST /auth/change-password',
        // incoming / outgoing
        'POST /inventory/stock-in', 'POST /inventory/stock-out', 'POST /goods-receipts',
        // read-only reference data needed to record movements
        'GET /products', 'GET /products/:id', 'GET /products/sku/:sku',
        'GET /categories', 'GET /categories/:id', 'GET /brands', 'GET /brands/:id',
        'GET /locations', 'GET /locations/:id',
        'GET /inventory', 'GET /inventory/low-stock', 'GET /inventory/location/:locationId', 'GET /inventory/:productId',
        'GET /stock-movements', 'GET /stock-movements/product/:productId', 'GET /stock-movements/location/:locationId', 'GET /stock-movements/:id',
        'GET /purchase-orders', 'GET /purchase-orders/:id',
        'GET /goods-receipts', 'GET /goods-receipts/purchase-order/:purchaseOrderId', 'GET /goods-receipts/:id',
      ].sort(),
    );
  });

  it('every mutating route other than stock-in/out and receiving is manager-only', () => {
    const allowedForKeeper = new Set([
      'POST /inventory/stock-in', 'POST /inventory/stock-out', 'POST /goods-receipts',
      'POST /auth/logout', 'POST /auth/refresh', 'POST /auth/change-password', 'POST /auth/login',
    ]);
    const leaks = routes.filter(
      (r) => !r.isPublic && !r.key.startsWith('GET ') && !allowedForKeeper.has(r.key) && r.roles?.includes('STOREKEEPER'),
    );
    expect(leaks.map((r) => r.key)).toEqual([]);
  });

  it('suppliers, users, reports and audit are never visible to storekeepers', () => {
    const blocked = routes.filter((r) => /^(GET|POST|PATCH|DELETE) \/(suppliers|users|reports|audit)/.test(r.key));
    expect(blocked.length).toBeGreaterThan(10);
    for (const r of blocked) expect(r.roles).toEqual(['ADMIN']);
  });
});

describe('RolesGuard', () => {
  const guardFor = (roles: string[] | undefined, isPublic = false) => {
    const reflector: any = {
      getAllAndOverride: vi.fn((key: string) => (key === PUBLIC_KEY ? isPublic : roles)),
    };
    return new RolesGuard(reflector);
  };
  const ctx = (user: any): any => ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  });

  it('allows a listed role', () => {
    expect(guardFor(['ADMIN']).canActivate(ctx({ role: 'ADMIN' }))).toBe(true);
  });
  it('blocks an unlisted role', () => {
    expect(() => guardFor(['ADMIN']).canActivate(ctx({ role: 'STOREKEEPER' }))).toThrow();
  });
  it('blocks routes that forgot @Roles', () => {
    expect(() => guardFor(undefined).canActivate(ctx({ role: 'ADMIN' }))).toThrow();
  });
  it('lets public routes through without a user', () => {
    expect(guardFor(undefined, true).canActivate(ctx(undefined))).toBe(true);
  });
});
