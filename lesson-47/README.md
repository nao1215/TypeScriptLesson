# Lesson 47: DOM操作とイベントハンドリング (DOM & Event Handling)

## 学習目標
- 型安全なDOM操作の実装方法を習得する
- 効率的なイベントハンドリングパターンを学ぶ
- イベント委譲とバブリングを理解する
- カスタムイベントシステムの実装を学ぶ
- パフォーマンスを考慮したDOM操作を習得する
- 実際のWebアプリケーションで使用できるDOM操作パターンを理解する

## DOM操作の基礎

### TypeScriptでの型安全なDOM操作

```typescript
// 基本的なDOM要素の取得と型アサーション
function getTypedElement<T extends Element>(selector: string): T | null {
    return document.querySelector<T>(selector);
}

function getTypedElements<T extends Element>(selector: string): NodeListOf<T> {
    return document.querySelectorAll<T>(selector);
}

// より安全なDOM要素アクセス
function requireElement<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Element not found: ${selector}`);
    }
    return element;
}

// 使用例
const button = getTypedElement<HTMLButtonElement>('#submit-button');
const inputs = getTypedElements<HTMLInputElement>('input[type="text"]');
const form = requireElement<HTMLFormElement>('#user-form');
```

### DOM要素作成とカスタマイズ

```typescript
interface ElementOptions {
    className?: string;
    id?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
    dataset?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    eventListeners?: Record<string, EventListener>;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options: ElementOptions = {}
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    // 基本プロパティの設定
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    if (options.textContent) element.textContent = options.textContent;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    
    // 属性の設定
    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            element.setAttribute(key, value);
        }
    }
    
    // データ属性の設定
    if (options.dataset) {
        for (const [key, value] of Object.entries(options.dataset)) {
            element.dataset[key] = value;
        }
    }
    
    // スタイルの設定
    if (options.styles) {
        Object.assign(element.style, options.styles);
    }
    
    // イベントリスナーの設定
    if (options.eventListeners) {
        for (const [event, listener] of Object.entries(options.eventListeners)) {
            element.addEventListener(event, listener);
        }
    }
    
    return element;
}

// 使用例
const button = createElement('button', {
    className: 'btn btn-primary',
    textContent: 'Click me!',
    attributes: { type: 'button' },
    dataset: { action: 'submit' },
    styles: { marginTop: '10px' },
    eventListeners: {
        click: () => console.log('Button clicked!')
    }
});
```

## イベントハンドリング

### イベントリスナー管理クラス

```typescript
interface EventListenerOptions extends AddEventListenerOptions {
    namespace?: string;
}

class EventManager {
    private listeners = new Map<string, {
        element: Element | Document | Window;
        event: string;
        listener: EventListener;
        options?: AddEventListenerOptions;
    }>();
    
    /**
     * イベントリスナーを追加
     */
    addEventListener<K extends keyof HTMLElementEventMap>(
        element: Element | Document | Window,
        event: K,
        listener: (event: HTMLElementEventMap[K]) => void,
        options: EventListenerOptions = {}
    ): string {
        const id = this.generateListenerId(element, event, options.namespace);
        
        // 既存のリスナーを削除
        this.removeEventListener(id);
        
        // 新しいリスナーを追加
        const eventListener = listener as EventListener;
        element.addEventListener(event, eventListener, options);
        
        // リスナー情報を保存
        this.listeners.set(id, {
            element,
            event,
            listener: eventListener,
            options
        });
        
        return id;
    }
    
    /**
     * イベントリスナーを削除
     */
    removeEventListener(id: string): boolean {
        const listenerInfo = this.listeners.get(id);
        if (!listenerInfo) return false;
        
        listenerInfo.element.removeEventListener(
            listenerInfo.event,
            listenerInfo.listener,
            listenerInfo.options
        );
        
        return this.listeners.delete(id);
    }
    
