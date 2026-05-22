import { BaseAttrs } from './constants';

// ═══════════════════════════════════════════════════
// Agent 相关接口
// ═══════════════════════════════════════════════════

export interface WorldOutline {
  name: string;
  geography: string;
  history: string;
  factions: FactionInfo[];
  rules: string[];
  maxRealm: string;  // 承载上限
}

export interface FactionInfo {
  name: string;
  type: 'righteous' | 'evil' | 'neutral';
  strength: 'S' | 'A' | 'B' | 'C';
  specialty: string;
}

export interface StoryOutline {
  background: string;
  npcs: NpcInfo[];
  destinyAnchors: DestinyAnchor[];
  storyTone: string;
}

export interface NpcInfo {
  name: string;
  type: 'friend' | 'enemy' | 'mentor' | 'neutral';
  personality: string;
  initialAffinity: number;
  plotRole: string;
}

export interface DestinyAnchor {
  phase: string;
  type: string;
  hint: string;
  triggerCondition: string;
}

// ═══════════════════════════════════════════════════
// 节点相关接口
// ═══════════════════════════════════════════════════

export interface GameNodeData {
  type: string;
  subType?: string;
  text: string;
  choices: NodeChoice[];
  stateChanges: StateChanges;
}

export interface NodeChoice {
  text: string;
  hint: string;
  expectedEffects?: Record<string, any>;
}

export interface StateChanges {
  baseAttrDelta: Partial<BaseAttrs>;
  expGain: number;
  ageConsume: number;
  inventoryAdd: string[];
  npcRelChange: Record<string, number>;
}

// ═══════════════════════════════════════════════════
// 游戏状态接口
// ═══════════════════════════════════════════════════

export interface StructuredGameState {
  baseAttrs: BaseAttrs;
  character: {
    realm: string;
    exp: number;
    age: number;
    maxAge: number;
    talent: number;
    wisdom: number;
    luck: number;
  };
  inventory: string[];
  skills: string[];
  npcRelations: Record<string, { status: string; affinity: number }>;
  karmaDebts: KarmaDebt[];
  worldFlags: string[];
}

export interface KarmaDebt {
  event: string;
  triggered: boolean;
  delayNodes: number;
  remaining: number;
}

// ═══════════════════════════════════════════════════
// SSE 事件类型
// ═══════════════════════════════════════════════════

export type SSEEventType =
  | 'log'
  | 'node'
  | 'status'
  | 'breakthrough'
  | 'ending'
  | 'heartbeat'
  | 'kicked'
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  data: any;
  timestamp: number;
}

// ═══════════════════════════════════════════════════
// API 响应包装
// ═══════════════════════════════════════════════════

export interface ApiEnvelope<T = any> {
  code: number;
  msg: string;
  data: T;
}

// ═══════════════════════════════════════════════════
// 校验结果
// ═══════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  suggestions: string[];
}
