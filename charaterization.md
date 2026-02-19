# MVP Characterization Doc — Trading Journal (Next.js + MUI + Supabase)  
Version: 0.1  
Date: 2026-02-19  
Owner: Imri

---

## 1) Product Summary

### 1.1 Purpose
A lightweight web app for manually logging trades and viewing core performance stats (PnL, win rate, averages). The MVP prioritizes speed, correctness, and clean extensibility.

### 1.2 Target Users
- Solo retail traders who want a simple journal (stocks/crypto/forex).
- Builders who want a React/Next.js practice project with “real” CRUD + auth + analytics.

### 1.3 Core Value Proposition
“Log trades in seconds, see performance instantly, keep everything synced and private.”

---

## 2) MVP Scope

### 2.1 In Scope (MVP)
- Authentication (email magic link or email/password via Supabase Auth)
- CRUD: Trades
- Basic Analytics:
  - Total Net PnL
  - Win rate
  - Avg PnL per trade
  - Avg % return
  - Profit factor (optional if time)
  - Equity curve (simple cumulative PnL line chart) — optional but recommended
- Filtering and sorting trades
- Data persistence in Supabase (RLS enforced)
- Responsive UI using Material-UI

### 2.2 Out of Scope (Post-MVP)
- Automated brokerage imports (IBKR, etc.)
- Advanced backtesting / Monte Carlo
- Multi-currency conversion and FX rates
- Attachments (screenshots), notes with rich text
- Team sharing / collaboration
- Strategy templates, tagging system (beyond 1-2 simple tags)

---

## 3) Key User Journeys

### 3.1 Sign up / Log in
1. User opens app
2. Clicks “Sign in”
3. Auth via Supabase
4. Redirect to Dashboard

Success Criteria: User can access app securely and sees only their data.

### 3.2 Add a Trade
1. Click “Add trade”
2. Fill form fields
3. Submit
4. Trade appears in list + stats update

Success Criteria: Trade persists and analytics update without refresh issues.

### 3.3 Review Performance
1. User opens Dashboard
2. Stats panel shows derived metrics
3. Trade list shows recent trades
4. Optional: graph shows equity curve

Success Criteria: Stats are consistent and match trade list.

### 3.4 Edit / Delete Trade
- Edit: open row → modify → save
- Delete: confirm dialog → remove

Success Criteria: Changes persist, stats recompute correctly.

---

## 4) Functional Requirements

### 4.1 Trade Entity (MVP Fields)
Required:
- `symbol` (string, uppercase, max 20)
- `asset_type` (enum: stock | crypto | forex | index | other)
- `entry_date` (date/time)
- `exit_date` (date/time)
- `entry_price` (number > 0)
- `exit_price` (number > 0)
- `position_size` (number > 0) *(units/shares/coins)*
- `side` (enum: long | short)

Optional:
- `fees` (number >= 0, default 0)
- `notes` (string, max 1000)
- `tags` (string[] or comma-separated string) *(optional MVP)*

Derived (computed in domain layer, not stored):
- `pnl` (number)
- `pnl_percent` (number)
- `holding_time` (duration)

### 4.2 Trade Validation Rules
- `exit_date >= entry_date`
- `symbol` must be non-empty
- Prices and size must be positive numbers
- `fees` cannot exceed gross pnl in a way that creates non-sense? (soft validation: allow, but warn)

### 4.3 Analytics (Derived Metrics)
Given a set of trades:
- `net_pnl = sum(pnl)`
- `wins = count(pnl > 0)`
- `losses = count(pnl < 0)`
- `win_rate = wins / (wins + losses)` (ignore pnl==0 or treat as neither)
- `avg_pnl = mean(pnl)`
- `avg_return_percent = mean(pnl_percent)`
- `profit_factor = sum(pnl of wins) / abs(sum(pnl of losses))` (if losses sum is 0 → null)

Equity curve:
- sort by `exit_date` asc
- cumulative sum of pnl

### 4.4 Filtering / Sorting
Filters:
- By `symbol`
- By `asset_type`
- By date range (entry_date or exit_date)
Sort:
- Default: `exit_date desc`
- Additional: pnl asc/desc

### 4.5 Error Handling & UX
- Show inline form validation
- Show global toast for API errors
- Loading states for reads/writes
- Confirm dialog on delete

---

## 5) Non-Functional Requirements

### 5.1 Performance
- Initial dashboard load under ~1s for up to 500 trades (reasonable goal)
- Pagination/virtualization optional; at MVP can do server paging.

### 5.2 Security & Privacy
- Supabase Row Level Security (RLS) required
- Each trade row belongs to exactly one user (`user_id`)
- No trade data accessible without auth

### 5.3 Reliability
- All writes are transactional (Supabase insert/update/delete)
- UI optimistic updates allowed but must reconcile on error

### 5.4 Accessibility
- Basic keyboard navigation
- Proper labels on form fields (MUI defaults help)

---

## 6) Tech Stack

### 6.1 Frontend
- Next.js (App Router)
- React
- Material-UI (MUI)
- TypeScript (recommended even for MVP)
- React Hook Form + Zod (recommended)
- TanStack Query (React Query) for data fetching/caching
- Recharts (optional, for equity curve chart)

### 6.2 Backend / Data
- Supabase:
  - Auth
  - Postgres database
  - RLS policies
  - (optional) Supabase Edge Functions if needed later

