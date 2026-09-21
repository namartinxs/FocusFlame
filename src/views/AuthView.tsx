import { useState } from 'react'
import type { AuthCredentials } from '../repositories/AuthRepository'

interface AuthViewProps {
  loading: boolean
  error: string | null
  infoMessage: string | null
  onSignIn(credentials: AuthCredentials): void
  onSignUp(credentials: AuthCredentials): void
}

export function AuthView({
  loading,
  error,
  infoMessage,
  onSignIn,
  onSignUp,
}: AuthViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const credentials: AuthCredentials = { email, password }
    if (mode === 'signIn') {
      onSignIn(credentials)
    } else {
      onSignUp(credentials)
    }
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
        {infoMessage && <p className="auth__info">{infoMessage}</p>}
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
