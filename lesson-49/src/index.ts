/**
 * Lesson 49: ステート管理パターン (State Management Patterns)
 * Observerパターン、Pub/Sub、ステートマシン、Redux風パターンの実装
 */

// ============================================================================
// 1. Observerパターン実装
// ============================================================================

export interface Observer<T> {
  update(data: T): void;
}

export interface Subject<T> {
  subscribe(observer: Observer<T>): () => void;
  unsubscribe(observer: Observer<T>): void;
  notify(data: T): void;
}

export class ObservableStore<T> implements Subject<T> {
  private observers: Set<Observer<T>> = new Set();
  private _state: T;

  constructor(initialState: T) {
    this._state = initialState;
  }

  get state(): T {
    return this._state;
  }

  setState(newState: T | ((prevState: T) => T)): void {
    const previousState = this._state;
    
    if (typeof newState === 'function') {
      this._state = (newState as (prevState: T) => T)(this._state);
    } else {
      this._state = newState;
    }

    // 状態が実際に変更された場合のみ通知
    if (this._state !== previousState) {
      this.notify(this._state);
    }
  }

  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer);
    
    // 購読解除関数を返す
    return () => {
      this.observers.delete(observer);
    };
  }

  unsubscribe(observer: Observer<T>): void {
    this.observers.delete(observer);
  }

  notify(data: T): void {
    this.observers.forEach(observer => {
      try {
        observer.update(data);
      } catch (error) {
        console.error('Observer notification error:', error);
      }
    });
  }

  // 購読者数の取得（デバッグ用）
  getObserverCount(): number {
    return this.observers.size;
  }

  // すべての購読を解除
  clear(): void {
    this.observers.clear();
  }
}

// ============================================================================
// 2. 型安全なイベントシステム（Pub/Sub）
// ============================================================================

export type EventMap = Record<string, any>;

export interface EventListener<T> {
  (event: T): void;
}

export class EventEmitter<TEventMap extends EventMap = EventMap> {
  private listeners: Map<keyof TEventMap, Set<EventListener<any>>> = new Map();
  private onceListeners: Map<keyof TEventMap, Set<EventListener<any>>> = new Map();
  private maxListeners: number = 100;

