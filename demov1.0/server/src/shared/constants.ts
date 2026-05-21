export const WORLD_INTRO = `这是一个灵气充裕的修仙世界。凡界之中，门派林立，散修遍地，妖兽横行，秘境时现。三大宗门——青云宗、玄剑派、万药阁——主导着凡界修行格局，而无数散修则在夹缝中艰难求存。修士以吞吐天地灵气为根基，历练气、筑基、金丹、元婴、化神、大乘诸境，最终以渡劫飞升为终极目标，脱离凡界，步入仙途。修行路上危机四伏，既有天材地宝等待有缘人，也有劫难杀机暗藏其中。`;

export const CHARACTER_DEFAULT = {
  name: '李青云',
  realm: '练气中期',
  identity: '散修',
  description:
    '李青云，一名普通散修，无门无派，凭借自身天赋与机缘在修仙界中独自闯荡。练气中期的修为虽不算高深，但其心性坚韧，对大道充满渴望。',
};

export const CHARACTER_INITIAL_STATS = {
  hp: 70,
  mp: 60,
  atk: 40,
  def: 35,
  luck: 50,
  cultivation: 15,
  achievements: [] as string[],
};

export const REALM_PROGRESSION = [
  '练气初期',
  '练气中期',
  '练气后期',
  '练气圆满',
  '筑基初期',
  '筑基中期',
  '筑基后期',
  '筑基圆满',
  '金丹初期',
  '金丹中期',
  '金丹后期',
  '金丹圆满',
  '元婴期',
  '化神期',
  '大乘期',
  '渡劫期',
] as const;

export const STORY_PHASES = ['intro', 'early', 'mid', 'late', 'ending'] as const;
export type StoryPhase = (typeof STORY_PHASES)[number];
