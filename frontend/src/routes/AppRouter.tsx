import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'
import { RoleRoute } from './RoleRoute'
import { ROUTES } from './route-constants'
import { MainLayout } from '../layouts/MainLayout'
import { LoadingSpinner } from '../components/common/Loading/LoadingSpinner'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const StockDeskPage = lazy(() => import('../pages/StockDeskPage'))
const ProductsPage = lazy(() => import('../pages/ProductsPage'))
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'))
const BrandsPage = lazy(() => import('../pages/BrandsPage'))
const LocationsPage = lazy(() => import('../pages/LocationsPage'))
const SuppliersPage = lazy(() => import('../pages/SuppliersPage'))
const InventoryPage = lazy(() => import('../pages/InventoryPage'))
const StockMovementsPage = lazy(() => import('../pages/StockMovementsPage'))
const PurchaseOrdersPage = lazy(() => import('../pages/PurchaseOrdersPage'))
const GoodsReceiptsPage = lazy(() => import('../pages/GoodsReceiptsPage'))
const ReportsPage = lazy(() => import('../pages/ReportsPage'))
const AuditPage = lazy(() => import('../pages/AuditPage'))
const UsersPage = lazy(() => import('../pages/UsersPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Routes>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />

        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            {/* Everyone */}
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
            <Route path={ROUTES.STOCK_MOVEMENTS} element={<StockMovementsPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

            {/* Recording incoming / outgoing stock */}
            <Route element={<RoleRoute permission="stock:record" />}>
              <Route path={ROUTES.STOCK_DESK} element={<StockDeskPage />} />
            </Route>
            <Route element={<RoleRoute permission="receipt:create" />}>
              <Route path={ROUTES.GOODS_RECEIPTS} element={<GoodsReceiptsPage />} />
            </Route>
            <Route element={<RoleRoute permission="po:view" />}>
              <Route path={ROUTES.PURCHASE_ORDERS} element={<PurchaseOrdersPage />} />
            </Route>

            {/* Manager only */}
            <Route element={<RoleRoute permission="catalog:manage" />}>
              <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
              <Route path={ROUTES.BRANDS} element={<BrandsPage />} />
              <Route path={ROUTES.LOCATIONS} element={<LocationsPage />} />
            </Route>
            <Route element={<RoleRoute permission="supplier:manage" />}>
              <Route path={ROUTES.SUPPLIERS} element={<SuppliersPage />} />
            </Route>
            <Route element={<RoleRoute permission="report:view" />}>
              <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            </Route>
            <Route element={<RoleRoute permission="audit:view" />}>
              <Route path={ROUTES.AUDIT} element={<AuditPage />} />
            </Route>
            <Route element={<RoleRoute permission="user:manage" />}>
              <Route path={ROUTES.USERS} element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/home" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
