export type BlockStatus = 'pending' | 'active' | 'completed' | 'skipped'

export const BLOCK_DURATION_MINUTES = 10

export interface FocusBlock {
  index: number
  durationMinutes: typeof BLOCK_DURATION_MINUTES
  status: BlockStatus
  completedAt?: string
}

export function createFocusBlocks(totalBlocks: number): FocusBlock[] {
  return Array.from({ length: totalBlocks }, (_, index) => ({
    index,
    durationMinutes: BLOCK_DURATION_MINUTES,
    status: 'pending',
  }))
}

export function completeBlock(blocks: FocusBlock[], blockIndex: number): FocusBlock[] {
  return blocks.map((block) =>
    block.index === blockIndex
      ? { ...block, status: 'completed', completedAt: new Date().toISOString() }
      : block,
  )
}
