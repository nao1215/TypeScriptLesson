/**
 * Lesson 46: リアルタイム通信 (Real-time Communication)
 * WebSockets、SSE、WebRTCを使ったリアルタイム通信の実装
 */

// ============================================================================
// 1. WebSocket クライアント実装
// ============================================================================

export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

export interface WebSocketMessage<T = any> {
  id: string;
  type: string;
  timestamp: number;
  data: T;
  userId?: string;
}

export interface WebSocketClientOptions {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageTimeout: number;
  autoReconnect: boolean;
}

export class WebSocketClient<T = any> {
  private ws: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private heartbeatTimer: number | null = null;
  private messageQueue: WebSocketMessage<T>[] = [];
  private pendingMessages = new Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timer: number;
  }>();
  
  private eventListeners = new Map<string, Array<(data: any) => void>>();
  private stateListeners = new Array<(state: WebSocketState) => void>();
  
  constructor(private options: WebSocketClientOptions) {
    this.connect();
  }
  
  /**
   * WebSocket接続を確立
   */
  private connect(): void {
    if (this.state === WebSocketState.CONNECTING || this.state === WebSocketState.CONNECTED) {
      return;
    }
    
    this.setState(WebSocketState.CONNECTING);
    
    try {
      this.ws = new WebSocket(this.options.url, this.options.protocols);
      this.setupEventHandlers();
    } catch (error) {
      this.handleConnectionError(error);
    }
  }
  
  /**
   * WebSocketイベントハンドラーの設定
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;
    
    this.ws.onopen = (event) => {
      console.log('WebSocket connected:', event);
      this.setState(WebSocketState.CONNECTED);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage<T> = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error, event.data);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      this.cleanup();
      
      if (event.code !== 1000 && this.options.autoReconnect) {
        this.handleReconnection();
      } else {
        this.setState(WebSocketState.DISCONNECTED);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleConnectionError(error);
    };
  }
  
  /**
   * メッセージ処理
   */
  private handleMessage(message: WebSocketMessage<T>): void {
    // ハートビート応答の処理
    if (message.type === 'pong') {
      return;
    }
    
    // 応答待ちメッセージの処理
    if (message.id && this.pendingMessages.has(message.id)) {
      const pending = this.pendingMessages.get(message.id)!;
      clearTimeout(pending.timer);
      this.pendingMessages.delete(message.id);
      
      if (message.type === 'error') {
        pending.reject(new Error(message.data));
      } else {
        pending.resolve(message.data);
      }
      return;
    }
    
    // 通常のメッセージ処理
    this.emit(message.type, message.data, message);
  }
  
  /**
   * ハートビートの開始
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = window.setInterval(() => {
      if (this.state === WebSocketState.CONNECTED) {
        this.send('ping', null, { expectResponse: false });
      }
    }, this.options.heartbeatInterval);
  }
  
  /**
   * 再接続処理
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setState(WebSocketState.ERROR);
      return;
    }
    
    this.setState(WebSocketState.RECONNECTING);
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  /**
   * 接続エラー処理
   */
  private handleConnectionError(error: any): void {
    console.error('WebSocket connection error:', error);
    this.setState(WebSocketState.ERROR);
    this.cleanup();
    
    if (this.options.autoReconnect) {
      this.handleReconnection();
    }
  }
  
  /**
   * クリーンアップ処理
   */
  private cleanup(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    // 保留中のメッセージを拒否
    for (const [id, pending] of this.pendingMessages) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingMessages.clear();
    
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
    }
  }
  
  /**
   * メッセージ送信
   */
  send<R = any>(
    type: string,
    data: T,
    options: { expectResponse?: boolean; timeout?: number } = {}
  ): Promise<R> {
    const message: WebSocketMessage<T> = {
      id: this.generateId(),
      type,
      timestamp: Date.now(),
      data
    };
    
    if (this.state !== WebSocketState.CONNECTED) {
      // 接続していない場合はキューに追加
      this.messageQueue.push(message);
      
      if (!options.expectResponse) {
        return Promise.resolve({} as R);
      }
      
      return new Promise((resolve, reject) => {
        // 接続が回復した時に処理される
        const checkConnection = () => {
          if (this.state === WebSocketState.CONNECTED) {
            resolve(this.sendMessage<R>(message, options));
          } else if (this.state === WebSocketState.ERROR) {
            reject(new Error('WebSocket connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }
    
    return this.sendMessage<R>(message, options);
  }
  
  /**
   * 実際のメッセージ送信
   */
  private sendMessage<R = any>(
    message: WebSocketMessage<T>,
    options: { expectResponse?: boolean; timeout?: number } = {}
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      try {
        this.ws.send(JSON.stringify(message));
        
        if (options.expectResponse !== false) {
          const timeout = options.timeout || this.options.messageTimeout;
          const timer = window.setTimeout(() => {
            this.pendingMessages.delete(message.id);
            reject(new Error('Message timeout'));
          }, timeout);
          
          this.pendingMessages.set(message.id, { resolve, reject, timer });
        } else {
          resolve({} as R);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * キューに蓄積されたメッセージを送信
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.sendMessage(message);
    }
  }
  
  /**
   * イベントリスナーの追加
   */
  on(event: string, listener: (data: any, message?: WebSocketMessage<T>) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * イベントリスナーの削除
   */
  off(event: string, listener: (data: any, message?: WebSocketMessage<T>) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * イベントの発火
   */
  private emit(event: string, data: any, message?: WebSocketMessage<T>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data, message);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }
  
  /**
   * 状態変更リスナーの追加
   */
  onStateChange(listener: (state: WebSocketState) => void): void {
    this.stateListeners.push(listener);
  }
  
  /**
   * 状態の設定
   */
  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach(listener => {
        try {
          listener(newState);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }
  }
  
  /**
   * 現在の状態を取得
   */
  getState(): WebSocketState {
    return this.state;
  }
  
  /**
   * 接続を閉じる
   */
  close(): void {
    this.options.autoReconnect = false;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client initiated close');
    }
    
    this.cleanup();
    this.setState(WebSocketState.DISCONNECTED);
  }
  
  /**
   * 一意IDの生成
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// 2. Server-Sent Events (SSE) クライアント実装
// ============================================================================

export interface SSEClientOptions {
  url: string;
  withCredentials?: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  headers?: Record<string, string>;
}

export interface SSEEvent {
  id?: string;
  event: string;
  data: string;
  retry?: number;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private state: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private eventListeners = new Map<string, Array<(data: any, event: SSEEvent) => void>>();
  private stateListeners = new Array<(state: string) => void>();
  
  constructor(private options: SSEClientOptions) {}
  
  /**
   * SSE接続を開始
   */
  connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') {
      return;
    }
    
    this.setState('connecting');
    
    try {
      // SSE接続の作成
      const eventSourceInitDict: EventSourceInit = {
        withCredentials: this.options.withCredentials || false
      };
      
      this.eventSource = new EventSource(this.options.url, eventSourceInitDict);
      this.setupEventHandlers();
    } catch (error) {
      console.error('SSE connection error:', error);
      this.handleConnectionError();
    }
  }
  
  /**
   * SSEイベントハンドラーの設定
   */
  private setupEventHandlers(): void {
    if (!this.eventSource) return;
    
    this.eventSource.onopen = (event) => {
      console.log('SSE connected:', event);
      this.setState('connected');
      this.reconnectAttempts = 0;
    };
    
    this.eventSource.onmessage = (event) => {
      const sseEvent: SSEEvent = {
        event: 'message',
        data: event.data,
        id: event.lastEventId
      };
      
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data, sseEvent);
      } catch (error) {
        // JSONでない場合はそのまま文字列として処理
        this.emit('message', event.data, sseEvent);
      }
    };
    
    this.eventSource.onerror = (event) => {
      console.error('SSE error:', event);
      
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.handleConnectionError();
      }
    };
  }
  
  /**
   * カスタムイベントリスナーの追加
   */
  addEventListener(eventType: string, listener: (data: any, event: SSEEvent) => void): void {
    if (this.eventSource) {
      this.eventSource.addEventListener(eventType, (event) => {
        const messageEvent = event as MessageEvent;
        const sseEvent: SSEEvent = {
          event: eventType,
          data: messageEvent.data,
          id: messageEvent.lastEventId
        };
        
        try {
          const data = JSON.parse(messageEvent.data);
          listener(data, sseEvent);
        } catch (error) {
          listener(messageEvent.data, sseEvent);
        }
      });
    }
    
    // 内部リスナーとしても登録
    this.on(eventType, listener);
  }
  
  /**
   * 接続エラー処理
   */
  private handleConnectionError(): void {
    this.setState('error');
    this.cleanup();
    
    if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.options.reconnectInterval * this.reconnectAttempts, 30000);
      
      console.log(`SSE reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('SSE max reconnection attempts reached');
    }
  }
  
  /**
   * クリーンアップ処理
   */
  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
  
  /**
   * イベントリスナーの追加
   */
  on(event: string, listener: (data: any, event?: SSEEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * イベントリスナーの削除
   */
  off(event: string, listener: (data: any, event?: SSEEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * イベントの発火
   */
  private emit(event: string, data: any, sseEvent?: SSEEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data, sseEvent);
        } catch (error) {
          console.error('SSE listener error:', error);
        }
      });
    }
  }
  
  /**
   * 状態変更の通知
   */
  private setState(newState: string): void {
    if (this.state !== newState) {
      this.state = newState as any;
      this.stateListeners.forEach(listener => {
        try {
          listener(newState);
        } catch (error) {
          console.error('SSE state listener error:', error);
        }
      });
    }
  }
  
  /**
   * 状態変更リスナーの追加
   */
  onStateChange(listener: (state: string) => void): void {
    this.stateListeners.push(listener);
  }
  
  /**
   * 現在の状態を取得
   */
  getState(): string {
    return this.state;
  }
  
  /**
   * 接続を閉じる
   */
  close(): void {
    this.cleanup();
    this.setState('disconnected');
  }
}

// ============================================================================
// 3. WebRTC データチャネル実装
// ============================================================================

export interface WebRTCClientOptions {
  iceServers: RTCIceServer[];
  dataChannelOptions?: RTCDataChannelInit;
}

export class WebRTCClient {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private isInitiator = false;
  private eventListeners = new Map<string, Array<(data: any) => void>>();
  
  constructor(private options: WebRTCClientOptions) {
    this.initializePeerConnection();
  }
  
  /**
   * WebRTCピア接続の初期化
   */
  private initializePeerConnection(): void {
    const config: RTCConfiguration = {
      iceServers: this.options.iceServers
    };
    
    this.peerConnection = new RTCPeerConnection(config);
    
    // ICE候補の処理
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('icecandidate', event.candidate);
      }
    };
    
    // データチャネルの受信処理
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannel(channel);
    };
    
    // 接続状態の監視
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('WebRTC connection state:', state);
      this.emit('connectionstatechange', state);
    };
  }
  
  /**
   * データチャネルの作成（イニシエーター）
   */
  createDataChannel(label: string = 'data'): void {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    this.isInitiator = true;
    this.dataChannel = this.peerConnection.createDataChannel(label, this.options.dataChannelOptions);
    this.setupDataChannel(this.dataChannel);
  }
  
  /**
   * データチャネルのセットアップ
   */
  private setupDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel;
    
    channel.onopen = () => {
      console.log('Data channel opened:', channel.label);
      this.emit('datachannel-open', channel.label);
    };
    
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
      } catch (error) {
        this.emit('message', event.data);
      }
    };
    
    channel.onclose = () => {
      console.log('Data channel closed:', channel.label);
      this.emit('datachannel-close', channel.label);
    };
    
    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.emit('datachannel-error', error);
    };
  }
  
  /**
   * オファーの作成
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }
  
  /**
   * アンサーの作成
   */
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }
  
  /**
   * リモート記述の設定
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    await this.peerConnection.setRemoteDescription(description);
  }
  
  /**
   * ICE候補の追加
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    await this.peerConnection.addIceCandidate(candidate);
  }
  
  /**
   * データの送信
   */
  sendData(data: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }
    
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this.dataChannel.send(message);
  }
  
  /**
   * イベントリスナーの追加
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * イベントの発火
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('WebRTC listener error:', error);
        }
      });
    }
  }
  
  /**
   * 接続の閉じる
   */
  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}

// ============================================================================
// 4. リアルタイムチャットクライアント実装
// ============================================================================

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'system';
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  createdAt: number;
}

export class RealtimeChatClient {
  private wsClient: WebSocketClient<ChatMessage>;
  private currentRoom: string | null = null;
  private messageHistory: ChatMessage[] = [];
  private typingUsers = new Set<string>();
  private typingTimer: number | null = null;
  
  constructor(wsUrl: string, private userId: string, private username: string) {
    this.wsClient = new WebSocketClient<ChatMessage>({
      url: wsUrl,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageTimeout: 10000,
      autoReconnect: true
    });
    
    this.setupEventHandlers();
  }
  
  /**
   * イベントハンドラーの設定
   */
  private setupEventHandlers(): void {
    // チャットメッセージの受信
    this.wsClient.on('chat-message', (message: ChatMessage) => {
      this.messageHistory.push(message);
      this.emit('message', message);
    });
    
    // タイピング通知の処理
    this.wsClient.on('user-typing', (data: { userId: string; username: string; roomId: string }) => {
      if (data.roomId === this.currentRoom && data.userId !== this.userId) {
        this.typingUsers.add(data.username);
        this.emit('typing-start', data);
        
        // 3秒後にタイピング状態をクリア
        setTimeout(() => {
          this.typingUsers.delete(data.username);
          this.emit('typing-stop', data);
        }, 3000);
      }
    });
    
    // ユーザー参加/退出の処理
    this.wsClient.on('user-joined', (data: { userId: string; username: string; roomId: string }) => {
      this.emit('user-joined', data);
    });
    
    this.wsClient.on('user-left', (data: { userId: string; username: string; roomId: string }) => {
      this.emit('user-left', data);
    });
    
    // 接続状態の監視
    this.wsClient.onStateChange((state) => {
      this.emit('connection-state', state);
    });
  }
  
  /**
   * チャットルームに参加
   */
  async joinRoom(roomId: string): Promise<ChatRoom> {
    const room = await this.wsClient.send<ChatRoom>('join-room', {
      roomId,
      userId: this.userId,
      username: this.username
    });
    
    this.currentRoom = roomId;
    this.messageHistory = []; // 履歴をクリア
    
    return room;
  }
  
  /**
   * チャットルームから退出
   */
  async leaveRoom(): Promise<void> {
    if (!this.currentRoom) return;
    
    await this.wsClient.send('leave-room', {
      roomId: this.currentRoom,
      userId: this.userId
    });
    
    this.currentRoom = null;
    this.messageHistory = [];
  }
  
  /**
   * メッセージの送信
   */
  async sendMessage(content: string, type: ChatMessage['type'] = 'text'): Promise<void> {
    if (!this.currentRoom) {
      throw new Error('Not joined to any room');
    }
    
    const message: Partial<ChatMessage> = {
      userId: this.userId,
      username: this.username,
      content,
      type,
      timestamp: Date.now()
    };
    
    await this.wsClient.send('send-message', {
      roomId: this.currentRoom,
      message
    });
  }
  
  /**
   * タイピング通知の送信
   */
  notifyTyping(): void {
    if (!this.currentRoom) return;
    
    this.wsClient.send('notify-typing', {
      roomId: this.currentRoom,
      userId: this.userId,
      username: this.username
    }, { expectResponse: false });
    
    // 連続したタイピング通知を制御
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    this.typingTimer = window.setTimeout(() => {
      this.wsClient.send('stop-typing', {
        roomId: this.currentRoom,
        userId: this.userId
      }, { expectResponse: false });
    }, 3000);
  }
  
  /**
   * メッセージ履歴の取得
   */
  getMessageHistory(): ChatMessage[] {
    return [...this.messageHistory];
  }
  
  /**
   * タイピング中のユーザー一覧
   */
  getTypingUsers(): string[] {
    return Array.from(this.typingUsers);
  }
  
  /**
   * 現在のルームID
   */
  getCurrentRoom(): string | null {
    return this.currentRoom;
  }
  
  /**
   * イベントリスナー（簡略化）
   */
  private eventListeners = new Map<string, Array<(data: any) => void>>();
  
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Chat client listener error:', error);
        }
      });
    }
  }
  
  /**
   * 接続を閉じる
   */
  disconnect(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    this.wsClient.close();
  }
}

// ============================================================================
// 5. リアルタイム同期システム（简化版）
// ============================================================================

export interface SyncOperation {
  id: string;
  type: 'insert' | 'delete' | 'update';
  position: number;
  content: string;
  timestamp: number;
  userId: string;
}

export class RealtimeSyncClient {
  private wsClient: WebSocketClient<SyncOperation>;
  private document: string = '';
  private operations: SyncOperation[] = [];
  private pendingOperations: SyncOperation[] = [];
  
  constructor(wsUrl: string, private documentId: string, private userId: string) {
    this.wsClient = new WebSocketClient<SyncOperation>({
      url: wsUrl,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageTimeout: 5000,
      autoReconnect: true
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    // 操作の受信と適用
    this.wsClient.on('operation', (operation: SyncOperation) => {
      this.applyOperation(operation);
      this.emit('document-changed', this.document);
    });
    
    // ドキュメント状態の同期
    this.wsClient.on('document-sync', (data: { document: string; operations: SyncOperation[] }) => {
      this.document = data.document;
      this.operations = data.operations;
      this.emit('document-synced', this.document);
    });
  }
  
  /**
   * ドキュメントに接続
   */
  async connect(): Promise<string> {
    const result = await this.wsClient.send<{ document: string; operations: SyncOperation[] }>('connect-document', {
      documentId: this.documentId,
      userId: this.userId
    });
    
    this.document = result.document;
    this.operations = result.operations;
    
    return this.document;
  }
  
  /**
   * テキスト挿入操作
   */
  async insertText(position: number, text: string): Promise<void> {
    const operation: SyncOperation = {
      id: this.generateOperationId(),
      type: 'insert',
      position,
      content: text,
      timestamp: Date.now(),
      userId: this.userId
    };
    
    // 楽観的更新
    this.applyOperationLocally(operation);
    this.pendingOperations.push(operation);
    
    try {
      await this.wsClient.send('apply-operation', {
        documentId: this.documentId,
        operation
      });
      
      // 成功時は保留中操作から削除
      const index = this.pendingOperations.findIndex(op => op.id === operation.id);
      if (index > -1) {
        this.pendingOperations.splice(index, 1);
      }
    } catch (error) {
      // 失敗時は操作を取り消し
      this.rollbackOperation(operation);
      throw error;
    }
  }
  
  /**
   * テキスト削除操作
   */
  async deleteText(position: number, length: number): Promise<void> {
    const operation: SyncOperation = {
      id: this.generateOperationId(),
      type: 'delete',
      position,
      content: this.document.substring(position, position + length),
      timestamp: Date.now(),
      userId: this.userId
    };
    
    this.applyOperationLocally(operation);
    this.pendingOperations.push(operation);
    
    try {
      await this.wsClient.send('apply-operation', {
        documentId: this.documentId,
        operation
      });
      
      const index = this.pendingOperations.findIndex(op => op.id === operation.id);
      if (index > -1) {
        this.pendingOperations.splice(index, 1);
      }
    } catch (error) {
      this.rollbackOperation(operation);
      throw error;
    }
  }
  
  /**
   * 操作の適用（リモート）
   */
  private applyOperation(operation: SyncOperation): void {
    if (operation.userId === this.userId) {
      // 自分の操作は既に適用済み
      return;
    }
    
    // 操作変換（簡略化）
    const transformedOperation = this.transformOperation(operation);
    this.applyOperationLocally(transformedOperation);
    this.operations.push(operation);
  }
  
  /**
   * 操作のローカル適用
   */
  private applyOperationLocally(operation: SyncOperation): void {
    switch (operation.type) {
      case 'insert':
        this.document = 
          this.document.substring(0, operation.position) +
          operation.content +
          this.document.substring(operation.position);
        break;
      case 'delete':
        this.document = 
          this.document.substring(0, operation.position) +
          this.document.substring(operation.position + operation.content.length);
        break;
    }
  }
  
  /**
   * 操作の変換（Operational Transform簡略版）
   */
  private transformOperation(operation: SyncOperation): SyncOperation {
    let transformedOperation = { ...operation };
    
    // 保留中の操作との競合解決
    for (const pendingOp of this.pendingOperations) {
      if (pendingOp.timestamp < operation.timestamp) {
        // より古い操作に基づいて位置を調整
        if (pendingOp.type === 'insert' && pendingOp.position <= transformedOperation.position) {
          transformedOperation.position += pendingOp.content.length;
        } else if (pendingOp.type === 'delete' && pendingOp.position < transformedOperation.position) {
          transformedOperation.position -= pendingOp.content.length;
        }
      }
    }
    
    return transformedOperation;
  }
  
  /**
   * 操作のロールバック
   */
  private rollbackOperation(operation: SyncOperation): void {
    switch (operation.type) {
      case 'insert':
        this.document = 
          this.document.substring(0, operation.position) +
          this.document.substring(operation.position + operation.content.length);
        break;
      case 'delete':
        this.document = 
          this.document.substring(0, operation.position) +
          operation.content +
          this.document.substring(operation.position);
        break;
    }
  }
  
  /**
   * 現在のドキュメント内容を取得
   */
  getDocument(): string {
    return this.document;
  }
  
  /**
   * 操作IDの生成
   */
  private generateOperationId(): string {
    return `${this.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // 簡略化されたイベントシステム
  private eventListeners = new Map<string, Array<(data: any) => void>>();
  
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Sync client listener error:', error);
        }
      });
    }
  }
  
  /**
   * 接続を閉じる
   */
  disconnect(): void {
    this.wsClient.close();
  }
}

