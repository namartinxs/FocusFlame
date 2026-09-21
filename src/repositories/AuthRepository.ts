import type { Session } from '@supabase/supabase-js'

export interface AuthCredentials {
  email: string
  password: string
}

/**
 * Abstração sobre o provedor de autenticação. Controllers dependem desta
 * interface, nunca do cliente Supabase diretamente (Dependency Inversion) —
 * trocar de provedor no futuro não deve exigir mudanças em controllers/views.
 */
export interface AuthRepository {
  getSession(): Promise<Session | null>
  onAuthStateChange(callback: (session: Session | null) => void): () => void
  signIn(credentials: AuthCredentials): Promise<Session>
  /** Retorna `null` quando o provedor exige confirmação por e-mail antes de abrir sessão. */
  signUp(credentials: AuthCredentials): Promise<Session | null>
}
