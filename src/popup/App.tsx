import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useBlockTimer } from '../lib/timer'
import type { FocusBlock, Reward } from '../types'
import { AuthPanel } from './components/AuthPanel'
import { BlockGrid } from './components/BlockGrid'
import { RewardsList } from './components/RewardsList'

const TOTAL_BLOCKS = 6 // 6 blocos de 10min = 1h de sessão de foco

function createBlocks(): FocusBlock[] {
  return Array.from({ length: TOTAL_BLOCKS }, (_, index) => ({
    index,
    durationMinutes: 10,
    status: 'pending',
  }))
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [blocks, setBlocks] = useState<FocusBlock[]>(createBlocks)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [activeBlockIndex, setActiveBlockIndex] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) =>
      setSession(nextSession),
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleBlockComplete = () => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.index === activeBlockIndex
          ? { ...block, status: 'completed', completedAt: new Date().toISOString() }
          : block,
      ),
    )
    setRewards((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        blockIndex: activeBlockIndex,
        label: 'Chama acesa \u{1F525}',
        earnedAt: new Date().toISOString(),
      },
    ])
    setActiveBlockIndex((index) => Math.min(index + 1, TOTAL_BLOCKS - 1))
  }

  const timer = useBlockTimer(handleBlockComplete)

  if (!session) {
    return <AuthPanel onSignedIn={setSession} />
  }

  const minutes = String(Math.floor(timer.secondsLeft / 60)).padStart(2, '0')
  const seconds = String(timer.secondsLeft % 60).padStart(2, '0')

  return (
    <main className="app">
      <header>
        <h1>FocusFlame</h1>
        <p>{session.user.email}</p>
      </header>

      <section className="timer">
        <span className="timer__clock">
          {minutes}:{seconds}
        </span>
        <div className="timer__actions">
          <button type="button" onClick={timer.isRunning ? timer.pause : timer.start}>
            {timer.isRunning ? 'Pausar' : 'Iniciar bloco'}
          </button>
          <button type="button" onClick={timer.reset}>
            Reiniciar
          </button>
        </div>
      </section>

      <BlockGrid blocks={blocks} activeBlockIndex={activeBlockIndex} />
      <RewardsList rewards={rewards} />
    </main>
  )
}
