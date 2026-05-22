import { Injectable, Logger } from '@nestjs/common';
import { WorldAgent } from './agents/world-agent';
import { StoryAgent } from './agents/story-agent';
import { NodeAgent } from './agents/node-agent';
import { WorldOutline, StoryOutline, GameNodeData, ValidationResult, StructuredGameState } from '../shared/interfaces';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private worldAgent: WorldAgent,
    private storyAgent: StoryAgent,
    private nodeAgent: NodeAgent,
  ) {}

  /**
   * Agent3: 生成新世界大纲
   */
  async generateWorld(realm: string, worldType: string): Promise<WorldOutline> {
    this.logger.log(`[Agent3] Generating world: type=${worldType}, realm=${realm}`);
    return this.worldAgent.generate(realm, worldType);
  }

  /**
   * Agent1: 生成故事大纲
   */
  async generateStory(worldOutline: WorldOutline, characterName: string, realm: string): Promise<StoryOutline> {
    this.logger.log(`[Agent1] Generating story for ${characterName}`);
    return this.storyAgent.generate(worldOutline, characterName, realm);
  }

  /**
   * Agent3: 校验内容一致性
   */
  async validateContent(worldOutline: WorldOutline, content: any, currentRealm: string): Promise<ValidationResult> {
    this.logger.log(`[Agent3] Validating content, realm=${currentRealm}`);
    return this.worldAgent.validate(worldOutline, content, currentRealm);
  }

  /**
   * Agent2: 生成游戏节点
   */
  async generateNodes(
    worldOutline: WorldOutline,
    storyOutline: StoryOutline,
    gameState: StructuredGameState,
    recentNodes: string[],
    count: number = 2,
  ): Promise<GameNodeData[]> {
    this.logger.log(`[Agent2] Generating ${count} nodes`);
    return this.nodeAgent.generate(worldOutline, storyOutline, gameState, recentNodes, count);
  }

  /**
   * Agent2: 基于选择生成后续叙事
   */
  async generateNarrativeAfterChoice(
    worldOutline: WorldOutline,
    storyOutline: StoryOutline,
    gameState: StructuredGameState,
    choiceText: string,
    nodeText: string,
  ): Promise<{ narrative: string; stateChanges: any }> {
    this.logger.log(`[Agent2] Generating narrative after choice: "${choiceText}"`);
    return this.nodeAgent.generateAfterChoice(worldOutline, storyOutline, gameState, choiceText, nodeText);
  }
}
