// ═══════════════════════════════════════════════════
// 境界体系
// ═══════════════════════════════════════════════════

export const REALM_LIST = [
  '练气初期', '练气中期', '练气后期', '练气圆满',
  '筑基初期', '筑基中期', '筑基后期', '筑基圆满',
  '金丹初期', '金丹中期', '金丹后期', '金丹圆满',
  '元婴初期', '元婴中期', '元婴后期', '元婴圆满',
  '化神期', '大乘期', '渡劫期',
] as const;

export type RealmName = (typeof REALM_LIST)[number];

// 境界配置：exp阈值、寿元上限、节点频率
export const REALM_CONFIG: Record<string, {
  expThreshold: number;
  maxAgeBonus: number;
  needTribulation: boolean;
  nodeFrequency: Record<string, number>;
}> = {
  '练气初期': { expThreshold: 100, maxAgeBonus: 0, needTribulation: false, nodeFrequency: { event: 50, battle: 20, wonder: 15, karma: 10, faction: 5 } },
  '练气中期': { expThreshold: 200, maxAgeBonus: 20, needTribulation: false, nodeFrequency: { event: 45, battle: 25, wonder: 15, karma: 10, faction: 5 } },
  '练气后期': { expThreshold: 350, maxAgeBonus: 40, needTribulation: false, nodeFrequency: { event: 40, battle: 25, wonder: 15, karma: 12, faction: 8 } },
  '练气圆满': { expThreshold: 500, maxAgeBonus: 60, needTribulation: false, nodeFrequency: { event: 35, battle: 30, wonder: 15, karma: 12, faction: 8 } },
  '筑基初期': { expThreshold: 800, maxAgeBonus: 100, needTribulation: false, nodeFrequency: { event: 35, battle: 25, wonder: 20, karma: 12, faction: 8 } },
  '筑基中期': { expThreshold: 1200, maxAgeBonus: 150, needTribulation: false, nodeFrequency: { event: 30, battle: 25, wonder: 20, karma: 15, faction: 10 } },
  '筑基后期': { expThreshold: 1800, maxAgeBonus: 200, needTribulation: false, nodeFrequency: { event: 30, battle: 25, wonder: 20, karma: 15, faction: 10 } },
  '筑基圆满': { expThreshold: 2500, maxAgeBonus: 250, needTribulation: true, nodeFrequency: { event: 25, battle: 30, wonder: 20, karma: 15, faction: 10 } },
  '金丹初期': { expThreshold: 3500, maxAgeBonus: 350, needTribulation: false, nodeFrequency: { event: 25, battle: 25, wonder: 20, karma: 18, faction: 12 } },
  '金丹中期': { expThreshold: 5000, maxAgeBonus: 450, needTribulation: false, nodeFrequency: { event: 25, battle: 25, wonder: 20, karma: 18, faction: 12 } },
  '金丹后期': { expThreshold: 7000, maxAgeBonus: 550, needTribulation: false, nodeFrequency: { event: 20, battle: 25, wonder: 25, karma: 18, faction: 12 } },
  '金丹圆满': { expThreshold: 10000, maxAgeBonus: 650, needTribulation: true, nodeFrequency: { event: 20, battle: 30, wonder: 20, karma: 18, faction: 12 } },
  '元婴初期': { expThreshold: 15000, maxAgeBonus: 900, needTribulation: false, nodeFrequency: { event: 20, battle: 25, wonder: 25, karma: 18, faction: 12 } },
  '元婴中期': { expThreshold: 22000, maxAgeBonus: 1200, needTribulation: false, nodeFrequency: { event: 20, battle: 25, wonder: 25, karma: 18, faction: 12 } },
  '元婴后期': { expThreshold: 30000, maxAgeBonus: 1500, needTribulation: false, nodeFrequency: { event: 15, battle: 25, wonder: 25, karma: 20, faction: 15 } },
  '元婴圆满': { expThreshold: 40000, maxAgeBonus: 2000, needTribulation: true, nodeFrequency: { event: 15, battle: 25, wonder: 25, karma: 20, faction: 15 } },
  '化神期': { expThreshold: 60000, maxAgeBonus: 3000, needTribulation: true, nodeFrequency: { event: 15, battle: 20, wonder: 25, karma: 25, faction: 15 } },
  '大乘期': { expThreshold: 100000, maxAgeBonus: 5000, needTribulation: true, nodeFrequency: { event: 10, battle: 20, wonder: 25, karma: 25, faction: 20 } },
  '渡劫期': { expThreshold: 999999, maxAgeBonus: 10000, needTribulation: true, nodeFrequency: { event: 10, battle: 15, wonder: 25, karma: 30, faction: 20 } },
};

