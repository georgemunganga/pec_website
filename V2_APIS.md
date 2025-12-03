# V2 Storefront API Reference

**Base URL:** `/api/v2`  
**Audience:** Pure Essence Apothecary ecommerce frontend team  
**Last Updated:** December 2, 2025

---

## Response Envelope

All controllers extend `App\Http\Controllers\API\V2\BaseController`, so every endpoint shares the same envelope:

| Scenario | Structure |
| --- | --- |
| Success | `{"success": true, "data": { ... }, "message": "optional"}` |
| Paginated Success | Same as above with `data.pagination = { page, limit, total, totalPages }` |
| Failure | `{"success": false, "error": {"code": "SCREAMING_SNAKE", "message": "Readable text", "details": {...optional}}}` |

**HTTP Status Codes**

- `200 / 201` → Successful operations
- `204` → Success with no body (deletes)
- `400` → Business rule violation / bad request
- `401 / 403` → Auth issues (`UNAUTHORIZED`, `FORBIDDEN`)
- `404` → Missing resource (`NOT_FOUND`, etc.)
- `422` → Validation error (`VALIDATION_ERROR`)

**Headers**

- `Authorization: Bearer <token>` for authenticated customers (Sanctum)
- `X-Session-Id: <uuid>` for guest cart + recently viewed tracking

---

## Public Endpoints

### Authentication (placeholders – responses are static messages until implementation lands)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| POST | `/auth/register` | `{"success":true,"data":{"message":"Registration endpoint - To be implemented"}}` | n/a |
| POST | `/auth/login` | `{"success":true,"data":{"message":"Login endpoint - To be implemented"}}` | n/a |
| POST | `/auth/forgot-password` | `{"success":true,"data":{"message":"Forgot password endpoint - To be implemented"}}` | n/a |
| POST | `/auth/reset-password` | `{"success":true,"data":{"message":"Reset password endpoint - To be implemented"}}` | n/a |
| POST | `/auth/request-otp` | `{"success":true,"data":{"message":"Request OTP endpoint - To be implemented"}}` | n/a |
| POST | `/auth/verify-otp` | `{"success":true,"data":{"message":"Verify OTP endpoint - To be implemented"}}` | n/a |

### Product Catalog

| Method | Path | Description | Success | Failure |
| --- | --- | --- | --- | --- |
| GET | `/products` | Listing placeholder | `{"success":true,"data":{"products":[],"pagination":[]},"message":"Products retrieved"}` | n/a |
| GET | `/products/{id}` | Product detail placeholder | `{"success":true,"data":[],"message":"Product retrieved"}` | n/a |
| GET | `/products/slug/{slug}` | Product by slug placeholder | same as above | n/a |
| GET | `/products/{id}/related` | Related products | `{"success":true,"data":[ProductResource...],"message":"Related products retrieved successfully"}` | `{"success":false,"error":{"code":"<exception>",...}}` (400) |

**`ProductResource`** now includes:

```jsonc
{
  "id": 1,
  "name": "Baobab Oil",
  "code": "PEA0001",
  "product_code": "PEA0001",
  "description": "Pack size: 100ml",
  "main_image": "https://cdn/.../main.jpg",
  "gallery_images": [
    {"id": 10, "url": ".../gallery-1.jpg", "thumbnail": ".../gallery-1-thumb.jpg"}
  ],
  "price": {"cost": 65, "sale_price": 100, "currency": "USD"},
  "category": {"id": 2, "name": "Oils"},
  "brand": {"id": 1, "name": "Pure Essence"},
  "rating": {"average": 4.8, "count": 17},
  "stock": {"available": 25, "in_stock": true},
  "unit": 1,
  "tax": {"rate": 0, "type": 1},
  "created_at": "2025-12-02T09:00:00Z",
  "updated_at": "2025-12-02T09:00:00Z"
}
```

### Search (`GET /search`)

