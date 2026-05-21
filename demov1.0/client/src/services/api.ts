import { StartGameResponse, NarrativeResponse } from '../types/game.types';

const BASE_URL = '/api/game';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function startGame(): Promise<StartGameResponse> {
  return request<StartGameResponse>('/start', { method: 'POST' });
}

export async function getNext(
  history: { role: string; content: string }[],
): Promise<NarrativeResponse> {
  return request<NarrativeResponse>('/next', {
    method: 'POST',
    body: JSON.stringify({ history }),
  });
}

export async function makeChoice(
  nodeId: number,
  choiceIndex: number,
  history: { role: string; content: string }[],
): Promise<NarrativeResponse> {
  return request<NarrativeResponse>('/choose', {
    method: 'POST',
    body: JSON.stringify({ nodeId, choiceIndex, history }),
  });
}

export async function getHistory() {
  return request<{ history: any[]; characterStats: any }>('/history');
}
