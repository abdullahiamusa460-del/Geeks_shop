# GeeksShop — Frontend Integration & Backend Handover Guide

> **Document Version:** 1.0.0  
> **Backend Target:** Node.js (ESM) / Express 5 / MongoDB (Mongoose 8)  
> **Default API Base URL:** `http://localhost:4000/api`  
> **Frontend Default Origin:** `http://localhost:5173` (Vite dev server)  
> **Author:** GeeksShop Backend Team  

---

## Table of Contents

1. [Executive Summary & Architecture](#1-executive-summary--architecture)
2. [Local Environment & Server Setup](#2-local-environment--server-setup)
3. [Network Protocol & Global API Conventions](#3-network-protocol--global-api-conventions)
4. [Standard Error Handling & Form Binding](#4-standard-error-handling--form-binding)
5. [Phase 1: Live Authentication & User Endpoints](#5-phase-1-live-authentication--user-endpoints)
   - [Health Check (`GET /api/health`)](#health-check-get-apihealth)
   - [User Registration (`POST /api/auth/register`)](#user-registration-post-apiauthregister)
   - [User Login (`POST /api/auth/login`)](#user-login-post-apiauthlogin)
   - [Current Session / Profile (`GET /api/auth/me`)](#current-session--profile-get-apiauthme)
6. [Frontend Client Integration Recipe](#6-frontend-client-integration-recipe)
   - [Replacing Mock Client Storage (`storage.ts`)](#replacing-mock-client-storage-storagets)
   - [Configuring the HTTP Client (Axios / Fetch)](#configuring-the-http-client-axios--fetch)
   - [Auth Provider & Token Lifecycle](#auth-provider--token-lifecycle)
   - [Direct Form Error Binding](#direct-form-error-binding)
7. [System Roadmap & Upcoming API Contracts](#7-system-roadmap--upcoming-api-contracts)
   - [Product Catalog & Categories](#product-catalog--categories-phase-2)
   - [Shopping Cart & Checkout](#shopping-cart--checkout-phase-2)
   - [Proprietary Redemption Code Engine](#proprietary-redemption-code-engine-phase-3)
   - [Orders & Fulfillment Lifecycle](#orders--fulfillment-lifecycle-phase-23)
   - [Payment Processing (Paystack / Local Cards)](#payment-processing-paystack--local-cards)
8. [Production TypeScript Definitions](#8-production-typescript-definitions)
9. [Integration & QA Testing Checklist](#9-integration--qa-testing-checklist)

---

## 1. Executive Summary & Architecture

GeeksShop is an e-commerce platform featuring a custom merchandise catalog, standard cart/checkout flows, and a **proprietary product-specific Redemption Code Engine**. 

### System Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend Client                      │
│       React 19 + TypeScript + Vite (@ localhost:5173)  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON
                           │ Authorization: Bearer <jwt>
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Backend API Server                   │
│             Express 5 REST API (@ localhost:4000)      │
│  ├── Helmet (Security headers)                         │
│  ├── CORS (Origin allowlist: localhost:5173)           │
│  ├── Express-Rate-Limit (Brute-force protection)       │
│  ├── Zod (Request payload schemas)                     │
│  └── JWT (HS256 signed bearer tokens)                  │
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose 8 (ODM)
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Database Engine                       │
│                     MongoDB 7+                         │
│  ├── Users (Auth, roles, verified status)              │
│  ├── Products & Categories (Roadmap)                   │
│  ├── Redemption Codes & History (Roadmap)              │
│  └── Orders & Payments (Roadmap)                       │
└────────────────────────────────────────────────────────┘
```

### Development Phases Status

- **Phase 1 (Live & Ready):** Core Authentication, Session Management, User Data Model, Password Security (bcrypt cost 12), Phone/Email normalization, Rate limiting.
- **Phase 2 (Contract Defined):** Product Catalog, Category Taxonomy, Search & Filtering, Cart, Checkout, Order Creation.
- **Phase 3 (Contract Defined):** Proprietary Redemption Engine (code validation, product binding, single-use atomic redemption, double-spend prevention, QR code flows, admin batch code generator).
- **Phase 4 (Future):** Wishlists, Reviews, Notification Webhooks, Analytics.

---

## 2. Local Environment & Server Setup

To run the backend locally while developing the frontend:

### 2.1. Prerequisites

- **Node.js:** v18.0.0+ (v20+ recommended)
- **MongoDB:** Running locally on port `27017` or a remote MongoDB Atlas connection URI.

### 2.2. Installation & Launch

From the repository root:

```bash
cd server
npm install
cp .env.example .env
```

Generate a secure 48-byte hex secret for JWT signing:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste this string into `JWT_SECRET` in `server/.env`.

Start the development server with live watch mode:

```bash
npm run dev
```

The server will listen at `http://localhost:4000`.

### 2.3. Seeding Test Accounts

To create the initial Super Admin account for testing administrative flows:

```bash
npm run seed
```

- **Default Email:** `admin@geeksshop.ng`
- **Default Password:** `ChangeMe123!`
- **Role:** `super_admin`

### 2.4. Environment Variables (`server/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `4000` | Port Express listens on. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/geeks_shop` | Mongo connection string. |
| `JWT_SECRET` | *(required)* | Symmetric key for signing auth tokens. |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration. |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Comma-separated CORS allowed origins. |
| `REGISTER_WINDOW_MINUTES` | `15` | Window for signup rate limiting. |
| `REGISTER_MAX_ATTEMPTS` | `10` | Allowed signups per IP per window. |
| `BCRYPT_SALT_ROUNDS` | `12` | Cost factor for password hashing. |

---

## 3. Network Protocol & Global API Conventions

### 3.1. Base URLs

- **Development:** `http://localhost:4000/api`
- **Production:** Configured via frontend environment variable (e.g. `VITE_API_URL` or `NEXT_PUBLIC_API_URL`).

### 3.2. Headers

- **JSON Requests:** `Content-Type: application/json`
- **Protected Endpoints:** `Authorization: Bearer <jwt_token>`
- **Payload Size Limit:** Max body size is `20kb`. Requests exceeding this will be rejected with HTTP 413.

### 3.3. Cross-Origin Resource Sharing (CORS)

- CORS is strictly configured to only allow origins specified in `CLIENT_ORIGIN`.
- Frontend runs at `http://localhost:5173` by default. If your frontend runs on a different port (e.g. `3000` or `5174`), add it to `CLIENT_ORIGIN` in `server/.env` separated by a comma:
  ```env
  CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000
  ```
- `credentials: true` is enabled.

---

## 4. Standard Error Handling & Form Binding

The backend guarantees a consistent error response structure across all endpoints.

### 4.1. Universal Error Schema

```json
{
  "message": "Human-readable error description.",
  "field": "email",
  "fieldErrors": {
    "email": "An account with this email already exists. Try logging in."
  },
  "code": "EMAIL_TAKEN"
}
```

- `message` *(string, required)*: Default message suitable for displaying in a toast or generic banner.
- `field` *(string, optional)*: The primary field that caused the error. Directly matches the input name on your frontend form.
- `fieldErrors` *(object, optional)*: Key-value map of field names to error messages for multi-field validation failures.
- `code` *(string, optional)*: Machine-readable error code for programmatic handling.

### 4.2. HTTP Status Code Reference

| Status | Code | Meaning & Typical Trigger |
| :---: | :--- | :--- |
| **200** | `OK` | Successful `GET` or `POST` login. |
| **201** | `CREATED` | Successful account creation (`POST /api/auth/register`). |
| **400** | `INVALID_JSON` | Malformed JSON in request body. |
| **401** | `UNAUTHORIZED` / `INVALID_CREDENTIALS` | Missing token, expired session, or incorrect password. |
| **404** | `NOT_FOUND` | Route does not exist. |
| **409** | `EMAIL_TAKEN` / `PHONE_TAKEN` / `DUPLICATE_KEY` | Conflict: email or phone already registered. |
| **422** | `VALIDATION_ERROR` | Request payload failed Zod schema rules. See `fieldErrors`. |
| **429** | `RATE_LIMITED` | Too many requests from this IP within the time window. |
| **500** | `INTERNAL_ERROR` | Unexpected server failure. Plain generic error shown to user. |

### 4.3. Seamless Form Field Binding

The backend's `field` and `fieldErrors` keys are designed to map 1:1 with frontend form models (`fullName`, `email`, `phone`, `password`, `confirmPassword`).

When handling errors in React (or with libraries like `react-hook-form` or Formik):

```typescript
try {
  await api.register(formData);
} catch (err: any) {
  if (err.status === 422 && err.fieldErrors) {
    // Bind all field-level validation errors at once
    Object.entries(err.fieldErrors).forEach(([field, message]) => {
      setFieldError(field, message);
    });
  } else if (err.field) {
    // Single field conflict (e.g. 409 EMAIL_TAKEN)
    setFieldError(err.field, err.message);
  } else {
    // Global banner/toast (e.g. 429 RATE_LIMITED, 500 INTERNAL_ERROR)
    setBannerError(err.message);
  }
}
```

---

## 5. Phase 1: Live Authentication & User Endpoints

### Health Check (`GET /api/health`)

Checks API liveness and process uptime.

- **URL:** `/api/health`
- **Method:** `GET`
- **Auth Required:** No
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "good to go",
    "uptime": 142.5312
  }
  ```

---

### User Registration (`POST /api/auth/register`)

Creates a new user account, returns the authenticated user profile, and immediately issues a JWT session token.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Auth Required:** No
- **Rate Limit:** 10 requests per 15 minutes per IP

#### Request Payload Rules & Normalization

| Field | Type | Required | Validation Rules | Normalization on Backend |
| :--- | :--- | :---: | :--- | :--- |
| `fullName` | `string` | **Yes** | 2–120 characters; must contain at least one letter. | Trimmed of outer whitespace. |
| `email` | `string` | **Yes** | Valid RFC 5322 format; max 254 chars. | Trimmed and converted to lowercase. |
| `phone` | `string` | **Yes** | Nigerian mobile format (`070`, `080`, `081`, `090`, `091`). | Spaces, hyphens, and `+234` stripped. Stored as `08031234567`. |
| `password` | `string` | **Yes** | 8–128 characters; requires at least 1 letter and 1 digit. | Salted & hashed using bcrypt (cost 12). Plaintext never stored. |
| `confirmPassword` | `string` | *Optional* | If provided, must match `password` exactly. | Never stored in the database. |

#### Request Example

```json
{
  "fullName": "Chidi Okonkwo",
  "email": "chidi@geeksshop.ng",
  "phone": "+234 803 123 4567",
  "password": "geeksPassword2026",
  "confirmPassword": "geeksPassword2026"
}
```

#### Success Response (`201 Created`)

```json
{
  "message": "Account created successfully.",
  "user": {
    "id": "6ac270b2ed92999427e148eb",
    "fullName": "Chidi Okonkwo",
    "email": "chidi@geeksshop.ng",
    "phone": "08031234567",
    "role": "customer",
    "isVerified": false,
    "createdAt": "2026-10-12T15:28:50.504Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

- **`422 Unprocessable Entity` (Schema Validation Failed):**
  ```json
  {
    "message": "Enter a valid phone number, e.g. 0803 123 4567.",
    "field": "phone",
    "fieldErrors": {
      "phone": "Enter a valid phone number, e.g. 0803 123 4567."
    },
    "code": "VALIDATION_ERROR"
  }
  ```
- **`409 Conflict` (Email Already Registered):**
  ```json
  {
    "message": "An account with this email already exists. Try logging in.",
    "field": "email",
    "code": "EMAIL_TAKEN"
  }
  ```
- **`409 Conflict` (Phone Number Already Registered):**
  ```json
  {
    "message": "An account with this phone number already exists. Try logging in.",
    "field": "phone",
    "code": "PHONE_TAKEN"
  }
  ```
- **`429 Too Many Requests` (Rate Limit Exceeded):**
  ```json
  {
    "message": "Too many signup attempts. Please try again in 15 minutes.",
    "code": "RATE_LIMITED"
  }
  ```

---

### User Login (`POST /api/auth/login`)

Authenticates an existing user via either email address or phone number.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Rate Limit:** 20 requests per 15 minutes per IP

#### Request Payload

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `identifier` | `string` | **Yes** | Either user's email address or Nigerian phone number. |
| `password` | `string` | **Yes** | Plaintext password candidate. |
| `remember` | `boolean` | *Optional* | Default `false`. Informs frontend whether to persist to `localStorage` or `sessionStorage`. |

#### Request Example (Email Login)

```json
{
  "identifier": "chidi@geeksshop.ng",
  "password": "geeksPassword2026",
  "remember": true
}
```

#### Request Example (Phone Login)

```json
{
  "identifier": "0803 123 4567",
  "password": "geeksPassword2026",
  "remember": false
}
```

#### Success Response (`200 OK`)

```json
{
  "message": "Signed in successfully.",
  "user": {
    "id": "6ac270b2ed92999427e148eb",
    "fullName": "Chidi Okonkwo",
    "email": "chidi@geeksshop.ng",
    "phone": "08031234567",
    "role": "customer",
    "isVerified": false,
    "createdAt": "2026-10-12T15:28:50.504Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

- **`401 Unauthorized` (Account Not Found):**
  *(Does not disclose whether the email/phone exists for enumeration protection)*
  ```json
  {
    "message": "We could not find an account with those details. Check your email or phone number, or create an account.",
    "code": "UNAUTHORIZED"
  }
  ```
- **`401 Unauthorized` (Incorrect Password):**
  ```json
  {
    "message": "The password you entered is incorrect. Please try again or reset your password.",
    "field": "password",
    "code": "INVALID_CREDENTIALS"
  }
  ```
- **`429 Too Many Requests` (Rate Limited):**
  ```json
  {
    "message": "Too many login attempts. Please try again in a few minutes.",
    "code": "RATE_LIMITED"
  }
  ```

---

### Current Session / Profile (`GET /api/auth/me`)

Validates the JWT token and returns the current user profile. Call this when the frontend app boots up to restore session state.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Auth Required:** **Yes** (`Authorization: Bearer <token>`)

#### Request Headers

```http
GET /api/auth/me HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`)

```json
{
  "user": {
    "id": "6ac270b2ed92999427e148eb",
    "fullName": "Chidi Okonkwo",
    "email": "chidi@geeksshop.ng",
    "phone": "08031234567",
    "role": "customer",
    "isVerified": false,
    "createdAt": "2026-10-12T15:28:50.504Z"
  }
}
```

#### Error Responses

- **`401 Unauthorized` (Missing Token):**
  ```json
  {
    "message": "You need to sign in to continue.",
    "code": "UNAUTHORIZED"
  }
  ```
- **`401 Unauthorized` (Expired or Tampered Token):**
  ```json
  {
    "message": "Your session has expired. Please sign in again.",
    "code": "UNAUTHORIZED"
  }
  ```

---

## 6. Frontend Client Integration Recipe

The previous frontend implementation used a mock client-side account store (`src/auth/storage.ts`) with browser-generated hashes and mock accounts. Follow this guide to replace it with real backend API calls.

### 6.1. Token Storage Strategy

| Setting | Storage Mechanism | Retention |
| :--- | :--- | :--- |
| `remember: false` (Default) | `sessionStorage` | Cleared when user closes the browser tab. |
| `remember: true` | `localStorage` | Persisted across browser sessions until explicit logout. |
| `remembered-identifier` | `localStorage` | Pre-fills the login field on subsequent visits. |

Storage keys:
- `geeks-shop.token`
- `geeks-shop.remembered-identifier`

---

### 6.2. Configuring the HTTP Client (Axios / Fetch)

Below is a production-grade API client implementation using Axios that automatically injects the Bearer token, normalizes errors, and handles 401 session expirations:

```typescript
// src/api/client.ts
import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'geeks-shop.token';
const REMEMBER_KEY = 'geeks-shop.remembered-identifier';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 1. Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Format Errors & Handle Expired Sessions
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; field?: string; fieldErrors?: Record<string, string>; code?: string }>) => {
    if (error.response?.status === 401) {
      // Clear invalid session tokens
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      
      // Dispatch custom event if your router needs to redirect to /login
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = error.response?.data;
    const customError = {
      status: error.response?.status || 500,
      message: data?.message || 'A network error occurred. Please try again.',
      field: data?.field,
      fieldErrors: data?.fieldErrors,
      code: data?.code || 'NETWORK_ERROR',
    };

    return Promise.reject(customError);
  }
);
```

---

### 6.3. Upgraded `src/auth/storage.ts`

Replace `src/auth/storage.ts` with real asynchronous API methods:

```typescript
// src/auth/storage.ts
import { apiClient } from '../api/client';
import type { AuthUser, RegisterInput } from './types';

const TOKEN_KEY = 'geeks-shop.token';
const REMEMBER_KEY = 'geeks-shop.remembered-identifier';

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function saveSessionToken(token: string, remember: boolean): void {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function readRememberedIdentifier(): string {
  return localStorage.getItem(REMEMBER_KEY) ?? '';
}

export function setRememberedIdentifier(identifier: string, remember: boolean): void {
  if (remember && identifier) {
    localStorage.setItem(REMEMBER_KEY, identifier);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

// REST API calls
export async function signUp(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
  const response = await apiClient.post<{ message: string; user: AuthUser; token: string }>(
    '/auth/register',
    input
  );
  return response.data;
}

export async function signIn(
  identifier: string,
  password: string,
  remember: boolean
): Promise<{ user: AuthUser; token: string }> {
  const response = await apiClient.post<{ message: string; user: AuthUser; token: string }>(
    '/auth/login',
    { identifier, password, remember }
  );
  return response.data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
  return response.data.user;
}
```

---

### 6.4. Updated `AuthProvider.tsx` (Session Rehydration)

Ensure `AuthProvider` verifies the token on mount via `GET /api/auth/me`:

```tsx
// src/auth/AuthProvider.tsx
import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context';
import {
  clearSession,
  fetchCurrentUser,
  getStoredToken,
  saveSessionToken,
  setRememberedIdentifier,
  signIn,
  signUp,
} from './storage';
import type { AuthUser, RegisterInput } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rehydrate session on mount
  useEffect(() => {
    async function rehydrateSession() {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    rehydrateSession();

    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string, remember: boolean) => {
      const { user: signedInUser, token } = await signIn(identifier, password, remember);
      saveSessionToken(token, remember);
      setRememberedIdentifier(identifier, remember);
      setUser(signedInUser);
      return signedInUser;
    },
    []
  );

  const register = useCallback(async (input: RegisterInput) => {
    const { user: createdUser, token } = await signUp(input);
    // User is automatically authenticated upon registration
    saveSessionToken(token, false);
    setUser(createdUser);
    return createdUser;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

---

## 7. System Roadmap & Upcoming API Contracts

As defined in `system documentation.md`, the backend is expanding into Phase 2 and Phase 3. The exact contracts below allow the frontend team to build mock adapters and UI views ahead of backend deployment.

---

### Product Catalog & Categories (Phase 2)

#### 1. List Products
- **Endpoint:** `GET /api/products`
- **Query Parameters:**
  - `category` *(string, optional)*: Filter by category slug or name.
  - `brand` *(string, optional)*: Filter by brand name.
  - `search` *(string, optional)*: Text search across name and description.
  - `minPrice` / `maxPrice` *(number, optional)*: Price filter range in Kobo or Naira.
  - `redemptionEligible` *(boolean, optional)*: Filter products redeemable via codes.
  - `sort` *(string, optional)*: `newest` \| `price-asc` \| `price-desc` \| `popular` \| `rating`.
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 12)*
- **Response Format (`200 OK`):**
  ```json
  {
    "products": [
      {
        "id": "prod_68192a01",
        "name": "Essential Oversized Hoodie",
        "description": "450 GSM pure cotton with tailored ribbed cuffs",
        "category": "Heavyweight Hoodies",
        "brand": "Geeks",
        "price": 59990,
        "discountPrice": 89990,
        "image": "/images/product01.jpeg",
        "images": ["/images/product01.jpeg", "/images/product01_back.jpeg"],
        "rating": 4.9,
        "reviews": 128,
        "badge": "Best Seller",
        "sku": "GS-HOOD-001",
        "stock": 45,
        "redemptionEligible": true,
        "colors": ["#36383e", "#c8c9cc", "#111111"],
        "sizes": ["S", "M", "L", "XL", "XXL"]
      }
    ],
    "pagination": {
      "total": 48,
      "page": 1,
      "totalPages": 4,
      "hasMore": true
    }
  }
  ```

#### 2. Get Product By ID
- **Endpoint:** `GET /api/products/:id`
- **Response Format (`200 OK`):** Single `Product` object.

#### 3. List Categories
- **Endpoint:** `GET /api/categories`
- **Response Format (`200 OK`):**
  ```json
  {
    "categories": [
      { "id": "cat_1", "name": "Heavyweight Hoodies", "slug": "heavyweight-hoodies", "count": 14 },
      { "id": "cat_2", "name": "Developer Graphic Tees", "slug": "developer-graphic-tees", "count": 18 },
      { "id": "cat_3", "name": "Utility Pants & Techwear", "slug": "utility-pants", "count": 6 },
      { "id": "cat_4", "name": "Desk & Studio Gear", "slug": "studio-gear", "count": 10 }
    ]
  }
  ```

---

### Shopping Cart & Checkout (Phase 2)

#### Cart Management Endpoints

- `GET /api/cart`: Retrieve the current user's active cart.
- `POST /api/cart/items`: Add item `{ productId: string, quantity: number, color?: string, size?: string }`.
- `PATCH /api/cart/items/:itemId`: Update quantity `{ quantity: number }`.
- `DELETE /api/cart/items/:itemId`: Remove line item.

#### Cart Data Schema

```json
{
  "items": [
    {
      "id": "cart_item_1",
      "product": {
        "id": "prod_68192a01",
        "name": "Essential Oversized Hoodie",
        "price": 59990,
        "image": "/images/product01.jpeg"
      },
      "quantity": 1,
      "color": "#111111",
      "size": "L",
      "lineTotal": 59990
    }
  ],
  "subtotal": 59990,
  "discount": 0,
  "shipping": 2500,
  "total": 62490
}
```

---

### Proprietary Redemption Code Engine (Phase 3)

The Redemption Engine is GeeksShop's proprietary feature. **Key Architectural Principle:** Redemption codes are distinct from promotional coupons. They represent a 1:1 product entitlement that triggers atomic inventory allocation and order generation.

```text
User enters code
       │
       ▼
[ POST /api/redemption/validate ]
       │
       ├── Code invalid / expired / disabled ────────► Reject (Display error)
       ├── Product mismatch (Code is for Phone, Cart has Hoodie) ──► Reject
       └── Valid ─────────────────────────────────────► Display item confirmation
                                                               │
                                                               ▼
                                                  [ POST /api/redemption/redeem ]
                                                               │
                                                               ▼
                                                  • Lock DB row (Atomic transaction)
                                                  • Mark code REDEEMED
                                                  • Decrement inventory
                                                  • Generate Order (total = ₦0)
                                                  • Create Redemption History
```

#### 1. Validate Redemption Code
- **Endpoint:** `POST /api/redemption/validate`
- **Auth Required:** Optional (or Required if code is bound to a specific user)
- **Request Body:**
  ```json
  {
    "code": "A55-X92K-72PQ",
    "productId": "prod_68192a01"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "valid": true,
    "code": "A55-X92K-72PQ",
    "product": {
      "id": "prod_68192a01",
      "name": "Essential Oversized Hoodie",
      "value": 59990,
      "image": "/images/product01.jpeg"
    },
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "message": "Code is valid for this product."
  }
  ```
- **Error Scenarios:**
  - `400 Bad Request`: `{ "message": "This redemption code is not valid for this product.", "code": "PRODUCT_MISMATCH" }`
  - `404 Not Found`: `{ "message": "Redemption code not found.", "code": "CODE_NOT_FOUND" }`
  - `409 Conflict`: `{ "message": "This code has already been redeemed.", "code": "ALREADY_REDEEMED" }`
  - `410 Gone`: `{ "message": "This redemption code has expired.", "code": "CODE_EXPIRED" }`

#### 2. Execute Product Redemption
- **Endpoint:** `POST /api/redemption/redeem`
- **Auth Required:** **Yes** (Bearer Token)
- **Request Body:**
  ```json
  {
    "code": "A55-X92K-72PQ",
    "productId": "prod_68192a01",
    "shippingAddress": {
      "street": "14 Commercial Avenue, Yaba",
      "city": "Lagos",
      "state": "Lagos State"
    }
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product successfully redeemed.",
    "redemptionId": "RED-92817",
    "orderId": "ORD-10291",
    "redeemedAt": "2026-10-12T16:00:00.000Z"
  }
  ```

#### 3. User Redemption History
- **Endpoint:** `GET /api/redemption/my-codes`
- **Auth Required:** **Yes** (Bearer Token)
- **Success Response (`200 OK`):**
  ```json
  {
    "activeCodes": [
      {
        "code": "A55-X92K-72PQ",
        "productName": "Essential Oversized Hoodie",
        "productId": "prod_68192a01",
        "expiresAt": "2026-12-31T23:59:59.000Z"
      }
    ],
    "redeemedCodes": [
      {
        "code": "IP15-72AA-19XZ",
        "productName": "Developer Graphic Tee",
        "productId": "prod_22100",
        "redeemedAt": "2026-09-04T11:20:00.000Z",
        "orderId": "ORD-09121"
      }
    ]
  }
  ```

#### 4. QR Code Redemption Flow

When a user scans a physical or digital QR code:
1. QR encodes URL: `https://geeksshop.ng/redeem?code=A55-X92K-72PQ`
2. Frontend `Redemption.tsx` automatically reads `code` from query parameters (`useSearchParams`).
3. If unauthenticated, frontend stores code in `sessionStorage` and redirects to `/login?redirect=/redeem`.
4. After authentication, automatically triggers `POST /api/redemption/validate`.

---

### Orders & Fulfillment Lifecycle (Phase 2/3)

#### Order Statuses

```text
PENDING ──► PAYMENT_PENDING ──► PAID ──► PROCESSING ──► SHIPPED ──► OUT_FOR_DELIVERY ──► DELIVERED
   │               │
   ▼               ▼
CANCELLED      REFUNDED
```

- `POST /api/orders`: Create regular order from active cart.
- `GET /api/orders`: List current user's past orders.
- `GET /api/orders/:id`: Detailed timeline tracking (`status`, delivery address, items, tracking code).

---

### Payment Processing (Paystack / Local Cards)

- **Provider:** Paystack / Local Gateway
- **Checkout Flow:**
  1. Frontend creates order via `POST /api/orders`. Backend returns `{ orderId, paymentReference, authorizationUrl }`.
  2. Frontend opens Paystack Popup or redirects to `authorizationUrl`.
  3. On success, Paystack redirects back to `/checkout/verify?reference=REF123`.
  4. Frontend calls `POST /api/payments/verify { reference: "REF123" }` to confirm payment and transition order to `PAID`.

---

## 8. Production TypeScript Definitions

Save the definitions below in `src/types/api.ts` on the frontend for end-to-end type safety:

```typescript
// src/types/api.ts

// --- USER & AUTH ---
export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
  remember?: boolean;
}

export type AuthErrorField =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword';

export interface ApiErrorResponse {
  status: number;
  message: string;
  field?: AuthErrorField | string;
  fieldErrors?: Record<string, string>;
  code?: string;
}

// --- PRODUCTS & CATALOG ---
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  sku?: string;
  stock: number;
  redemptionEligible: boolean;
  colors: string[];
  sizes: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

// --- SHOPPING CART ---
export interface CartItem {
  id: string;
  product: Pick<Product, 'id' | 'name' | 'price' | 'image'>;
  quantity: number;
  color?: string;
  size?: string;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

// --- REDEMPTION ENGINE ---
export type RedemptionStatus =
  | 'ACTIVE'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'DISABLED'
  | 'CANCELLED';

export interface ValidateRedemptionRequest {
  code: string;
  productId: string;
}

export interface ValidateRedemptionResponse {
  valid: boolean;
  code: string;
  product: {
    id: string;
    name: string;
    value: number;
    image: string;
  };
  expiresAt: string;
  message: string;
}

export interface ExecuteRedemptionRequest {
  code: string;
  productId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
  };
}

export interface ExecuteRedemptionResponse {
  success: boolean;
  message: string;
  redemptionId: string;
  orderId: string;
  redeemedAt: string;
}

// --- ORDERS ---
export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentReference?: string;
  isRedemption: boolean;
  createdAt: string;
}
```

---

## 9. Integration & QA Testing Checklist

Use this QA checklist to verify frontend-backend integration before deploying:

- [ ] **1. Health Check:** `GET http://localhost:4000/api/health` returns status `200` with status `"good to go"`.
- [ ] **2. Happy Path Registration:** Registering with a valid full name, email, Nigerian phone (`0803 123 4567` or `+234 803 123 4567`), and password returns `201 Created` with a token and user object.
- [ ] **3. Duplicate Email Rejection:** Attempting to register an already existing email returns `409 Conflict` with `field: "email"` and `code: "EMAIL_TAKEN"`. The email input shows an inline error.
- [ ] **4. Duplicate Phone Rejection:** Attempting to register an already existing phone returns `409 Conflict` with `field: "phone"` and `code: "PHONE_TAKEN"`. The phone input shows an inline error.
- [ ] **5. Form Validation Errors:** Submitting weak passwords or invalid emails returns `422 Unprocessable Entity` with `fieldErrors`. Form inputs highlight appropriately.
- [ ] **6. Email Login:** Logging in with registered email and password returns `200 OK` and saves token to storage.
- [ ] **7. Phone Login:** Logging in with registered phone (`08031234567` or with spaces/dashes) returns `200 OK`.
- [ ] **8. Bad Credentials:** Submitting an invalid password returns `401 Unauthorized` with `field: "password"`.
- [ ] **9. "Remember Me" Toggle:**
  - With checkbox **checked**, token is persisted to `localStorage` and persists across browser tab closes.
  - With checkbox **unchecked**, token is stored in `sessionStorage` and disappears when the tab closes.
- [ ] **10. Session Rehydration:** Refreshing the page with a valid token triggers `GET /api/auth/me` and keeps the user signed in without redirecting to `/login`.
- [ ] **11. Session Expiry / 401 Handling:** Tampering with the token in storage and refreshing triggers a 401 handler that clears storage and cleanly redirects to `/login`.
- [ ] **12. Rate Limiting:** Submitting 11 registration attempts in under 15 minutes triggers `429 Too Many Requests` with a banner message.
- [ ] **13. CORS Verification:** Frontend calls made from `http://localhost:5173` successfully pass without `Cross-Origin Request Blocked` browser console errors.
