# Pure Essence Apothecary - REST API Documentation

**Base URL:** `https://api.pureessenceapothecary.com/v1`

**Authentication:** Bearer token in `Authorization` header

---

## Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "0977883578"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0977883578",
      "createdAt": "2025-11-23T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "loyaltyPoints": 150
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0977883578",
    "loyaltyPoints": 150,
    "createdAt": "2025-11-23T10:00:00Z"
  }
}
```

### Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Request Password Reset
```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
```
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

---

## Product Endpoints

### Get All Products
```
GET /products?page=1&limit=20&search=moisturizer&category=skincare&minPrice=10&maxPrice=50&brand=everdrop&skinType=dry&sort=price_asc
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional)
- `category` (string, optional): skincare, makeup, foundation, etc.
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `brand` (string, optional)
- `skinType` (string, optional): dry, oily, combination, sensitive
- `sort` (string, optional): price_asc, price_desc, newest, popular, rating

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Ultra Dry Skin Moisturizer",
        "slug": "ultra-dry-skin-moisturizer",
        "description": "Intensive hydration for dry skin",
        "price": 18.00,
        "originalPrice": 32.00,
        "discount": 44,
        "category": "skincare",
        "brand": "Everdrop",
        "skinType": ["dry", "sensitive"],
        "images": [
          "https://cdn.example.com/products/moisturizer-1.jpg",
          "https://cdn.example.com/products/moisturizer-2.jpg"
        ],
        "stock": 45,
        "rating": 4.5,
        "reviewCount": 128,
        "isFeatured": true,
        "isNew": false,
        "tags": ["hydrating", "organic", "cruelty-free"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    },
    "filters": {
      "categories": ["skincare", "makeup", "foundation"],
      "brands": ["Everdrop", "Onne", "Pure Essence"],
      "priceRange": { "min": 5, "max": 100 },
      "skinTypes": ["dry", "oily", "combination", "sensitive"]
    }
  }
}
```

### Get Product by ID/Slug
```
GET /products/{id}
GET /products/slug/{slug}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ultra Dry Skin Moisturizer",
    "slug": "ultra-dry-skin-moisturizer",
    "description": "Intensive hydration for dry skin. Our advanced formula penetrates deep...",
    "longDescription": "Full product description with benefits, ingredients, usage...",
    "price": 18.00,
    "originalPrice": 32.00,
    "discount": 44,
    "category": "skincare",
    "brand": "Everdrop",
    "skinType": ["dry", "sensitive"],
    "images": ["url1", "url2", "url3"],
    "stock": 45,
    "rating": 4.5,
    "reviewCount": 128,
    "features": [
      "Hyaluronic acid formula",
      "24-hour hydration",
      "Non-comedogenic"
    ],
    "ingredients": "Water, Hyaluronic Acid, Glycerin...",
    "howToUse": "Apply morning and evening...",
    "variants": [
      { "size": "50ml", "price": 18.00, "stock": 45 },
      { "size": "100ml", "price": 29.00, "stock": 32 }
    ],
    "relatedProducts": [2, 5, 8],
    "tags": ["hydrating", "organic", "cruelty-free"]
  }
}
```

### Get Related Products
```
GET /products/{id}/related?limit=4
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Gentle Face Cleanser",
      "price": 15.00,
      "images": ["url"],
      "rating": 4.3
    }
  ]
}
```

---

## Review Endpoints

### Get Product Reviews
```
GET /products/{productId}/reviews?page=1&limit=10&rating=5
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `rating` (number, 1-5, optional): filter by star rating

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "userId": 5,
        "userName": "Sarah Johnson",
        "userAvatar": "https://cdn.example.com/avatars/5.jpg",
        "rating": 5,
        "title": "Amazing product!",
        "comment": "This moisturizer changed my skin completely...",
        "verifiedPurchase": true,
        "helpful": 24,
        "notHelpful": 2,
        "createdAt": "2025-11-20T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 128
    },
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 128,
      "ratingDistribution": {
        "5": 85,
        "4": 30,
        "3": 8,
        "2": 3,
        "1": 2
      }
    }
  }
}
```

### Submit Review
```
POST /products/{productId}/reviews
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Amazing product!",
  "comment": "This moisturizer changed my skin completely..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 129,
    "rating": 5,
    "title": "Amazing product!",
    "comment": "This moisturizer changed my skin completely...",
    "createdAt": "2025-11-23T10:00:00Z"
  }
}
```

### Mark Review Helpful
```
POST /reviews/{reviewId}/helpful
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "helpful": 25,
    "notHelpful": 2
  }
}
```

---

## Wishlist Endpoints

### Get User Wishlist
```
GET /wishlist
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productId": 5,
      "product": {
        "id": 5,
        "name": "Long Lasting Make Up Fixer",
        "price": 12.00,
        "images": ["url"],
        "stock": 23,
        "rating": 4.7
      },
      "addedAt": "2025-11-20T10:00:00Z"
    }
  ]
}
```

### Add to Wishlist
```
POST /wishlist
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "productId": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product added to wishlist"
}
```

### Remove from Wishlist
```
DELETE /wishlist/{productId}
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

