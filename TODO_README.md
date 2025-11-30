# Full-Stack To‑Do Roadmap

Comprehensive checklist to take the storefront from API wiring to polished UX. Tackle each layer sequentially (or in parallel with API mocks). Tick an item only when it is both implemented and verified via manual or automated tests.

---

## 1. API Layer & Configuration
- [x] Finalize `VITE_API_BASE_URL` and secret-safe env handling (prod/dev parity).
- [ ] Implement a reusable `apiClient` with:
  - [x] Request/response interceptors (auth headers, refresh token rotation).
  - [x] Unified error normalization (status codes ? typed errors).
  - [x] Retry/backoff for idempotent calls (products, categories).
- [x] Add logging hooks (console in dev, optional remote logger in prod).
- [x] Ensure CORS + CSRF strategy documented (cookies vs bearer tokens).

## 2. Authentication & Authorization
- [x] Replace mock auth flows in `AuthContext` with `authAPI` calls.
- [x] Persist tokens securely (httpOnly cookie preferred; fallback to memory).
- [x] Refresh token lifecycle + silent renew.
- [x] Protect account routes via guarded layout + redirect.
- [x] Role-based UI toggles (hide admin-only controls entirely).
- [x] Forgot / reset password + optional email verification pages.

## 3. Data Domain Integration
### Products & Categories
- [x] Swap static `data/products.ts` for API-backed hooks (list, detail, related).
- [x] Category + tag fetch with caching (React Query/Zustand).
- [x] Filters (price, category, search, availability) mapped to API params.
- [x] Sorting (price asc/desc, newest, popular) wired to backend.
- [x] Pagination or infinite scroll w/ skeleton loaders.
- [x] Surface inventory & low-stock badges.

### Reviews
- [x] Fetch, submit, edit, delete reviews via `productsAPI`.
- [x] Enforce auth/ownership on review mutations.
- [x] Moderation messaging if backend flags review.

## 4. Cart & Checkout
- [x] Sync cart context with backend (guest cart → merge on login).
- [x] Support add/update/remove with optimistic UI + rollback.
- [x] Persist shipping address + preferred delivery options.
- [x] Fetch tax, shipping, discount totals from backend quote endpoint.
- [x] Integrate payment provider UI (Stripe/PayPal) and handle callbacks.
- [x] “Place order” mutation + success/failure messaging.

## 5. User Account Surfaces
- [x] Profile page bound to `userAPI` (name, email, phone, avatar upload).
- [x] Address CRUD tied to `addressesAPI` with validation + default flags.
- [x] Orders list & detail pages consuming `ordersAPI`.
- [x] Returns/support ticket flows hitting real endpoints.
- [x] Wishlist state synced via `wishlistAPI` (no local-only fallback).
- [x] Recently viewed + comparison contexts hydrated from backend.

## 6. Global State & Data Fetching
- [x] Introduce `/store` using React Query or Zustand:
  - [x] Query keys for products, categories, cart, user, orders.
  - [x] Mutations with cache invalidation + optimistic updates.
  - [x] Centralized loading/error handling hooks.
- [x] Migrate existing contexts (Cart, Wishlist, Theme, Currency) to use store where appropriate.

## 7. UI/UX Enhancements
- [x] Header search: autocomplete results & keyboard navigation.
- [x] Add skeletons/placeholders for product grids & account sections.
- [x] Global toast system for success/error (already using Sonner – ensure every mutation triggers feedback).
- [x] Mobile nav & drawer transitions tuned for accessibility (focus trap, ESC support).
- [x] Form validation (client + server errors surfaced inline).
- [x] 404 + 500 pages linked from router fallback.

## 8. Utilities & Helpers
- [x] Expand `/lib` with:
  - [x] `formatCurrency`, `formatDate`, `slugify`, `calculateCartTotals`.
  - [x] Pagination + query param helpers.
  - [x] Accessibility helpers (trap focus, announce to SR).
- [x] Create `/config/constants.ts` for app metadata, theme tokens, support emails.

## 9. Assets & Content
- [x] Compress hero/product imagery for performance.

## 10. Testing & Quality
- [ ] Add unit tests for hooks/contexts (Vitest).
- [ ] Integration tests for auth/cart/checkout flows with MSW mocks.
- [ ] Lighthouse/perf audit – ensure bundle splitting, lazy loading.
- [ ] ErrorBoundary coverage for entire app shell.

## 11. Performance & Resilience
- [x] Establish performance budgets (bundle size, TTI, LCP) and monitor via Lighthouse/SpeedCurve.
- [x] Implement code splitting + route-level lazy loading for heavy pages (Checkout, Account).
- [x] Serve optimized media via CDN; add responsive sources and preloading for hero assets.
- [x] Add offline/slow-network fallbacks (retry UI, cached cart state).
- [x] Instrument runtime with monitoring (Sentry/New Relic/Datadog) for errors and slow API calls.
- [x] Document load testing expectations for peak traffic.

## 12. Accessibility & UX Compliance
- [x] Run automated audits (axe/Lighthouse) and fix WCAG 2.1 AA issues.
- [x] Ensure full keyboard navigation: focus outlines, trap focus in dialogs/drawers, skip links.
- [x] Provide ARIA labels/descriptions for interactive components (carousel, search, modals).
- [x] Support prefers-reduced-motion, high-contrast modes, and sufficient color contrast.
- [x] Document accessibility acceptance criteria per feature.

## 13. Security Hardening
- [x] Enforce secure headers (CSP, X-Frame-Options, HSTS) via hosting config.
- [x] Sanitize all user inputs (forms, reviews) before submission; encode outputs.
- [x] Hide admin/debug routes behind auth checks; guard against open redirects.
- [x] Store secrets outside repo; rotate tokens/keys per environment.

## 14. Documentation & API Contracts
- [ ] For each feature touching the backend, author/update an expected API schema (OpenAPI/JSON schema) checked into the repo.
- [ ] Keep `API_DOCS.md` synchronized with schema changes and endpoint behavior.
- [ ] Document developer setup (env vars, scripts, test commands) and deployment steps.

---

**Implementation Tips**
- Tackle layers bottom-up: API client → hooks/store → contexts/components.
- Adopt feature folders as complexity grows (e.g., `/features/cart` encapsulating UI + logic).
- Document any backend contract assumptions in `API_DOCS.md` to keep parity across teams.
