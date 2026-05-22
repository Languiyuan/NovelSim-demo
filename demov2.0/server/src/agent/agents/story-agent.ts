import { Injectable, Logger } from '@nestjs/common';
import { LangChainProvider } from '../providers/langchain.provider';
import { MockAgentProvider } from '../providers/mock-agent.provider';
import { WorldOutline, StoryOutline } from '../../shared/interfaces';

@Injectable()
export class StoryAgent {
  private readonly logger = new Logger(StoryAgent.name);

  constructor(
    private langchain: LangChainProvider,
    private mock: MockAgentProvider,
  ) {}

  async generate(worldOutline: WorldOutline, characterName: string, realm: string): Promise<StoryOutline> {
    if (!this.langchain.enabled) {
      return this.mock.generateStory(worldOutline, characterName, realm);
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildPrompt(worldOutline, characterName, realm);

    return this.langchain.invokeWithRetry(
      systemPrompt,
      userPrompt,
      (raw) => JSON.parse(raw) as StoryOutline,
    );
  }

  private buildSystemPrompt(): string {
    return `你是一个修仙故事的编剧大师。你的职责是：
1. 生成主角出身背景、核心NPC、命运锚点
2. 提供故事宏观走向（松散大纲，不限制玩家自由度）

你必须严格返回JSON格式，不要包含任何其他内容。`;
  }

  private buildPrompt(worldOutline: WorldOutline, characterName: string, realm: string): string {
    return `请为主角生成故事大纲。

世界信息：
- 世界名：${worldOutline.name}
- 地理：${worldOutline.geography}
- 势力：${worldOutline.factions.map(f => f.name).join('、')}

主角信息：
- 姓名：${characterName}
- 当前境界：${realm}
- 身份：散修

请输出JSON格式：
{
  "background": "主角背景故事（50-100字）",
  "npcs": [
    { "name": "NPC名", "type": "friend|enemy|mentor|neutral", "personality": "性格描述", "initialAffinity": 0-100, "plotRole": "剧情角色" }
  ],
  "destinyAnchors": [
    { "phase": "触发境界", "type": "KARMA|WONDER|FACTION", "hint": "提示", "triggerCondition": "触发条件" }
  ],
  "storyTone": "故事基调描述"
}

要求：
- 生成3-5个NPC，包含至少一个友方、一个敌方
- 命运锚点2-3个，覆盖不同境界阶段`;
  }
}
