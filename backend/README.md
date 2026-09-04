# Playhouse Inventory - Backend API

## Overview

Playhouse Inventory is a standalone Inventory Management System (IMS) built for Playhouse Electronics. It manages products, stock levels, stock movements, procurement, storage locations, inventory adjustments, and inventory-related business intelligence. The system is designed to be independently deployable and API-first, ready to integrate with the e-commerce platform later.

## Architecture

The backend follows a **modular monolith** architecture using NestJS, with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    NestJS API                           │
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth  │  │  Users   │  │ Products │  │Inventory│ │
│  └─────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Suppliers│  │   PO     │  │   GR     │  │ Reports │ │
│  └─────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌─────────┐  ┌──────────┐                              │
│  │  Audit  │  │  Common  │                              │
│  └─────────┘  └──────────┘                              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────────┐
                    │    Prisma ORM     │
                    └───────────────────┘
                            │
                            ▼
                    ┌───────────────────┐
                    │   PostgreSQL      │
                    └───────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Framework** | NestJS 10.x |
| **Language** | TypeScript 5.x |
| **ORM** | Prisma 5.x |
| **Database** | PostgreSQL (Neon) |
| **Authentication** | JWT + Passport |
| **Validation** | class-validator |
| **API Documentation** | Swagger/OpenAPI |
| **Testing** | Jest |

## Features

### ✅ Implemented Features

#### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Two roles: `ADMIN` and `STOREKEEPER`
- User login, logout, profile, and token refresh
- Password hashing with bcrypt

#### User Management
- CRUD operations for users
- User status management (ACTIVE/DISABLED)
- Role assignment (ADMIN/STOREKEEPER)
- Self-protection (cannot delete/disable self)
- Last admin protection

#### Product Catalog
- CRUD operations for products
- SKU (unique identifier) management
- Category and Brand management
- Product search (SKU, name, barcode)
- Product filtering (category, brand, status)
- Barcode support (for future scanning)
- Cost price management with Decimal precision

#### Inventory Management (Core)
- Stock In, Stock Out, Adjustment, and Damage operations
- Transactional stock mutations (ACID compliant)
- Automatic stock movement audit trail
- Available quantity calculation (quantity - reservedQuantity)
- Reservation support (ready for e-commerce integration)
- Low stock and out of stock detection
- Reorder level management
- Location-based inventory tracking

#### Stock Movements
- Complete audit trail of all stock changes
- Movement types: STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGE, RETURN
- Previous and new quantity tracking
- User attribution for all movements
- Filtering by product, location, type, user, date range

#### Procurement
- Supplier management (CRUD)
- Purchase Order workflow (DRAFT → SUBMITTED → APPROVED → RECEIVED)
- Purchase Order items with unit cost and total cost
- Partial receiving support
- Goods Receipt with damaged quantity tracking
- Automatic inventory update on goods receipt
- PO number and Receipt number generation

#### Reports
- Inventory Summary Dashboard (KPIs)
  - Total products, units, available, value
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

#### Audit Logging
- Complete audit trail for all operations
- Old/New value tracking with JSON storage
- User attribution for all changes
- Filtering by user, entity, action, date range

#### Integrations (Ready)
- SKU-based product identification
- externalProductId for future e-commerce mapping
- Idempotency-ready architecture
- Client credentials structure in place

## Database Schema

### Core Models (14)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | System users | email, passwordHash, role (ADMIN/STOREKEEPER), status |
| **Category** | Product categories | name, description, status |
| **Brand** | Product brands | name, status |
| **Product** | Products tracked | sku (unique), name, costPrice (Decimal), reorderLevel, externalProductId |
| **Location** | Physical locations | name |
| **InventoryBalance** | Current stock | productId + locationId (unique), quantity, reservedQuantity |
| **StockMovement** | Audit trail | type, quantity, previous/new quantities, reason, reference |
| **StockAdjustment** | Adjustment records | adjustmentNumber, type (INCREASE/DECREASE), reason |
| **Supplier** | Suppliers | name, contactPerson, email, phone, address, status |
| **PurchaseOrder** | Purchase orders | poNumber, status (DRAFT→APPROVED→RECEIVED), totalAmount |
| **PurchaseOrderItem** | PO line items | quantity, receivedQuantity, unitCost (Decimal), totalCost (Decimal) |
| **GoodsReceipt** | Receiving records | receiptNumber, locationId, receivedAt |
| **GoodsReceiptItem** | Receipt line items | receivedQuantity, acceptedQuantity, damagedQuantity |
| **AuditLog** | System audit | action, entity, entityId, oldValue (JSON), newValue (JSON) |

