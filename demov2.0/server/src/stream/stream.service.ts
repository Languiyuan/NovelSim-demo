import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { SSEEvent } from '../shared/interfaces';

interface Connection {
  saveId: number;
  subject: Subject<MessageEvent>;
  lastHeartbeat: number;
}

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);
  private connections = new Map<number, Connection>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 启动心跳定时器
    this.heartbeatInterval = setInterval(() => this.sendHeartbeats(), 30000);
  }

  /**
   * 建立 SSE 连接
   */
  connect(saveId: number): Observable<MessageEvent> {
    // 如果已有连接，先踢掉
    if (this.connections.has(saveId)) {
      this.kick(saveId, '其他设备连接');
    }

    const subject = new Subject<MessageEvent>();
    this.connections.set(saveId, {
      saveId,
      subject,
      lastHeartbeat: Date.now(),
    });

    this.logger.log(`SSE connected: saveId=${saveId}`);
    return subject.asObservable();
  }

  /**
   * 断开连接
   */
  disconnect(saveId: number): void {
    const conn = this.connections.get(saveId);
    if (conn) {
      conn.subject.complete();
      this.connections.delete(saveId);
      this.logger.log(`SSE disconnected: saveId=${saveId}`);
    }
  }

  /**
   * 推送事件
   */
  pushEvent(saveId: number, event: SSEEvent): void {
    const conn = this.connections.get(saveId);
    if (!conn) return;

    const messageEvent = new MessageEvent(event.type, {
      data: JSON.stringify(event.data),
    }) as any;

    // NestJS SSE 使用 { data: string } 格式
    conn.subject.next({
      data: JSON.stringify({ type: event.type, data: event.data, timestamp: event.timestamp }),
    } as any);
  }

  /**
   * 推送修炼日志
   */
  pushLog(saveId: number, text: string): void {
    this.pushEvent(saveId, { type: 'log', data: { text }, timestamp: Date.now() });
  }

  /**
   * 推送节点
   */
  pushNode(saveId: number, node: any): void {
    this.pushEvent(saveId, { type: 'node', data: { node }, timestamp: Date.now() });
  }

  /**
   * 推送状态更新
   */
  pushStatus(saveId: number, character: any, changes?: any): void {
    this.pushEvent(saveId, { type: 'status', data: { character, changes }, timestamp: Date.now() });
  }

  /**
   * 推送突破
   */
  pushBreakthrough(saveId: number, oldRealm: string, newRealm: string): void {
    this.pushEvent(saveId, { type: 'breakthrough', data: { oldRealm, newRealm }, timestamp: Date.now() });
  }

  /**
   * 推送结局
   */
  pushEnding(saveId: number, ending: any): void {
    this.pushEvent(saveId, { type: 'ending', data: ending, timestamp: Date.now() });
  }

  /**
   * 踢掉连接
   */
  private kick(saveId: number, reason: string): void {
    const conn = this.connections.get(saveId);
    if (conn) {
      conn.subject.next({
        data: JSON.stringify({ type: 'kicked', data: { reason }, timestamp: Date.now() }),
      } as any);
      conn.subject.complete();
      this.connections.delete(saveId);
      this.logger.log(`SSE kicked: saveId=${saveId}, reason=${reason}`);
    }
  }

  /**
   * 发送心跳
   */
  private sendHeartbeats(): void {
    const now = Date.now();
    for (const [saveId, conn] of this.connections) {
      conn.subject.next({
        data: JSON.stringify({ type: 'heartbeat', data: { ts: now }, timestamp: now }),
      } as any);
      conn.lastHeartbeat = now;
    }
  }
}
