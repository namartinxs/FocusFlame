import type { FocusBlock } from '../../types'

interface BlockGridProps {
  blocks: FocusBlock[]
  activeBlockIndex: number
}

export function BlockGrid({ blocks, activeBlockIndex }: BlockGridProps) {
  return (
    <section className="block-grid">
      {blocks.map((block) => (
        <div
          key={block.index}
          className={`block-grid__cell block-grid__cell--${block.status}${
            block.index === activeBlockIndex ? ' block-grid__cell--active' : ''
          }`}
          title={`Bloco ${block.index + 1} · ${block.durationMinutes}min`}
        >
          {block.index + 1}
        </div>
      ))}
    </section>
  )
}
