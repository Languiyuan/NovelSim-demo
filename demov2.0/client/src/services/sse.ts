import { SSEMessage } from '../types/game.types';

export class SSEClient {
  private eventSource: EventSource | null = null;
  private onMessage: (msg: SSEMessage) => void;
  private onError: (err: any) => void;
  private saveId: number = 0;

  constructor(
    onMessage: (msg: SSEMessage) => void,
    onError: (err: any) => void,
  ) {
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect(saveId: number): void {
    this.disconnect();
    this.saveId = saveId;

    this.eventSource = new EventSource(`/api/stream/connect/${saveId}`);

    this.eventSource.onmessage = (event) => {
      try {
        const msg: SSEMessage = JSON.parse(event.data);
        this.onMessage(msg);
      } catch (e) {
        console.warn('SSE parse error:', e);
      }
    };

    this.eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      this.onError(err);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  get connected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}
