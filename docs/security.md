# Security Hardening Guide

This repo ships with client-side safeguards, but production deployments must also enforce headers and environment hygiene. Use this checklist when provisioning an environment.

## 1. Secure Headers

- **Content Security Policy** - Copy `config/security-headers.json` into your hosting provider's header config (Vercel, Netlify, CloudFront). Tweak `connect-src` with the actual API origin(s).
- **Transport** - Force HTTPS and enable HSTS (`Strict-Transport-Security` header already included in the sample).
- **Framing & Sniffing** - `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` prevent click-jacking and MIME sniffing.

`index.html` also contains equivalent `<meta http-equiv>` tags for local development.

## 2. Environment Secrets

- Never commit `.env`; use `.env.example` as the reference.  
- Each environment (dev, staging, prod) should inject secrets through your hosting console or CI pipeline.  
- Rotate API credentials quarterly and whenever a developer leaves the team.

## 3. Input Sanitization

- `sanitizePayload` removes HTML or scripting before any payload leaves the browser (`src/lib/security.ts`).  
- Apply `sanitizePayload` whenever you add API calls or form submissions by using the shared `json()` helper exported from `src/lib/security.ts`.

## 4. AuthN/AuthZ

- `withProtectedRoute` blocks anonymous users. For admin-only flows, pass `{ roles: ['admin'] }` (see component doc) once the backend exposes role metadata.
- When integrating OAuth redirect flows, validate return URLs with `isSafeRedirect` from `src/lib/security.ts` to block open redirects.

## 5. Incident Response

- Monitoring beacons (`VITE_MONITORING_ENDPOINT`) capture API failures and JS errors. Point this to Sentry or Datadog.  
- Log anomalies (rate spikes, blocked CSP violations) and document responses in `IMPROVEMENTS.md`.

Adhering to this playbook satisfies the items in Section 13 of `TODO_README.md` and keeps the storefront compliant with common ecommerce security expectations.
