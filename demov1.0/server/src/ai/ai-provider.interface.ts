export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AiProvider {
  generateCompletion(
    messages: ChatMessage[],
    options?: GenerationOptions,
  ): Promise<string>;
}

export interface CharacterStats {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  luck: number;
  cultivation: number;
  achievements: string[];
}

export interface AttributeChanges {
  hp?: number;
  mp?: number;
  atk?: number;
  def?: number;
  luck?: number;
  cultivation?: number;
  achievements?: string[];
}

export interface AiNarrativeResponse {
  narrative: string;
  triggerNode: boolean;
  nodeType?: 'event' | 'battle' | 'wonder' | 'fate';
  nodeText?: string;
  choices?: { text: string; hint: string }[];
  isEnding?: boolean;
  endingType?: 'ascension' | 'death' | 'lifespan';
  attributeChanges?: AttributeChanges;
}

export interface AiEndingResponse {
  narrative: string;
  summary: string;
  attributeChanges?: AttributeChanges;
}
