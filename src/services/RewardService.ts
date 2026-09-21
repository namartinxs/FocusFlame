import type { Reward } from '../models/Reward'

/**
 * Estratégia de recompensa por bloco concluído. Novas recompensas (ex.:
 * variar por horário, por streak, por tipo de bloco) entram como uma nova
 * implementação desta interface, sem tocar no controller que a consome
 * (Open/Closed Principle).
 */
export interface RewardStrategy {
  createReward(blockIndex: number): Reward
}

export class FlameRewardStrategy implements RewardStrategy {
  createReward(blockIndex: number): Reward {
    return {
      id: crypto.randomUUID(),
      blockIndex,
      label: 'Chama acesa \u{1F525}',
      earnedAt: new Date().toISOString(),
    }
  }
}
