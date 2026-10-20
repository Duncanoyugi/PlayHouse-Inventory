import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { API_CONFIG } from '../config/api.config'
import { AUTH_EXPIRED_EVENT, tokenStorage } from '../utils/storage-utils'

interface Envelope<T> {
  success?: boolean
  data?: T
}

class ApiClient {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    })

    this.client.interceptors.request.use((config) => {
      const token = tokenStorage.get()
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const isLogin = error.config?.url?.includes('/auth/login')
        // An expired / revoked session: tell the app (no hard page reload, no lost state).
        // A 401 from the login form itself is just "wrong password" and must reach the form.
        if (error.response?.status === 401 && !isLogin && tokenStorage.get()) {
          tokenStorage.clear()
          window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
        }
        return Promise.reject(error)
      },
    )
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config).then((r) => this.unwrap<T>(r.data))
  }
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config).then((r) => this.unwrap<T>(r.data))
  }
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config).then((r) => this.unwrap<T>(r.data))
  }
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config).then((r) => this.unwrap<T>(r.data))
  }

  /** The API wraps every payload as { success, data, message }. */
  private unwrap<T>(payload: unknown): T {
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as Envelope<T>).data as T
    }
    return payload as T
  }
}

export const apiClient = new ApiClient()
