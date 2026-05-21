export function buildNarrativePrompt(
  storyPhase: string,
  narrativeSegmentCount: number,
  historySummary: string,
  lastChoice?: string,
  currentStats?: {
    hp: number;
    mp: number;
    atk: number;
    def: number;
    luck: number;
    cultivation: number;
    achievements: string[];
  },
): string {
  const phaseInstruction = getPhaseInstruction(storyPhase, narrativeSegmentCount);
  const statsDesc = currentStats ? buildStatsDescription(currentStats) : '';

  let prompt = `═══════════════════════════════
当前叙事任务（第${narrativeSegmentCount + 1}段，共约6段）
═══════════════════════════════

【故事阶段】${storyPhase}（第${narrativeSegmentCount + 1}段）
${phaseInstruction}

【主角当前状态】
${statsDesc}

【已有剧情摘要】
${historySummary || '（故事刚刚开始，尚无历史剧情）'}
`;

  if (lastChoice) {
    prompt += `
【玩家上一次的选择】
"${lastChoice}"

⚡ 重要：本段叙事必须自然地呈现这个选择带来的后果，让玩家感受到选择的重量。
`;
  }

  prompt += `
═══════════════════════════════
生成要求（严格遵守）
═══════════════════════════════

1. 【字数约束】narrative字段正文必须在50-100字之间，请写完后自行估算
2. 【节点约束】${storyPhase === 'ending' ? '当前为结局阶段，不生成节点（triggerNode: false），请触发结局（isEnding: true）' : '本段【必须】触发决策节点（triggerNode: true），不得为false'}
3. 【属性变化】根据本段情节内容，合理调整attributeChanges中的各属性增减值
4. 【选项质量】若触发节点，三个选项必须代表明显不同的行动路线，禁止废选项
5. 【情节连贯】新叙事必须与历史剧情保持一致，不得出现矛盾

${getPhaseSpecificHints(storyPhase, narrativeSegmentCount)}

请直接输出JSON，不要有任何额外文字。`;

  return prompt;
}

function getPhaseInstruction(phase: string, count: number): string {
  switch (phase) {
    case 'intro':
      return `【阶段基调：开篇铺垫】
- 目标：建立世界代入感，让玩家对李青云产生共情
- 节奏：舒缓，如诗如画，但结尾要埋下悬念
- 侧重：环境描写（修仙世界的景象）+ 主角的内心独白或日常
- 节点建议：event类型（遭遇普通事件），让玩家初步感受选择的趣味`;

    case 'early':
      return `【阶段基调：初期冒险】（第${count + 1}段）
- 目标：主角开始遭遇机遇与挑战，展现修仙世界的多彩
- 节奏：逐渐加快，出现小高潮
- 侧重：事件冲突、人物关系、利益权衡
- 节点建议：battle或event类型，考验玩家的判断力`;

    case 'mid':
      return `【阶段基调：中期冲突】
- 目标：重大冲突爆发，价值观受到考验，出现不可逆的关键选择
- 节奏：紧张，张力十足，情绪激烈
- 侧重：道德困境、生死边缘、重要抉择的代价
- 节点建议：fate或battle类型，影响故事走向的关键决策`;

    case 'late':
      return `【阶段基调：后期高潮】
- 目标：命运性转折，暗示可能的结局走向，情绪达到顶峰
- 节奏：极度紧张，一触即发
- 侧重：过去选择的因果呈现，大道之争，生死一线
- 节点建议：fate或wonder类型，这是影响结局类型的关键选择`;

    case 'ending':
      return `【阶段基调：结局降临】
- 目标：以一段深情的叙事收束全篇，触发三种结局之一
- 节奏：由急转缓，如落幕之曲
- 侧重：呼应过去的选择，给予情感上的圆满或遗憾
- 结局判断依据：根据主角当前hp、cultivation、luck以及整体剧情走向决定结局类型`;

    default:
      return '';
  }
}

function getPhaseSpecificHints(phase: string, count: number): string {
  if (phase === 'ending') {
    return `【结局触发指南】
- hp ≤ 20 时，优先考虑 death（陨落）结局
- cultivation ≥ 80 且 hp > 40 时，优先考虑 ascension（飞升）结局
- 其他情况默认考虑 lifespan（寿尽）结局
- isEnding 必须为 true，endingType 必须填写对应类型`;
  }

  if (count === 3) {
    return `【中期特别提示】
本段是故事的转折点，节点应为fate（命运）类型。
选项的后果差异应该最为显著，可以暗示不同结局的可能性。`;
  }

  if (count === 4) {
    return `【后期特别提示】
本段是最后一个有节点的章节，请在叙事中制造强烈的悬念感。
玩家的选择将直接影响最终结局，请在hint中给出明确的方向性暗示。`;
  }

  return '';
}

function buildStatsDescription(stats: {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  luck: number;
  cultivation: number;
  achievements: string[];
}): string {
  const lines = [
    `生命值：${stats.hp}/100  灵力值：${stats.mp}/100`,
    `攻击力：${stats.atk}/100  防御力：${stats.def}/100  气运：${stats.luck}/100`,
    `修炼进度：${stats.cultivation}/100${stats.cultivation >= 80 ? '（接近突破！）' : ''}`,
    stats.achievements.length > 0
      ? `已有成就：${stats.achievements.join('、')}`
      : '尚无特殊成就',
  ];
  return lines.join('\n');
}
