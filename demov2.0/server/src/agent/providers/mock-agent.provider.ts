import { Injectable } from '@nestjs/common';
import { WorldOutline, StoryOutline, GameNodeData, StructuredGameState, NpcInfo } from '../../shared/interfaces';
import { REALM_CONFIG, NODE_TYPES } from '../../shared/constants';

@Injectable()
export class MockAgentProvider {
  private nodeCallCount = 0;

  reset() {
    this.nodeCallCount = 0;
  }

  generateWorld(realm: string, worldType: string): WorldOutline {
    return {
      name: '苍茫界',
      geography: '三洲九域，以中洲天柱山为核心向外辐射。东有碧波海域，西有万丈沙海，南北则是连绵山脉。灵气自天柱山脉源头涌出，覆盖三洲。',
      history: '万年前仙魔大战后，上界封锁通道，凡界遗留诸多秘境。三大宗门于战后崛起，主导修仙界格局至今。',
      factions: [
        { name: '青云宗', type: 'righteous', strength: 'A', specialty: '剑修' },
        { name: '玄天阁', type: 'neutral', strength: 'A', specialty: '炼器' },
        { name: '万毒谷', type: 'evil', strength: 'B', specialty: '毒修' },
        { name: '天机楼', type: 'neutral', strength: 'B', specialty: '阵法' },
      ],
      rules: [
        '灵气浓郁但分布不均，天柱山周围最为丰厚',
        '化神以上不得在凡人聚集地动手',
        '秘境每百年开启一次',
        '宗门弟子可凭令牌进入各城',
      ],
      maxRealm: '化神期',
    };
  }

  generateStory(worldOutline: WorldOutline, characterName: string, realm: string): StoryOutline {
    return {
      background: `${characterName}出身于苍茫界东洲一个偏远小镇，幼时偶得残缺功法，自行摸索修炼至${realm}。无宗门庇佑，也无师父指点，全凭坚韧心性与过人悟性在修仙路上独自前行。`,
      npcs: [
        { name: '周平', type: 'friend', personality: '温厚谨慎，重情重义', initialAffinity: 60, plotRole: '修行路上的第一个道友' },
        { name: '苏婉清', type: 'neutral', personality: '冷傲聪慧，心思缜密', initialAffinity: 30, plotRole: '青云宗内门弟子，命运交织者' },
        { name: '陈霸天', type: 'enemy', personality: '狂妄自大，心狠手辣', initialAffinity: -40, plotRole: '早期宿敌，不断纠缠' },
        { name: '玄清子', type: 'mentor', personality: '深不可测，亦正亦邪', initialAffinity: 50, plotRole: '隐世前辈，关键时刻指点迷津' },
      ],
      destinyAnchors: [
        { phase: '筑基期', type: 'KARMA', hint: '师门传承', triggerCondition: '结识玄清子后完成三次委托' },
        { phase: '金丹期', type: 'WONDER', hint: '上古秘境机缘', triggerCondition: '集齐三枚秘境令牌' },
        { phase: '元婴期', type: 'FACTION', hint: '宗门抉择', triggerCondition: '声望达到一定程度' },
      ],
      storyTone: '先苦后甜，逆境翻盘型。前期多磨难历练，中期渐入佳境，后期风云际会。',
    };
  }

  generateNodes(
    worldOutline: WorldOutline,
    storyOutline: StoryOutline,
    gameState: StructuredGameState,
    recentNodes: string[],
    count: number,
  ): GameNodeData[] {
    const realm = gameState.character.realm;
    const config = REALM_CONFIG[realm] || REALM_CONFIG['练气中期'];
    const nodes: GameNodeData[] = [];

    for (let i = 0; i < count; i++) {
      const nodeType = this.pickNodeType(config.nodeFrequency);
      nodes.push(this.buildMockNode(nodeType, gameState, storyOutline));
    }

    this.nodeCallCount++;
    return nodes;
  }

  generateNarrativeAfterChoice(
    gameState: StructuredGameState,
    choiceText: string,
    nodeText: string,
  ): { narrative: string; stateChanges: any } {
    const narratives = [
      `选择了"${choiceText}"后，事情的发展超出了预料。灵气波动愈发剧烈，前方的道路似乎隐隐约约透出某种机缘的气息。修行之路就是如此，每一个选择都会将命运推向不同的方向。`,
      `"${choiceText}"——做出决定的瞬间，心中反而平静了。无论结果如何，修仙者当以本心为剑，斩断犹疑。一路向前，灵气在经脉中翻涌，修为在不知不觉中有了些许精进。`,
      `踏出这一步之后，周遭的灵气明显有了变化。"${choiceText}"这个选择似乎触动了什么，远处传来隐约的灵器共鸣声。修行者的直觉告诉你，前方或有收获，或有劫数。`,
    ];

    return {
      narrative: narratives[this.nodeCallCount % narratives.length],
      stateChanges: {
        baseAttrDelta: { jing: 2, qi: 3, shen: 1 },
        expGain: 50 + Math.floor(Math.random() * 100),
        ageConsume: 10 + Math.floor(Math.random() * 20),
        inventoryAdd: [],
        npcRelChange: {},
      },
    };
  }