---

## Cart Endpoints

### Get Cart
```
GET /cart
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "productId": 3,
        "product": {
          "id": 3,
          "name": "BB Cream",
          "price": 10.38,
          "images": ["url"],
          "stock": 15
        },
        "quantity": 2,
        "variant": "60ml"
      }
    ],
    "summary": {
      "subtotal": 20.76,
      "shipping": 5.00,
      "tax": 2.58,
      "discount": 0,
      "total": 28.34
    }
  }
}
```

### Add to Cart
```
POST /cart
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "productId": 3,
  "quantity": 2,
  "variant": "60ml"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product added to cart"
}
```

### Update Cart Item
```
PUT /cart/{itemId}
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
```
DELETE /cart/{itemId}
Headers: Authorization: Bearer {token}
```

### Apply Coupon
```
POST /cart/coupon
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "code": "SAVE20"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "discount": 5.52,
    "newTotal": 22.82
  }
}
```

---

## Order Endpoints

### Create Order
```
POST /orders
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "shippingAddressId": 1,
  "billingAddressId": 1,
  "paymentMethod": "mobile_money",
  "couponCode": "SAVE20",
  "giftMessage": "Happy Birthday!",
  "giftWrap": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "PE2LCHLRO",
    "total": 28.34,
    "paymentUrl": "https://payment.gateway.com/pay/abc123",
    "estimatedDelivery": "2025-11-30"
  }
}
```

### Get User Orders
```
GET /orders?page=1&limit=10&status=completed
Headers: Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (string, optional): pending, processing, shipped, completed, cancelled

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "PE2LCHLRO",
        "status": "shipped",
        "total": 28.34,
        "itemCount": 3,
        "createdAt": "2025-11-22T10:00:00Z",
        "estimatedDelivery": "2025-11-30"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5
    }
  }
}
```

### Get Order Details
```
GET /orders/{orderId}
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "PE2LCHLRO",
    "status": "shipped",
    "items": [
      {
        "productId": 3,
        "name": "BB Cream",
        "quantity": 2,
        "price": 10.38,
        "image": "url"
      }
    ],
    "shippingAddress": {
      "name": "Home",
      "street": "Kafue Rd Balmoral",
      "city": "Chilanga",
      "postalCode": "10101",
      "phone": "0977883578"
    },
    "payment": {
      "method": "mobile_money",
      "status": "paid",
      "paidAt": "2025-11-22T10:05:00Z"
    },
    "summary": {
      "subtotal": 20.76,
      "shipping": 5.00,
      "tax": 2.58,
      "discount": 0,
      "total": 28.34
    },
    "tracking": {
      "number": "TRK123456789",
      "carrier": "DHL",
      "status": "in_transit",
      "estimatedDelivery": "2025-11-30",
      "updates": [
        {
          "status": "picked_up",
          "location": "Lusaka Warehouse",
          "timestamp": "2025-11-22T14:00:00Z"
        }
      ]
    },
    "createdAt": "2025-11-22T10:00:00Z"
  }
}
```

### Track Order
```
GET /orders/{orderId}/tracking
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "PE2LCHLRO",
    "trackingNumber": "TRK123456789",
    "carrier": "DHL",
    "status": "in_transit",
    "estimatedDelivery": "2025-11-30",
    "timeline": [
      {
        "status": "order_placed",
        "timestamp": "2025-11-22T10:00:00Z",
        "location": "Online"
      },
      {
        "status": "processing",
        "timestamp": "2025-11-22T11:00:00Z",
        "location": "Lusaka Warehouse"
      },
      {
        "status": "picked_up",
        "timestamp": "2025-11-22T14:00:00Z",
        "location": "Lusaka Warehouse"
      },
      {
        "status": "in_transit",
        "timestamp": "2025-11-23T08:00:00Z",
        "location": "Chilanga Hub"
      }
    ]
  }
}
```

### Download Invoice
```
GET /orders/{orderId}/invoice
Headers: Authorization: Bearer {token}
```

**Response:** PDF file

### Cancel Order
```
POST /orders/{orderId}/cancel
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

### Reorder
```
POST /orders/{orderId}/reorder
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Items added to cart"
}
```

