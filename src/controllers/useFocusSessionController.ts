import { useState } from 'react'
import { completeBlock, createFocusBlocks, type FocusBlock } from '../models/FocusBlock'
import type { Reward } from '../models/Reward'
import { FlameRewardStrategy, type RewardStrategy } from '../services/RewardService'
import { useBlockTimer } from './useBlockTimer'

const TOTAL_BLOCKS = 6 // 6 blocos de 10min = 1h de sessão de foco

export interface FocusSessionController {
  blocks: FocusBlock[]
  activeBlockIndex: number
  rewards: Reward[]
  secondsLeft: number
  isRunning: boolean
  start(): void
  pause(): void
  reset(): void
}

/**
 * `rewardStrategy` é injetada com um default concreto (mesmo raciocínio de
 * `useAuthController`): o controller só conhece a interface `RewardStrategy`.
 */
export function useFocusSessionController(
  rewardStrategy: RewardStrategy = new FlameRewardStrategy(),
): FocusSessionController {
  const [blocks, setBlocks] = useState<FocusBlock[]>(() =>
    createFocusBlocks(TOTAL_BLOCKS),
  )
  const [rewards, setRewards] = useState<Reward[]>([])
  const [activeBlockIndex, setActiveBlockIndex] = useState(0)

  const handleBlockComplete = () => {
    setBlocks((prev) => completeBlock(prev, activeBlockIndex))
    setRewards((prev) => [...prev, rewardStrategy.createReward(activeBlockIndex)])
    setActiveBlockIndex((index) => Math.min(index + 1, TOTAL_BLOCKS - 1))
  }

  const timer = useBlockTimer(handleBlockComplete)

  return {
    blocks,
    activeBlockIndex,
    rewards,
    secondsLeft: timer.secondsLeft,
    isRunning: timer.isRunning,
    start: timer.start,
    pause: timer.pause,
    reset: timer.reset,
  }
}
