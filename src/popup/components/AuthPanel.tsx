import type { Session } from '@supabase/supabase-js'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface AuthPanelProps {
  onSignedIn: (session: Session) => void
}

export function AuthPanel({ onSignedIn }: AuthPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: authError } =
      mode === 'signIn'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }
    if (data.session) onSignedIn(data.session)
  }

  return (
    <main className="app auth">
      <h1>FocusFlame</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="e-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {mode === 'signIn' ? 'Entrar' : 'Criar conta'}
        </button>
        {error && <p className="auth__error">{error}</p>}
      </form>
      <button
        type="button"
        className="auth__toggle"
        onClick={() => setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'))}
      >
        {mode === 'signIn' ? 'Criar uma conta' : 'Já tenho conta'}
      </button>
    </main>
  )
}
