const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== undefined && json.code !== 0) {
    throw new Error(json.msg || 'Unknown error');
  }
  return json.data !== undefined ? json.data : json;
}

export async function rollCharacter() {
  return request<any>('/game/roll-character', { method: 'POST' });
}

export async function confirmCharacter(roll: any) {
  return request<any>('/game/confirm-character', {
    method: 'POST',
    body: JSON.stringify({ roll }),
  });
}

export async function getGameState(saveId: number) {
  return request<any>(`/game/state/${saveId}`);
}

export async function getNextNode(saveId: number) {
  return request<any>(`/game/next/${saveId}`, { method: 'POST' });
}

export async function makeChoice(saveId: number, nodeId: number, choiceIndex: number) {
  return request<any>('/game/choose', {
    method: 'POST',
    body: JSON.stringify({ saveId, nodeId, choiceIndex }),
  });
}

export async function tryBreakthrough(saveId: number) {
  return request<any>(`/game/breakthrough/${saveId}`, { method: 'POST' });
}

export async function getSaves(userId: number = 1) {
  return request<any>(`/game/saves?userId=${userId}`);
}

export async function getHistory(saveId: number) {
  return request<any>(`/game/history/${saveId}`);
}
