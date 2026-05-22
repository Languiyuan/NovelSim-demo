import { Injectable, Logger } from '@nestjs/common';
import { LangChainProvider } from '../providers/langchain.provider';
import { MockAgentProvider } from '../providers/mock-agent.provider';
import { WorldOutline, StoryOutline, GameNodeData, StructuredGameState } from '../../shared/interfaces';

@Injectable()
export class NodeAgent {
  private readonly logger = new Logger(NodeAgent.name);

  constructor(
    private langchain: LangChainProvider,
    private mock: MockAgentProvider,
  ) {}

  async generate(
    worldOutline: WorldOutline,
    storyOutline: StoryOutline,
    gameState: StructuredGameState,
    recentNodes: string[],
    count: number,
  ): Promise<GameNodeData[]> {
    if (!this.langchain.enabled) {
      return this.mock.generateNodes(worldOutline, storyOutline, gameState, recentNodes, count);
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildGeneratePrompt(worldOutline, storyOutline, gameState, recentNodes, count);

    return this.langchain.invokeWithRetry(
      systemPrompt,
      userPrompt,
      (raw) => {
        const parsed = JSON.parse(raw);
        return parsed.nodes || [parsed];
      },
    );
  }

  async generateAfterChoice(
    worldOutline: WorldOutline,
    storyOutline: StoryOutline,
    gameState: StructuredGameState,
    choiceText: string,
    nodeText: string,
  ): Promise<{ narrative: string; stateChanges: any }> {
    if (!this.langchain.enabled) {
      return this.mock.generateNarrativeAfterChoice(gameState, choiceText, nodeText);
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildChoicePrompt(worldOutline, storyOutline, gameState, choiceText, nodeText);

    return this.langchain.invokeWithRetry(
      systemPrompt,
      userPrompt,
      (raw) => JSON.parse(raw),
    );
  }

  private buildSystemPrompt(): string {
    return `你是一个修仙游戏的节点生成器。你的职责是：
1. 根据当前游戏状态和世界观，生成合理的游戏节点
2. 每个节点包含叙事文本、选项和状态变更指令
3. 节点类型包括：EVENT(事件)、BATTLE(战斗)、WONDER(秘境)、KARMA(因果)、FACTION(宗门)

你必须严格返回JSON格式，不要包含任何其他内容。`;
  }

  private buildGeneratePrompt(
    worldOutline: WorldOutline,
    storyOutline: StoryOutline,
    gameState: StructuredGameState,
    recentNodes: string[],
    count: number,
  ): string {
    return `请生成${count}个游戏节点。

世界：${worldOutline.name}
故事基调：${storyOutline.storyTone}
当前境界：${gameState.character.realm}
精/气/神：${gameState.baseAttrs.jing}/${gameState.baseAttrs.qi}/${gameState.baseAttrs.shen}
年龄/寿元：${gameState.character.age}/${gameState.character.maxAge}

最近节点摘要：${recentNodes.join('; ') || '无'}

输出JSON格式：
{
  "nodes": [
    {
      "type": "EVENT|BATTLE|WONDER|KARMA|FACTION",
      "subType": "子类型描述",
      "text": "叙事文本（80-150字）",
      "choices": [
        { "text": "选项文本", "hint": "提示" }
      ],
      "stateChanges": {
        "baseAttrDelta": { "jing": 0, "qi": 0, "shen": 0 },
        "expGain": 100,
        "ageConsume": 10,
        "inventoryAdd": [],
        "npcRelChange": {}
      }
    }
  ]
}

要求：
- 每个节点2-3个选项
- 正面节点占比约75%
- 叙事要贴合世界观和当前境界`;
  }

  private buildChoicePrompt(
    worldOutline: WorldOutline,
    storyOutline: StoryOutline,
    gameState: StructuredGameState,
    choiceText: string,
    nodeText: string,
  ): string {
    return `玩家在以下场景中做出了选择，请生成后续叙事。

场景：${nodeText}
玩家选择：${choiceText}
当前境界：${gameState.character.realm}
世界：${worldOutline.name}

输出JSON格式：
{
  "narrative": "后续叙事文本（80-150字）",
  "stateChanges": {
    "baseAttrDelta": { "jing": 0, "qi": 0, "shen": 0 },
    "expGain": 50,
    "ageConsume": 10,
    "inventoryAdd": [],
    "npcRelChange": {}
  }
}`;
  }
}
