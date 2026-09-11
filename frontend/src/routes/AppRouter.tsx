import { Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'
import { PublicRoute } from './PublicRoute'
import { ROUTES } from './route-constants'

// Layouts
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'

// Pages
import { LoginPage } from '../pages/LoginPage'
import { LandingPage } from '../pages/LandingPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProductsPage } from '../pages/ProductsPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { BrandsPage } from '../pages/BrandsPage'
import { InventoryPage } from '../pages/InventoryPage'
import { StockMovementsPage } from '../pages/StockMovementsPage'
import { SuppliersPage } from '../pages/SuppliersPage'
import { LocationsPage } from '../pages/LocationsPage'
import { PurchaseOrdersPage } from '../pages/PurchaseOrdersPage'
import { GoodsReceiptsPage } from '../pages/GoodsReceiptsPage'
import { ReportsPage } from '../pages/ReportsPage'
import { AuditPage } from '../pages/AuditPage'
import { UsersPage } from '../pages/UsersPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.BRANDS} element={<BrandsPage />} />
          <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
          <Route path={ROUTES.STOCK_MOVEMENTS} element={<StockMovementsPage />} />
          <Route path={ROUTES.SUPPLIERS} element={<SuppliersPage />} />
          <Route path={ROUTES.LOCATIONS} element={<LocationsPage />} />
          <Route path={ROUTES.PURCHASE_ORDERS} element={<PurchaseOrdersPage />} />
          <Route path={ROUTES.GOODS_RECEIPTS} element={<GoodsReceiptsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route element={<RoleRoute role="ADMIN" />}>
            <Route path={ROUTES.AUDIT} element={<AuditPage />} />
            <Route path={ROUTES.USERS} element={<UsersPage />} />
          </Route>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}