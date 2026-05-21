import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession, CharacterStats } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { AiService } from '../ai/ai.service';
import { AttributeChanges } from '../ai/ai-provider.interface';
import {
  WORLD_INTRO,
  CHARACTER_DEFAULT,
  CHARACTER_INITIAL_STATS,
  REALM_PROGRESSION,
} from '../shared/constants';
import { NextNarrativeDto } from './dto/next-narrative.dto';
import { ChooseOptionDto } from './dto/choose-option.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(GameSession)
    private sessionRepo: Repository<GameSession>,
    @InjectRepository(StoryNode)
    private storyNodeRepo: Repository<StoryNode>,
    private aiService: AiService,
  ) {}

  async startGame() {
    // 结束旧会话
    await this.sessionRepo.update({ status: 'active' }, { status: 'ended' });

    // 重置 Mock 状态
    this.aiService.resetState();

    // 创建新会话
    const initialStats: CharacterStats = { ...CHARACTER_INITIAL_STATS };
    const session = this.sessionRepo.create({
      characterName: CHARACTER_DEFAULT.name,
      realm: CHARACTER_DEFAULT.realm,
      stateJson: {
        name: CHARACTER_DEFAULT.name,
        realm: CHARACTER_DEFAULT.realm,
        storyPhase: 'intro',
        history: [],
        characterStats: initialStats,
        narrativeSegmentCount: 0,
      },
      status: 'active',
    });
    await this.sessionRepo.save(session);

    // 生成开篇叙事
    const aiResponse = await this.aiService.generateNarrative(
      'intro',
      0,
      '',
      initialStats,
    );

    // 应用属性变化
    const updatedStats = this.applyAttributeChanges(
      initialStats,
      aiResponse.attributeChanges,
    );

    // 检查境界突破
    const { stats: finalStats, newRealm } = this.checkRealmBreakthrough(
      updatedStats,
      session.realm,
    );

    // 更新会话状态
    session.stateJson = {
      ...session.stateJson,
      characterStats: finalStats,
      narrativeSegmentCount: 1,
      storyPhase: this.derivePhase(1),
      realm: newRealm,
    };
    if (newRealm !== session.realm) {
      session.realm = newRealm;
    }
    await this.sessionRepo.save(session);

    // 保存开篇节点
    const node = this.storyNodeRepo.create({
      sessionId: session.id,
      nodeType: aiResponse.triggerNode ? aiResponse.nodeType || 'event' : 'narrative',
      narrativeText: aiResponse.narrative,
      choicesJson: aiResponse.triggerNode ? aiResponse.choices || null : null,
      chosenIndex: null,
    });
    await this.storyNodeRepo.save(node);

    const result: any = {
      sessionId: session.id,
      worldIntro: WORLD_INTRO,
      character: CHARACTER_DEFAULT,
      openingStory: aiResponse.narrative,
      characterStats: finalStats,
      attributeChanges: aiResponse.attributeChanges,
    };

    if (aiResponse.triggerNode) {
      result.hasNode = true;
      result.node = {
        id: node.id,
        type: aiResponse.nodeType,
        text: aiResponse.nodeText || '',
        choices: aiResponse.choices || [],
      };
    } else {
      result.hasNode = false;
    }

    return result;
  }

  async getNextNarrative(dto: NextNarrativeDto) {
    const session = await this.getActiveSession();
    if (!session) throw new Error('No active game session');

    const historySummary = this.buildHistorySummary(dto.history || []);
    const currentStats = session.stateJson.characterStats ?? { ...CHARACTER_INITIAL_STATS };
    const segmentCount = session.stateJson.narrativeSegmentCount ?? 0;
    const storyPhase = session.stateJson.storyPhase;

    const aiResponse = await this.aiService.generateNarrative(
      storyPhase,
      segmentCount,
      historySummary,
      currentStats,
    );

    // 处理结局
    if (aiResponse.isEnding) {
      return await this.handleEnding(session, aiResponse, historySummary, currentStats);
    }

    // 应用属性变化
    const updatedStats = this.applyAttributeChanges(currentStats, aiResponse.attributeChanges);
    const { stats: finalStats, newRealm } = this.checkRealmBreakthrough(updatedStats, session.realm);

    // 推进段数和阶段
    const newCount = segmentCount + 1;
    const newPhase = this.derivePhase(newCount);

    session.stateJson = {
      ...session.stateJson,
      characterStats: finalStats,
      narrativeSegmentCount: newCount,
      storyPhase: newPhase,
      realm: newRealm,
    };
    if (newRealm !== session.realm) session.realm = newRealm;
    await this.sessionRepo.save(session);

    // 保存节点
    const node = this.storyNodeRepo.create({
      sessionId: session.id,
      nodeType: aiResponse.triggerNode ? aiResponse.nodeType || 'event' : 'narrative',
      narrativeText: aiResponse.narrative,
      choicesJson: aiResponse.triggerNode ? aiResponse.choices || null : null,
      chosenIndex: null,
    });
    await this.storyNodeRepo.save(node);

    const result: any = {
      narrative: aiResponse.narrative,
      hasNode: aiResponse.triggerNode,
      isEnding: false,
      characterStats: finalStats,
      attributeChanges: aiResponse.attributeChanges,
      stateUpdate: {
        storyPhase: newPhase,
        realm: newRealm,
      },
    };

    if (aiResponse.triggerNode) {
      result.node = {
        id: node.id,
        type: aiResponse.nodeType,
        text: aiResponse.nodeText || '',
        choices: aiResponse.choices || [],
      };
    }

    return result;
  }

  async makeChoice(dto: ChooseOptionDto) {
    const session = await this.getActiveSession();
    if (!session) throw new Error('No active game session');

    // 记录玩家选择
    const targetNode = await this.storyNodeRepo.findOne({ where: { id: dto.nodeId } });
    if (targetNode) {
      targetNode.chosenIndex = dto.choiceIndex;
      await this.storyNodeRepo.save(targetNode);
    }

    const choiceText = targetNode?.choicesJson?.[dto.choiceIndex]?.text || `选项${dto.choiceIndex + 1}`;
    const historySummary = this.buildHistorySummary(dto.history || []);
    const currentStats = session.stateJson.characterStats ?? { ...CHARACTER_INITIAL_STATS };
    const segmentCount = session.stateJson.narrativeSegmentCount ?? 0;
    const storyPhase = session.stateJson.storyPhase;

    const aiResponse = await this.aiService.generateNarrative(
      storyPhase,
      segmentCount,
      historySummary,
      currentStats,
      choiceText,
    );

    // 处理结局
    if (aiResponse.isEnding) {
      return await this.handleEnding(session, aiResponse, historySummary, currentStats);
    }

    // 应用属性变化
    const updatedStats = this.applyAttributeChanges(currentStats, aiResponse.attributeChanges);
    const { stats: finalStats, newRealm } = this.checkRealmBreakthrough(updatedStats, session.realm);

    const newCount = segmentCount + 1;
    const newPhase = this.derivePhase(newCount);

    session.stateJson = {
      ...session.stateJson,
      characterStats: finalStats,
      narrativeSegmentCount: newCount,
      storyPhase: newPhase,
      realm: newRealm,
    };
    if (newRealm !== session.realm) session.realm = newRealm;
    await this.sessionRepo.save(session);

    const node = this.storyNodeRepo.create({
      sessionId: session.id,
      nodeType: aiResponse.triggerNode ? aiResponse.nodeType || 'event' : 'narrative',
      narrativeText: aiResponse.narrative,
      choicesJson: aiResponse.triggerNode ? aiResponse.choices || null : null,
      chosenIndex: null,
    });
    await this.storyNodeRepo.save(node);

    const result: any = {
      narrative: aiResponse.narrative,
      hasNode: aiResponse.triggerNode,
      isEnding: false,
      characterStats: finalStats,
      attributeChanges: aiResponse.attributeChanges,
      stateUpdate: {
        storyPhase: newPhase,
        realm: newRealm,
      },
    };

    if (aiResponse.triggerNode) {
      result.node = {
        id: node.id,
        type: aiResponse.nodeType,
        text: aiResponse.nodeText || '',
        choices: aiResponse.choices || [],
      };
    }

    return result;
  }

  async getHistory() {
    const session = await this.getActiveSession();
    if (!session) return { history: [], characterStats: null };

    const nodes = await this.storyNodeRepo.find({
      where: { sessionId: session.id },
      order: { createdAt: 'ASC' },
    });

    return {
      history: nodes.map((n) => ({
        id: n.id,
        type: n.nodeType,
        text: n.narrativeText,
        choices: n.choicesJson,
        chosenIndex: n.chosenIndex,
        createdAt: n.createdAt,
      })),
      characterStats: session.stateJson.characterStats ?? CHARACTER_INITIAL_STATS,
    };
  }

  // ── 私有方法 ──────────────────────────────────────────────

  private async handleEnding(
    session: GameSession,
    aiResponse: any,
    historySummary: string,
    currentStats: CharacterStats,
  ) {
    // 自动判断结局类型（若 AI 未给出）
    const endingType = aiResponse.endingType || this.determineEndingType(currentStats);

    // 获取玩家关键选择
    const allNodes = await this.storyNodeRepo.find({
      where: { sessionId: session.id },
      order: { createdAt: 'ASC' },
    });
    const keyChoices = allNodes
      .filter((n) => n.chosenIndex !== null && n.choicesJson)
      .slice(0, 5)
      .map((n) => ({
        nodeType: n.nodeType,
        choiceText: n.choicesJson?.[n.chosenIndex!]?.text || '某个选择',
      }));

    // 生成结局叙事
    const endingResult = await this.aiService.generateEnding(
      endingType,
      historySummary,
      keyChoices,
      currentStats,
    );

    // 应用最终属性变化
    const finalStats = this.applyAttributeChanges(currentStats, endingResult.attributeChanges);

    // 保存结局节点
    const endingNode = this.storyNodeRepo.create({
      sessionId: session.id,
      nodeType: 'ending',
      narrativeText: endingResult.narrative,
      choicesJson: null,
      chosenIndex: null,
    });
    await this.storyNodeRepo.save(endingNode);

    // 结束会话
    session.status = 'ended';
    session.stateJson = { ...session.stateJson, characterStats: finalStats, storyPhase: 'ending' };
    await this.sessionRepo.save(session);

    return {
      narrative: aiResponse.narrative,
      hasNode: false,
      isEnding: true,
      ending: {
        type: endingType,
        narrative: endingResult.narrative,
        summary: endingResult.summary,
      },
      characterStats: finalStats,
      attributeChanges: endingResult.attributeChanges,
      stateUpdate: { storyPhase: 'ending' },
    };
  }

  private applyAttributeChanges(
    current: CharacterStats,
    changes?: AttributeChanges | null,
  ): CharacterStats {
    if (!changes) return { ...current };

    const clamp = (val: number) => Math.max(0, Math.min(100, val));

    return {
      hp: clamp(current.hp + (changes.hp || 0)),
      mp: clamp(current.mp + (changes.mp || 0)),
      atk: clamp(current.atk + (changes.atk || 0)),
      def: clamp(current.def + (changes.def || 0)),
      luck: clamp(current.luck + (changes.luck || 0)),
      cultivation: clamp(current.cultivation + (changes.cultivation || 0)),
      achievements: [
        ...current.achievements,
        ...(changes.achievements || []).filter((a) => !current.achievements.includes(a)),
      ],
    };
  }

  private checkRealmBreakthrough(
    stats: CharacterStats,
    currentRealm: string,
  ): { stats: CharacterStats; newRealm: string } {
    if (stats.cultivation < 100) {
      return { stats, newRealm: currentRealm };
    }

    const currentIndex = REALM_PROGRESSION.indexOf(currentRealm as any);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= REALM_PROGRESSION.length) {
      // 已是最高境界，cultivation 停在 100
      return { stats, newRealm: currentRealm };
    }

    const newRealm = REALM_PROGRESSION[nextIndex];
    const newStats: CharacterStats = {
      ...stats,
      cultivation: 0,
      hp: Math.min(100, stats.hp + 20),
      mp: Math.min(100, stats.mp + 20),
      achievements: [
        ...stats.achievements,
        `突破至${newRealm}`,
      ].filter((a, i, arr) => arr.indexOf(a) === i),
    };

    this.logger.log(`Realm breakthrough: ${currentRealm} → ${newRealm}`);
    return { stats: newStats, newRealm };
  }

  private determineEndingType(stats: CharacterStats): 'ascension' | 'death' | 'lifespan' {
    if (stats.hp <= 20) return 'death';
    if (stats.cultivation >= 80 && stats.hp > 40) return 'ascension';
    return 'lifespan';
  }

  private derivePhase(count: number): string {
    if (count <= 1) return 'intro';
    if (count <= 3) return 'early';
    if (count === 4) return 'mid';
    if (count === 5) return 'late';
    return 'ending';
  }

  private async getActiveSession(): Promise<GameSession | null> {
    return this.sessionRepo.findOne({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  private buildHistorySummary(history: { role: string; content: string }[]): string {
    if (!history || history.length === 0) return '';
    return history
      .slice(-10)
      .map((h) => h.content)
      .join('\n');
  }
}