### Key Relationships

```
User ────┐
         ├── StockMovement (creator)
         ├── AuditLog (creator)
         ├── PurchaseOrder (creator/approver)
         └── GoodsReceipt (receiver)

Product ────┬── Category (belongs to)
           ├── Brand (belongs to)
           ├── InventoryBalance (has many)
           ├── StockMovement (has many)
           ├── PurchaseOrderItem (has many)
           └── GoodsReceiptItem (has many)

InventoryBalance ────┬── Product
                    ├── Location
                    ├── StockMovement (has many)
                    └── StockAdjustment (has many)

PurchaseOrder ────┬── Supplier
                 ├── PurchaseOrderItem (has many)
                 └── GoodsReceipt (has many)

GoodsReceipt ────┬── PurchaseOrder
                ├── Location
                ├── User (receiver)
                └── GoodsReceiptItem (has many)
```

### Unique Constraints

- `sku` on Product
- `email` on User
- `name` on Category, Brand, Location, Supplier
- `poNumber` on PurchaseOrder
- `receiptNumber` on GoodsReceipt
- `adjustmentNumber` on StockAdjustment
- `(productId, locationId)` on InventoryBalance
- `(purchaseOrderId, productId)` on PurchaseOrderItem
- `(goodsReceiptId, productId)` on GoodsReceiptItem

### Indexes

- All foreign key fields
- All unique fields
- `createdAt` for time-based queries
- `status` for status filtering
- `sku` for product lookups
- `type` for movement filtering

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Login user | Public |
| POST | `/api/v1/auth/logout` | Logout user | Any |
| GET | `/api/v1/auth/me` | Get current user | Any |
| POST | `/api/v1/auth/refresh` | Refresh token | Public |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/users` | Create user | ADMIN |
| GET | `/api/v1/users` | Get all users | ADMIN |
| GET | `/api/v1/users/:id` | Get user by ID | ADMIN |
| PATCH | `/api/v1/users/:id` | Update user | ADMIN |
| DELETE | `/api/v1/users/:id` | Delete user | ADMIN |
| PATCH | `/api/v1/users/:id/disable` | Disable user | ADMIN |
| PATCH | `/api/v1/users/:id/enable` | Enable user | ADMIN |

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/categories` | Create category | ADMIN |
| GET | `/api/v1/categories` | Get categories | Any |
| GET | `/api/v1/categories/:id` | Get category | Any |
| PATCH | `/api/v1/categories/:id` | Update category | ADMIN |
| DELETE | `/api/v1/categories/:id` | Delete category | ADMIN |

### Brands

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/brands` | Create brand | ADMIN |
| GET | `/api/v1/brands` | Get brands | Any |
| GET | `/api/v1/brands/:id` | Get brand | Any |
| PATCH | `/api/v1/brands/:id` | Update brand | ADMIN |
| DELETE | `/api/v1/brands/:id` | Delete brand | ADMIN |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/products` | Create product | ADMIN |
| GET | `/api/v1/products` | Get products (search/filter) | Any |
| GET | `/api/v1/products/:id` | Get product | Any |
| GET | `/api/v1/products/sku/:sku` | Get product by SKU | Any |
| PATCH | `/api/v1/products/:id` | Update product | ADMIN |
| DELETE | `/api/v1/products/:id` | Delete product | ADMIN |

### Locations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/locations` | Create location | ADMIN |
| GET | `/api/v1/locations` | Get locations | Any |
| GET | `/api/v1/locations/:id` | Get location | Any |
| PATCH | `/api/v1/locations/:id` | Update location | ADMIN |
| DELETE | `/api/v1/locations/:id` | Delete location | ADMIN |

### Inventory

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/inventory` | Get inventory | Any |
| GET | `/api/v1/inventory/:productId` | Get inventory by product | Any |
| GET | `/api/v1/inventory/location/:locationId` | Get inventory by location | Any |
| GET | `/api/v1/inventory/low-stock` | Get low stock items | Any |
| POST | `/api/v1/inventory/stock-in` | Add stock | ADMIN/STOREKEEPER |
| POST | `/api/v1/inventory/stock-out` | Remove stock | ADMIN/STOREKEEPER |
| POST | `/api/v1/inventory/adjust` | Adjust stock | ADMIN/STOREKEEPER |
| POST | `/api/v1/inventory/damage` | Record damage | ADMIN/STOREKEEPER |

### Stock Movements

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/stock-movements` | Get movements (filter) | Any |
| GET | `/api/v1/stock-movements/:id` | Get movement | Any |
| GET | `/api/v1/stock-movements/product/:productId` | Get movements by product | Any |
| GET | `/api/v1/stock-movements/location/:locationId` | Get movements by location | Any |

