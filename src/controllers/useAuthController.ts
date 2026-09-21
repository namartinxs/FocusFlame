import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import type { AuthCredentials, AuthRepository } from '../repositories/AuthRepository'
import { SupabaseAuthRepository } from '../repositories/SupabaseAuthRepository'

export interface AuthController {
  session: Session | null
  loading: boolean
  error: string | null
  infoMessage: string | null
  signIn(credentials: AuthCredentials): Promise<void>
  signUp(credentials: AuthCredentials): Promise<void>
}

/**
 * `authRepository` é recebido por parâmetro (com um default concreto) em vez
 * de importado direto — permite trocar a implementação (ex.: em testes, ou
 * por outro provedor de auth) sem alterar este controller.
 */
export function useAuthController(
  authRepository: AuthRepository = new SupabaseAuthRepository(),
): AuthController {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    authRepository.getSession().then(setSession)
    return authRepository.onAuthStateChange(setSession)
  }, [authRepository])

  const signIn = async (credentials: AuthCredentials) => {
    setLoading(true)
    setError(null)
    try {
      setSession(await authRepository.signIn(credentials))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (credentials: AuthCredentials) => {
    setLoading(true)
    setError(null)
    setInfoMessage(null)
    try {
      const newSession = await authRepository.signUp(credentials)
      if (newSession) {
        setSession(newSession)
      } else {
        setInfoMessage('Conta criada! Confirme seu e-mail para entrar.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return { session, loading, error, infoMessage, signIn, signUp }
}
