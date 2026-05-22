// ═══════════════════════════════════════════════════
// 基础属性
// ═══════════════════════════════════════════════════

export interface BaseAttrs {
  jing: number;
  qi: number;
  shen: number;
}

export interface DerivedStats {
  hp: number;
  mp: number;
  sp: number;
  atk: number;
  def: number;
}

export interface CharacterData {
  name: string;
  realm: string;
  exp: number;
  age: number;
  maxAge: number;
  jing: number;
  qi: number;
  shen: number;
  talent: number;
  wisdom: number;
  luck: number;
  derived: DerivedStats;
}

export interface CharacterRoll {
  name: string;
  jing: number;
  qi: number;
  shen: number;
  talent: number;
  wisdom: number;
  luck: number;
  maxAge: number;
}

// ═══════════════════════════════════════════════════
// 节点相关
// ═══════════════════════════════════════════════════

export interface NodeChoice {
  text: string;
  hint: string;
}

export interface GameNode {
  id: number;
  type: string;
  subType?: string;
  text: string;
  choices: NodeChoice[];
  stateChanges?: any;
}

// ═══════════════════════════════════════════════════
// 叙事历史
// ═══════════════════════════════════════════════════

export interface NarrativeEntry {
  text: string;
  type: 'log' | 'node' | 'choice' | 'battle' | 'breakthrough' | 'ending';
  timestamp?: number;
}

// ═══════════════════════════════════════════════════
// 结局
// ═══════════════════════════════════════════════════

export interface GameEnding {
  type: string;
  narrative: string;
  summary: string;
}

// ═══════════════════════════════════════════════════
// 世界信息
// ═══════════════════════════════════════════════════

export interface WorldInfo {
  name: string;
  geography: string;
  factions: { name: string; type: string; strength: string; specialty: string }[];
}

// ═══════════════════════════════════════════════════
// NPC
// ═══════════════════════════════════════════════════

export interface NpcInfo {
  name: string;
  type: string;
  personality: string;
  initialAffinity: number;
  plotRole: string;
}

// ═══════════════════════════════════════════════════
// 游戏阶段
// ═══════════════════════════════════════════════════

export type GamePhase = 'idle' | 'creating' | 'playing' | 'ended';

// ═══════════════════════════════════════════════════
// SSE 事件
// ═══════════════════════════════════════════════════

export interface SSEMessage {
  type: string;
  data: any;
  timestamp: number;
}