### Suppliers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/suppliers` | Create supplier | ADMIN |
| GET | `/api/v1/suppliers` | Get suppliers | Any |
| GET | `/api/v1/suppliers/:id` | Get supplier | Any |
| PATCH | `/api/v1/suppliers/:id` | Update supplier | ADMIN |
| DELETE | `/api/v1/suppliers/:id` | Delete supplier | ADMIN |

### Purchase Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/purchase-orders` | Create PO | ADMIN/STOREKEEPER |
| GET | `/api/v1/purchase-orders` | Get POs (filter) | Any |
| GET | `/api/v1/purchase-orders/:id` | Get PO | Any |
| POST | `/api/v1/purchase-orders/:id/submit` | Submit PO | ADMIN/STOREKEEPER |
| POST | `/api/v1/purchase-orders/:id/approve` | Approve PO | ADMIN |
| POST | `/api/v1/purchase-orders/:id/cancel` | Cancel PO | ADMIN/STOREKEEPER |
| PATCH | `/api/v1/purchase-orders/:id` | Update PO (DRAFT only) | ADMIN/STOREKEEPER |
| DELETE | `/api/v1/purchase-orders/:id` | Delete PO (DRAFT only) | ADMIN |

### Goods Receipts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/goods-receipts` | Receive goods | ADMIN/STOREKEEPER |
| GET | `/api/v1/goods-receipts` | Get receipts (filter) | Any |
| GET | `/api/v1/goods-receipts/:id` | Get receipt | Any |
| GET | `/api/v1/goods-receipts/purchase-order/:poId` | Get receipts by PO | Any |

### Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/reports/inventory-summary` | Get dashboard KPIs | Any |
| GET | `/api/v1/reports/low-stock` | Get low stock report | Any |
| GET | `/api/v1/reports/movements` | Get movement report | Any |
| GET | `/api/v1/reports/valuation` | Get valuation report | Any |
| GET | `/api/v1/reports/top-moving` | Get top moving products | Any |

### Audit

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/audit` | Get audit logs (filter) | ADMIN |
| GET | `/api/v1/audit/user/:userId` | Get logs by user | ADMIN |
| GET | `/api/v1/audit/entity/:entity/:entityId` | Get logs by entity | ADMIN |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | Full health check | Any |
| GET | `/api/v1/health/db` | Database health | Any |
| GET | `/api/v1/health/db/stats` | Database stats | Any |

## Business Rules

### Inventory Rules
1. **Stock cannot be negative** - All operations validate quantity >= 0
2. **Stock-out cannot exceed available stock** - `requested <= (quantity - reservedQuantity)`
3. **Every stock mutation generates a movement** - Complete audit trail
4. **All mutations are in database transactions** - ACID compliant
5. **Transactional records are never deleted** - Soft delete pattern
6. **Available quantity is calculated** - Not stored, `quantity - reservedQuantity`
7. **Every adjustment creates a StockAdjustment record** - Proper audit trail

### Procurement Rules
1. **Creating a PO does NOT affect inventory** - Only Goods Receipt does
2. **Receiving must respect PO limits** - `received + damaged <= ordered`
3. **PO must be APPROVED before receiving** - Status validation
4. **Only ADMIN can approve POs** - Role-based control
5. **PO status transitions are enforced** - State machine pattern

### Security Rules
1. **Only ADMIN can manage users** - User CRUD restricted
2. **Only ADMIN can manage categories, brands** - Catalog management restricted
3. **ADMIN and STOREKEEPER can manage inventory** - Operational access
4. **Users cannot delete themselves** - Self-protection
5. **Last admin cannot be deleted** - Critical protection
6. **Passwords are hashed with bcrypt** - Security best practice

## Testing

### Test Coverage

| Module | Unit Tests | Integration Tests | E2E Tests |
|--------|------------|-------------------|-----------|
| Auth | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ |
| Categories | ✅ | ✅ | - |
| Brands | ✅ | ✅ | - |
| Products | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ |
| Stock Movements | ✅ | ✅ | - |
| Suppliers | ✅ | ✅ | - |
| Purchase Orders | ✅ | ✅ | ✅ |
| Goods Receipts | ✅ | ✅ | ✅ |
| Reports | ✅ | - | - |
| Audit | ✅ | - | - |

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# CI mode
npm run test:ci
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/playhouse_inventory?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# API
API_VERSION="v1"
API_PREFIX="/api"
```

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/playhouse-inventory-backend.git
cd playhouse-inventory-backend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Run Prisma migrations
npx prisma migrate dev --name init

