# Authentication Flow - Pure Essence Apothecary V2 API

## Overview

The V2 API supports **two authentication workflows**:
1. **Password-based authentication** (traditional)
2. **OTP-based authentication** (passwordless)

## Authentication Workflows

### 1. Registration Flow (New Users)

#### Option A: Traditional Registration (Password-based)
```
User enters details → POST /auth/register → Account created + Token returned
```

**Endpoint:** `POST /api/v2/auth/register`

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "token": "1|abc123...",
    "token_type": "Bearer"
  },
  "message": "Registration successful"
}
```

---

#### Option B: OTP-based Registration (Passwordless)

**Step 1: Request OTP for Registration**
```
User enters email → POST /auth/request-otp (context: register) → OTP sent
```

**Endpoint:** `POST /api/v2/auth/request-otp`

**Request:**
```json
{
  "identifier": "john@example.com",
  "method": "email"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "method": "email",
    "expires_in": 300,
    "dev_otp": "123456"  // Only in local environment
  },
  "message": "If an account exists with this identifier, an OTP has been sent."
}
```

**Note:** For security, the API does not reveal whether the user exists or not. The same response is returned regardless of registration status to prevent user enumeration attacks.

---

**Step 2: Verify OTP**
```
User enters OTP → POST /auth/verify-otp → OTP verified
```

**Endpoint:** `POST /api/v2/auth/verify-otp`

**Request:**
```json
{
  "identifier": "john@example.com",
  "method": "email",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true
  },
  "message": "OTP verified successfully. You may proceed."
}
```

**Note:** For security, the API does not reveal user registration status. The frontend should attempt both login and registration flows based on user intent.

---

**Step 3: Complete Registration**
```
Frontend shows registration form → POST /auth/register → Account created
```

User can now register with the verified email/phone.

---

### 2. Login Flow (Existing Users)

#### Option A: Traditional Login (Password-based)
```
User enters credentials → POST /auth/login → Token returned
```

**Endpoint:** `POST /api/v2/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "token": "2|xyz789...",
    "token_type": "Bearer"
  },
  "message": "Login successful"
}
```

**Error: Invalid Credentials (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

**Error: Inactive Account (403):**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Account is inactive"
  }
}
```

---

#### Option B: OTP-based Login (Passwordless)

**Step 1: Request OTP for Login**
```
User enters email → POST /auth/request-otp (context: login) → OTP sent
```

**Endpoint:** `POST /api/v2/auth/request-otp`

**Request:**
```json
{
  "identifier": "john@example.com",
  "method": "email"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": true,
    "method": "email",
    "expires_in": 300,
    "dev_otp": "123456"  // Only in local environment
  },
  "message": "If an account exists with this identifier, an OTP has been sent."
}
```

**Note:** For security, the API does not reveal whether the user exists or not. The same response is returned regardless of registration status to prevent user enumeration attacks.

---

**Step 2: Verify OTP**
```
User enters OTP → POST /auth/verify-otp → OTP verified + User info returned
```

**Endpoint:** `POST /api/v2/auth/verify-otp`

**Request:**
```json
{
  "identifier": "john@example.com",
  "method": "email",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true
  },
  "message": "OTP verified successfully. You may proceed."
}
```

**Note:** For security, the API does not reveal user registration status. The frontend should attempt both login and registration flows based on user intent.

---

**Step 3: Login with Verified Email**
```
Frontend automatically logs user in → POST /auth/login → Token returned
```

