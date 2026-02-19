# Implementation Phases — MVP Trading Journal

Based on [charaterization.md](./charaterization.md). Current state: domain, application, and infrastructure layers are complete; presentation layer is missing.

---

## Phase 1: Foundation & Auth UI

**Goal:** Add MUI, auth screens, and wire up protected routes.

**Scope:**
- Install and configure [MUI](https://mui.com/material-ui/getting-started/installation/) + React Hook Form + TanStack Query
- Create `app/(auth)/login/page.tsx` — sign-in form (magic link or email/password)
- Implement auth flow: sign in → redirect to dashboard; sign out
- Wire middleware to redirect unauthenticated users from `/dashboard` and `/trades` to `/login`
- Home page (`/`) — landing with “Sign in” / “Get Started” CTA

**Deliverables:**
- User can sign in and sign out
- Unauthenticated users cannot access `/dashboard`

**Ref:** §3.1, §10.1, §11.1, Milestone 2

---

## Phase 2: Dashboard & Trades List

**Goal:** Read trades and display them on the dashboard.

**Scope:**
- Create `app/dashboard/page.tsx` — main dashboard layout
- Add `StatsPanel` — Net PnL, win rate, avg PnL, avg % return, profit factor
- Add `TradeTable` — list trades with columns (symbol, asset type, side, dates, prices, PnL, etc.)
- Add `useTrades` and `useStats` hooks (TanStack Query)
- Server actions or API routes that call use cases
- Loading and empty states

**Deliverables:**
- Dashboard shows stats and trade list
- Stats are consistent with trade list

**Ref:** §3.3, §6.1, §9.2, §10.1, §10.2, Milestones 3 & 6

---

## Phase 3: Add Trade (Create)

**Goal:** Add new trades via a form dialog.

**Scope:**
- Add `TradeFormDialog` — form with all required and optional fields
- React Hook Form + Zod validation (reuse `createTradeSchema`)
- “Add trade” button opens dialog
- Submit → create trade via use case → invalidate cache → close dialog
- Inline validation and error messages

**Deliverables:**
- User can add a trade via form
- Trade persists and analytics update without refresh

**Ref:** §3.2, §4.5, §10.2, Milestone 4

---

## Phase 4: Edit & Delete Trades

**Goal:** Edit and delete existing trades.

**Scope:**
- Add `TradeRowActions` — edit and delete buttons per row
- Edit: open `TradeFormDialog` in edit mode, prefill, call `UpdateTrade` on save
- Delete: `ConfirmDialog` → call `DeleteTrade` on confirm
- Optimistic updates with rollback on error

**Deliverables:**
- User can edit and delete trades
- Changes persist and stats recompute correctly

**Ref:** §3.4, §4.5, §10.2, Milestone 5

---

## Phase 5: Filters & Sorting

**Goal:** Filter and sort trades.

**Scope:**
- Add `FiltersBar` — symbol, asset type, date range
- Table sorting: sort by exit date, PnL (asc/desc)
- Default sort: `exit_date desc`
- Wire filters and sort to `ListTrades` options
- Cache invalidation when filters change

**Deliverables:**
- User can filter by symbol, asset type, date range
- User can sort by exit date and PnL

**Ref:** §4.4, §10.2, Milestone 7

---

## Phase 6: Equity Curve & Polish

**Goal:** Optional equity curve and UX polish.

**Scope:**
- Add Recharts
- Add `EquityCurve` — cumulative PnL line chart (sorted by exit date asc)
- Add `ToastProvider` for global API errors
- Loading states for reads/writes
- Accessibility: keyboard navigation, labels on form fields

**Deliverables:**
- Equity curve chart (optional)
- Toast, loading, and error UX
- Basic accessibility

**Ref:** §2.1, §4.3, §5.4, §10.1, §10.2

---

## Phase 7: Deploy

**Goal:** Deploy to production.

**Scope:**
- Deploy Next.js to Vercel
- Configure Supabase project for production (URLs, keys)
- Security pass: verify RLS and auth flow
- Optional: smoke test with two users

**Deliverables:**
- App live on Vercel
- RLS and auth verified

**Ref:** §11.4, Milestone 9

---

## Summary

| Phase | Focus                    | Key Outputs                          |
|-------|--------------------------|--------------------------------------|
| 1     | Foundation & Auth UI     | MUI, login, protected routes         |
| 2     | Dashboard & Trades List  | StatsPanel, TradeTable, hooks       |
| 3     | Add Trade                | TradeFormDialog, create flow        |
| 4     | Edit & Delete            | TradeRowActions, ConfirmDialog     |
| 5     | Filters & Sorting        | FiltersBar, sort controls           |
| 6     | Equity Curve & Polish    | Chart, toast, loading, a11y         |
| 7     | Deploy                   | Vercel + Supabase production        |

---

## Dependencies

- **Phase 1** must be done first (auth, MUI, routing).
- **Phase 2** depends on Phase 1.
- **Phase 3** and **Phase 4** depend on Phase 2.
- **Phase 5** depends on Phase 2.
- **Phase 6** can be done in parallel with or after Phase 5.
- **Phase 7** after all other phases.
