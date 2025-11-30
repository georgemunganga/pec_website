# Accessibility & UX Acceptance Criteria

This document outlines the concrete checks every feature must satisfy before it ships. It complements `TODO_README.md` section 12.

## Automated Audits

1. Build the app: `bun run build && bun run preview`.
2. Run axe against the preview server (requires Chrome):  
   ```bash
   bunx @axe-core/cli http://localhost:4173 --exit
   ```
3. Capture Lighthouse (mobile + desktop) reports and attach to the pull request. Target WCAG 2.1 AA scores ≥ 95 for Accessibility.

## Keyboard & Focus

- Every interactive element must be reachable with <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd>.  
- Visible focus indicator (`:focus-visible`) is enforced globally; do not override it without providing an equally visible style.  
- Drawers, dialogs, and the mobile search modal trap focus and close with <kbd>Esc</kbd>.

## Screen Reader & ARIA

- Navigation landmarks: `Header`, `Footer`, `Main`, `nav` elements require `aria-label`s. Mobile navigation uses `aria-current="page"`.  
- Carousels expose `role="region"` plus “slide” announcements.  
- Buttons that only show icons must include `aria-label`/`.sr-only` copy.

## Motion & Contrast

- `prefers-reduced-motion` disables transitions/animations (see `src/index.css`).  
- `prefers-contrast: more` increases border/foreground contrast while preserving brand colors.  
- Avoid auto-playing motion; when necessary, provide pause controls.

## Feature-Level Acceptance

- **Auth & Account** pages must expose heading hierarchy (`h1` per page) and announce success/error messages via Sonner.  
- **Shop/Product** surfaces must provide semantic lists for grids and note price/availability text (no “color-only” signals).  
- **Cart/Checkout** flows must preserve form labels, helper text, and inline validation that is announced via `aria-live` (handled in form components).

## Regression Checklist

Before merging UI changes:

1. `bun run dev` → keyboard walkthrough of the affected feature.  
2. Run `bunx @axe-core/cli http://localhost:5173 --exit` against the dev server for quick smoke testing.  
3. Record findings (if any) in `IMPROVEMENTS.md` under “Accessibility”.

These steps ensure accessibility stays a first-class quality gate as the storefront evolves.
