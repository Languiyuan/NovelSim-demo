export function buildEndingPrompt(
  endingType: string,
  historySummary: string,
  keyChoices: { nodeType: string; choiceText: string }[],
  finalStats: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
    luck: number;
    cultivation: number;
    achievements: string[];
  },
): string {
  const endingDesc = getEndingDescription(endingType);
  const choicesNarrative = buildKeyChoicesContext(keyChoices);
  const statsContext = buildFinalStatsContext(finalStats);

  return `═══════════════════════════════
结局生成任务
═══════════════════════════════

【结局类型】${endingType}
${endingDesc}

═══════════════════════════════
主角的修仙旅程回顾
═══════════════════════════════

【故事摘要】
${historySummary}

【主角做出的关键选择】
${choicesNarrative}

【最终属性状态】
${statsContext}

═══════════════════════════════
结局写作要求（严格遵守）
═══════════════════════════════

1. 【字数约束】narrative字段正文必须在80-120字之间
2. 【情感深度】结局必须有强烈的情感冲击力，让玩家久久难忘
3. 【选择呼应】用自然的叙事手法（非列表）回顾玩家做过的1-3个关键选择，展现因果
4. 【属性刻画】根据最终属性状态，为主角的境遇做合理的文学化呈现（无需直接提及数值）
5. 【诗意收尾】结局的最后一段要有诗意，可以化用古诗词意境，给玩家留下回味空间
6. 【一句话命运】summary字段要高度凝练，道出主角命运的精髓，不超过30字

【结局基调参考】
${getEndingToneGuide(endingType, finalStats)}

请直接输出JSON，格式如下：
{
  "narrative": "（80-120字结局叙事）",
  "summary": "（30字内，一句话总结主角命运）",
  "attributeChanges": {
    "hp": 0,
    "mp": 0,
    "atk": 0,
    "def": 0,
    "luck": 0,
    "cultivation": ${endingType === 'ascension' ? 100 : 0},
    "achievements": ${endingType === 'ascension' ? '["白日飞升，化为仙人"]' : endingType === 'death' ? '["陨落凡界，英魂永存"]' : '["寿终正寝，悟道归尘"]'}
  }
}`;
}

function getEndingDescription(type: string): string {
  switch (type) {
    case 'ascension':
      return `【飞升】
李青云历经千难万险，终于在某一天，灵台清明，感悟大道。他的修炼进度突破临界，引动天地异象，九色仙云聚顶，天雷阵阵。他以散修之身，渡过了足以令宗门弟子望而生畏的天劫，化为一道流光，白日飞升，脱离凡界，步入仙途。`;

    case 'death':
      return `【陨落】
李青云的修仙之路，在某一刻戛然而止。无论是激烈的战斗、积累已久的伤势，还是命运的无情捉弄，他的生命力走到了终点。元神俱灭，身死道消。修仙路漫漫，他走得并不平庸，但终究未能走到终点。`;

    case 'lifespan':
      return `【寿尽】
李青云修行数百年，始终未能突破那最后的瓶颈。他的大限已至，不是死于战斗，不是倒在天劫之中，而是在某个宁静的清晨，端坐于洞府之中，感受着生命之火缓缓熄灭。安然坐化，魂归天地。`;

    default:
      return '';
  }
}

function buildKeyChoicesContext(
  choices: { nodeType: string; choiceText: string }[],
): string {
  if (!choices || choices.length === 0) {
    return '主角一路随缘而行，未留下特别的选择印记。';
  }

  const typeNames: Record<string, string> = {
    event: '日常抉择',
    battle: '战斗决策',
    wonder: '奇遇抉择',
    fate: '命运抉择',
  };

  return choices
    .map((c, i) => `第${i + 1}个关键选择（${typeNames[c.nodeType] || '抉择'}）："${c.choiceText}"`)
    .join('\n');
}

function buildFinalStatsContext(stats: {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  luck: number;
  cultivation: number;
  achievements: string[];
}): string {
  const hpDesc = stats.hp <= 20 ? '（命悬一线）' : stats.hp >= 80 ? '（体魄强健）' : '';
  const cultivationDesc =
    stats.cultivation >= 80 ? '（大道将成）' : stats.cultivation >= 50 ? '（修为深厚）' : '';
  const luckDesc =
    stats.luck >= 70 ? '（气运鼎盛）' : stats.luck <= 30 ? '（气运衰竭）' : '';

  return [
    `生命：${stats.hp}/100${hpDesc}  灵力：${stats.mp}/100`,
    `攻击：${stats.atk}/100  防御：${stats.def}/100`,
    `气运：${stats.luck}/100${luckDesc}  修炼进度：${stats.cultivation}/100${cultivationDesc}`,
    stats.achievements.length > 0
      ? `毕生成就：${stats.achievements.join('、')}`
      : '未留下特别成就',
  ].join('\n');
}

function getEndingToneGuide(
  type: string,
  stats: { hp: number; luck: number; cultivation: number; achievements: string[] },
): string {
  if (type === 'ascension') {
    return `基调：壮阔、圆满、超脱。从挣扎到飞升的蜕变，是对所有苦难的最好答复。
情感：激动、感慨、解脱。可以有泪水，但是幸福的泪水。
意象：白云、仙光、雷霆、羽化、云端`;
  }

  if (type === 'death') {
    const isDying = stats.hp <= 20;
    return `基调：${isDying ? '悲壮、英雄末路' : '惋惜、命运弄人'}。死亡不是终点，而是另一种永恒。
情感：不甘、释然、对这段修仙岁月的留恋。
意象：落叶、断剑、最后的灵光、消散的元神`;
  }

  return `基调：淡然、禅意、岁月如歌。未能飞升，但走完了属于自己的路。
情感：释怀、温柔的遗憾、对所有经历的珍视。
意象：暮色、枯坐、灵气归尘、一缕青烟`;
}
