import { Injectable } from '@nestjs/common';
import { StructuredGameState, StateChanges } from '../../shared/interfaces';

@Injectable()
export class NodeService {
  /**
   * 应用状态变更到游戏状态
   */
  applyStateChanges(state: StructuredGameState, changes: StateChanges): void {
    // 应用基础属性变化
    if (changes.baseAttrDelta) {
      state.baseAttrs.jing = Math.max(1, state.baseAttrs.jing + (changes.baseAttrDelta.jing || 0));
      state.baseAttrs.qi = Math.max(1, state.baseAttrs.qi + (changes.baseAttrDelta.qi || 0));
      state.baseAttrs.shen = Math.max(1, state.baseAttrs.shen + (changes.baseAttrDelta.shen || 0));
    }

    // 经验增长
    if (changes.expGain) {
      state.character.exp += changes.expGain;
    }

    // 年龄消耗
    if (changes.ageConsume) {
      state.character.age += changes.ageConsume;
    }

    // 物品获得
    if (changes.inventoryAdd && changes.inventoryAdd.length > 0) {
      state.inventory.push(...changes.inventoryAdd);
    }

    // NPC 关系变化
    if (changes.npcRelChange) {
      for (const [npcName, delta] of Object.entries(changes.npcRelChange)) {
        if (state.npcRelations[npcName]) {
          state.npcRelations[npcName].affinity += delta;
        } else {
          state.npcRelations[npcName] = { status: '在世', affinity: delta };
        }
      }
    }
  }
}