// ═══════════════════════════════════════════════════
// 节点类型
// ═══════════════════════════════════════════════════

export const NODE_TYPES = [
  'EVENT',     // 奇遇事件
  'BATTLE',    // 战斗
  'WONDER',    // 秘境/宝物
  'KARMA',     // 因果
  'FACTION',   // 宗门
  'RETREAT',   // 闭关
  'TRIBULATION', // 天劫
  'ASCEND',    // 飞升
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

// ═══════════════════════════════════════════════════
// 战力公式
// ═══════════════════════════════════════════════════

export interface BaseAttrs {
  jing: number;  // 精
  qi: number;    // 气
  shen: number;  // 神
}

export interface DerivedStats {
  hp: number;    // 气血 = qi * 8 + jing * 3
  mp: number;    // 法力 = shen * 8 + qi * 3
  sp: number;    // 神识 = shen * 5 + jing * 2
  atk: number;   // 攻击 = (jing + qi) * 2
  def: number;   // 防御 = (qi + shen) * 1.5
}

export function calculateDerivedStats(base: BaseAttrs): DerivedStats {
  return {
    hp: Math.floor(base.qi * 8 + base.jing * 3),
    mp: Math.floor(base.shen * 8 + base.qi * 3),
    sp: Math.floor(base.shen * 5 + base.jing * 2),
    atk: Math.floor((base.jing + base.qi) * 2),
    def: Math.floor((base.qi + base.shen) * 1.5),
  };
}

export function calculatePowerScore(derived: DerivedStats): number {
  return derived.hp * 0.3 + derived.mp * 0.25 + derived.atk * 0.25 + derived.def * 0.15 + derived.sp * 0.05;
}

// ═══════════════════════════════════════════════════
// 战斗结果
// ═══════════════════════════════════════════════════

export type BattleResult = 'GREAT_WIN' | 'WIN' | 'DRAW' | 'RETREAT' | 'DEATH';

export function calculateBattleResult(
  playerPower: number,
  enemyPower: number,
  luck: number,
): BattleResult {
  const powerRatio = playerPower / Math.max(enemyPower, 1);
  const luckBonus = (luck - 50) * 0.005;
  const random = Math.random() * 0.3;
  const winScore = powerRatio + luckBonus + random;

  if (winScore >= 1.6) return 'GREAT_WIN';
  if (winScore >= 1.2) return 'WIN';
  if (winScore >= 0.8) return 'DRAW';
  if (winScore >= 0.5) return 'RETREAT';
  return 'DEATH';
}

// ═══════════════════════════════════════════════════
// 世界默认设定
// ═══════════════════════════════════════════════════

export const DEFAULT_WORLD_TYPES = ['凡界', '灵界', '仙界'] as const;

export const CHARACTER_NAMES = [
  '李青云', '张玄霆', '王道心', '陈无极', '赵剑尘',
  '林悟真', '周归元', '杨天问', '刘星河', '黄灵均',
];

export function generateRandomName(): string {
  return CHARACTER_NAMES[Math.floor(Math.random() * CHARACTER_NAMES.length)];
}