  // イベントリスナーの追加
  on<K extends keyof TEventMap>(
    event: K,
    listener: EventListener<TEventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    
    // 最大リスナー数のチェック
    if (eventListeners.size >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) reached for event: ${String(event)}`);
    }

    eventListeners.add(listener);

    // 購読解除関数を返す
    return () => {
      eventListeners.delete(listener);
    };
  }

  // 一度だけ実行されるリスナーの追加
  once<K extends keyof TEventMap>(
    event: K,
    listener: EventListener<TEventMap[K]>
  ): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }

    this.onceListeners.get(event)!.add(listener);

    return () => {
      this.onceListeners.get(event)?.delete(listener);
    };
  }

  // イベントリスナーの削除
  off<K extends keyof TEventMap>(
    event: K,
    listener: EventListener<TEventMap[K]>
  ): void {
    this.listeners.get(event)?.delete(listener);
    this.onceListeners.get(event)?.delete(listener);
  }

  // イベントの発火
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    // 通常のリスナーを実行
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Event listener error for ${String(event)}:`, error);
        }
      });
    }

    // onceリスナーを実行して削除
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Once event listener error for ${String(event)}:`, error);
        }
      });
      onceListeners.clear();
    }
  }

  // 特定イベントのリスナー数を取得
  listenerCount<K extends keyof TEventMap>(event: K): number {
    const regular = this.listeners.get(event)?.size ?? 0;
    const once = this.onceListeners.get(event)?.size ?? 0;
    return regular + once;
  }

  // 全イベントのリスナーを削除
  removeAllListeners<K extends keyof TEventMap>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  // 最大リスナー数の設定
  setMaxListeners(max: number): void {
    this.maxListeners = max;
  }
}

// ============================================================================
// 3. ステートマシン実装
// ============================================================================

export interface StateTransition<TState, TEvent> {
  from: TState;
  to: TState;
  event: TEvent;
  guard?: (context: any) => boolean;
  action?: (context: any) => void;
}

export interface StateMachineConfig<TState, TEvent> {
  initialState: TState;
  states: TState[];
  transitions: StateTransition<TState, TEvent>[];
}

export class StateMachine<TState extends string, TEvent extends string> {
  private currentState: TState;
  private transitions: Map<string, StateTransition<TState, TEvent>[]> = new Map();
  private eventEmitter = new EventEmitter<{
    stateChange: { from: TState; to: TState; event: TEvent };
    transitionError: { state: TState; event: TEvent; error: string };
  }>();
  private context: any = {};

  constructor(private config: StateMachineConfig<TState, TEvent>) {
    this.currentState = config.initialState;
    this.buildTransitionMap();
  }

  private buildTransitionMap(): void {
    this.config.transitions.forEach(transition => {
      const key = `${transition.from}-${transition.event}`;
      if (!this.transitions.has(key)) {
        this.transitions.set(key, []);
      }
      this.transitions.get(key)!.push(transition);
    });
  }

  // 現在の状態を取得
  getState(): TState {
    return this.currentState;
  }

  // コンテキストの設定
  setContext(context: any): void {
    this.context = { ...this.context, ...context };
  }

  // コンテキストの取得
  getContext(): any {
    return { ...this.context };
  }

  // イベントの送信
  send(event: TEvent): boolean {
    const key = `${this.currentState}-${event}`;
    const possibleTransitions = this.transitions.get(key);

    if (!possibleTransitions || possibleTransitions.length === 0) {
      this.eventEmitter.emit('transitionError', {
        state: this.currentState,
        event,
        error: `No transition defined for state '${this.currentState}' and event '${event}'`
      });
      return false;
    }

    // 条件を満たす最初の遷移を実行
    for (const transition of possibleTransitions) {
      if (!transition.guard || transition.guard(this.context)) {
        const previousState = this.currentState;
        
        // アクションを実行
        if (transition.action) {
          try {
            transition.action(this.context);
          } catch (error) {
            console.error('State transition action error:', error);
          }
        }

        // 状態を変更
        this.currentState = transition.to;

        // 状態変更イベントを発火
        this.eventEmitter.emit('stateChange', {
          from: previousState,
          to: this.currentState,
          event
        });

        return true;
      }
    }

    this.eventEmitter.emit('transitionError', {
      state: this.currentState,
      event,
      error: `Guard conditions not met for transition from '${this.currentState}' with event '${event}'`
    });

    return false;
  }

  // 状態変更の監視
  onStateChange(listener: (data: { from: TState; to: TState; event: TEvent }) => void): () => void {
    return this.eventEmitter.on('stateChange', listener);
  }

  // エラーの監視
  onTransitionError(listener: (data: { state: TState; event: TEvent; error: string }) => void): () => void {
    return this.eventEmitter.on('transitionError', listener);
  }

  // 可能な遷移の取得
  getPossibleTransitions(): TEvent[] {
    const events: TEvent[] = [];
    this.config.transitions.forEach(transition => {
      if (transition.from === this.currentState) {
        if (!transition.guard || transition.guard(this.context)) {
          events.push(transition.event);
        }
      }
    });
    return [...new Set(events)];
  }

  // 状態のリセット
  reset(): void {
    const previousState = this.currentState;
    this.currentState = this.config.initialState;
    this.context = {};
    
    if (previousState !== this.currentState) {
      this.eventEmitter.emit('stateChange', {
        from: previousState,
        to: this.currentState,
        event: 'reset' as TEvent
      });
    }
  }
}

// ============================================================================
// 4. Redux風状態管理パターン
// ============================================================================

export interface Action {
  type: string;
  payload?: any;
}

export type Reducer<TState> = (state: TState, action: Action) => TState;

export interface Middleware<TState> {
  (store: Store<TState>): (next: (action: Action) => void) => (action: Action) => void;
}

export class Store<TState> {
  private state: TState;
  private reducer: Reducer<TState>;
  private listeners: Set<() => void> = new Set();
  private middlewares: Middleware<TState>[] = [];
  private isDispatching = false;

  constructor(reducer: Reducer<TState>, initialState: TState, middlewares: Middleware<TState>[] = []) {
    this.reducer = reducer;
    this.state = initialState;
    this.middlewares = middlewares;
  }

  // 現在の状態を取得
  getState(): TState {
    return this.state;
  }

  // アクションのディスパッチ
  dispatch(action: Action): void {
    if (this.isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }

    try {
      this.isDispatching = true;
      
      // ミドルウェアの適用
      let next = (action: Action) => {
        this.state = this.reducer(this.state, action);
      };

      // ミドルウェアチェーンを構築
      for (let i = this.middlewares.length - 1; i >= 0; i--) {
        next = this.middlewares[i](this)(next);
      }

      next(action);
    } finally {
      this.isDispatching = false;
    }

    // リスナーに通知
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Store listener error:', error);
      }
    });
  }

  // 状態変更の購読
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // リスナー数の取得
  getListenerCount(): number {
    return this.listeners.size;
  }
}

// ============================================================================
// 5. 永続化対応状態管理
// ============================================================================

export interface PersistentStoreOptions {
  key: string;
  storage?: Storage;
  serializer?: {
    serialize: (state: any) => string;
    deserialize: (data: string) => any;
  };
  throttleMs?: number;
}

export class PersistentStore<TState> extends ObservableStore<TState> {
  private persistOptions: PersistentStoreOptions;
  private saveTimer: number | null = null;

  constructor(initialState: TState, options: PersistentStoreOptions) {
    super(initialState);
    this.persistOptions = {
      storage: localStorage,
      serializer: {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      },
      throttleMs: 300,
      ...options
    };

    this.loadFromStorage();
    this.setupAutoSave();
  }

  private loadFromStorage(): void {
    try {
      const saved = this.persistOptions.storage!.getItem(this.persistOptions.key);
      if (saved) {
        const deserializedState = this.persistOptions.serializer!.deserialize(saved);
        this.setState(deserializedState);
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
  }

  private setupAutoSave(): void {
    this.subscribe({
      update: (state: TState) => {
        this.throttledSave(state);
      }
    });
  }

  private throttledSave(state: TState): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = window.setTimeout(() => {
      this.saveToStorage(state);
    }, this.persistOptions.throttleMs);
  }

  private saveToStorage(state: TState): void {
    try {
      const serialized = this.persistOptions.serializer!.serialize(state);
      this.persistOptions.storage!.setItem(this.persistOptions.key, serialized);
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  }

  // 手動保存
  save(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveToStorage(this.state);
  }

  // ストレージから削除
  clear(): void {
    try {
      this.persistOptions.storage!.removeItem(this.persistOptions.key);
    } catch (error) {
      console.error('Failed to clear state from storage:', error);
    }
    super.clear();
  }
}

// ============================================================================
// 6. 実用的なミドルウェア例
// ============================================================================

// ログミドルウェア
export function createLoggerMiddleware<TState>(): Middleware<TState> {
  return (store) => (next) => (action) => {
    console.group(`Action: ${action.type}`);
    console.log('Previous State:', store.getState());
    console.log('Action:', action);
    
    next(action);
    
    console.log('Next State:', store.getState());
    console.groupEnd();
  };
}

// 非同期アクション対応ミドルウェア
export function createThunkMiddleware<TState>(): Middleware<TState> {
  return (store) => (next) => (action) => {
    if (typeof action === 'function') {
      return action(store.dispatch.bind(store), store.getState.bind(store));
    }
    return next(action);
  };
}

// エラーハンドリングミドルウェア
export function createErrorMiddleware<TState>(): Middleware<TState> {
  return (store) => (next) => (action) => {
    try {
      return next(action);
    } catch (error) {
      console.error('Action error:', error);
      store.dispatch({
        type: 'ERROR_OCCURRED',
        payload: { error: error.message, originalAction: action }
      });
    }
  };
}

// ============================================================================
// 7. 使用例とデモンストレーション
// ============================================================================

// ショッピングカート状態管理の例
interface CartState {
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  discounts: number;
}

interface CartEvents {
  itemAdded: { id: string; name: string; price: number };
  itemRemoved: { id: string };
  cartCleared: void;
  discountApplied: { amount: number };
}

export function createShoppingCartStore(): {
  store: PersistentStore<CartState>;
  events: EventEmitter<CartEvents>;
  actions: {
    addItem: (id: string, name: string, price: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    applyDiscount: (amount: number) => void;
  };
} {
  const initialState: CartState = {
    items: [],
    total: 0,
    discounts: 0
  };

  const store = new PersistentStore(initialState, {
    key: 'shopping-cart',
    storage: localStorage
  });

  const events = new EventEmitter<CartEvents>();

  const actions = {
    addItem: (id: string, name: string, price: number) => {
      const currentState = store.state;
      const existingItem = currentState.items.find(item => item.id === id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        currentState.items.push({ id, name, price, quantity: 1 });
      }

      const newTotal = currentState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      store.setState({
        ...currentState,
        total: newTotal - currentState.discounts
      });

      events.emit('itemAdded', { id, name, price });
    },

    removeItem: (id: string) => {
      const currentState = store.state;
      const newItems = currentState.items.filter(item => item.id !== id);
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      store.setState({
        ...currentState,
        items: newItems,
        total: newTotal - currentState.discounts
      });

      events.emit('itemRemoved', { id });
    },

    clearCart: () => {
      store.setState(initialState);
      events.emit('cartCleared');
    },

    applyDiscount: (amount: number) => {
      const currentState = store.state;
      const newDiscounts = currentState.discounts + amount;
      const itemsTotal = currentState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      store.setState({
        ...currentState,
        discounts: newDiscounts,
        total: itemsTotal - newDiscounts
      });

      events.emit('discountApplied', { amount });
    }
  };

  return { store, events, actions };
}

export async function demonstrateStateManagement(): Promise<void> {
  console.log('=== Lesson 49: State Management Patterns Demonstration ===');

  try {
    // 1. Observer パターンのデモ
    console.log('\n1. Observer Pattern Demo:');
    const userStore = new ObservableStore({ name: '', email: '', isLoggedIn: false });
    
    const logger = {
      update: (state: any) => console.log('User state changed:', state)
    };

    const unsubscribe = userStore.subscribe(logger);
    userStore.setState({ name: 'John Doe', email: 'john@example.com', isLoggedIn: true });
    unsubscribe();

    // 2. イベントシステムのデモ
    console.log('\n2. Event System Demo:');
    const eventBus = new EventEmitter<{ userLogin: { userId: string }; notification: { message: string } }>();
    
    eventBus.on('userLogin', (data) => {
      console.log(`User logged in: ${data.userId}`);
    });

    eventBus.emit('userLogin', { userId: 'user123' });

    // 3. ステートマシンのデモ
    console.log('\n3. State Machine Demo:');
    type OrderState = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    type OrderEvent = 'process' | 'ship' | 'deliver' | 'cancel';

    const orderMachine = new StateMachine<OrderState, OrderEvent>({
      initialState: 'pending',
      states: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      transitions: [
        { from: 'pending', to: 'processing', event: 'process' },
        { from: 'processing', to: 'shipped', event: 'ship' },
        { from: 'shipped', to: 'delivered', event: 'deliver' },
        { from: 'pending', to: 'cancelled', event: 'cancel' }
      ]
    });

    orderMachine.onStateChange((data) => {
      console.log(`Order state changed: ${data.from} -> ${data.to} (${data.event})`);
    });

    orderMachine.send('process');
    orderMachine.send('ship');
    orderMachine.send('deliver');

    // 4. Redux風ストアのデモ
    console.log('\n4. Redux-style Store Demo:');
    interface CounterState {
      count: number;
    }

    const counterReducer: Reducer<CounterState> = (state, action) => {
      switch (action.type) {
        case 'INCREMENT':
          return { count: state.count + 1 };
        case 'DECREMENT':
          return { count: state.count - 1 };
        case 'RESET':
          return { count: 0 };
        default:
          return state;
      }
    };

    const counterStore = new Store(
      counterReducer,
      { count: 0 },
      [createLoggerMiddleware()]
    );

    counterStore.subscribe(() => {
      console.log('Counter state:', counterStore.getState());
    });

    counterStore.dispatch({ type: 'INCREMENT' });
    counterStore.dispatch({ type: 'INCREMENT' });
    counterStore.dispatch({ type: 'DECREMENT' });

    // 5. ショッピングカートのデモ
    console.log('\n5. Shopping Cart Demo:');
    const { store: cartStore, events: cartEvents, actions: cartActions } = createShoppingCartStore();

    cartEvents.on('itemAdded', (data) => {
      console.log(`Item added to cart: ${data.name} ($${data.price})`);
    });

    cartActions.addItem('1', 'T-Shirt', 19.99);
    cartActions.addItem('2', 'Jeans', 49.99);
    cartActions.applyDiscount(5.00);

    console.log('Final cart state:', cartStore.state);

    console.log('\nState management demonstration completed!');

  } catch (error) {
    console.error('Demo error:', error);
  }
}

// エクスポート
export {
  ObservableStore,
  EventEmitter,
  StateMachine,
  Store,
  PersistentStore
};