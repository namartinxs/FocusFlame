import type { Reward } from '../models/Reward'

interface RewardsListViewProps {
  rewards: Reward[]
}

export function RewardsListView({ rewards }: RewardsListViewProps) {
  if (rewards.length === 0) {
    return (
      <p className="rewards rewards--empty">
        Complete um bloco para ganhar sua primeira recompensa.
      </p>
    )
  }

  return (
    <ul className="rewards">
      {rewards.map((reward) => (
        <li key={reward.id}>{reward.label}</li>
      ))}
    </ul>
  )
}
