# Playhouse Inventory - Frontend Application

## Overview

Playhouse Inventory Frontend is a modern, responsive web application built for managing inventory operations at Playhouse Electronics. It provides an intuitive dashboard for staff to manage products, inventory, suppliers, purchase orders, and generate reports.

The application is built as a Single Page Application (SPA) using React with TypeScript, featuring a clean UI with Tailwind CSS and real-time data updates via React Query.

## Architecture

The frontend follows a **feature-based modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                       │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Pages  │  │Components│  │  Layouts │  │   Routes    │ │
│  └─────────┘  └──────────┘  └──────────┘  └─────────────┘ │
│       │            │            │              │           │
│       └────────────┼────────────┼──────────────┘           │
│                    │            │                           │
│  ┌─────────────────▼────────────▼──────────────────────┐   │
│  │                  Services                            │   │
│  │  product.service, inventory.service, etc.           │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │                     API                             │   │
│  │  client.ts + interceptors + endpoints               │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│                  ┌──────────────────┐                      │
│                  │   NestJS Backend  │                      │
│                  └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18.x |
| **Language** | TypeScript 5.x |
| **Build Tool** | Vite 5.x |
| **Styling** | Tailwind CSS 3.x |
| **Routing** | React Router 6.x |
| **State Management** | Zustand (Client State) + TanStack Query (Server State) |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Date Handling** | date-fns |
| **Code Quality** | ESLint + Prettier |

## Features

### ✅ Implemented Features

#### Authentication
- User login with email/password
- JWT token storage
- Protected routes with role-based access
- Automatic token refresh
- Logout functionality
- Session persistence

#### Dashboard
- Real-time KPIs (Total Products, Units, Value, Low Stock)
- Low stock and out of stock alerts
- Recent stock movements
- Quick action buttons for common tasks
- Responsive design

#### Product Management
- Product listing with search and filters
- Product CRUD operations (Create, Read, Update, Delete)
- SKU-based product identification
- Category and brand management
- Stock level display (Total, Reserved, Available)
- Barcode support
- Status management (Active, Inactive, Discontinued)

#### Inventory Management
- Real-time inventory view with pagination
- Stock In operations (Add stock)
- Stock Out operations (Remove stock)
- Stock Adjustments (Increase/Decrease)
- Damage recording
- Location-based filtering
- Low stock detection and alerts

#### Stock Movements
- Complete audit trail of all stock changes
- Filtering by product, location, type, user, date range
- Movement details view
- Stock balance change tracking

#### Supplier Management
- Supplier CRUD operations
- Contact person and details management
- Purchase order history view
- Status management (Active, Inactive)

#### Purchase Orders
- Full PO workflow (DRAFT → SUBMITTED → APPROVED → RECEIVED)
- PO creation with multiple items
- PO submission and approval
- PO cancellation
- Partial receiving support
- PO status tracking

#### Goods Receipts
- Goods receiving from approved POs
- Damaged quantity tracking
- Automatic inventory update
- Location-based receiving
- Receipt history and details

#### Reports
- Inventory Summary Dashboard
  - Total products, units, value
  - Low stock and out of stock counts
  - Breakdown by location and category
- Low Stock Report
  - Low stock items with shortfall
  - Out of stock items
- Movement Report
  - Filter by date range, product, location
  - Aggregated by movement type
- Valuation Report
  - Total inventory value
  - Available inventory value
  - Per-product valuation

#### Audit Logs
- Complete audit trail view
- Filtering by user, entity, action, date range
- Detailed view with old/new values
- JSON diff visualization

#### User Management
- User CRUD operations (Admin only)
- Role assignment (ADMIN/STOREKEEPER)
- User status management (Active, Disabled)
- Self-protection (cannot disable self)
- Last admin protection

#### Profile & Settings
- User profile management
- Password change
- Theme preferences (Light/Dark)
- Language selection
- Notification preferences

## Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── robots.txt
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── api/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   │   ├── auth.api.ts
│   │   │   ├── users.api.ts
│   │   │   ├── products.api.ts
│   │   │   ├── categories.api.ts
│   │   │   ├── brands.api.ts
│   │   │   ├── inventory.api.ts
│   │   │   ├── stock-movements.api.ts
│   │   │   ├── suppliers.api.ts
│   │   │   ├── purchase-orders.api.ts
│   │   │   ├── goods-receipts.api.ts
│   │   │   ├── reports.api.ts
│   │   │   └── audit.api.ts
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts
│   │       └── error.interceptor.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── empty-state.svg
│   │   │   └── no-results.svg
│   │   └── icons/
│   │       └── index.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── Loading/
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── SkeletonLoader.tsx
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── ConfirmModal.tsx
│   │   │   ├── Table/
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── TableHeader.tsx
│   │   │   │   ├── TableRow.tsx
│   │   │   │   └── TablePagination.tsx
│   │   │   ├── Forms/
│   │   │   │   ├── FormInput.tsx
│   │   │   │   ├── FormSelect.tsx
│   │   │   │   ├── FormTextarea.tsx
│   │   │   │   └── FormDatePicker.tsx
│   │   │   ├── Cards/
│   │   │   │   └── StatCard.tsx
│   │   │   ├── Buttons/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── IconButton.tsx
│   │   │   ├── Badges/
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── RoleBadge.tsx
│   │   │   ├── Alerts/
│   │   │   │   └── Toast.tsx
│   │   │   ├── Search/
│   │   │   │   └── SearchBar.tsx
│   │   │   └── Pagination/
│   │   │       └── Pagination.tsx
│   │   │
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KPICards.tsx
│   │   │   ├── LowStockTable.tsx
│   │   │   ├── RecentMovements.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── ProductSearch.tsx
│   │   │
│   │   ├── categories/
│   │   │   ├── CategoryList.tsx
│   │   │   └── CategoryForm.tsx
│   │   │
│   │   ├── brands/
│   │   │   ├── BrandList.tsx
│   │   │   └── BrandForm.tsx
│   │   │
│   │   ├── inventory/
│   │   │   ├── InventoryList.tsx
│   │   │   ├── StockInForm.tsx
│   │   │   ├── StockOutForm.tsx
│   │   │   ├── AdjustStockForm.tsx
│   │   │   ├── DamageForm.tsx
│   │   │   └── InventoryFilters.tsx
│   │   │
│   │   ├── stock-movements/
│   │   │   ├── MovementList.tsx
│   │   │   └── MovementFilters.tsx
│   │   │
│   │   ├── suppliers/
│   │   │   ├── SupplierList.tsx
│   │   │   ├── SupplierForm.tsx
│   │   │   └── SupplierDetail.tsx
│   │   │
│   │   ├── purchase-orders/
│   │   │   ├── PurchaseOrderList.tsx
│   │   │   ├── PurchaseOrderForm.tsx
│   │   │   ├── PurchaseOrderDetail.tsx
│   │   │   ├── PurchaseOrderFilters.tsx
│   │   │   └── PurchaseOrderActions.tsx
│   │   │
│   │   ├── goods-receipts/
│   │   │   ├── GoodsReceiptList.tsx
│   │   │   ├── GoodsReceiptForm.tsx
│   │   │   └── GoodsReceiptDetail.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── InventorySummary.tsx
│   │   │   ├── LowStockReport.tsx
│   │   │   ├── MovementReport.tsx
│   │   │   ├── ValuationReport.tsx
│   │   │   └── ReportFilters.tsx
│   │   │
│   │   ├── audit/
│   │   │   ├── AuditLogList.tsx
│   │   │   └── AuditLogFilters.tsx
│   │   │
│   │   └── users/
│   │       ├── UserList.tsx
│   │       └── UserForm.tsx
│   │
│   ├── config/
│   │   ├── index.ts
│   │   ├── api.config.ts
│   │   ├── routes.config.ts
│   │   └── environment.ts
│   │
│   ├── constants/
│   │   ├── index.ts
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   ├── statuses.ts
│   │   └── messages.ts
│   │
│   ├── contexts/
│   │   ├── index.ts
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useAuth.ts
│   │   ├── useAxios.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   ├── useSearch.ts
│   │   ├── useToast.ts
│   │   └── usePermissions.ts
│   │
│   ├── layouts/
│   │   ├── index.ts
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── EmptyLayout.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── BrandsPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── StockMovementsPage.tsx
│   │   ├── SuppliersPage.tsx
│   │   ├── PurchaseOrdersPage.tsx
│   │   ├── GoodsReceiptsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── AuditPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── UnauthorizedPage.tsx
│   │
│   ├── routes/
│   │   ├── index.ts
│   │   ├── AppRouter.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── route-constants.ts
│   │
│   ├── services/
│   │   ├── index.ts
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   ├── brand.service.ts
│   │   ├── inventory.service.ts
│   │   ├── stock-movement.service.ts
│   │   ├── supplier.service.ts
│   │   ├── purchase-order.service.ts
│   │   ├── goods-receipt.service.ts
│   │   ├── report.service.ts
│   │   └── audit.service.ts
│   │
│   ├── store/
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   ├── notification.slice.ts
│   │   │   └── ui.slice.ts
│   │   └── hooks.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── category.types.ts
│   │   ├── brand.types.ts
│   │   ├── inventory.types.ts
│   │   ├── stock-movement.types.ts
│   │   ├── supplier.types.ts
│   │   ├── purchase-order.types.ts
│   │   ├── goods-receipt.types.ts
│   │   ├── report.types.ts
│   │   ├── audit.types.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/
│   │   ├── index.ts
│   │   ├── date-utils.ts
│   │   ├── format-utils.ts
│   │   ├── validation-utils.ts
│   │   ├── storage-utils.ts
│   │   └── error-utils.ts
│   │
│   └── styles/
│       ├── index.css
│       ├── variables.css
│       ├── globals.css
│       └── tailwind.css
│
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
├── README.md
└── LICENSE
```

## API Integration

### Data Flow

```
┌──────────────┐
│   Component  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │  ← Business logic, data transformation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   API Layer  │  ← HTTP requests, error handling
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Axios Client│  ← Interceptors, auth headers
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  NestJS API  │
└──────────────┘
```

### Authentication Flow

```
1. User submits login form
   ↓
