import { AiProvider, ChatMessage, GenerationOptions } from '../ai-provider.interface';

let mockCallCount = 0;

export function resetMockState() {
  mockCallCount = 0;
}

const MOCK_NARRATIVES = [
  // 第1段 - intro（50-100字）
  `晨雾笼罩青石山，灵气如丝流淌。李青云盘坐岩上，感受天地元气的脉动。作为散修，他无宗门庇佑，只凭一腔热忱独自闯荡。就在此时，一名青云宗外门弟子停步询问，打破了这份宁静。`,

  // 第2段 - early（50-100字）
  `与道友周平一番畅谈，李青云收获颇丰。别后东行，云岚坊市热闹非凡。他刚踏入其中，便感到气氛暗藏杀机——有人在暗中盯着他腰间的玉简，目光如鹰隼般锐利。`,

  // 第3段 - early（50-100字）
  `两名筑基修士突然现身，觊觎那枚残缺玉简。李青云凭借地形与符箓勉强脱身，却误入一处幽谷。谷中寂静异常，灵气却浓郁得令人心悸，不知藏着机缘还是杀机。`,

  // 第4段 - mid（50-100字）
  `幽谷深处，一枚通天灵晶静静悬浮。追兵已至，三名修士将他团团围住。李青云手握灵晶，心念电转——是引爆灵晶拼死一搏，还是以其为诱饵，设局反杀？`,

  // 第5段 - late（50-100字）
  `死里逃生后调息三日，剑意在生死边缘悄然升华。洞府之外，一名白衣少女捧着受伤灵兽闯入，神色慌张。她身着青云宗内门弟子服，请求李青云护送灵兽前往深山圣地。`,

  // 第6段 - ending 备用（80-120字）
  `岁月流转，修仙路漫漫。李青云立于命运岔路，回望来时种种。每一个选择，都已铸就今日的他。无论前路如何，无怨无悔。`,
];

const MOCK_NODES = [
  {
    nodeType: 'event',
    nodeText: '宗门弟子周平提出想要探查洞府，背后或许有宗门指令，也可能只是个人好奇。',
    choices: [
      { text: '热情相邀，共同探查', hint: '或许能结交贵人' },
      { text: '委婉拒绝，保持距离', hint: '安全为上，但失去机缘' },
      { text: '以信息交换，互利合作', hint: '实际但需要主动谈判' },
    ],
  },
  {
    nodeType: 'battle',
    nodeText: '在坊市遭遇两名觊觎玉简的筑基修士，对方修为在练气期之上，人多势众。',
    choices: [
      { text: '正面迎战，以命搏命', hint: '九死一生，但或有意外收获' },
      { text: '故布疑阵，伺机脱逃', hint: '消耗符箓，但能保住性命' },
      { text: '抛出玉简以换平安', hint: '丢失宝物，却换得太平' },
    ],
  },
  {
    nodeType: 'wonder',
    nodeText: '幽谷深处发现通天灵晶，但同时感知到强敌将至，是取是弃，是留是走？',
    choices: [
      { text: '取走灵晶，速速离去', hint: '冒险但有重宝在手' },
      { text: '就地布置陷阱守候', hint: '以逸待劳，风险较高' },
      { text: '留下标记，假装不知', hint: '或可引蛇出洞' },
    ],
  },
  {
    nodeType: 'fate',
    nodeText: '白衣少女请求护送受伤灵兽，此行必经险地，却也可能通向前人遗留的机缘。',
    choices: [
      { text: '慨然应诺，义薄云天', hint: '仁义之举，或有奇遇' },
      { text: '提出条件，以利相交', hint: '务实，但关系变味' },
      { text: '婉拒，伤势未愈为由', hint: '自保，但错过机缘' },
    ],
  },
];

const MOCK_ATTRIBUTE_CHANGES = [
  { hp: 0, mp: -5, atk: 0, def: 0, luck: 10, cultivation: 8, achievements: [] },
  { hp: -15, mp: -10, atk: 5, def: 3, luck: -5, cultivation: 10, achievements: ['初遇《青阳一式》残篇'] },
  { hp: -20, mp: -15, atk: 8, def: 5, luck: 5, cultivation: 12, achievements: ['以弱胜强，险脱围困'] },
  { hp: -10, mp: -20, atk: 10, def: 8, luck: 15, cultivation: 18, achievements: ['剑意入境'] },
  { hp: 10, mp: 5, atk: 0, def: 0, luck: 20, cultivation: 20, achievements: ['结识青云宗内门弟子'] },
];

export class MockProvider implements AiProvider {
  async generateCompletion(
    _messages: ChatMessage[],
    _options?: GenerationOptions,
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const index = mockCallCount % MOCK_NARRATIVES.length;
    const narrative = MOCK_NARRATIVES[index];
    const attributeChanges = MOCK_ATTRIBUTE_CHANGES[index] || MOCK_ATTRIBUTE_CHANGES[0];
    const isEnding = mockCallCount >= 5;
    const nodeIndex = mockCallCount % MOCK_NODES.length;

    mockCallCount++;

    if (isEnding) {
      return JSON.stringify({
        narrative,
        triggerNode: false,
        nodeType: null,
        nodeText: null,
        choices: null,
        attributeChanges: { hp: 0, mp: 0, atk: 0, def: 0, luck: 0, cultivation: 15, achievements: [] },
        isEnding: true,
        endingType: 'ascension',
      });
    }

    const node = MOCK_NODES[nodeIndex];

    return JSON.stringify({
      narrative,
      triggerNode: true,
      nodeType: node.nodeType,
      nodeText: node.nodeText,
      choices: node.choices,
      attributeChanges,
      isEnding: false,
      endingType: null,
    });
  }
}
