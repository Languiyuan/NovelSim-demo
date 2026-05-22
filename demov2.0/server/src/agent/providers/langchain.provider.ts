import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

@Injectable()
export class LangChainProvider {
  private readonly logger = new Logger(LangChainProvider.name);
  private llm: ChatOpenAI | null = null;
  private isEnabled: boolean;

  constructor(private config: ConfigService) {
    const provider = this.config.get('AI_PROVIDER', 'mock');
    this.isEnabled = provider === 'deepseek';

    if (this.isEnabled) {
      const apiKey = this.config.get<string>('DEEPSEEK_API_KEY', '');
      const baseURL = this.config.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com');
      const model = this.config.get<string>('DEEPSEEK_MODEL', 'deepseek-chat');

      this.llm = new ChatOpenAI({
        model,
        apiKey,
        configuration: { baseURL },
        temperature: 0.85,
        maxTokens: 2000,
        modelKwargs: { response_format: { type: 'json_object' } },
      });

      this.logger.log(`LangChain Provider initialized: model=${model}`);
    }
  }

  get enabled(): boolean {
    return this.isEnabled;
  }

  async invoke(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.llm) throw new Error('LangChain provider not initialized');

    const result = await this.llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ]);
    return result.content as string;
  }

  async invokeWithRetry<T>(
    systemPrompt: string,
    userPrompt: string,
    parser: (raw: string) => T,
    maxRetries = 2,
  ): Promise<T> {
    let prompt = userPrompt;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const raw = await this.invoke(systemPrompt, prompt);
        return parser(raw);
      } catch (e) {
        if (i === maxRetries) throw e;
        prompt += '\n\n[系统提示：上次输出格式错误，请严格返回合法JSON]';
        this.logger.warn(`Retry ${i + 1}/${maxRetries} due to parse error`);
      }
    }
    throw new Error('Unreachable');
  }
}
