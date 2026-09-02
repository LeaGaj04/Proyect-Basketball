// -------------------------------------------------------
// Auth helpers — session stored in localStorage
// -------------------------------------------------------

export interface JugadorSession {
  id: string
  nombre: string
  categoria?: string
}

const SESSION_KEY = 'sports_survey_session'

export function getSession(): JugadorSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(jugador: JugadorSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(jugador))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

// Admin token stored in sessionStorage (cleared on tab close)
const ADMIN_KEY = 'sports_survey_admin'

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ADMIN_KEY) === 'true'
}

export function setAdminAuthenticated(): void {
  sessionStorage.setItem(ADMIN_KEY, 'true')
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_KEY)
}
