import axios from 'axios'
import type { AxiosError } from 'axios'

export const TOKEN_KEY = 'geeks-shop.token'
export const REMEMBER_KEY = 'geeks-shop.remembered-identifier'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export interface ApiErrorPayload {
  message?: string
  field?: string
  fieldErrors?: Record<string, string>
  code?: string
}

export class ApiError extends Error {
  status: number
  field?: string
  fieldErrors?: Record<string, string>
  code: string

  constructor(
    message: string,
    options: {
      status?: number
      field?: string
      fieldErrors?: Record<string, string>
      code?: string
    } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? 500
    this.field = options.field
    this.fieldErrors = options.fieldErrors
    this.code = options.code ?? 'NETWORK_ERROR'
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    const data = error.response?.data
    return Promise.reject(
      new ApiError(
        data?.message || 'A network error occurred. Please try again.',
        {
          status: error.response?.status ?? 500,
          field: data?.field,
          fieldErrors: data?.fieldErrors,
          code: data?.code,
        },
      ),
    )
  },
)
