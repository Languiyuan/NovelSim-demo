import { Injectable, Logger } from '@nestjs/common';
import { LangChainProvider } from '../providers/langchain.provider';
import { MockAgentProvider } from '../providers/mock-agent.provider';
import { WorldOutline, ValidationResult } from '../../shared/interfaces';

@Injectable()
export class WorldAgent {
  private readonly logger = new Logger(WorldAgent.name);

  constructor(
    private langchain: LangChainProvider,
    private mock: MockAgentProvider,
  ) {}

  async generate(realm: string, worldType: string): Promise<WorldOutline> {
    if (!this.langchain.enabled) {
      return this.mock.generateWorld(realm, worldType);
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildGeneratePrompt(realm, worldType);

    return this.langchain.invokeWithRetry(
      systemPrompt,
      userPrompt,
      (raw) => JSON.parse(raw) as WorldOutline,
    );
  }

  async validate(worldOutline: WorldOutline, content: any, currentRealm: string): Promise<ValidationResult> {
    if (!this.langchain.enabled) {
      // Mock 模式直接通过校验
      return { valid: true, issues: [], suggestions: [] };
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildValidatePrompt(worldOutline, content, currentRealm);

    try {
      return await this.langchain.invokeWithRetry(
        systemPrompt,
        userPrompt,
        (raw) => JSON.parse(raw) as ValidationResult,
      );
    } catch (e) {
      this.logger.warn('Validation failed, passing through');
      return { valid: true, issues: [], suggestions: [] };
    }
  }

  private buildSystemPrompt(): string {
    return `你是一个修仙世界的世界观架构师。你的职责包括：
1. 生成完整的世界框架（地理、历史、势力、规则）
2. 校验其他内容是否符合世界观和境界限制

你必须严格返回JSON格式，不要包含任何其他内容。`;
  }

  private buildGeneratePrompt(realm: string, worldType: string): string {
    return `请生成一个${worldType}的世界大纲。当前主角境界为${realm}。

输出JSON格式：
{
  "name": "世界名称",
  "geography": "地理描述（100-200字）",
  "history": "历史背景（100-200字）",
  "factions": [{ "name": "宗门名", "type": "righteous|evil|neutral", "strength": "S|A|B|C", "specialty": "特色" }],
  "rules": ["世界规则1", "规则2"],
  "maxRealm": "承载上限境界"
}`;
  }

  private buildValidatePrompt(worldOutline: WorldOutline, content: any, currentRealm: string): string {
    return `请校验以下内容是否符合世界观。

世界大纲：${JSON.stringify(worldOutline)}
当前境界：${currentRealm}
待校验内容：${JSON.stringify(content)}

输出JSON格式：
{
  "valid": true/false,
  "issues": ["问题描述"],
  "suggestions": ["修正建议"]
}`;
  }
}
