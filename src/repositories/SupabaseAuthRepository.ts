import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AuthCredentials, AuthRepository } from './AuthRepository'

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession()
    return data.session
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      callback(session),
    )
    return () => data.subscription.unsubscribe()
  }

  async signIn({ email, password }: AuthCredentials): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.session) throw new Error('Login não retornou uma sessão.')
    return data.session
  }

  async signUp({ email, password }: AuthCredentials): Promise<Session | null> {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data.session
  }
}
