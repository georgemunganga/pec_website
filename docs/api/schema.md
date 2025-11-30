# Pure Essence Apothecary – API Schema Cheat Sheet

Reference guide for frontend devs. Each endpoint returns `application/json` unless otherwise stated and wraps payloads in `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code": string, "message": string } }`.

## 1. Authentication

### POST `/auth/register`
```json
{
  "name": "string",
  "email": "user@example.com",
  "password": "secret",
  "phone": "+260977883578"
}
```
**201 Response**
```json
{
  "success": true,
  "data": {
    "user": { "...User" },
    "token": "jwt"
  }
}
```

### POST `/auth/login`
```json
{ "email": "user@example.com", "password": "secret" }
```
**200 Response** – same as register.

### GET `/auth/me` *(auth required)*
**200 Response** `data = User`

### POST `/auth/logout`
**200 Response** `{ "success": true, "message": "Logged out successfully" }`

### POST `/auth/request-otp`
```json
{ "identifier": "user@example.com", "method": "email" }
```
**200 Response** message.

### POST `/auth/verify-otp`
```json
{ "identifier": "user@example.com", "otp": "123456" }
```
**200 Response** same as register/login.

### POST `/auth/forgot-password`
```json
{ "email": "user@example.com" }
```

### POST `/auth/reset-password`
```json
{ "token": "reset-token", "password": "newSecret" }
```

## 2. Catalog

### GET `/products`
Query params: `page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`, `brand`, `skinType`, `sort`.

**200 Response**
```json
{
  "success": true,
  "data": {
    "products": [ "...Product" ],
    "pagination": { "page": 1, "limit": 20, "total": 156 }
  }
}
```

### GET `/products/{id}` or `/products/slug/{slug}`
**200 Response** `data = Product`

### GET `/products/{id}/related?limit=4`
**200 Response** `data = Product[]`

### GET `/search?q=term&limit=10`
**200 Response** `data = { "products": [...], "suggestions": ["term"] }`

### GET `/products/{productId}/reviews`
Query: `page`, `limit`, `rating`.

**200 Response**
```json
{
  "success": true,
  "data": {
    "reviews": [ "...Review" ],
    "pagination": { "page": 1, "limit": 10, "total": 128 }
  }
}
```

### POST `/products/{productId}/reviews` *(auth)*
```json
{ "rating": 5, "title": "string", "comment": "string" }
```
**201 Response** `data = Review`

### PUT `/products/{productId}/reviews/{reviewId}` *(auth)*
Same body as POST. **200 Response** review.

### DELETE `/products/{productId}/reviews/{reviewId}` *(auth)*
**204 Response** empty.

### POST `/reviews/{reviewId}/helpful` *(auth)*
**200 Response** message or helpful counts.

## 3. Wishlist *(auth)*

- **GET `/wishlist`** → `data = Product[]`
- **POST `/wishlist`** body `{ "productId": 5 }` → 201 message
- **DELETE `/wishlist/{productId}`** → 204 empty

## 4. Cart *(auth)*

- **GET `/cart`** → `data = Cart`
- **POST `/cart`** `{ "productId": 3, "quantity": 2, "variant": "60ml" }` → 201 cart
- **PUT `/cart/{itemId}`** `{ "quantity": 3 }` → 200 cart
- **DELETE `/cart/{itemId}`** → 204
- **POST `/cart/quote`** `{ "shipping": ShippingAddress, "deliveryOption": "express" }` → 200 cart totals
- **POST `/cart/shipping`** `ShippingAddress` → 200 cart
- **POST `/cart/coupon`** `{ "code": "SAVE20" }` → 200 cart
- **DELETE `/cart/coupon`** → 204
- **POST `/cart/clear`** → 204

`Cart` object:
```json
{
  "items": [
    {
      "id": 1,
      "productId": 3,
      "product": { "...Product" },
      "quantity": 2,
      "variant": "60ml"
    }
  ],
  "summary": {
    "subtotal": 20.76,
    "shipping": 5.0,
    "tax": 2.58,
    "discount": 0,
    "total": 28.34
  },
  "couponCode": "SAVE20"
}
```

## 5. Orders *(auth)*