2. AuthService.login() calls authApi.login()
   ↓
3. API returns { accessToken, user }
   ↓
4. Store token in localStorage
   ↓
5. Set user in AuthContext
   ↓
6. Redirect to dashboard
   ↓
7. All subsequent requests include Bearer token
   ↓
8. Token expiration → 401 → Redirect to login
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running at http://localhost:3000

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Playhouse Inventory
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/playhouse-inventory-frontend.git
cd playhouse-inventory-frontend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your API URL

# 4. Start the development server
npm run dev

# 5. Open the application
# http://localhost:5173
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview

# The build output is in the 'dist' directory
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Test Structure

```
test/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── api/
│   └── pages/
└── e2e/
    ├── auth.spec.ts
    ├── products.spec.ts
    └── inventory.spec.ts
```

## Default Users (for testing)

| Email | Password | Role |
|-------|----------|------|
| admin@playhouse.co.ke | Admin@123 | ADMIN |
| storekeeper@playhouse.co.ke | Storekeeper@123 | STOREKEEPER |

## Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/login` | Login page |

### Private Routes
| Route | Description | Required Role |
|-------|-------------|---------------|
| `/` | Dashboard | Any |
| `/products` | Product Management | Any |
| `/categories` | Category Management | ADMIN |
| `/brands` | Brand Management | ADMIN |
| `/inventory` | Inventory Management | Any |
| `/stock-movements` | Stock Movements | Any |
| `/suppliers` | Supplier Management | Any |
| `/purchase-orders` | Purchase Orders | Any |
| `/goods-receipts` | Goods Receipts | Any |
| `/reports` | Reports | Any |
| `/audit` | Audit Logs | ADMIN |
| `/users` | User Management | ADMIN |
| `/profile` | User Profile | Any |
| `/settings` | Settings | Any |

## Components

### Common Components