// ============================================================================
// 6. 使用例とデモンストレーション
// ============================================================================

export async function demonstrateRealtimeCommunication(): Promise<void> {
  console.log('=== Lesson 46: Real-time Communication Demonstration ===');
  
  try {
    // 1. WebSocketクライアントのデモ
    console.log('\n1. WebSocket Client Demo:');
    const wsClient = new WebSocketClient<any>({
      url: 'wss://echo.websocket.org/',
      reconnectInterval: 1000,
      maxReconnectAttempts: 3,
      heartbeatInterval: 30000,
      messageTimeout: 5000,
      autoReconnect: true
    });
    
    wsClient.onStateChange((state) => {
      console.log(`WebSocket state: ${state}`);
    });
    
    wsClient.on('echo', (data) => {
      console.log('Received echo:', data);
    });
    
    // 接続待機
    await new Promise(resolve => {
      wsClient.onStateChange((state) => {
        if (state === WebSocketState.CONNECTED) {
          resolve(void 0);
        }
      });
    });
    
    // メッセージ送信テスト
    await wsClient.send('echo', { message: 'Hello WebSocket!' });
    
    setTimeout(() => {
      wsClient.close();
    }, 2000);
    
    // 2. SSE クライアントのデモ
    console.log('\n2. SSE Client Demo:');
    // 実際のSSEエンドポイントがないため、モック
    console.log('SSE demo (would connect to real endpoint in production)');
    
    // 3. WebRTC クライアントのデモ
    console.log('\n3. WebRTC Client Demo:');
    const webrtcClient = new WebRTCClient({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    
    webrtcClient.on('connectionstatechange', (state) => {
      console.log(`WebRTC connection state: ${state}`);
    });
    
    console.log('WebRTC client initialized (requires peer for full demo)');
    
    // 4. チャットクライアントのデモ（モック）
    console.log('\n4. Chat Client Demo (mock):');
    console.log('Chat client would connect to WebSocket server for real-time messaging');
    
    // 5. 同期クライアントのデモ（モック）
    console.log('\n5. Sync Client Demo (mock):');
    console.log('Sync client would enable real-time collaborative editing');
    
    console.log('\nReal-time communication demonstration completed!');
    
  } catch (error) {
    console.error('Demo error:', error);
  }
}

// エクスポート
export {
  WebSocketClient,
  SSEClient,
  WebRTCClient,
  RealtimeChatClient,
  RealtimeSyncClient
};