### POST `/orders`
```json
{
  "paymentMethod": "mobile_money",
  "shippingAddressId": 1,
  "billingAddressId": 1,
  "couponCode": "SAVE20",
  "giftMessage": "Happy Birthday!",
  "giftWrap": true,
  "shippingDetails": ShippingAddress,
  "deliveryOption": "standard"
}
```
**201 Response**
```json
{
  "success": true,
  "data": {
    "orderId": "PE2LCHLRO",
    "status": "processing",
    "total": 28.34,
    "paymentUrl": "https://payment...",
    "estimatedDelivery": "2025-11-30"
  }
}
```

### GET `/orders?page=1&limit=10&status=completed`
`data = { "orders": [OrderSummary], "pagination": ... }`

### GET `/orders/{orderId}`
`data = OrderDetail` (items, shippingAddress, summary, tracking).

### GET `/orders/{orderId}/tracking`
`data = { "orderId": "...", "trackingNumber": "...", "timeline": [...] }`

### GET `/orders/{orderId}/invoice`
Returns PDF stream.

### POST `/orders/{orderId}/cancel`
```json
{ "reason": "Changed my mind" }
```

### POST `/orders/{orderId}/reorder`
Rehydrates cart; response `data = Cart`.

## 6. Addresses *(auth)*

- **GET `/addresses`** → `data = Address[]`
- **POST `/addresses`** `AddressPayload` → 201 message
- **PUT `/addresses/{id}`** `AddressPayload` → 200 message
- **DELETE `/addresses/{id}`** → 204
- **POST `/addresses/{id}/set-default`** → 200 message

`AddressPayload` contains `name`, `street/line1`, `city`, `region`, `postalCode`, `country`, `phone`, `isDefault`.

## 7. Account *(auth)*

- **PUT `/profile`** `{ "name": "Jane Doe", "phone": "0977..." }` → 200 message
- **POST `/profile/change-password`** `{ "currentPassword": "", "newPassword": "" }` → 200
- **POST `/profile/avatar`** multipart field `avatar` → uploaded file metadata.

## 8. Returns *(auth)*

### GET `/returns`
Returns `data = Return[]`.

### POST `/returns`
```json
{
  "orderId": "PE2LCHLRO",
  "items": [
    { "productId": 3, "quantity": 1, "reason": "Product damaged" }
  ],
  "description": "Package leaked",
  "images": ["https://..."]
}
```
**201 Response** message + `returnId`.

## 9. Support *(auth)*

- **GET `/support/tickets`** → `data = Ticket[]`
- **POST `/support/tickets`** `{ "subject": "Order not received", "category": "order_issue", "priority": "high", "message": "..." }`
- **GET `/support/tickets/{ticketId}/messages`** → `data = Message[]`
- **POST `/support/tickets/{ticketId}/messages`** `{ "message": "Thanks!" }`

## 10. Notifications *(auth)*

- **GET `/notifications?page=1&limit=20&unreadOnly=true`** → `data = { "notifications": [...], "unreadCount": 3 }`
- **POST `/notifications/{id}/read`** → message
- **POST `/notifications/read-all`** → message

## 11. Recently Viewed *(auth optional)*

- **GET `/recently-viewed`** → `data = Product[]` augmented with `viewedAt`
- **POST `/recently-viewed`** `{ "productId": 1 }` → 201 message

---

### Shared Schemas
- `User`: `id`, `name`, `email`, `phone`, `role`, `loyaltyPoints`, timestamps.
- `Product`: `id`, `name`, `slug`, `description`, `longDescription`, `price`, `originalPrice`, `discount`, `category`, `brand`, `skinType[]`, `images[]`, `stock`, `rating`, `reviewCount`, `tags[]`, `features[]`, `variants[]`.
- `Review`: `id`, `userId`, `userName`, `rating`, `title`, `comment`, `verifiedPurchase`, `helpful`, `notHelpful`, `createdAt`.
- `Return`, `Ticket`, `Notification`, `OrderDetail` objects mirror the shapes already documented in `API_DOCS.md`.

Use this sheet alongside `API_DOCS.md` for sample payloads and business rules. Update both whenever backend contracts change.