- Query params: `q`, `category_id`, `brand_id`, `min_price`, `max_price`, `min_rating`, `sort_by`, `per_page`, `suggestions`.
- **Success (results):**

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 20,
    "total": 45,
    "filters": {
      "categories": [{"id": 2, "name": "Oils"}],
      "brands": [{"id": 1, "name": "Pure Essence"}],
      "price_range": {"min": 25, "max": 250}
    },
    "pagination": {"page":1,"limit":20,"total":45,"totalPages":3}
  },
  "message": "Search results for 'oil'"
}
```

- **Suggestions:** Pass `?suggestions=1` → `{"success":true,"data":{"suggestions":["Baobab Oil","Mongongo Oil"]},"message":"Search suggestions retrieved"}`

### Recently Viewed (public)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/recently-viewed` | Accepts optional `limit`. Returns `ProductResource` collection. |
| POST | `/recently-viewed` | Body `{ "product_id": 12 }`, header `X-Session-Id` required for guests. Success returns `{"data":{"tracked":true}}`. Missing both auth and header yields `400` with code `EITHER_AUTHENTICATION_OR_X_SESSION_ID_HEADER_IS_REQUIRED`. |

### Payment Webhooks (public)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| POST | `/payments/webhook` | `{"success":true,"data":{"processed":true}}` (payload depends on service) | Missing signature ⇒ `{"success":false,"error":{"code":"MISSING_SIGNATURE",...}}` (400) or invalid signature ⇒ 401. |
| GET | `/payments/callback?reference=REF` | Returns verification status from Lenco Pay. Omitting `reference` ⇒ 400. |

---

## Authenticated Endpoints

> All routes below require Sanctum auth. Include `X-Session-Id` when interacting as a guest transitioning to logged-in state (cart sync, recently viewed, etc.).

### Auth & Profile

- `GET /auth/me`, `POST /auth/logout`, `PUT /profile`, `POST /profile/change-password`, `POST /profile/avatar` currently return placeholder success messages. Expect standard envelope; failures bubble up when implementation is completed.

### Wishlist (`/wishlist`)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| GET | `/wishlist` | `{"data":[WishlistResource...]}` | 401 if unauthenticated |
| POST | `/wishlist` | 201 + `WishlistResource` | `404` (`Product not found or unavailable`), `400` (`Product already in wishlist`) |
| POST | `/wishlist/toggle` | `{"data":{"added":true,"wishlist":{...}}}` or `{"data":{"added":false}}` | Same as above |
| GET | `/wishlist/check/{productId}` | `{"data":{"in_wishlist":true}}` | 401 |
| DELETE | `/wishlist/{productId}` | `204 No Content` | `404` (`Product not found in wishlist`) |

### Recently Viewed (auth scope)

- `GET /recently-viewed`, `POST /recently-viewed/track`, `POST /recently-viewed/clear`, `DELETE /recently-viewed/{productId}`, `GET /recently-viewed/trending` mirror the public behavior but scoped to user ID. All wrap exceptions via `sendError(...,400)`.

### Cart (`/cart`)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| GET | `/cart` | `{"data": CartResource}` | 401 if token missing |
| POST | `/cart` | 201 + updated cart | Validation errors (422) or service errors (400, message from exception) |
| PUT | `/cart/{itemId}` | Updated cart | `400` if item missing/out of stock |
| DELETE | `/cart/{itemId}` | `204` | `400` on invalid item |
| POST | `/cart/quote` | `{"data":{"delivery_option":"standard","totals":...}}` | Validation failure ⇒ 422 |
| POST | `/cart/shipping` | `{"data":CartResource}` | 400 on service error |
| POST | `/cart/coupon` | Updated cart | `400` if coupon invalid |
| DELETE | `/cart/coupon` | `204` | n/a |
| POST | `/cart/clear` | `{"data":{"cleared":true}}` | n/a |

### Addresses (`/addresses`)

- `GET /addresses` → list
- `POST /addresses` → created address (201)
- `PUT /addresses/{id}` → updated address
- `DELETE /addresses/{id}` → `204`
- `POST /addresses/{id}/set-default` → marks default

All methods wrap repository/service exceptions in `sendError($e->getMessage(), 400)` (e.g., deleting default when not allowed).

### Orders (`/orders`)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| GET | `/orders` | Paginated order history | 401 |
| POST | `/orders` | `{"data":{"order_number":"PO-123","status":"pending",...}}` | Validation errors → 422, service issues → 400 |
| GET | `/orders/{orderId}` | Order detail | `404` if not found |
| GET | `/orders/{orderId}/tracking` | Tracking array | 404 |
| GET | `/orders/{orderId}/invoice` | Invoice metadata / link | 404 |
| POST | `/orders/{orderId}/cancel` | `{"data":{"cancelled":true}}` | `404` or `400` if status disallows cancellation |
| POST | `/orders/{orderId}/reorder` | Creates new draft order | `404` or `400` |