---

## 7) Clean Architecture (Proposed Structure)

### 7.1 Layers
**Domain**
- Entities: `Trade`
- Value Objects: `Money`, `Percent` (optional), `Symbol`
- Domain Services: `TradeCalculator`, `StatsCalculator`
- Domain Errors

**Application**
- Use cases:
  - `CreateTrade`
  - `UpdateTrade`
  - `DeleteTrade`
  - `ListTrades`
  - `GetStats`
- Interfaces:
  - `TradesRepository`
  - `AuthRepository` (or AuthService)

**Infrastructure**
- Supabase client adapters:
  - `SupabaseTradesRepository`
  - `SupabaseAuthRepository`
- Mapping: DB row ↔ domain entity

**Presentation**
- Next.js routes/pages
- UI components (MUI)
- View models / hooks:
  - `useTrades`
  - `useStats`

### 7.2 Folder Layout (Next.js App Router)
src/
app/
(auth)/
login/
page.tsx
dashboard/
page.tsx
trades/
page.tsx
presentation/
components/
TradeForm/
TradeTable/
StatsPanel/
hooks/
useTrades.ts
useStats.ts
application/
usecases/
create-trade.ts
update-trade.ts
delete-trade.ts
list-trades.ts
get-stats.ts
ports/
trades-repository.ts
auth-repository.ts
domain/
entities/
trade.ts
services/
trade-calculator.ts
stats-calculator.ts
validation/
trade-schema.ts
infrastructure/
supabase/
client.ts
trades-repository.ts
auth-repository.ts
mappers.ts
shared/
config/
types/

---

## 8) Data Model (Supabase / Postgres)

### 8.1 Table: `trades`
Columns:
- `id` UUID PK default gen_random_uuid()
- `user_id` UUID not null references auth.users(id)
- `symbol` text not null
- `asset_type` text not null
- `side` text not null
- `entry_date` timestamptz not null
- `exit_date` timestamptz not null
- `entry_price` numeric not null
- `exit_price` numeric not null
- `position_size` numeric not null
- `fees` numeric not null default 0
- `notes` text null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- (user_id, exit_date desc)
- (user_id, symbol)

### 8.2 RLS Policies
- Enable RLS on `trades`
- Policies:
  - SELECT: user can read rows where `user_id = auth.uid()`
  - INSERT: user can insert only with `user_id = auth.uid()`
  - UPDATE: user can update only their rows
  - DELETE: user can delete only their rows

---

## 9) API / Data Access Patterns

### 9.1 Data Fetching
- Use repository methods called by use cases:
  - `listTrades({ filters, sort, pagination })`
  - `createTrade(trade)`
  - `updateTrade(id, patch)`
  - `deleteTrade(id)`

### 9.2 Caching Strategy
- React Query keys:
  - `['trades', filters, sort, page]`
  - `['stats', filters]` (or derived client-side from trades if small)

MVP choice:
- Compute stats client-side from fetched trades if fetching all trades.
- If paging, consider a `GetStats` use case that queries all trades for stats (server-side aggregation later).

---

## 10) UI (MUI) — Screens & Components

### 10.1 Screens
1. **Login**
2. **Dashboard**
   - StatsPanel (top)
   - EquityCurve (optional)
   - TradesTable (bottom)
3. **Trades Page** (optional if dashboard includes table already)

### 10.2 Components
- `TradeFormDialog`
- `TradeTable`
- `TradeRowActions` (edit/delete)
- `StatsPanel`
- `FiltersBar`
- `ConfirmDialog`
- `ToastProvider`

---

## 11) Acceptance Criteria

### Auth
- User can sign in and sign out.
- Unauthenticated users cannot access `/dashboard`.

### Trades CRUD
- Create: adds trade and it persists after refresh.
- Edit: updates trade and recalculates stats.
- Delete: removes trade with confirmation.

### Stats Correctness
- Net PnL equals sum of per-trade pnl.
- Win rate computed accurately and consistent with trade list.
- Equity curve increases by each trade’s pnl in chronological order.

### Security
- RLS prevents cross-user access (verified by manual test with two users).

---

## 12) Testing Strategy (MVP)
- Unit tests (Domain):
  - `TradeCalculator` pnl for long/short
  - `StatsCalculator` metrics
- Integration tests (Infrastructure):
  - Repository mapping correctness (mock Supabase or local test env)
- UI smoke test:
  - Render dashboard, create/edit/delete flow (Playwright optional)

Suggested packages:
- Vitest (unit)
- Testing Library (React)
- Playwright (optional e2e)

---

## 13) MVP Delivery Plan (Milestones)

1. Project scaffold (Next.js + MUI + Supabase client + routing)
2. Auth flow + protected routes
3. Trades table read (list trades)
4. Add trade (create)
5. Edit/delete
6. Stats panel (domain calculators)
7. Filters + sorting
8. RLS + security pass
9. Polish & deploy (Vercel + Supabase)

---

## 14) Open Decisions (Pick defaults for MVP)
- Auth method: magic link vs email/password (recommend magic link for speed)
- Stats computed client-side vs server-side aggregation (recommend client-side initially)
- TypeScript: yes/no (recommend yes)
- Equity curve: include in MVP? (recommend optional “nice-to-have”)

---
