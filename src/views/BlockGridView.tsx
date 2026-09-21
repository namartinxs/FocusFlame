import type { FocusBlock } from '../models/FocusBlock'

interface BlockGridViewProps {
  blocks: FocusBlock[]
  activeBlockIndex: number
}

export function BlockGridView({ blocks, activeBlockIndex }: BlockGridViewProps) {
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
