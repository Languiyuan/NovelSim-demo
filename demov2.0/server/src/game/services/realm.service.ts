import { Injectable, Logger } from '@nestjs/common';
import { StructuredGameState } from '../../shared/interfaces';
import { REALM_LIST, REALM_CONFIG } from '../../shared/constants';

export interface BreakthroughResult {
  success: boolean;
  oldRealm: string;
  newRealm: string | null;
  narrative: string;
  needTribulation: boolean;
  tribulationPassed?: boolean;
}

@Injectable()
export class RealmService {
  private readonly logger = new Logger(RealmService.name);

  /**
   * 尝试境界突破
   */
  tryBreakthrough(state: StructuredGameState): BreakthroughResult {
    const currentRealm = state.character.realm;
    const config = REALM_CONFIG[currentRealm];

    if (!config) {
      return {
        success: false, oldRealm: currentRealm, newRealm: null,
        narrative: '当前境界无法再进一步。', needTribulation: false,
      };
    }

    // 检查经验是否足够
    if (state.character.exp < config.expThreshold) {
      return {
        success: false, oldRealm: currentRealm, newRealm: null,
        narrative: `修为不足，需要${config.expThreshold}经验才能尝试突破，当前${state.character.exp}。`,
        needTribulation: false,
      };
    }

    const currentIndex = REALM_LIST.indexOf(currentRealm as any);
    if (currentIndex < 0 || currentIndex >= REALM_LIST.length - 1) {
      return {
        success: false, oldRealm: currentRealm, newRealm: null,
        narrative: '已达境界巅峰，需寻求飞升之路。', needTribulation: false,
      };
    }

    const nextRealm = REALM_LIST[currentIndex + 1];

    // 天劫判定
    if (config.needTribulation) {
      const tribSuccess = this.rollTribulation(state);
      if (!tribSuccess) {
        // 天劫失败：损失属性但不死
        state.baseAttrs.jing = Math.max(10, state.baseAttrs.jing - 15);
        state.baseAttrs.qi = Math.max(10, state.baseAttrs.qi - 15);
        state.baseAttrs.shen = Math.max(10, state.baseAttrs.shen - 10);
        state.character.exp = Math.floor(state.character.exp * 0.7);

        return {
          success: false, oldRealm: currentRealm, newRealm: null,
          narrative: `天劫降临！雷霆轰鸣，劫云压顶。遗憾的是未能抗住天劫之力，修为受损，跌落回${currentRealm}。需要重新积累修为。`,
          needTribulation: true, tribulationPassed: false,
        };
      }
    }

    // 突破成功
    state.character.realm = nextRealm;
    state.character.exp = 0;
    state.character.maxAge += (REALM_CONFIG[nextRealm]?.maxAgeBonus || 50);

    // 突破奖励属性
    state.baseAttrs.jing += 10;
    state.baseAttrs.qi += 10;
    state.baseAttrs.shen += 10;

    this.logger.log(`Breakthrough: ${currentRealm} → ${nextRealm}`);

    const narrative = config.needTribulation
      ? `天劫降临，九道雷霆劈下！凭借坚韧心志和深厚底蕴，硬抗天劫通过。灵气翻涌，境界突破——${currentRealm} → ${nextRealm}！修为大进，寿元延长！`
      : `灵气在体内翻涌，瓶颈轰然碎裂！一股浩大的力量从丹田涌出，境界突破——${currentRealm} → ${nextRealm}！修为精进，感悟更深。`;

    return {
      success: true, oldRealm: currentRealm, newRealm: nextRealm,
      narrative, needTribulation: config.needTribulation,
      tribulationPassed: config.needTribulation ? true : undefined,
    };
  }

  private rollTribulation(state: StructuredGameState): boolean {
    // 基础成功率 60%，受资质和气运加成
    const baseRate = 0.6;
    const talentBonus = (state.character.talent - 50) * 0.003;
    const luckBonus = (state.character.luck - 50) * 0.004;
    const successRate = Math.min(0.95, Math.max(0.2, baseRate + talentBonus + luckBonus));

    return Math.random() < successRate;
  }
}