    /**
     * ネームスペース内の全リスナーを削除
     */
    removeNamespace(namespace: string): number {
        let removed = 0;
        
        for (const [id, listenerInfo] of this.listeners) {
            if (id.includes(`::${namespace}`)) {
                listenerInfo.element.removeEventListener(
                    listenerInfo.event,
                    listenerInfo.listener,
                    listenerInfo.options
                );
                this.listeners.delete(id);
                removed++;
            }
        }
        
        return removed;
    }
    
    /**
     * すべてのリスナーを削除
     */
    removeAllListeners(): void {
        for (const [id] of this.listeners) {
            this.removeEventListener(id);
        }
    }
    
    /**
     * 一意なリスナーIDを生成
     */
    private generateListenerId(
        element: Element | Document | Window,
        event: string,
        namespace?: string
    ): string {
        const elementId = element instanceof Element 
            ? element.id || element.tagName.toLowerCase() 
            : element.constructor.name;
        const namespaceStr = namespace ? `::${namespace}` : '';
        const timestamp = Date.now();
        
        return `${elementId}:${event}${namespaceStr}:${timestamp}`;
    }
    
    /**
     * 現在のリスナー数を取得
     */
    get listenerCount(): number {
        return this.listeners.size;
    }
    
    /**
     * リスナー情報をデバッグ出力
     */
    debug(): void {
        console.table(Array.from(this.listeners.entries()).map(([id, info]) => ({
            id,
            element: info.element.constructor.name,
            event: info.event,
            hasOptions: !!info.options
        })));
    }
}

// グローバルなイベントマネージャーインスタンス
export const eventManager = new EventManager();
```

### イベント委譲（Event Delegation）

```typescript
class EventDelegator {
    private delegatedEvents = new Map<string, {
        selector: string;
        handler: (event: Event, target: Element) => void;
    }>();
    
    constructor(private container: Element = document.body) {}
    
    /**
     * イベント委譲でリスナーを追加
     */
    delegate<K extends keyof HTMLElementEventMap>(
        event: K,
        selector: string,
        handler: (event: HTMLElementEventMap[K], target: Element) => void,
        options?: AddEventListenerOptions
    ): string {
        const delegateId = `${event}:${selector}:${Date.now()}`;
        
        // 委譲ハンドラーを作成
        const delegateHandler = (e: Event) => {
            const target = e.target as Element;
            if (target && target.matches(selector)) {
                handler(e as HTMLElementEventMap[K], target);
            }
        };
        
        // コンテナにリスナーを追加
        this.container.addEventListener(event, delegateHandler, options);
        
        // 委譲情報を保存
        this.delegatedEvents.set(delegateId, {
            selector,
            handler: delegateHandler
        });
        
        return delegateId;
    }
    
    /**
     * 委譲されたイベントリスナーを削除
     */
    undelegate(delegateId: string): boolean {
        const delegateInfo = this.delegatedEvents.get(delegateId);
        if (!delegateInfo) return false;
        
        // 実際のイベントタイプを取得するのは困難なので、
        // より良い実装では delegateInfo にイベントタイプも保存する
        this.container.removeEventListener('click', delegateInfo.handler as EventListener);
        
        return this.delegatedEvents.delete(delegateId);
    }
    
    /**
     * 改良版：イベントタイプも保存する実装
     */
    delegateImproved<K extends keyof HTMLElementEventMap>(
        event: K,
        selector: string,
        handler: (event: HTMLElementEventMap[K], target: Element) => void,
        options?: AddEventListenerOptions
    ): string {
        const delegateId = `${event}:${selector}:${Date.now()}`;
        
        const delegateHandler = (e: Event) => {
            // より柔軟な要素マッチング
            let target = e.target as Element;
            while (target && target !== this.container) {
                if (target.matches(selector)) {
                    handler(e as HTMLElementEventMap[K], target);
                    break;
                }
                target = target.parentElement as Element;
            }
        };
        
        this.container.addEventListener(event, delegateHandler, options);
        
        // より詳細な情報を保存
        (this.delegatedEvents as any).set(delegateId, {
            event,
            selector,
            handler: delegateHandler,
            originalHandler: handler
        });
        
        return delegateId;
    }
}
```

### カスタムイベントシステム

```typescript
interface CustomEventData {
    [key: string]: any;
}

