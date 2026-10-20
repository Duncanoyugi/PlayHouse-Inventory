const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const tokenStorage = {
  get: () => safe(() => localStorage.getItem(TOKEN_KEY), null),
  set: (token: string) => safe(() => localStorage.setItem(TOKEN_KEY, token), undefined),
  clear: () =>
    safe(() => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }, undefined),
}

export const AUTH_EXPIRED_EVENT = 'auth:expired'
