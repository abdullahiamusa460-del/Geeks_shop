// --- USER & AUTH ---
export type UserRole = 'customer' | 'admin' | 'super_admin'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface RegisterInput {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword?: string
}

export interface LoginInput {
  identifier: string
  password: string
  remember?: boolean
}

export type AuthErrorField =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'password'
  | 'confirmPassword'

export interface ApiErrorResponse {
  status: number
  message: string
  field?: AuthErrorField | string
  fieldErrors?: Record<string, string>
  code?: string
}

// --- PRODUCTS & CATALOG ---
export interface Product {
  id: string
  name: string
  description: string
  category: string
  brand: string
  price: number
  discountPrice?: number
  image: string
  images?: string[]
  rating: number
  reviews: number
  badge?: string
  sku?: string
  stock: number
  redemptionEligible: boolean
  colors: string[]
  sizes: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  count: number
}

export interface Pagination {
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

// --- SHOPPING CART ---
export interface CartItem {
  id: string
  product: Pick<Product, 'id' | 'name' | 'price' | 'image'>
  quantity: number
  color?: string
  size?: string
  lineTotal: number
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
}

// --- REDEMPTION ENGINE ---
export type RedemptionStatus =
  | 'ACTIVE'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'DISABLED'
  | 'CANCELLED'

export interface ValidateRedemptionRequest {
  code: string
  productId: string
}

export interface ValidateRedemptionResponse {
  valid: boolean
  code: string
  product: {
    id: string
    name: string
    value: number
    image: string
  }
  expiresAt: string
  message: string
}

export interface ExecuteRedemptionRequest {
  code: string
  productId: string
  shippingAddress: {
    street: string
    city: string
    state: string
  }
}

export interface ExecuteRedemptionResponse {
  success: boolean
  message: string
  redemptionId: string
  orderId: string
  redeemedAt: string
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
  | 'REFUNDED'

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: OrderStatus
  paymentReference?: string
  isRedemption: boolean
  createdAt: string
}