### Product Reviews

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| GET | `/products/{productId}/reviews` | `{"data":[ReviewResource...]}` | 404 if product missing |
| GET | `/products/{productId}/reviews/statistics` | `{"data":{"average":4.8,"count":17,"breakdown":{...}}}` | 404 |
| POST | `/products/{productId}/reviews` | 201 + review | `400` or `422` (validation) |
| PUT | `/products/{productId}/reviews/{reviewId}` | Updated review | 404 if review not owned |
| DELETE | `/products/{productId}/reviews/{reviewId}` | `204` | 404 |
| POST | `/reviews/{reviewId}/helpful` | `{"data":{"helpful":true}}` | 404 |
| POST | `/reviews/{reviewId}/not-helpful` | `{"data":{"helpful":false}}` | 404 |

### Payments (`/payments`)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| POST | `/payments/initialize/card` | `{"data":{"requires_redirect":false,"reference":"PO-123",...}}` | `404` (order not found), `400` (`Order has already been paid`, `Cash on delivery orders do not require online payment`) |
| POST | `/payments/initialize/mobile-money` | `{"data":{"reference":"PO-123","status":"pending"}}` | Same as above |
| GET | `/payments/verify/{reference}` | `{"data":{"verified":true,"order_number":"PO-123","amount_paid":100}}` | `404` (order not found), `403` (Unauthorized) |
| GET | `/payments/status/{orderNumber}` | Summary of payment attempts | `404`/`403` |
| GET | `/payments/channels` | Available channels | n/a |
| GET | `/payments/methods` | Payment method list | n/a |
| GET | `/payments/mobile-money/networks` | `[ "MTN","AIRTEL","VODAFONE","TIGO" ]` | n/a |

### Shipping (`/shipping`)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| POST | `/shipping/rates` | `{"data":{"rates":[...]}}` | 400 |
| GET | `/shipping/methods` | Methods + price ranges | n/a |
| GET | `/shipping/pickup-locations` | Locations list | n/a |
| GET | `/shipping/zones` | Shipping zones | n/a |
| GET | `/shipping/track/{trackingNumber}` | Tracking detail | `404` or `403` |
| GET | `/shipping/order/{orderNumber}` | Associated shipment | `404` / `403` |
| GET | `/shipping/proof/{trackingNumber}` | Delivery proof metadata | `404` / `403` / `400` (proof not available) |
| POST | `/shipping/validate` | `{ "valid": true }` | 400 |

### Returns (`/returns`)

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| GET | `/returns` | Paginated returns | 401 |
| POST | `/returns` | 201 + return detail | 400 (service error) |
| GET | `/returns/{returnNumber}` | Return detail | `404` |
| POST | `/returns/{returnNumber}/tracking` | Updated tracking info | 404 |
| POST | `/returns/{returnNumber}/cancel` | `{"data":{"cancelled":true}}` | 404 / 400 |
| GET | `/returns/{returnNumber}/refund-estimate` | `{"data":{"estimated_refund":100}}` | 404 |

### Support & Notifications

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| GET | `/support/tickets` | Ticket list | 401 |
| POST | `/support/tickets` | 201 + ticket | 400 |
| GET | `/support/tickets/{ticketId}/messages` | Messages | 404 |
| POST | `/support/tickets/{ticketId}/messages` | 201 + message | 404 / 400 |
| GET | `/notifications` | Notification list | 401 |
| POST | `/notifications/{id}/read` | `{"data":{"read":true}}` | 404 |
| POST | `/notifications/read-all` | `{"data":{"read_all":true}}` | 400 (if service fails) |

---

## Integration Checklist

1. **Always inspect `success`.** If `false`, read `error.code` for user messaging.
2. **Handle 204** responses (DELETEs) by checking status code, not body.
3. **Provide `X-Session-Id`** for anonymous cart/recently-viewed flows; the same ID must be reused until checkout/login.
4. **Watch for placeholders.** Auth/profile endpoints currently return static messages—you can integrate request/response scaffolding now and wire dynamic behavior once implemented.
5. **Paginated endpoints** (`/search`, `/orders`, `/returns`, `/support/tickets`, etc.) always include `data.pagination`.
6. **Media fields**: `ProductResource` now exposes both `main_image` (primary shot) and `gallery_images[]` (new ecommerce gallery) alongside the legacy `images` array.

With this reference the frontend can double-check every integration path while hooking up the storefront. Let the backend team know if you need sample payloads for any service not covered above.***
