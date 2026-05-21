import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import {
  AiNarrativeResponse,
  AiEndingResponse,
  AttributeChanges,
  CharacterStats,
} from './ai-provider.interface';
import { MockProvider, resetMockState } from './providers/mock.provider';
import { buildSystemPrompt } from './prompts/system-prompt';
import { buildNarrativePrompt } from './prompts/narrative.prompt';
import { buildEndingPrompt } from './prompts/ending.prompt';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private llm: ChatOpenAI | null = null;
  private mockProvider: MockProvider | null = null;
  private providerType: string;

  constructor(private configService: ConfigService) {
    this.providerType = this.configService.get('AI_PROVIDER', 'mock');

    if (this.providerType === 'deepseek') {
      const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
      const baseURL = this.configService.get<string>(
        'DEEPSEEK_BASE_URL',
        'https://api.deepseek.com',
      );
      const model = this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat');

      this.llm = new ChatOpenAI({
        model,
        apiKey,
        configuration: { baseURL },
        temperature: 0.85,
        maxTokens: 2000,
        modelKwargs: {
          response_format: { type: 'json_object' },
        },
      });

      this.logger.log(`AI Provider: DeepSeek (model: ${model})`);
    } else {
      this.mockProvider = new MockProvider();
      this.logger.log('AI Provider: Mock');
    }
  }

  async generateNarrative(
    storyPhase: string,
    narrativeSegmentCount: number,
    historySummary: string,
    currentStats: CharacterStats,
    lastChoice?: string,
  ): Promise<AiNarrativeResponse> {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildNarrativePrompt(
      storyPhase,
      narrativeSegmentCount,
      historySummary,
      lastChoice,
      currentStats,
    );

    try {
      const raw = await this.invokeAI(systemPrompt, userPrompt, {
        temperature: 0.85,
        maxTokens: 2000,
      });
      return this.parseNarrativeResponse(raw);
    } catch (error) {
      this.logger.error('generateNarrative failed:', error);
      return this.getFallbackNarrativeResponse(storyPhase);
    }
  }

  async generateEnding(
    endingType: string,
    historySummary: string,
    keyChoices: { nodeType: string; choiceText: string }[],
    finalStats: CharacterStats,
  ): Promise<AiEndingResponse> {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildEndingPrompt(endingType, historySummary, keyChoices, finalStats);

    try {
      const raw = await this.invokeAI(systemPrompt, userPrompt, {
        temperature: 0.8,
        maxTokens: 2500,
      });
      return this.parseEndingResponse(raw);
    } catch (error) {
      this.logger.error('generateEnding failed:', error);
      return this.getFallbackEndingResponse(endingType);
    }
  }

  resetState() {
    if (this.mockProvider) {
      resetMockState();
    }
  }

  // ── 私有方法 ──────────────────────────────────────────────

  private async invokeAI(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature?: number; maxTokens?: number },
  ): Promise<string> {
    if (this.mockProvider) {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ];
      return this.mockProvider.generateCompletion(messages, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });
    }

    // LangChain 调用
    const result = await this.llm!.invoke(
      [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
      {
        options: {
          temperature: options.temperature ?? 0.85,
        },
      } as any,
    );

    return result.content as string;
  }

  private parseNarrativeResponse(raw: string): AiNarrativeResponse {
    try {
      const parsed = JSON.parse(raw);
      const attributeChanges = this.normalizeAttributeChanges(parsed.attributeChanges);

      return {
        narrative: parsed.narrative || '修仙路漫漫，故事继续……',
        triggerNode: !!parsed.triggerNode,
        nodeType: parsed.nodeType,
        nodeText: parsed.nodeText,
        choices: Array.isArray(parsed.choices) ? parsed.choices : undefined,
        isEnding: !!parsed.isEnding,
        endingType: parsed.endingType || undefined,
        attributeChanges,
      };
    } catch (e) {
      this.logger.warn('Failed to parse narrative response, using fallback');
      return this.getFallbackNarrativeResponse('mid');
    }
  }

  private parseEndingResponse(raw: string): AiEndingResponse {
    try {
      const parsed = JSON.parse(raw);
      return {
        narrative: parsed.narrative || '修仙之路，就此画上句点。',
        summary: parsed.summary || '李青云的故事，永远留在了凡界的记忆中。',
        attributeChanges: this.normalizeAttributeChanges(parsed.attributeChanges),
      };
    } catch (e) {
      this.logger.warn('Failed to parse ending response, using fallback');
      return this.getFallbackEndingResponse('lifespan');
    }
  }

  private normalizeAttributeChanges(raw: any): AttributeChanges {
    if (!raw || typeof raw !== 'object') {
      return { hp: 0, mp: 0, atk: 0, def: 0, luck: 0, cultivation: 0, achievements: [] };
    }
    return {
      hp: Number(raw.hp) || 0,
      mp: Number(raw.mp) || 0,
      atk: Number(raw.atk) || 0,
      def: Number(raw.def) || 0,
      luck: Number(raw.luck) || 0,
      cultivation: Number(raw.cultivation) || 0,
      achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    };
  }

  private getFallbackNarrativeResponse(phase: string): AiNarrativeResponse {
    return {
      narrative:
        '灵气流转之间，李青云感受到修仙路上的艰辛与机遇。前方的道路未知，但他的心志从未动摇。每一步前行，都是对大道的叩问，都是对命运的挑战。修仙者，当以坚韧为剑，以悟性为盾，在这茫茫天地间，寻找属于自己的道路。',
      triggerNode: phase !== 'ending',
      nodeType: 'event',
      nodeText: '前方出现了一个选择……',
      choices: [
        { text: '谨慎探查', hint: '稳妥但耗费时间' },
        { text: '直接前行', hint: '快速但有风险' },
      ],
      isEnding: phase === 'ending',
      endingType: phase === 'ending' ? 'lifespan' : undefined,
      attributeChanges: { hp: 0, mp: 0, atk: 0, def: 0, luck: 0, cultivation: 5, achievements: [] },
    };
  }

  private getFallbackEndingResponse(endingType: string): AiEndingResponse {
    const narratives: Record<string, string> = {
      ascension:
        '历经无数磨难，李青云终于在某个天朗气清的清晨，感受到了大道的呼唤。灵气如潮水般涌入他的周身，九色仙云自天际飘来，雷霆轰鸣之声震彻凡界。他端坐于云端，闭目感受着这前所未有的力量。渡劫，飞升，脱离凡界——这一刻，他做到了。',
      death:
        '李青云的修仙之路，在这一刻走到了终点。他最后望了一眼那片熟悉的天空，嘴角带着一丝苦笑。他不后悔，这条路，是他自己选择的。元神消散之际，他想起了修行以来的点点滴滴，心中充满了对这段岁月的感激。',
      lifespan:
        '岁月如白驹过隙，李青云在修行的道路上走了数百年。如今大限已至，他端坐于洞府之中，感受着生命之火的缓缓熄灭。他无怨无悔，因为他曾经真正地活过，真正地为大道而努力过。',
    };

    const summaries: Record<string, string> = {
      ascension: '散修李青云，以无门无派之身，终踏仙途，印证大道。',
      death: '李青云虽陨落凡界，然其不屈之志，长存天地之间。',
      lifespan: '李青云安然坐化，以平淡之心，诠释了修仙者的另一种圆满。',
    };

    return {
      narrative: narratives[endingType] || narratives.lifespan,
      summary: summaries[endingType] || summaries.lifespan,
      attributeChanges: { hp: 0, mp: 0, atk: 0, def: 0, luck: 0, cultivation: 0, achievements: [] },
    };
  }
}