---

## Address Endpoints

### Get User Addresses
```
GET /addresses
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Home",
      "street": "Kafue Rd Balmoral",
      "city": "Chilanga",
      "postalCode": "10101",
      "phone": "0977883578",
      "isDefault": true
    }
  ]
}
```

### Add Address
```
POST /addresses
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Office",
  "street": "Cairo Road",
  "city": "Lusaka",
  "postalCode": "10101",
  "phone": "0977883578",
  "isDefault": false
}
```

### Update Address
```
PUT /addresses/{id}
Headers: Authorization: Bearer {token}
```

### Delete Address
```
DELETE /addresses/{id}
Headers: Authorization: Bearer {token}
```

### Set Default Address
```
POST /addresses/{id}/set-default
Headers: Authorization: Bearer {token}
```

---

## User Profile Endpoints

### Update Profile
```
PUT /profile
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "0977883578"
}
```

### Change Password
```
POST /profile/change-password
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

### Upload Profile Picture
```
POST /profile/avatar
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
avatar: (file)
```

---

## Returns & Refunds Endpoints

### Get User Returns
```
GET /returns
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderId": "PE2LCHLRO",
      "status": "approved",
      "reason": "Product damaged",
      "refundAmount": 28.34,
      "createdAt": "2025-11-23T10:00:00Z"
    }
  ]
}
```

### Create Return Request
```
POST /returns
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "PE2LCHLRO",
  "items": [
    {
      "productId": 3,
      "quantity": 1,
      "reason": "Product damaged"
    }
  ],
  "description": "The product arrived with a crack in the bottle",
  "images": ["url1", "url2"]
}
```

---

## Support Endpoints

### Get Support Tickets
```
GET /support/tickets
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subject": "Order not received",
      "status": "open",
      "priority": "high",
      "createdAt": "2025-11-23T10:00:00Z",
      "lastReply": "2025-11-23T11:00:00Z"
    }
  ]
}
```

### Create Support Ticket
```
POST /support/tickets
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "subject": "Order not received",
  "category": "order_issue",
  "priority": "high",
  "message": "I haven't received my order yet...",
  "orderId": "PE2LCHLRO"
}
```

### Get Ticket Messages
```
GET /support/tickets/{id}/messages
Headers: Authorization: Bearer {token}
```

### Reply to Ticket
```
POST /support/tickets/{id}/messages
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "message": "Thank you for the update..."
}
```

---

## Notification Endpoints

### Get User Notifications
```
GET /notifications?page=1&limit=20&unreadOnly=true
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "order_shipped",
        "title": "Your order has shipped!",
        "message": "Order PE2LCHLRO is on its way",
        "read": false,
        "createdAt": "2025-11-23T10:00:00Z",
        "data": {
          "orderId": "PE2LCHLRO"
        }
      }
    ],
    "unreadCount": 3
  }
}
```

### Mark Notification as Read
```
POST /notifications/{id}/read
Headers: Authorization: Bearer {token}
```

### Mark All as Read
```
POST /notifications/read-all
Headers: Authorization: Bearer {token}
```

---

## Search & Autocomplete

### Search Products
```
GET /search?q=moisturizer&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Ultra Dry Skin Moisturizer",
        "price": 18.00,
        "image": "url",
        "category": "skincare"
      }
    ],
    "suggestions": [
      "moisturizer for dry skin",
      "moisturizer organic",
      "moisturizer night cream"
    ]
  }
}
```

---

## Recently Viewed

### Get Recently Viewed Products
```
GET /recently-viewed
Headers: Authorization: Bearer {token} (optional)
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ultra Dry Skin Moisturizer",
      "price": 18.00,
      "image": "url",
      "viewedAt": "2025-11-23T09:00:00Z"
    }
  ]
}
```

### Track Product View
```
POST /recently-viewed
```

**Request Body:**
```json
{
  "productId": 1
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409) - e.g., email already exists
- `RATE_LIMIT_EXCEEDED` (429)
- `SERVER_ERROR` (500)

---

## Notes for Backend Team

1. **Authentication:** Use JWT tokens with 7-day expiry
2. **Pagination:** Default limit 20, max 100
3. **File Uploads:** Max 5MB per image, accept jpg/png/webp
4. **Rate Limiting:** 100 requests/minute per IP
5. **CORS:** Enable for frontend domain
6. **Timestamps:** Use ISO 8601 format (UTC)
7. **Prices:** Store in cents/smallest currency unit
8. **Stock:** Decrement on order creation, increment on cancellation
9. **Search:** Implement fuzzy search with typo tolerance
10. **Webhooks:** Send to frontend for real-time updates (order status, etc.)
