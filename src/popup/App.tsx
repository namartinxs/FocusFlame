import { useAuthController } from '../controllers/useAuthController'
import { useFocusSessionController } from '../controllers/useFocusSessionController'
import { AuthView } from '../views/AuthView'
import { BlockGridView } from '../views/BlockGridView'
import { RewardsListView } from '../views/RewardsListView'
import { TimerView } from '../views/TimerView'

export default function App() {
  const auth = useAuthController()
  const focusSession = useFocusSessionController()

  if (!auth.session) {
    return (
      <AuthView
        loading={auth.loading}
        error={auth.error}
        infoMessage={auth.infoMessage}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      />
    )
  }

  return (
    <main className="app">
      <header>
        <h1>FocusFlame</h1>
        <p>{auth.session.user.email}</p>
      </header>

      <TimerView
        secondsLeft={focusSession.secondsLeft}
        isRunning={focusSession.isRunning}
        onToggle={focusSession.isRunning ? focusSession.pause : focusSession.start}
        onReset={focusSession.reset}
      />

      <BlockGridView
        blocks={focusSession.blocks}
        activeBlockIndex={focusSession.activeBlockIndex}
      />
      <RewardsListView rewards={focusSession.rewards} />
    </main>
  )
}
