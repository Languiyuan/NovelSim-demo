import { create } from 'zustand';
import {
  GamePhase, CharacterData, CharacterRoll, GameNode,
  GameEnding, NarrativeEntry, WorldInfo, NpcInfo,
} from '../types/game.types';
import * as api from '../services/api';

interface GameStore {
  // 状态
  phase: GamePhase;
  saveId: number | null;
  character: CharacterData | null;
  currentRoll: CharacterRoll | null;
  world: WorldInfo | null;
  npcs: NpcInfo[];
  narrativeHistory: NarrativeEntry[];
  currentNode: GameNode | null;
  ending: GameEnding | null;
  isLoading: boolean;
  isTyping: boolean;
  canBreakthrough: boolean;
  error: string | null;

  // 动作
  rollCharacter: () => Promise<void>;
  confirmCharacter: () => Promise<void>;
  getNextNode: () => Promise<void>;
  makeChoice: (nodeId: number, choiceIndex: number) => Promise<void>;
  tryBreakthrough: () => Promise<void>;
  setTypingComplete: () => void;
  resetGame: () => void;
  addNarrative: (entry: NarrativeEntry) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'idle',
  saveId: null,
  character: null,
  currentRoll: null,
  world: null,
  npcs: [],
  narrativeHistory: [],
  currentNode: null,
  ending: null,
  isLoading: false,
  isTyping: false,
  canBreakthrough: false,
  error: null,

  rollCharacter: async () => {
    set({ isLoading: true, error: null });
    try {
      const roll = await api.rollCharacter();
      set({ currentRoll: roll, phase: 'creating', isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  confirmCharacter: async () => {
    const { currentRoll } = get();
    if (!currentRoll) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.confirmCharacter(currentRoll);
      const narrativeHistory: NarrativeEntry[] = [];

      // 添加世界介绍
      if (data.world) {
        narrativeHistory.push({
          text: `你来到了${data.world.name}。${data.world.geography?.substring(0, 100) || ''}`,
          type: 'log',
        });
      }

      // 添加故事背景
      if (data.story?.background) {
        narrativeHistory.push({ text: data.story.background, type: 'log' });
      }

      set({
        phase: 'playing',
        saveId: data.saveId,
        character: data.character,
        world: data.world,
        npcs: data.npcs || [],
        narrativeHistory,
        currentNode: data.firstNode || null,
        isLoading: false,
        isTyping: true,
      });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  getNextNode: async () => {
    const { saveId } = get();
    if (!saveId) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.getNextNode(saveId);

      const newEntries: NarrativeEntry[] = [];

      // 修炼日志
      if (data.log) {
        newEntries.push({ text: data.log.text, type: 'log' });
      }

      set((state) => ({
        narrativeHistory: [...state.narrativeHistory, ...newEntries],
        currentNode: data.node || null,
        character: data.character ? { ...state.character!, ...data.character } : state.character,
        canBreakthrough: data.canBreakthrough || false,
        isLoading: false,
        isTyping: true,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  makeChoice: async (nodeId: number, choiceIndex: number) => {
    const { saveId, currentNode } = get();
    if (!saveId || !currentNode) return;

    const choiceText = currentNode.choices?.[choiceIndex]?.text || '';

    set({ isLoading: true, error: null, currentNode: null });
    try {
      const data = await api.makeChoice(saveId, nodeId, choiceIndex);

      const newEntries: NarrativeEntry[] = [];

      // 玩家选择记录
      newEntries.push({ text: `> 选择：${choiceText}`, type: 'choice' });

      // 后续叙事
      if (data.narrative) {
        newEntries.push({ text: data.narrative, type: 'node' });
      }

      // 战斗结果
      if (data.battleResult) {
        newEntries.push({ text: data.battleResult.narrative, type: 'battle' });
      }

      // 结局
      if (data.isEnding && data.ending) {
        newEntries.push({ text: data.ending.narrative, type: 'ending' });
        set((state) => ({
          phase: 'ended',
          ending: data.ending,
          narrativeHistory: [...state.narrativeHistory, ...newEntries],
          character: data.character ? { ...state.character!, ...data.character } : state.character,
          isLoading: false,
          isTyping: true,
        }));
        return;
      }

      set((state) => ({
        narrativeHistory: [...state.narrativeHistory, ...newEntries],
        character: data.character ? { ...state.character!, ...data.character } : state.character,
        canBreakthrough: data.canBreakthrough || false,
        isLoading: false,
        isTyping: true,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  tryBreakthrough: async () => {
    const { saveId } = get();
    if (!saveId) return;

    set({ isLoading: true, error: null });
    try {
      const data = await api.tryBreakthrough(saveId);

      const newEntries: NarrativeEntry[] = [];
      newEntries.push({ text: data.narrative, type: 'breakthrough' });

      set((state) => ({
        narrativeHistory: [...state.narrativeHistory, ...newEntries],
        character: data.character ? { ...state.character!, ...data.character } : state.character,
        canBreakthrough: false,
        isLoading: false,
        isTyping: true,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  setTypingComplete: () => set({ isTyping: false }),

  resetGame: () => set({
    phase: 'idle',
    saveId: null,
    character: null,
    currentRoll: null,
    world: null,
    npcs: [],
    narrativeHistory: [],
    currentNode: null,
    ending: null,
    isLoading: false,
    isTyping: false,
    canBreakthrough: false,
    error: null,
  }),

  addNarrative: (entry: NarrativeEntry) =>
    set((state) => ({
      narrativeHistory: [...state.narrativeHistory, entry],
    })),
}));