class CustomEventEmitter {
    private events = new Map<string, Set<Function>>();
    
    /**
     * イベントリスナーを追加
     */
    on(event: string, listener: Function): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        
        this.events.get(event)!.add(listener);
        
        // アンサブスクライブ関数を返す
        return () => this.off(event, listener);
    }
    
    /**
     * 一回だけ実行されるイベントリスナーを追加
     */
    once(event: string, listener: Function): () => void {
        const onceWrapper = (...args: any[]) => {
            listener(...args);
            this.off(event, onceWrapper);
        };
        
        return this.on(event, onceWrapper);
    }
    
    /**
     * イベントリスナーを削除
     */
    off(event: string, listener: Function): boolean {
        const listeners = this.events.get(event);
        if (!listeners) return false;
        
        return listeners.delete(listener);
    }
    
    /**
     * イベントを発火
     */
    emit(event: string, ...args: any[]): boolean {
        const listeners = this.events.get(event);
        if (!listeners || listeners.size === 0) return false;
        
        listeners.forEach(listener => {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error in event listener for '${event}':`, error);
            }
        });
        
        return true;
    }
    
    /**
     * イベントリスナーをすべて削除
     */
    removeAllListeners(event?: string): void {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
    
    /**
     * 指定されたイベントのリスナー数を取得
     */
    listenerCount(event: string): number {
        return this.events.get(event)?.size || 0;
    }
    
    /**
     * 全イベントの名前を取得
     */
    eventNames(): string[] {
        return Array.from(this.events.keys());
    }
}

// DOM要素でカスタムイベントを発火
function dispatchCustomEvent(
    element: Element,
    eventType: string,
    data: CustomEventData = {},
    options: CustomEventInit = {}
): boolean {
    const customEvent = new CustomEvent(eventType, {
        detail: data,
        bubbles: true,
        cancelable: true,
        ...options
    });
    
    return element.dispatchEvent(customEvent);
}

// カスタムイベントのリスナー（型安全）
function addCustomEventListener<T = CustomEventData>(
    element: Element,
    eventType: string,
    listener: (event: CustomEvent<T>) => void,
    options?: AddEventListenerOptions
): void {
    element.addEventListener(eventType, listener as EventListener, options);
}
```

## 実践的なDOM操作パターン

### コンポーネントベースのDOM操作

```typescript
interface ComponentOptions {
    className?: string;
    attributes?: Record<string, string>;
    children?: (Element | string)[];
    eventListeners?: Record<string, (event: Event) => void>;
}

abstract class DOMComponent {
    protected element: HTMLElement;
    protected eventManager = new EventManager();
    protected customEvents = new CustomEventEmitter();
    
    constructor(tagName: string, options: ComponentOptions = {}) {
        this.element = document.createElement(tagName);
        this.initialize(options);
        this.render();
        this.bindEvents();
    }
    
    /**
     * 初期設定
     */
    private initialize(options: ComponentOptions): void {
        if (options.className) {
            this.element.className = options.className;
        }
        
        if (options.attributes) {
            for (const [key, value] of Object.entries(options.attributes)) {
                this.element.setAttribute(key, value);
            }
        }
        
        if (options.children) {
            for (const child of options.children) {
                if (typeof child === 'string') {
                    this.element.appendChild(document.createTextNode(child));
                } else {
                    this.element.appendChild(child);
                }
            }
        }
        
        if (options.eventListeners) {
            for (const [event, listener] of Object.entries(options.eventListeners)) {
                this.eventManager.addEventListener(this.element, event as any, listener);
            }
        }
    }
    
    /**
     * レンダリング処理（サブクラスで実装）
     */
    protected abstract render(): void;
    
    /**
     * イベントバインディング（サブクラスで実装）
     */
    protected abstract bindEvents(): void;
    
    /**
     * 要素をDOMに挿入
     */
    appendTo(parent: Element): this {
        parent.appendChild(this.element);
        this.onMounted();
        return this;
    }
    
    /**
     * 要素をDOMから削除
     */
    remove(): this {
        this.onUnmounted();
        this.eventManager.removeAllListeners();
        this.element.remove();
        return this;
    }
    
    /**
     * 要素が挿入された時の処理
     */
    protected onMounted(): void {
        this.customEvents.emit('mounted', this);
    }
    
    /**
     * 要素が削除された時の処理
     */
    protected onUnmounted(): void {
        this.customEvents.emit('unmounted', this);
    }
    
    /**
     * DOM要素を取得
     */
    getElement(): HTMLElement {
        return this.element;
    }
    
    /**
     * カスタムイベントのリスナーを追加
     */
    on(event: string, listener: Function): () => void {
        return this.customEvents.on(event, listener);
    }
    
    /**
     * カスタムイベントを発火
     */
    emit(event: string, ...args: any[]): boolean {
        return this.customEvents.emit(event, ...args);
    }
}

// 具体的なコンポーネント例
class Button extends DOMComponent {
    private text: string;
    private onClick?: () => void;
    
    constructor(text: string, onClick?: () => void, options: ComponentOptions = {}) {
        super('button', {
            ...options,
            className: `btn ${options.className || ''}`.trim()
        });
        
        this.text = text;
        this.onClick = onClick;
    }
    
    protected render(): void {
        this.element.textContent = this.text;
    }
    
    protected bindEvents(): void {
        if (this.onClick) {
            this.eventManager.addEventListener(this.element, 'click', () => {
                this.onClick!();
                this.emit('clicked', this);
            });
        }
    }
    
    /**
     * テキストを更新
     */
    setText(text: string): this {
        this.text = text;
        this.element.textContent = text;
        return this;
    }
    
    /**
     * ボタンを無効化/有効化
     */
    setDisabled(disabled: boolean): this {
        (this.element as HTMLButtonElement).disabled = disabled;
        this.element.classList.toggle('disabled', disabled);
        return this;
    }
}

// モーダルダイアログコンポーネント
class Modal extends DOMComponent {
    private title: string;
    private content: string | Element;
    private closable: boolean;
    
    constructor(
        title: string,
        content: string | Element,
        options: ComponentOptions & { closable?: boolean } = {}
    ) {
        super('div', {
            ...options,
            className: `modal ${options.className || ''}`.trim()
        });
        
        this.title = title;
        this.content = content;
        this.closable = options.closable !== false;
    }
    
    protected render(): void {
        this.element.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">${this.title}</h3>
                        ${this.closable ? '<button class="modal-close">&times;</button>' : ''}
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary modal-cancel">Cancel</button>
                        <button class="btn btn-primary modal-confirm">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        const modalBody = this.element.querySelector('.modal-body')!;
        if (typeof this.content === 'string') {
            modalBody.innerHTML = this.content;
        } else {
            modalBody.appendChild(this.content);
        }
    }
    
    protected bindEvents(): void {
        // 背景クリックで閉じる
        const backdrop = this.element.querySelector('.modal-backdrop')!;
        this.eventManager.addEventListener(backdrop, 'click', (event) => {
            if (event.target === backdrop) {
                this.close();
            }
        });
        
        // 閉じるボタン
        if (this.closable) {
            const closeBtn = this.element.querySelector('.modal-close')!;
            this.eventManager.addEventListener(closeBtn, 'click', () => {
                this.close();
            });
        }
        
        // キャンセルボタン
        const cancelBtn = this.element.querySelector('.modal-cancel')!;
        this.eventManager.addEventListener(cancelBtn, 'click', () => {
            this.cancel();
        });
        
        // 確認ボタン
        const confirmBtn = this.element.querySelector('.modal-confirm')!;
        this.eventManager.addEventListener(confirmBtn, 'click', () => {
            this.confirm();
        });
        
        // ESCキーで閉じる
        this.eventManager.addEventListener(document, 'keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible()) {
                this.close();
            }
        });
    }
    
    /**
     * モーダルを表示
     */
    show(): this {
        document.body.classList.add('modal-open');
        this.appendTo(document.body);
        this.element.classList.add('show');
        this.emit('shown', this);
        return this;
    }
    
    /**
     * モーダルを非表示
     */
    hide(): this {
        this.element.classList.remove('show');
        setTimeout(() => {
            this.remove();
            document.body.classList.remove('modal-open');
            this.emit('hidden', this);
        }, 300); // アニメーション時間
        return this;
    }
    
    /**
     * モーダルを閉じる
     */
    close(): this {
        this.emit('close', this);
        this.hide();
        return this;
    }
    
    /**
     * キャンセル処理
     */
    cancel(): this {
        this.emit('cancel', this);
        this.hide();
        return this;
    }
    
    /**
     * 確認処理
     */
    confirm(): this {
        this.emit('confirm', this);
        this.hide();
        return this;
    }
    
    /**
     * モーダルが表示されているかチェック
     */
    isVisible(): boolean {
        return document.body.contains(this.element);
    }
}
```

### パフォーマンス最適化

```typescript
class DOMOptimizer {
    /**
     * 仮想スクロール（大量のリストアイテムを効率的に表示）
     */
    static createVirtualScrollList<T>(
        container: HTMLElement,
        items: T[],
        itemHeight: number,
        renderItem: (item: T, index: number) => HTMLElement,
        options: {
            overscan?: number;
            containerHeight?: number;
        } = {}
    ): {
        scrollToIndex: (index: number) => void;
        refresh: () => void;
        destroy: () => void;
    } {
        const {
            overscan = 5,
            containerHeight = container.clientHeight
        } = options;
        
        const viewport = createElement('div', {
            styles: {
                height: `${containerHeight}px`,
                overflow: 'auto'
            }
        });
        
        const content = createElement('div', {
            styles: {
                height: `${items.length * itemHeight}px`,
                position: 'relative'
            }
        });
        
        viewport.appendChild(content);
        container.appendChild(viewport);
        
        const visibleItems = new Map<number, HTMLElement>();
        
        const updateVisibleItems = () => {
            const scrollTop = viewport.scrollTop;
            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
            const endIndex = Math.min(
                items.length - 1,
                Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
            );
            
            // 不要なアイテムを削除
            for (const [index, element] of visibleItems) {
                if (index < startIndex || index > endIndex) {
                    element.remove();
                    visibleItems.delete(index);
                }
            }
            
            // 新しいアイテムを追加
            for (let i = startIndex; i <= endIndex; i++) {
                if (!visibleItems.has(i)) {
                    const element = renderItem(items[i], i);
                    element.style.position = 'absolute';
                    element.style.top = `${i * itemHeight}px`;
                    element.style.width = '100%';
                    element.style.height = `${itemHeight}px`;
                    
                    content.appendChild(element);
                    visibleItems.set(i, element);
                }
            }
        };
        
        // スクロールイベントをスロットル
        const throttledUpdate = this.throttle(updateVisibleItems, 16); // ~60fps
        viewport.addEventListener('scroll', throttledUpdate);
        
        // 初回レンダリング
        updateVisibleItems();
        
        return {
            scrollToIndex: (index: number) => {
                viewport.scrollTop = index * itemHeight;
            },
            refresh: updateVisibleItems,
            destroy: () => {
                viewport.removeEventListener('scroll', throttledUpdate);
                container.removeChild(viewport);
            }
        };
    }
    
    /**
     * DOM更新をバッチ処理
     */
    static batchDOMUpdates(updates: (() => void)[]): void {
        // DocumentFragmentを使用して一括更新
        const fragment = document.createDocumentFragment();
        const tempContainer = document.createElement('div');
        
        updates.forEach(update => {
            try {
                update();
            } catch (error) {
                console.error('Error in DOM update:', error);
            }
        });
        
        // 強制的にレイアウトを発生させない
        requestAnimationFrame(() => {
            // ここで実際のDOM操作を実行
        });
    }
    
    /**
     * 要素の表示状態を効率的にチェック（Intersection Observer使用）
     */
    static createVisibilityObserver(
        callback: (entries: IntersectionObserverEntry[]) => void,
        options: IntersectionObserverInit = {}
    ): {
        observe: (element: Element) => void;
        unobserve: (element: Element) => void;
        disconnect: () => void;
    } {
        const observer = new IntersectionObserver(callback, {
            threshold: 0.1,
            rootMargin: '50px',
            ...options
        });
        
        return {
            observe: (element: Element) => observer.observe(element),
            unobserve: (element: Element) => observer.unobserve(element),
            disconnect: () => observer.disconnect()
        };
    }
    
    /**
     * 関数をスロットル（頻繁な実行を制限）
     */
    static throttle<T extends (...args: any[]) => void>(
        func: T,
        delay: number
    ): T {
        let timeoutId: number | null = null;
        let lastExecTime = 0;
        
        return ((...args: any[]) => {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func(...args);
                lastExecTime = currentTime;
            } else if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    func(...args);
                    lastExecTime = Date.now();
                    timeoutId = null;
                }, delay - (currentTime - lastExecTime));
            }
        }) as T;
    }
    
    /**
     * 関数をデバウンス（連続実行を防止）
     */
    static debounce<T extends (...args: any[]) => void>(
        func: T,
        delay: number
    ): T {
        let timeoutId: number | null = null;
        
        return ((...args: any[]) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            timeoutId = setTimeout(() => {
                func(...args);
                timeoutId = null;
            }, delay);
        }) as T;
    }
}
```

## 実践的な使用例

### アプリケーションの統合例

```typescript
class TodoApp {
    private container: HTMLElement;
    private todoList: HTMLElement;
    private eventManager = new EventManager();
    private customEvents = new CustomEventEmitter();
    private todos: Array<{ id: number; text: string; completed: boolean }> = [];
    private nextId = 1;
    
    constructor(containerId: string) {
        this.container = requireElement<HTMLElement>(`#${containerId}`);
        this.initialize();
        this.render();
        this.bindEvents();
    }
    
    private initialize(): void {
        this.container.innerHTML = `
            <div class="todo-app">
                <header class="todo-header">
                    <h1>Todo App</h1>
                    <div class="todo-input-group">
                        <input type="text" class="todo-input" placeholder="Add a new todo...">
                        <button class="todo-add-btn">Add</button>
                    </div>
                </header>
                <main class="todo-main">
                    <div class="todo-filters">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="active">Active</button>
                        <button class="filter-btn" data-filter="completed">Completed</button>
                    </div>
                    <ul class="todo-list"></ul>
                </main>
                <footer class="todo-footer">
                    <span class="todo-count">0 items left</span>
                    <button class="clear-completed">Clear completed</button>
                </footer>
            </div>
        `;
        
        this.todoList = requireElement('.todo-list');
    }
    
    private render(): void {
        this.todoList.innerHTML = '';
        
        this.todos.forEach(todo => {
            const todoItem = createElement('li', {
                className: `todo-item ${todo.completed ? 'completed' : ''}`,
                dataset: { id: todo.id.toString() },
                innerHTML: `
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text">${todo.text}</span>
                    <button class="todo-delete">×</button>
                `
            });
            
            this.todoList.appendChild(todoItem);
        });
        
        this.updateCounter();
    }
    
    private bindEvents(): void {
        // イベント委譲を使用
        const delegator = new EventDelegator(this.container);
        
        // Todo追加
        delegator.delegateImproved('click', '.todo-add-btn', () => {
            this.addTodo();
        });
        
        delegator.delegateImproved('keydown', '.todo-input', (event) => {
            if (event.key === 'Enter') {
                this.addTodo();
            }
        });
        
        // Todoの完了/未完了切り替え
        delegator.delegateImproved('change', '.todo-checkbox', (event, target) => {
            const todoItem = target.closest('.todo-item') as HTMLElement;
            const id = parseInt(todoItem.dataset.id!);
            this.toggleTodo(id);
        });
        
        // Todo削除
        delegator.delegateImproved('click', '.todo-delete', (event, target) => {
            const todoItem = target.closest('.todo-item') as HTMLElement;
            const id = parseInt(todoItem.dataset.id!);
            this.deleteTodo(id);
        });
        
        // フィルタ切り替え
        delegator.delegateImproved('click', '.filter-btn', (event, target) => {
            const filter = target.dataset.filter!;
            this.setFilter(filter);
        });
        
        // 完了済みタスクをクリア
        delegator.delegateImproved('click', '.clear-completed', () => {
            this.clearCompleted();
        });
    }
    
    private addTodo(): void {
        const input = this.container.querySelector('.todo-input') as HTMLInputElement;
        const text = input.value.trim();
        
        if (!text) return;
        
        const todo = {
            id: this.nextId++,
            text,
            completed: false
        };
        
        this.todos.push(todo);
        input.value = '';
        
        this.render();
        this.customEvents.emit('todoAdded', todo);
    }
    
    private toggleTodo(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.render();
            this.customEvents.emit('todoToggled', todo);
        }
    }
    
    private deleteTodo(id: number): void {
        const index = this.todos.findIndex(t => t.id === id);
        if (index >= 0) {
            const todo = this.todos.splice(index, 1)[0];
            this.render();
            this.customEvents.emit('todoDeleted', todo);
        }
    }
    
    private setFilter(filter: string): void {
        // フィルタボタンの状態更新
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.container.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
        
        // Todoアイテムの表示/非表示
        this.todoList.querySelectorAll('.todo-item').forEach((item: HTMLElement) => {
            const id = parseInt(item.dataset.id!);
            const todo = this.todos.find(t => t.id === id)!;
            
            let show = true;
            if (filter === 'active') {
                show = !todo.completed;
            } else if (filter === 'completed') {
                show = todo.completed;
            }
            
            item.style.display = show ? '' : 'none';
        });
        
        this.customEvents.emit('filterChanged', filter);
    }
    
    private clearCompleted(): void {
        const completed = this.todos.filter(t => t.completed);
        this.todos = this.todos.filter(t => !t.completed);
        this.render();
        this.customEvents.emit('completedCleared', completed);
    }
    
    private updateCounter(): void {
        const activeCount = this.todos.filter(t => !t.completed).length;
        const counter = this.container.querySelector('.todo-count')!;
        counter.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    }
    
    // パブリックAPI
    public on(event: string, listener: Function): () => void {
        return this.customEvents.on(event, listener);
    }
    
    public destroy(): void {
        this.eventManager.removeAllListeners();
        this.customEvents.removeAllListeners();
    }
}

// 使用例
const app = new TodoApp('app');

// アプリケーションイベントの監視
app.on('todoAdded', (todo) => {
    console.log('New todo added:', todo);
});

app.on('todoToggled', (todo) => {
    console.log('Todo toggled:', todo);
});
```

## まとめ

- TypeScriptを使用した型安全なDOM操作
- イベント管理とメモリリーク防止
- イベント委譲によるパフォーマンス向上
- コンポーネントベースのDOM構築
- 仮想スクロールなどの最適化技術
- 実践的なWebアプリケーションパターン

次のLessonでは、フォーム処理とバリデーションについて学習します。

## 参考リンク

- [MDN: DOM操作](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [MDN: Event handling](https://developer.mozilla.org/en-US/docs/Web/Events)
- [パフォーマンス最適化](https://web.dev/dom-performance/)