| Component | Purpose |
|-----------|---------|
| `Button` | Reusable button with variants and loading states |
| `DataTable` | Feature-rich data table with sorting and pagination |
| `Modal` | Modal dialog with overlay and accessibility |
| `FormInput` | Form input with validation and error messages |
| `FormSelect` | Select dropdown with options |
| `FormTextarea` | Textarea with validation |
| `StatusBadge` | Status indicator with color coding |
| `RoleBadge` | Role indicator with color coding |
| `LoadingSpinner` | Loading indicator |
| `StatCard` | Dashboard statistics card |
| `SearchBar` | Search input with debounce |

### Feature Components

| Feature | Components |
|---------|------------|
| Products | ProductList, ProductForm, ProductFilters, ProductSearch |
| Inventory | InventoryList, StockInForm, StockOutForm, AdjustStockForm, DamageForm |
| Purchase Orders | PurchaseOrderList, PurchaseOrderForm, PurchaseOrderActions |
| Goods Receipts | GoodsReceiptList, GoodsReceiptForm |
| Reports | InventorySummary, LowStockReport, MovementReport, ValuationReport |

## State Management

### Client State (Zustand)

```typescript
// Store structure
store/
├── slices/
│   ├── auth.slice.ts     // User authentication state
│   ├── notification.slice.ts // Toast notifications
│   └── ui.slice.ts       // UI state (sidebar, theme, modals)
└── hooks.ts              // Custom store hooks
```

### Server State (TanStack Query)

```typescript
// Query structure
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productsApi.getAll(filters),
})

// Mutation structure
const mutation = useMutation({
  mutationFn: productsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  },
})
```

## Styling

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        warning: { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
        error: { 50: '#fef2f2', 500: '#ef4444', 700: '#b91c1c' },
      },
    },
  },
}
```

### CSS Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --success: 142.1 76.2% 36.3%;
  --warning: 38 92% 50%;
  --error: 0 84.2% 60.2%;
}
```

## Performance Optimizations

1. **Code Splitting**: Lazy loading of routes and components
2. **Caching**: React Query caching for server data
3. **Debouncing**: Search inputs with debounce
4. **Pagination**: Server-side pagination for large datasets
5. **Memoization**: useMemo and useCallback for expensive operations
6. **Image Optimization**: Lazy loading and optimized images
7. **Bundle Optimization**: Tree shaking and code splitting

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader friendly

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Deploy to Vercel

```bash
# 1. Build the application
npm run build

# 2. Deploy to Vercel
npx vercel --prod

# Or connect GitHub repository to Vercel for automatic deployments
```

### Deploy to Netlify

```bash
# 1. Build the application
npm run build

# 2. Deploy to Netlify
npx netlify deploy --prod --dir=dist

# Or connect GitHub repository to Netlify for automatic deployments
```

### Deploy with Docker

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Environment Variables (Production)

```env
VITE_API_URL=https://api.playhouse.co.ke/api/v1
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Playhouse Inventory
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Future Roadmap

### V2 - Enhanced Features (Planned)
- Dark mode improvements
- Mobile responsive design
- Barcode scanner integration
- Advanced search with filters
- Export reports (PDF, Excel)
- Email notifications
- User activity dashboard

### V3 - Advanced Features (Planned)
- Real-time inventory updates (WebSockets)
- Interactive charts and analytics
- AI-powered demand forecasting
- Multi-language support (i18n)
- PWA support
- Offline mode
- Mobile app (React Native)

## Troubleshooting

### Common Issues

#### API Connection Issues
```
Error: Network Error
Solution: Check if backend is running and CORS is configured correctly
```

#### Authentication Issues
```
Error: 401 Unauthorized
Solution: Clear localStorage and re-login
```

#### Build Issues
```
Error: Out of memory
Solution: Increase Node memory limit: NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript strict mode
- Follow React best practices (hooks, components)
- Write tests for all features
- Document components with JSDoc
- Use ESLint and Prettier for code formatting

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## Support

For support, email support@playhouse.co.ke or create an issue in the repository.

---

**Built with ❤️ for Playhouse Electronics**