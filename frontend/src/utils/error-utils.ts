import axios from 'axios'

/** Turns any thrown value into a message that is safe and useful to show a user. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
    if (!error.response) return 'Cannot reach the server. Check your internet connection and try again.'
    if (error.response.status === 429) return 'Too many requests. Please wait a moment and try again.'
    const message = (error.response.data as { message?: string | string[] } | undefined)?.message
    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === 'string' && message) return message
    if (error.response.status >= 500) return 'The server ran into a problem. Please try again shortly.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