# 5. Generate Prisma client
npx prisma generate

# 6. Seed the database
npx prisma db seed

# 7. Start the development server
npm run start:dev

# 8. Access Swagger documentation
# http://localhost:3000/api/docs
```

### Default Users (Seeded)

| Email | Password | Role |
|-------|----------|------|
| admin@playhouse.co.ke | Admin@123 | ADMIN |
| storekeeper@playhouse.co.ke | Storekeeper@123 | STOREKEEPER |

### Default Data (Seeded)
- **Location**: Main Store
- **Categories**: Phones, Laptops, TVs, Accessories, Appliances
- **Brands**: Samsung, Apple, HP, Dell, Lenovo, LG, Sony, Hisense, JBL, Oraimo

## Project Structure

```
playhouse-inventory-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   └── constants/
│   │       └── index.ts
│   │
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── config.validation.ts
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       └── login.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   ├── brands/
│   │   ├── brands.module.ts
│   │   ├── brands.controller.ts
│   │   ├── brands.service.ts
│   │   └── dto/
│   │       ├── create-brand.dto.ts
│   │       └── update-brand.dto.ts
│   │
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       └── update-product.dto.ts
│   │
│   ├── locations/
│   │   ├── locations.module.ts
│   │   ├── locations.controller.ts
│   │   ├── locations.service.ts
│   │   └── dto/
│   │       └── create-location.dto.ts
│   │
│   ├── inventory/
│   │   ├── inventory.module.ts
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   └── dto/
│   │       ├── stock-in.dto.ts
│   │       ├── stock-out.dto.ts
│   │       ├── adjustment.dto.ts
│   │       └── damage.dto.ts
│   │
│   ├── stock-movements/
│   │   ├── stock-movements.module.ts
│   │   ├── stock-movements.controller.ts
│   │   ├── stock-movements.service.ts
│   │   └── dto/
│   │       └── stock-movement-filter.dto.ts
│   │
│   ├── suppliers/
│   │   ├── suppliers.module.ts
│   │   ├── suppliers.controller.ts
│   │   ├── suppliers.service.ts
│   │   └── dto/
│   │       ├── create-supplier.dto.ts
│   │       └── update-supplier.dto.ts
│   │
│   ├── purchase-orders/
│   │   ├── purchase-orders.module.ts
│   │   ├── purchase-orders.controller.ts
│   │   ├── purchase-orders.service.ts
│   │   └── dto/
│   │       ├── create-purchase-order.dto.ts
│   │       └── update-purchase-order.dto.ts
│   │
│   ├── goods-receipts/
│   │   ├── goods-receipts.module.ts
│   │   ├── goods-receipts.controller.ts
│   │   ├── goods-receipts.service.ts
│   │   └── dto/
│   │       └── create-goods-receipt.dto.ts
│   │
│   ├── reports/
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   └── dto/
│   │       └── report-filter.dto.ts
│   │
│   ├── audit/
│   │   ├── audit.module.ts
│   │   ├── audit.controller.ts
│   │   ├── audit.service.ts
│   │   └── dto/
│   │       └── audit-filter.dto.ts
│   │
│   └── seed/
│       └── seed.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── test/
│   ├── e2e/
│   ├── integration/
│   └── unit/
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## Deployment

### Deploy to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Environment Variables: Add all from `.env.example`

### Deploy to Railway

1. Push your code to GitHub
2. Create a new project on Railway
3. Connect your repository
4. Add environment variables
5. Deploy

### Deploy with Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

```bash
# Build and run
docker build -t playhouse-inventory-backend .
docker run -p 3000:3000 --env-file .env playhouse-inventory-backend
```

## Future Roadmap

### V2 - Operational Inventory (Planned)
- Serial Number / IMEI tracking
- Multiple warehouse support
- Barcode scanning integration
- Returns management
- Inventory valuation (FIFO, Average Cost)
- Stock transfer between locations
- Notifications (Email, SMS)
- Advanced reporting

### V3 - Integrated Platform (Planned)
- E-commerce integration
- POS integration
- Stock reservation system
- Order synchronization
- Webhooks for real-time updates
- Multi-channel inventory sync
- Event-driven architecture

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow NestJS best practices
- Write unit tests for all services
- Use TypeScript strict mode
- Document all API endpoints with Swagger
- Follow the established module structure

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## Support

For support, email support@playhouse.co.ke or create an issue in the repository.

---

**Built with ❤️ for Playhouse Electronics**