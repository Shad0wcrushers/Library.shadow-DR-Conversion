/**
 * Root WebSocket client for real-time events
 * Handles connection, reconnection, and event dispatching
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { RootConfig, RootEventType, RootWSPayload } from './types';
import { Logger } from '../../utils/logger';

// WebSocket op codes
enum RootWSOpCode {
  DISPATCH = 0,           // Server -> Client: Event dispatch
  HEARTBEAT = 1,          // Client -> Server: Keep-alive
  IDENTIFY = 2,           // Client -> Server: Initial authentication
  HEARTBEAT_ACK = 11,     // Server -> Client: Heartbeat acknowledged
  HELLO = 10,             // Server -> Client: Connection established
}

export class RootWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: RootConfig;
  private logger: Logger;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sequence: number | null = null;
  private reconnectAttempts = 0;
  private isReconnecting = false;

  constructor(config: RootConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
  }

  /**
   * Connect to Root WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.wsUrl || 'wss://gateway.rootapp.com';
      
      this.logger.info(`Connecting to Root WebSocket: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.logger.info('WebSocket connection established');
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const dataStr = Buffer.isBuffer(data) ? data.toString() : String(data);
          const payload = JSON.parse(dataStr) as RootWSPayload;
          this.handleMessage(payload, resolve, reject);
        } catch (error) {
          this.logger.error('Failed to parse WebSocket message:', error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        this.logger.warn(`WebSocket closed: ${code} - ${reason.toString()}`);
        this.cleanup();
        
        if (this.config.autoReconnect && !this.isReconnecting) {
          void this.attemptReconnect();
        }
      });

      this.ws.on('error', (error: Error) => {
        this.logger.error('WebSocket error:', error);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isReconnecting = false;
    this.cleanup();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(
    payload: RootWSPayload,
    resolve?: (value: void) => void,
    _reject?: (reason?: unknown) => void
  ): void {
    // Update sequence
    if (payload.s !== undefined) {
      this.sequence = payload.s;
    }

    // Handle based on payload type
    if (typeof payload.t === 'string') {
      // Check for specific event types
      if (payload.t === RootEventType.READY) {
        this.logger.info('Root bot ready');
        
        // Start heartbeat
        const payloadData = payload.d as { heartbeat_interval?: number } | undefined;
        if (payloadData?.heartbeat_interval) {
          this.startHeartbeat(payloadData.heartbeat_interval);
        }
        
        if (resolve) {
          resolve();
        }
      }
      
      // Emit event to provider
      this.emit('event', payload.t, payload.d);
      return;
    }

    // Handle op codes - cast to enum for type safety
    const opCode = payload.op as RootWSOpCode;
    switch (opCode) {
      case RootWSOpCode.HELLO:
        // Server sent hello, start authentication
        this.sendIdentify();
        break;

      case RootWSOpCode.HEARTBEAT_ACK:
        // Heartbeat acknowledged
        this.logger.debug('Heartbeat acknowledged');
        break;

      case RootWSOpCode.DISPATCH:
        // Already handled above with payload.t
        break;

      default:
        this.logger.debug(`Unknown op code: ${payload.op}`);
    }
  }

  /**
   * Send identify payload
   */
  private sendIdentify(): void {
    const payload: RootWSPayload = {
      op: RootWSOpCode.IDENTIFY,
      d: {
        token: this.config.token,
        properties: {
          os: process.platform,
          browser: 'Library@DR-Conversion',
          device: 'Library@DR-Conversion',
        },
      },
    };

    this.send(payload);
  }

  /**
   * Start heartbeat interval
   */
  private startHeartbeat(interval: number): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
  }

  /**
   * Send heartbeat
   */
  private sendHeartbeat(): void {
    const payload: RootWSPayload = {
      op: RootWSOpCode.HEARTBEAT,
      d: this.sequence,
    };

    this.send(payload);
    this.logger.debug('Sent heartbeat');
  }

  /**
   * Send payload to WebSocket
   */
  private send(payload: RootWSPayload): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      this.logger.warn('Cannot send payload: WebSocket not open');
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.isReconnecting) {
      return;
    }

    const maxAttempts = this.config.maxReconnectAttempts || 5;
    if (this.reconnectAttempts >= maxAttempts) {
      this.logger.error('Max reconnect attempts reached');
      this.emit('maxReconnectReached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    const delay = this.config.reconnectDelay || 5000;
    this.logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`);

    setTimeout(() => {
      this.connect()
        .then(() => {
          this.isReconnecting = false;
          this.emit('reconnected');
        })
        .catch((error) => {
          this.logger.error('Reconnect failed:', error);
          this.isReconnecting = false;
          this.attemptReconnect();
        });
    }, delay);
  }
}
