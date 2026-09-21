interface TimerViewProps {
  secondsLeft: number
  isRunning: boolean
  onToggle(): void
  onReset(): void
}

export function TimerView({ secondsLeft, isRunning, onToggle, onReset }: TimerViewProps) {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return (
    <section className="timer">
      <span className="timer__clock">
        {minutes}:{seconds}
      </span>
      <div className="timer__actions">
        <button type="button" onClick={onToggle}>
          {isRunning ? 'Pausar' : 'Iniciar bloco'}
        </button>
        <button type="button" onClick={onReset}>
          Reiniciar
        </button>
      </div>
    </section>
  )
}
