# E-Commerce Application — Features, Structure & Functionalities

## 1. Overall Application Structure

```text
E-COMMERCE APPLICATION
│
├── Customer App
│   ├── Home
│   ├── Products
│   ├── Categories
│   ├── Search & Filters
│   ├── Product Details
│   ├── Cart
│   ├── Checkout
│   ├── Orders
│   ├── Redemption
│   ├── Wishlist
│   ├── Notifications
│   └── Profile
│
├── Admin Dashboard
│   ├── Dashboard
│   ├── Products
│   ├── Categories
│   ├── Inventory
│   ├── Orders
│   ├── Customers
│   ├── Redemption Codes
│   ├── Payments
│   ├── Discounts
│   ├── Shipping
│   └── Reports
│
├── Backend/API
│   ├── Authentication
│   ├── Product API
│   ├── Cart API
│   ├── Order API
│   ├── Payment API
│   ├── Redemption API
│   └── Notification API
│
└── Database
    ├── Users
    ├── Products
    ├── Orders
    ├── Order Items
    ├── Redemption Codes
    ├── Redemption History
    └── Payments
```

---

## 2. Customer Features

### Home Page

Include:

- Hero/banner section
- Featured products
- New arrivals
- Popular products
- Recommended products
- Product categories
- Special offers
- Products eligible for redemption
- Search bar
- Cart icon
- User profile
- Notifications

### Product Catalogue

Each product can contain:

```text
Product
├── Product ID
├── Name
├── Description
├── Category
├── Brand
├── Price
├── Discount Price
├── Images
├── Videos (optional)
├── SKU
├── Stock Quantity
├── Available Sizes
├── Available Colors
├── Weight
├── Dimensions
├── Rating
├── Reviews
├── Tags
├── Status
└── Redemption Eligible
```

### Search and Filtering

Users should be able to search by:

- Product name
- Brand
- Category
- SKU
- Price range
- Rating
- Availability

Filters:

- Category
- Brand
- Price
- Rating
- Availability
- Discount
- Newest
- Popular
- Redemption Eligible

---

## 3. Shopping Cart

The cart should support:

- Add product
- Remove product
- Increase/decrease quantity
- Save for later
- Calculate subtotal
- Apply discount
- Apply redemption code
- Calculate shipping
- Calculate total

Example:

```text
Product              ₦100,000
Quantity                     1
-----------------------------
Subtotal             ₦100,000
Redemption           -₦100,000
Shipping                    ₦0
-----------------------------
TOTAL                       ₦0
```

---

# 4. Redemption Code System

The redemption system should be a core feature of the application.

A redemption code can be:

- Assigned to a particular product
- Assigned to a particular user
- Single-use or multi-use
- Given an expiration date
- Disabled by an administrator
- Permanently marked as redeemed after successful redemption

### Redemption Flow

```text
Admin creates product
        ↓
Admin generates redemption code
        ↓
Code is assigned to product
        ↓
User receives/owns code
        ↓
User enters code
        ↓
System validates code
        ↓
System checks product
        ↓
System checks expiration
        ↓
System checks ownership/eligibility
        ↓
System checks whether already redeemed
        ↓
VALID
        ↓
Product becomes redeemable
        ↓
User confirms redemption
        ↓
Code becomes REDEEMED
        ↓
Redemption recorded
```

---

## 5. Redemption Code Data Structure

Recommended structure:

```text
RedemptionCode
------------------------------
id
code
product_id
user_id
status
created_at
expires_at
redeemed_at
order_id
max_uses
uses_count
```

Possible statuses:

```text
ACTIVE
REDEEMED
EXPIRED
DISABLED
CANCELLED
```

Example:

```text
Code:
DAZ-7X9K-82PQ

Product:
Samsung Galaxy A55

User:
User #1034

Status:
ACTIVE

Expires:
2026-12-31

Max Uses:
1

Uses:
0
```

---

## 6. Product-Specific Redemption

A redemption code should be restricted to its assigned product.

Example:

```text
PRODUCT A
Samsung Galaxy A55
₦450,000

REDEMPTION CODE
A55-7X92-ABCD
```

The code should work for the Samsung Galaxy A55 but not for an unrelated product such as an iPhone 15.

If a user tries to use it on the wrong product, display:

> This redemption code is not valid for this product.

---

## 7. Redemption Page

Recommended interface:

```text
        REDEEM YOUR PRODUCT

Enter your redemption code

┌──────────────────────────────┐
│ A55-7X92-ABCD                │
└──────────────────────────────┘

        [ VERIFY CODE ]

--------------------------------

Product:
Samsung Galaxy A55

Value:
₦450,000

Status:
✓ Code is valid

        [ REDEEM PRODUCT ]
```

After clicking **Redeem Product**:

```text
Are you sure?

You are redeeming:

Samsung Galaxy A55

Redemption code:
A55-7X92-ABCD

[Cancel] [Confirm Redemption]
```

---

## 8. Redemption Validation

All important validation should happen on the backend/server.

The system should check:

1. Does the code exist?
2. Is the code active?
3. Has it expired?
4. Is it disabled?
5. Is the product still eligible?
6. Does the code belong to the current user?
7. Has it already been redeemed?
8. Has the maximum usage been reached?
9. Is the product still available?
10. Has this user already redeemed this code?

Only after all required checks pass should the redemption be completed.

---

## 9. Preventing Double Redemption

For single-use codes, the application must prevent two simultaneous requests from redeeming the same code.

Example:

```text
Request A → Redeem CODE123
Request B → Redeem CODE123
```

Expected result:

```text
A → SUCCESS
B → REJECTED
```

Use a database transaction or atomic update so the redemption is processed safely.

A successful redemption should update fields such as:

```text
status = REDEEMED
uses_count = uses_count + 1
redeemed_at = current_time
user_id = current_user
order_id = generated_order
```

---

## 10. Redemption History

Every successful or relevant redemption attempt should be recorded.

```text
RedemptionHistory
│
├── id
├── redemption_code_id
├── user_id
├── product_id
├── order_id
├── redeemed_at
└── status
```

Example:

```text
Code             Product          User       Status
---------------------------------------------------------
A55-7X92-ABCD    Galaxy A55       User 1034  Redeemed
IPH-8821-XK91    iPhone 15        User 2041  Active
SAM-22AA-77BC    Galaxy S24       User 1092  Expired
```

---

## 11. Admin Redemption Management

Admin should be able to generate codes using a form such as:

```text
Product:
[ Samsung Galaxy A55 ]

Number of codes:
[ 100 ]

Expiration:
[ 31/12/2026 ]

Maximum uses:
[ 1 ]

        [ GENERATE CODES ]
```

The system can generate unique codes such as:

```text
A55-X92K-72PQ
A55-91KD-82LA
A55-72PQ-19XZ
A55-82LA-73MN
```

Use cryptographically secure random code generation rather than predictable sequences.

---

## 12. Admin Redemption Dashboard

Display summary statistics:

```text
REDEMPTION CODES

Total Codes       10,000
Active             7,320
Redeemed           2,410
Expired              210
Disabled              60
```

And a table:

| Code | Product | Status | User | Created | Expires |
|---|---|---|---|---|---|
| A55-X92K | Galaxy A55 | Active | — | Sep 1 | Dec 31 |
| A55-91KD | Galaxy A55 | Redeemed | User 1034 | Sep 1 | Dec 31 |
| IP15-22AA | iPhone 15 | Expired | — | Jun 1 | Aug 31 |

---

## 13. QR Code Redemption

A useful future feature is QR-code redemption.

Instead of typing a code, users can scan a QR code.

```text
Scan QR
   ↓
Open redemption page
   ↓
Authenticate user
   ↓
Validate code
   ↓
Show product
   ↓
Confirm redemption
   ↓
Redeem
```

The QR code should contain a secure redemption reference rather than sensitive internal information.

---

## 14. User Account

Customer dashboard:

```text
MY ACCOUNT

Profile
Orders
Wishlist
Saved Addresses
Payment Methods
Redemption Codes
Redeemed Products
Notifications
Security
Logout
```

### My Redemption Codes

```text
MY REDEMPTIONS

Active Codes
-----------------------------
A55-X92K-72PQ
Samsung Galaxy A55
Expires: Dec 31, 2026
[ Redeem ]

Redeemed
-----------------------------
IP15-72AA-19XZ
iPhone 15
Redeemed: Sep 4, 2026
```

---

## 15. Order Management

Recommended order statuses:

```text
PENDING
PAYMENT_PENDING
PAID
PROCESSING
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
REFUNDED
```

Customer order tracking:

```text
ORDER #ORD-10291

✓ Order placed
✓ Payment confirmed
✓ Processing
✓ Shipped
○ Delivered
```

---

## 16. Admin Product Management

Admin should be able to:

- Create products
- Edit products
- Delete/archive products
- Upload images
- Set prices
- Set discounts
- Set stock quantities
- Set SKU
- Add product variants
- Add categories
- Enable/disable redemption eligibility
- Generate redemption codes
- View product sales
- View redemption statistics

---

## 17. Inventory Management

Inventory should update automatically.

Example:

```text
Stock before: 10
Customer buys: 2
Stock after: 8
```

For redemption:

```text
Stock before: 10
User redeems: 1
Stock after: 9
```

Useful inventory features:

```text
Low Stock
Out of Stock
Stock Adjustment
Stock History
```

---

## 18. Payment System

The application can support:

- Card payments
- Bank transfer
- USSD where supported
- Other supported local payment methods

Recommended payment flow:

```text
Customer
   ↓
Checkout
   ↓
Create Order
   ↓
Payment Provider
   ↓
Payment Verification
   ↓
Order = PAID
   ↓
Fulfillment
```

Keep payment processing separate from core order logic.

---

## 19. Notifications

### Order notifications

> Your order has been confirmed.

### Redemption notification

> Your redemption code has been successfully redeemed.

### Expiration notification

> Your redemption code expires soon.

### Fulfillment notification

> Your redeemed product is ready for pickup/delivery.

---

## 20. Security Features

The application should include:

