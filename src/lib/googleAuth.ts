import { GOOGLE_SCOPES, getClientId } from './config'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (resp: TokenResponse) => void
            error_callback?: (err: unknown) => void
          }): TokenClient
        }
      }
    }
  }
}

interface TokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void
}

interface TokenResponse {
  access_token?: string
  expires_in?: number
  error?: string
}

const TOKEN_KEY = 'pensieri.googleToken'

interface StoredToken {
  accessToken: string
  expiresAt: number
}

let scriptLoadPromise: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Impossibile caricare Google Identity Services'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

function readStoredToken(): StoredToken | null {
  const raw = sessionStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredToken
    if (parsed.expiresAt > Date.now() + 30_000) return parsed
    return null
  } catch {
    return null
  }
}

function storeToken(accessToken: string, expiresIn: number) {
  const stored: StoredToken = { accessToken, expiresAt: Date.now() + expiresIn * 1000 }
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(stored))
}

export function isConnected(): boolean {
  return readStoredToken() !== null
}

export function signOut(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

/**
 * Richiede un access token. Se manca un consenso valido mostra il popup di login Google
 * (necessario almeno una volta per dispositivo/browser, poi il token viene tenuto in cache).
 */
export async function requestAccessToken(): Promise<string> {
  const cached = readStoredToken()
  if (cached) return cached.accessToken

  const clientId = getClientId()
  if (!clientId) throw new Error('MISSING_CLIENT_ID')

  await loadGisScript()

  return new Promise((resolve, reject) => {
    try {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
        callback: (resp) => {
          if (resp.error || !resp.access_token) {
            reject(new Error(resp.error ?? 'Autenticazione Google fallita'))
            return
          }
          storeToken(resp.access_token, resp.expires_in ?? 3600)
          resolve(resp.access_token)
        },
        error_callback: (err) => reject(err),
      })
      client.requestAccessToken()
    } catch (err) {
      reject(err)
    }
  })
}

export async function getAccessToken(): Promise<string> {
  const cached = readStoredToken()
  if (cached) return cached.accessToken
  return requestAccessToken()
}
