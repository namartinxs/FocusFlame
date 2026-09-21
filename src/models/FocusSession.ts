import type { FocusBlock } from './FocusBlock'

export interface FocusSession {
  id: string
  userId: string
  startedAt: string
  blocks: FocusBlock[]
}
