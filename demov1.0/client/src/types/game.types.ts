export interface GameCharacter {
  name: string;
  realm: string;
  identity: string;
  description: string;
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

export interface NodeChoice {
  text: string;
  hint: string;
}

export interface GameNode {
  id: number;
  type: string;
  text: string;
  choices: NodeChoice[];
}

export interface GameEnding {
  type: 'ascension' | 'death' | 'lifespan';
  narrative: string;
  summary: string;
}

export interface StartGameResponse {
  sessionId: number;
  worldIntro: string;
  character: GameCharacter;
  openingStory: string;
  characterStats: CharacterStats;
  attributeChanges?: AttributeChanges;
  hasNode?: boolean;
  node?: GameNode;
}

export interface NarrativeResponse {
  narrative: string;
  hasNode: boolean;
  node?: GameNode;
  isEnding: boolean;
  ending?: GameEnding;
  characterStats?: CharacterStats;
  attributeChanges?: AttributeChanges;
  stateUpdate?: { storyPhase?: string; realm?: string };
}

export interface HistoryItem {
  id: number;
  type: string;
  text: string;
  choices: NodeChoice[] | null;
  chosenIndex: number | null;
  createdAt: string;
}

export type GamePhase = 'idle' | 'intro' | 'playing' | 'ended';

export const INITIAL_STATS: CharacterStats = {
  hp: 70,
  mp: 60,
  atk: 40,
  def: 35,
  luck: 50,
  cultivation: 15,
  achievements: [],
};

export interface GameState {
  phase: GamePhase;
  character: GameCharacter | null;
  worldIntro: string;
  storyPhase: string;
  narrativeHistory: { id?: number; text: string; type: string }[];
  currentNode: GameNode | null;
  ending: GameEnding | null;
  isLoading: boolean;
  isTyping: boolean;
  characterStats: CharacterStats;
  lastAttributeChanges: AttributeChanges | null;
}
