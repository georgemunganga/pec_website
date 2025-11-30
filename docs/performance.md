# Performance & Resilience Playbook

This document codifies the targets and guardrails for the storefront so the team can validate changes consistently.

## Budgets

| Metric | Target | Notes |
| --- | --- | --- |
| Initial JS bundle (post-code-splitting) | ≤ 280KB gzipped | Enforced via `bun run perf:budget` after `bun run build`. |
| Initial CSS | ≤ 120KB gzipped | Checked by the same budget script. |
| LCP (hero image) | ≤ 2.5s on 3G Fast | Validate with Lighthouse mobile config. |
| TTI | ≤ 3.0s | Captured in scheduled Lighthouse runs (see below). |

## Monitoring

- `initMonitoring` wires clients to `VITE_MONITORING_ENDPOINT` (e.g., Sentry, Datadog intake).  
- Every API request reports `{url, method, status, duration}`; slow responses (>2s) emit a UI banner and telemetry event.  
- Production builds must define the env var to ensure beacons reach your APM of choice.

## Automated Audits

1. `bun run build`
2. `bun run perf:budget` – fails if JS/CSS bundles exceed limits.
3. `bunx lighthouse http://localhost:4173 --preset=desktop` or `bunx @lhci/cli autorun` to store reports. Upload JSON/HTML to SpeedCurve for continuous tracking.

## Load / Stress Testing Expectations

- Traffic profile: up to 500 concurrent shoppers, 50 concurrent checkout flows.
- Use k6 or Artillery against `/api/products`, `/api/cart`, `/api/orders` with RPS ramps of 50 → 150 over 10 minutes.
- Collect Apdex (0.5s threshold) plus error rates; flag if >1% 5xx.
- Coordinate load tests with backend team; document results in `IMPROVEMENTS.md`.

## Resilience UX

- Offline mode: the cart persists in `localStorage`, and a banner surfaces connectivity issues with a manual retry.
- Slow network indicator triggers when API calls exceed 2 seconds and automatically resolves after 7 seconds.
- Use the `NetworkStatusBanner` snapshot as UX reference during manual QA.