After OTP verification, the frontend should call the normal login endpoint (or you can create a dedicated OTP login endpoint that doesn't require password).

---

## Security Features & Changes

### 1. User Enumeration Prevention

**Security Issue:** APIs that reveal whether a user exists enable attackers to harvest valid email addresses/phone numbers.

**Solution Implemented:**
- ✅ Always return the same generic response regardless of user existence
- ✅ Same HTTP status code (200) whether user exists or not
- ✅ Generic message: "If an account exists with this identifier, an OTP has been sent."
- ✅ No `is_registered`, `context`, or `user_status` fields in response

### 2. Server-Side Context Inference

**Security Issue:** Client-controlled `context` parameter allows attackers to manipulate the authentication flow.

**Solution Implemented:**
- ✅ Removed `context` parameter from API request
- ✅ Backend infers context based on user existence: `$context = $isRegistered ? 'login' : 'register';`
- ✅ OTP is sent silently based on server-side determination

### 3. Error Messages

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| OTP request (user exists or not) | 200 | "If an account exists with this identifier, an OTP has been sent." |
| OTP verification success | 200 | "OTP verified successfully. You may proceed." |
| Account inactive | 403 | "Account is inactive. Please contact support." |
| Rate limit exceeded | 429 | Rate limit message with retry_after |

---

## Frontend Implementation Guide

### Registration Page

```javascript
// Step 1: Request OTP
async function requestRegisterOTP(email) {
  const response = await fetch('/api/v2/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: email,
      method: 'email'
      // No context parameter - server infers it
    })
  });

  const data = await response.json();

  if (data.success) {
    // Always show OTP verification screen
    // API doesn't reveal if user exists (security)
    showOTPVerificationScreen(email);
  }

  return data;
}

// Step 2: Verify OTP
async function verifyOTP(email, otp) {
  const response = await fetch('/api/v2/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: email,
      method: 'email',
      otp: otp
    })
  });

  const data = await response.json();

  if (data.success && data.data.verified) {
    // Show registration form
    // User will get error if they already exist when submitting
    showRegistrationForm(email);
  }

  return data;
}

// Step 3: Complete registration
async function completeRegistration(userData) {
  const response = await fetch('/api/v2/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (response.status === 422 && data.errors?.email?.includes('has already been taken')) {
    // User already exists - redirect to login
    alert('An account with this email already exists. Please login instead.');
    redirectToLogin();
  }

  return data;
}
```

---

### Login Page

```javascript
// Step 1: Request OTP
async function requestLoginOTP(email) {
  const response = await fetch('/api/v2/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: email,
      method: 'email'
      // No context parameter - server infers it
    })
  });

  const data = await response.json();

  if (data.success) {
    // Always show OTP verification screen
    // API doesn't reveal if user exists (security)
    showOTPVerificationScreen(email);
  }

  return data;
}

// Step 2: Verify OTP
async function verifyLoginOTP(email, otp) {
  const response = await fetch('/api/v2/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: email,
      method: 'email',
      otp: otp
    })
  });

  const data = await response.json();

  if (data.success && data.data.verified) {
    // OTP verified - attempt login
    // If login fails (user doesn't exist), redirect to registration
    return attemptLogin(email);
  }
}

// Step 3: Login (password-based)
async function login(email, password) {
  const response = await fetch('/api/v2/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });

  const data = await response.json();

  if (response.status === 401 && data.error?.code === 'INVALID_CREDENTIALS') {
    // Could be wrong password OR user doesn't exist
    // Don't reveal which one (security)
    showError('Invalid email or password.');
  }

  return data;
}
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/auth/register` | POST | Create new account (password-based) | No |
| `/auth/login` | POST | Login with password | No |
| `/auth/request-otp` | POST | Request OTP (server infers login/register context) | No |
| `/auth/verify-otp` | POST | Verify OTP code | No |
| `/auth/forgot-password` | POST | Request password reset | No |
| `/auth/reset-password` | POST | Reset password with token | No |
| `/auth/me` | GET | Get current user | **Yes** (Bearer token) |
| `/auth/logout` | POST | Logout current session | **Yes** (Bearer token) |

---

## Security Features

✅ **User enumeration prevention** - Generic responses; same message whether user exists or not
✅ **Server-side context inference** - Backend determines login vs register; client cannot manipulate
✅ **Rate limiting** - 3 OTP sends per hour per identifier, 5 verifications per minute
✅ **OTP hashing** - OTPs stored as bcrypt hashes (never plain text)
✅ **Expiry** - OTPs expire after 5 minutes
✅ **Attempt tracking** - Max 5 verification attempts per OTP session
✅ **Account lockout** - 15-minute lockout after failed attempts
✅ **Audit logging** - All OTP events logged with IP and user agent
✅ **Timing attack prevention** - Consistent response times via bcrypt
✅ **Replay attack prevention** - OTPs invalidated after successful verification

---

## Recommendation

**Create a dedicated OTP login endpoint** that doesn't require password after OTP verification:

```php
POST /auth/login-with-otp
{
  "identifier": "user@example.com",
  "otp_session_id": 123  // From verify-otp response
}
```

This would complete the passwordless login flow without needing to call the regular login endpoint.

Would you like me to implement this endpoint?
