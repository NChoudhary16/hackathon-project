# StockFlow iPDS — Backend Architecture

Enterprise FIFO-based inventory and dispatch management backend platform for government food-grain godowns, built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

---

## 🛠 Technology Stack

- **Runtime**: Node.js (v24.x)
- **Framework**: Express (v4.x)
- **Language**: TypeScript (v5.x, strict mode)
- **Database**: PostgreSQL 13+
- **ORM**: Prisma ORM (v5.x)
- **Validation**: Zod (v3.x)
- **Authentication**: JWT & bcryptjs password hashing
- **Security**: Helmet, CORS, Rate Limiting (`express-rate-limit`)
- **Testing**: Vitest & Supertest

---

## 📂 Project Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma         # 12 core relational PDS models & enums
│   └── seed.ts               # Realistic PDS seed data & demo users
├── src/
│   ├── config/
│   │   └── env.ts            # Environment config & fallback values
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   └── jwt.ts            # JWT signing & verification helpers
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT auth & RBAC permissions
│   │   ├── error.middleware.ts    # Centralized HTTP error handler
│   │   ├── rateLimiter.ts         # Helmet & rate limiting policies
│   │   └── validate.middleware.ts # Zod request validator
│   ├── modules/
│   │   ├── auth/             # Login, register, current user
│   │   ├── users/            # User directory
│   │   ├── godowns/          # Godowns & capacity metrics
│   │   ├── commodities/      # PDS food grains (Wheat, Rice, Sugar, etc.)
│   │   ├── suppliers/        # Suppliers (FCI, PUNSUP, NAFED, etc.)
│   │   ├── fps/              # Fair Price Shops (Ration depots)
│   │   ├── receipts/         # Stock receipts & inward consignments
│   │   ├── inventory/        # Active batches, filters & summary
│   │   ├── fifo/             # FIFO allocation engine & simulations
│   │   ├── challans/         # Delivery challans & dispatches
│   │   ├── movements/        # Append-only stock ledger trail
│   │   └── reports/          # Ageing buckets & FIFO compliance audit
│   ├── services/
│   │   ├── fifo.service.ts       # FIFO priority queue & deviation detector
│   │   ├── inventory.service.ts  # Batch queries, age & metrics computation
│   │   ├── dispatch.service.ts   # Atomic dispatch & stock deduction transaction
│   │   └── audit.service.ts      # Administrative audit logger
│   ├── app.ts                # Express application assembly
│   └── server.ts             # Server entrypoint & graceful shutdown
├── tests/
│   ├── receipts.test.ts      # Integration tests for Receipt workflows
│   ├── inventory.test.ts     # Integration tests for Inventory filters & summary
│   ├── fifo.test.ts          # Integration tests for FIFO sorting & deviation detection
│   └── challans.test.ts      # Integration tests for atomic challan creation
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 💾 Database Schema

The database utilizes integer base units (**Kilograms**) internally to prevent any floating-point truncation errors during recurring dispatches:

1. **User**: Roles (`ADMIN`, `GODOWN_MANAGER`, `QUALITY_INSPECTOR`, `DISPATCH_OFFICER`).
2. **Godown**: Storage capacity in MT, district, state.
3. **Commodity**: Grains, standard bag weight (50 kg), shelf life.
4. **Supplier**: FCI, PUNSUP, NAFED, Markfed.
5. **FairPriceShop**: Ration shops, quota allocation, card holder count.
6. **StockReceipt**: Inward consignments, lab report numbers, moisture %.
7. **InventoryBatch**: Stack locations, bay IDs, remaining quantity (Kg), age days, quality grade (`GRADE_A`, `GRADE_B`, `QUARANTINE`, `DAMAGED`).
8. **DeliveryChallan**: Dispatch orders, vehicle details, driver credentials.
9. **ChallanAllocation**: Multi-batch fulfillment mapping with priority ranks.
10. **StockMovement**: Append-only audit records (`RECEIPT`, `DISPATCH`, `ADJUSTMENT`, `REVERSAL`).
11. **AuditLog**: System audit events.
12. **FifoException**: Logged when manual managerial batch override is granted.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database & Environment
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:1234@localhost:5432/stockflow_db?schema=public"
JWT_SECRET="stockflow_pds_super_secret_jwt_key_2026_secure"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

### 3. Synchronize Schema & Seed Database
```bash
# Push schema to PostgreSQL
npm run prisma:push

# Populate realistic PDS data
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Run Test Suite
```bash
npm test
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/auth/login` | User login & JWT issuance |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `POST` | `/api/receipts` | Inward receipt creation (Atomic batch + movement) |
| `GET` | `/api/receipts` | List all stock receipts |
| `GET` | `/api/receipts/:id` | Get stock receipt details |
| `GET` | `/api/inventory` | List batches with age, risk, and eligibility |
| `GET` | `/api/inventory/summary` | Executive stock summary & capacity utilization |
| `GET` | `/api/inventory/:batchId` | Batch record with ledger movements |
| `POST` | `/api/fifo/calculate` | Dry-run FIFO allocation simulation & deviation alert |
| `GET` | `/api/fifo/eligible` | Ranked FIFO eligible batches |
| `POST` | `/api/challans` | Issue Delivery Challan with atomic inventory deduction |
| `GET` | `/api/challans` | List delivery challans |
| `GET` | `/api/challans/:id` | Get challan details with batch allocations |
| `GET` | `/api/movements` | Append-only stock movements audit trail |
| `GET` | `/api/reports/ageing` | Regulatory grain ageing buckets (0-30, 31-60, 61-90, 91+ d) |
| `GET` | `/api/reports/fifo-compliance` | FIFO compliance rate % and exception count |

---

## 🔑 Demo Seed Users

All accounts seeded with default password: `Password@123`

- **Admin**: `admin@stockflow.gov.in`
- **Godown Manager**: `manager@stockflow.gov.in`
- **Quality Inspector**: `inspector@stockflow.gov.in`
- **Dispatch Officer**: `dispatch@stockflow.gov.in`