  private pickNodeType(frequency: Record<string, number>): string {
    const entries = Object.entries(frequency);
    const total = entries.reduce((sum, [, v]) => sum + v, 0);
    let roll = Math.random() * total;

    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return type.toUpperCase();
    }
    return 'EVENT';
  }

  private buildMockNode(nodeType: string, gameState: StructuredGameState, story: StoryOutline): GameNodeData {
    const mockNodes: Record<string, () => GameNodeData> = {
      EVENT: () => ({
        type: 'EVENT',
        subType: '奇遇',
        text: `途经云岚坊市外围的密林时，一阵异常的灵气波动引起了注意。循着波动源头探去，竟发现一处天然灵眼正在喷涌灵气。然而灵眼旁已有数名修士对峙，气氛剑拔弩张。`,
        choices: [
          { text: '静观其变，坐收渔利', hint: '安全但可能错过机缘' },
          { text: '上前调解，参与分配', hint: '展现实力，但可能树敌' },
          { text: '暗中布阵，独吞灵眼', hint: '收益最大，风险也最大' },
        ],
        stateChanges: {
          baseAttrDelta: { jing: 3, qi: 5, shen: 2 },
          expGain: 80,
          ageConsume: 15,
          inventoryAdd: [],
          npcRelChange: {},
        },
      }),
      BATTLE: () => ({
        type: 'BATTLE',
        subType: '遭遇战',
        text: `前方山道上，一名面容阴沉的修士拦住了去路。此人散发着筑基期的气息压迫，冷笑道："识相的把空间袋留下，否则休怪我手下无情。"`,
        choices: [
          { text: '正面迎战', hint: '九死一生，但若胜则收获颇丰' },
          { text: '以言语周旋，寻找破绽', hint: '拖延时间，伺机而动' },
          { text: '果断撤退', hint: '留得青山在，不怕没柴烧' },
        ],
        stateChanges: {
          baseAttrDelta: { jing: -5, qi: -3, shen: 4 },
          expGain: 120,
          ageConsume: 5,
          inventoryAdd: [],
          npcRelChange: {},
        },
      }),
      WONDER: () => ({
        type: 'WONDER',
        subType: '秘境',
        text: `洞府深处，一道若隐若现的空间裂缝出现在眼前。裂缝中隐约可见奇花异草和灵光闪烁的矿脉。这或许是上古遗留的小型秘境入口，但空间不稳定，随时可能坍塌。`,
        choices: [
          { text: '毫不犹豫进入', hint: '机缘与危险并存' },
          { text: '先投掷灵石试探稳定性', hint: '谨慎行事' },
          { text: '记下位置，准备充分再来', hint: '可能被他人抢先' },
        ],
        stateChanges: {
          baseAttrDelta: { jing: 5, qi: 5, shen: 5 },
          expGain: 150,
          ageConsume: 30,
          inventoryAdd: ['灵石x50'],
          npcRelChange: {},
        },
      }),
      KARMA: () => ({
        type: 'KARMA',
        subType: '因果',
        text: `梦中，一个模糊的身影出现在面前，低语道："你欠下的因果，终有一日要偿还。"醒来后，手腕处多了一道若隐若现的红色印记，灵力流转间隐隐作痛。`,
        choices: [
          { text: '寻求前辈指点化解', hint: '可能需要付出代价' },
          { text: '以修为强行压制', hint: '暂时无恙，后患无穷' },
          { text: '顺其自然，不做理会', hint: '因果自有定数' },
        ],
        stateChanges: {
          baseAttrDelta: { jing: 0, qi: -2, shen: 8 },
          expGain: 60,
          ageConsume: 0,
          inventoryAdd: [],
          npcRelChange: {},
        },
      }),
      FACTION: () => ({
        type: 'FACTION',
        subType: '宗门',
        text: `一名身着青云宗外门弟子服饰的年轻人急匆匆跑来，恳请帮忙："道友救命！我在执行宗门任务时遭遇妖兽围攻，同伴受伤被困，请助我一臂之力！"`,
        choices: [
          { text: '仗义出手', hint: '结交宗门弟子，提升声望' },
          { text: '要求事后报酬', hint: '利益交换，不伤情分' },
          { text: '婉言拒绝', hint: '明哲保身，但失去潜在机缘' },
        ],
        stateChanges: {
          baseAttrDelta: { jing: 2, qi: 2, shen: 2 },
          expGain: 100,
          ageConsume: 10,
          inventoryAdd: [],
          npcRelChange: { '青云宗': 20 },
        },
      }),
    };

    const builder = mockNodes[nodeType] || mockNodes['EVENT'];
    return builder();
  }
}
