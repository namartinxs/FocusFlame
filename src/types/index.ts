export type BlockStatus = 'pending' | 'active' | 'completed' | 'skipped'

export interface FocusBlock {
  index: number
  durationMinutes: 10
  status: BlockStatus
  completedAt?: string
}

export interface FocusSession {
  id: string
  userId: string
  startedAt: string
  blocks: FocusBlock[]
}

export interface Reward {
  id: string
  blockIndex: number
  label: string
  earnedAt: string
}
