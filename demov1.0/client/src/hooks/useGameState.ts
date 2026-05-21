import { useReducer, useCallback } from 'react';
import {
  GameState,
  GamePhase,
  GameCharacter,
  GameNode,
  GameEnding,
  CharacterStats,
  AttributeChanges,
  INITIAL_STATS,
} from '../types/game.types';
import * as api from '../services/api';

type GameAction =
  | {
      type: 'GAME_STARTED';
      character: GameCharacter;
      worldIntro: string;
      openingStory: string;
      characterStats: CharacterStats;
      attributeChanges?: AttributeChanges;
      node?: GameNode;
    }
  | { type: 'NARRATIVE_RECEIVED'; text: string; nodeType?: string }
  | { type: 'NODE_TRIGGERED'; node: GameNode | null }
  | { type: 'LOADING_START' }
  | { type: 'ENDING_REACHED'; ending: GameEnding }
  | { type: 'TYPING_COMPLETE' }
  | { type: 'RESET' }
  | { type: 'SET_PHASE'; storyPhase: string; realm?: string }
  | { type: 'STATS_UPDATED'; stats: CharacterStats; changes: AttributeChanges | null };

const initialState: GameState = {
  phase: 'idle',
  character: null,
  worldIntro: '',
  storyPhase: 'intro',
  narrativeHistory: [],
  currentNode: null,
  ending: null,
  isLoading: false,
  isTyping: false,
  characterStats: { ...INITIAL_STATS },
  lastAttributeChanges: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GAME_STARTED':
      return {
        ...state,
        phase: 'playing',
        character: action.character,
        worldIntro: action.worldIntro,
        narrativeHistory: [{ text: action.openingStory, type: 'narrative' }],
        characterStats: action.characterStats,
        lastAttributeChanges: action.attributeChanges || null,
        currentNode: action.node || null,
        isLoading: false,
        isTyping: true,
      };

    case 'NARRATIVE_RECEIVED':
      return {
        ...state,
        narrativeHistory: [
          ...state.narrativeHistory,
          { text: action.text, type: action.nodeType || 'narrative' },
        ],
        isLoading: false,
        isTyping: true,
      };

    case 'NODE_TRIGGERED':
      return { ...state, currentNode: action.node };

    case 'LOADING_START':
      return { ...state, isLoading: true };

    case 'ENDING_REACHED':
      return {
        ...state,
        phase: 'ended',
        ending: action.ending,
        currentNode: null,
        isLoading: false,
        isTyping: true,
      };

    case 'TYPING_COMPLETE':
      return { ...state, isTyping: false };

    case 'SET_PHASE': {
      const updated = { ...state, storyPhase: action.storyPhase };
      if (action.realm && state.character) {
        updated.character = { ...state.character, realm: action.realm };
      }
      return updated;
    }

    case 'STATS_UPDATED':
      return {
        ...state,
        characterStats: action.stats,
        lastAttributeChanges: action.changes,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const buildHistory = useCallback(() => {
    return state.narrativeHistory.slice(-10).map((item) => ({
      role: 'assistant' as const,
      content: item.text,
    }));
  }, [state.narrativeHistory]);

  const startGame = useCallback(async () => {
    dispatch({ type: 'LOADING_START' });
    try {
      const response = await api.startGame();
      dispatch({
        type: 'GAME_STARTED',
        character: response.character,
        worldIntro: response.worldIntro,
        openingStory: response.openingStory,
        characterStats: response.characterStats,
        attributeChanges: response.attributeChanges,
        node: response.node,
      });
    } catch (error) {
      console.error('Failed to start game:', error);
      dispatch({ type: 'RESET' });
    }
  }, []);

  const continueStory = useCallback(async () => {
    dispatch({ type: 'LOADING_START' });
    try {
      const history = buildHistory();
      const response = await api.getNext(history);

      dispatch({ type: 'NARRATIVE_RECEIVED', text: response.narrative });

      if (response.characterStats) {
        dispatch({
          type: 'STATS_UPDATED',
          stats: response.characterStats,
          changes: response.attributeChanges || null,
        });
      }

      if (response.isEnding && response.ending) {
        dispatch({ type: 'ENDING_REACHED', ending: response.ending });
      } else if (response.hasNode && response.node) {
        dispatch({ type: 'NODE_TRIGGERED', node: response.node });
      } else {
        dispatch({ type: 'NODE_TRIGGERED', node: null });
      }

      if (response.stateUpdate?.storyPhase) {
        dispatch({
          type: 'SET_PHASE',
          storyPhase: response.stateUpdate.storyPhase,
          realm: response.stateUpdate.realm,
        });
      }
    } catch (error) {
      console.error('Failed to continue story:', error);
      dispatch({ type: 'TYPING_COMPLETE' });
    }
  }, [buildHistory]);

  const makeChoice = useCallback(
    async (nodeId: number, choiceIndex: number) => {
      dispatch({ type: 'LOADING_START' });
      try {
        const history = buildHistory();
        const response = await api.makeChoice(nodeId, choiceIndex, history);

        dispatch({ type: 'NODE_TRIGGERED', node: null });
        dispatch({ type: 'NARRATIVE_RECEIVED', text: response.narrative });

        if (response.characterStats) {
          dispatch({
            type: 'STATS_UPDATED',
            stats: response.characterStats,
            changes: response.attributeChanges || null,
          });
        }

        if (response.isEnding && response.ending) {
          dispatch({ type: 'ENDING_REACHED', ending: response.ending });
        } else if (response.hasNode && response.node) {
          dispatch({ type: 'NODE_TRIGGERED', node: response.node });
        }

        if (response.stateUpdate?.storyPhase) {
          dispatch({
            type: 'SET_PHASE',
            storyPhase: response.stateUpdate.storyPhase,
            realm: response.stateUpdate.realm,
          });
        }
      } catch (error) {
        console.error('Failed to make choice:', error);
        dispatch({ type: 'TYPING_COMPLETE' });
      }
    },
    [buildHistory],
  );

  const onTypingComplete = useCallback(() => {
    dispatch({ type: 'TYPING_COMPLETE' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    startGame,
    continueStory,
    makeChoice,
    onTypingComplete,
    resetGame,
  };
}
