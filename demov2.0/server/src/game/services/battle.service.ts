import { Injectable } from '@nestjs/common';
import { StructuredGameState } from '../../shared/interfaces';
import { calculateDerivedStats, calculatePowerScore, calculateBattleResult, BattleResult } from '../../shared/constants';

export interface BattleOutcome {
  result: BattleResult;
  narrative: string;
  rewards: { expGain: number; items: string[] };
  damage: { jing: number; qi: number; shen: number };
}

@Injectable()
export class BattleService {
  /**
   * 解算战斗结果
   */
  resolveBattle(state: StructuredGameState): BattleOutcome {
    const playerDerived = calculateDerivedStats(state.baseAttrs);
    const playerPower = calculatePowerScore(playerDerived);

    // 生成敌人（基于当前境界浮动）
    const enemyMultiplier = 0.7 + Math.random() * 0.8; // 0.7~1.5倍
    const enemyPower = playerPower * enemyMultiplier;

    const result = calculateBattleResult(playerPower, enemyPower, state.character.luck);

    const outcome = this.buildOutcome(result, state);

    // 应用战斗结果到状态
    state.baseAttrs.jing = Math.max(1, state.baseAttrs.jing + outcome.damage.jing);
    state.baseAttrs.qi = Math.max(1, state.baseAttrs.qi + outcome.damage.qi);
    state.baseAttrs.shen = Math.max(1, state.baseAttrs.shen + outcome.damage.shen);
    state.character.exp += outcome.rewards.expGain;
    state.inventory.push(...outcome.rewards.items);

    return outcome;
  }

  private buildOutcome(result: BattleResult, state: StructuredGameState): BattleOutcome {
    switch (result) {
      case 'GREAT_WIN':
        return {
          result,
          narrative: '势如破竹，以雷霆之势碾压对手！对方甚至来不及反应就被击溃。这一战打出了修仙者的威风！',
          rewards: { expGain: 200, items: ['战利品·灵石x100'] },
          damage: { jing: -2, qi: -1, shen: 5 },
        };
      case 'WIN':
        return {
          result,
          narrative: '经过一番苦战，终于凭借精妙的走位和凌厉的攻势击败对手。虽有损伤，但收获颇丰。',
          rewards: { expGain: 150, items: ['战利品·灵石x50'] },
          damage: { jing: -5, qi: -3, shen: 3 },
        };
      case 'DRAW':
        return {
          result,
          narrative: '双方势均力敌，激战百招不分胜负。最终默契地各退一步，这一战让修为有了新的领悟。',
          rewards: { expGain: 80, items: [] },
          damage: { jing: -8, qi: -5, shen: 2 },
        };
      case 'RETREAT':
        return {
          result,
          narrative: '对方实力强横，硬拼无望。当机立断施展身法撤退，虽然受了些伤，但好歹保住了性命。',
          rewards: { expGain: 30, items: [] },
          damage: { jing: -12, qi: -10, shen: -3 },
        };
      case 'DEATH':
        return {
          result,
          narrative: '对方实力远超预估，致命一击贯穿防御。元神摇摇欲坠……',
          rewards: { expGain: 0, items: [] },
          damage: { jing: -30, qi: -30, shen: -20 },
        };
    }
  }
}