- Password hashing
- Secure authentication
- Role-based access control
- Admin authentication
- Server-side validation
- Rate limiting
- CSRF protection where applicable
- Input sanitization
- HTTPS
- Secure sessions/tokens
- Audit logs
- Redemption attempt logging
- Database transactions
- Unique redemption-code constraints

For high-value codes, consider storing a secure hash rather than the plain redemption code.

---

## 21. User Roles

Recommended roles:

```text
SUPER ADMIN
    ↓
ADMIN
    ↓
PRODUCT MANAGER
    ↓
ORDER MANAGER
    ↓
CUSTOMER
```

Permissions:

```text
Super Admin
✓ Everything

Admin
✓ Products
✓ Orders
✓ Customers
✓ Redemption

Product Manager
✓ Products
✓ Inventory

Order Manager
✓ Orders
✓ Shipping

Customer
✓ Shopping
✓ Orders
✓ Redemption
```

---

## 22. Recommended Database Structure

```text
users
│
├── id
├── name
├── email
├── phone
├── password_hash
├── role
└── created_at


products
│
├── id
├── name
├── description
├── price
├── stock
├── sku
├── category_id
├── redemption_enabled
└── created_at


categories
│
├── id
├── name
└── slug


orders
│
├── id
├── user_id
├── subtotal
├── discount
├── shipping
├── total
├── payment_status
├── order_status
└── created_at


order_items
│
├── id
├── order_id
├── product_id
├── quantity
├── unit_price
└── subtotal


redemption_codes
│
├── id
├── code_hash
├── product_id
├── assigned_user_id
├── status
├── max_uses
├── uses_count
├── expires_at
├── redeemed_at
└── created_at


redemption_history
│
├── id
├── redemption_code_id
├── user_id
├── product_id
├── order_id
├── status
└── redeemed_at


payments
│
├── id
├── order_id
├── reference
├── amount
├── provider
├── status
└── paid_at


reviews
│
├── id
├── user_id
├── product_id
├── rating
├── comment
└── created_at
```

---

## 23. API Structure

Example API structure:

```text
/api/auth
/api/products
/api/categories
/api/cart
/api/orders
/api/payments
/api/users
/api/reviews

/api/redemption
/api/redemption/validate
/api/redemption/redeem
/api/redemption/history

/api/admin/products
/api/admin/orders
/api/admin/users
/api/admin/redemption
/api/admin/redemption/generate
```

### Validate Redemption Code

```http
POST /api/redemption/validate
```

```json
{
  "code": "A55-X92K-72PQ",
  "productId": "prod_123"
}
```

Example response:

```json
{
  "valid": true,
  "product": {
    "id": "prod_123",
    "name": "Samsung Galaxy A55"
  },
  "expiresAt": "2026-12-31"
}
```

### Redeem Product

```http
POST /api/redemption/redeem
```

```json
{
  "code": "A55-X92K-72PQ",
  "productId": "prod_123"
}
```

Example response:

```json
{
  "success": true,
  "message": "Product successfully redeemed",
  "redemptionId": "RED-92817"
}
```

---

# 24. Complete Customer Journey

```text
                    CUSTOMER
                       │
                       ▼
                 Browse Store
                       │
                       ▼
                 Select Product
                       │
              ┌────────┴────────┐
              │                 │
          Buy normally      Has code?
              │                 │
              │                 ▼
              │           Enter Code
              │                 │
              │                 ▼
              │           Validate Code
              │                 │
              │          ┌──────┴──────┐
              │          │             │
              │        Invalid       Valid
              │          │             │
              │          ▼             ▼
              │       Error       Show Product
              │                        │
              │                        ▼
              │                   Confirm Redeem
              │                        │
              │                        ▼
              │                  Mark Code Used
              │                        │
              │                        ▼
              │                  Create Redemption
              │                        │
              └──────────────┬─────────┘
                             ▼
                       Order/Fulfillment
                             │
                             ▼
                         Delivered
```

---

# 25. Recommended Development Roadmap

### Phase 1 — Core E-Commerce

Build:

- Authentication
- Products
- Categories
- Search
- Product details
- Cart
- Checkout
- Orders

### Phase 2 — Administration

Build:

- Admin dashboard
- Product management
- Inventory
- Order management
- Customer management
- Payment integration

### Phase 3 — Redemption System

Build:

- Redemption code generation
- Code assignment
- Product-specific validation
- User-specific validation
- Expiration
- Single-use/multi-use support
- Redemption history
- Admin redemption dashboard
- QR redemption

### Phase 4 — Advanced Features

Build:

- Reviews
- Wishlist
- Notifications
- Analytics
- Recommendations
- Advanced reporting
- Promotional campaigns
- Advanced shipping management

---

# 26. Key Design Principle

The redemption system should be treated as a **separate business domain** from ordinary coupons.

### Coupon

```text
SAVE10
↓
10% discount
```

### Redemption Code

```text
A55-X92K
↓
Specific product
↓
Eligibility verification
↓
Redemption
↓
Permanent redemption record
```

This separation will make the application easier to secure, maintain, test, and expand later.
