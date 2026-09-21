import { useCallback, useEffect, useRef, useState } from 'react'

export const BLOCK_DURATION_SECONDS = 10 * 60

export interface BlockTimer {
  secondsLeft: number
  isRunning: boolean
  start(): void
  pause(): void
  reset(): void
}

export function useBlockTimer(onBlockComplete: () => void): BlockTimer {
  const [secondsLeft, setSecondsLeft] = useState(BLOCK_DURATION_SECONDS)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number>(undefined)

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onBlockComplete()
          return BLOCK_DURATION_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalRef.current)
  }, [isRunning, onBlockComplete])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback(() => {
    setIsRunning(false)
    setSecondsLeft(BLOCK_DURATION_SECONDS)
  }, [])

  return { secondsLeft, isRunning, start, pause, reset }
}
