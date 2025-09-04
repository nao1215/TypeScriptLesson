/**
 * Lesson 51: ルーティングとナビゲーション (Routing & Navigation)
 * 
 * SPA向けの型安全なルーティングシステムの実装
 */

// =============================================================================
// 型定義
// =============================================================================

// コンポーネント型
export type ComponentType = new (...args: any[]) => any;
export type LazyComponent = () => Promise<{ default: ComponentType }>;

// ルートメタデータ
export interface RouteMeta {
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
  [key: string]: unknown;
}

// ルート定義
export interface Route {
  path: string;
  name?: string;
  component?: ComponentType;
  loader?: LazyComponent;
  guards?: RouteGuard[];
  beforeEnter?: RouteGuard;
  children?: Route[];
  meta?: RouteMeta;
  redirect?: string;
}

// ルートマッチ
export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  fullPath: string;
  matched: Route[];
}

// ナビゲーションオプション
export interface NavigationOptions {
  replace?: boolean;
  state?: unknown;
  preserveQuery?: boolean;
  preserveHash?: boolean;
  force?: boolean;
}

// ルートガード
export type RouteGuard = (
  to: RouteMatch,
  from: RouteMatch | null
) => boolean | Promise<boolean> | string | void;

// ナビゲーションフック
export type BeforeNavigate = (to: RouteMatch, from: RouteMatch | null) => boolean | Promise<boolean>;
export type AfterNavigate = (to: RouteMatch, from: RouteMatch | null) => void | Promise<void>;

// 履歴エントリ
export interface HistoryEntry {
  path: string;
  state?: unknown;
  timestamp: number;
}

// ルーターイベント
export interface RouterEvents {
  beforeNavigate: (to: RouteMatch, from: RouteMatch | null) => void;
  afterNavigate: (to: RouteMatch, from: RouteMatch | null) => void;
  navigationError: (error: NavigationError) => void;
  routeChanged: (route: RouteMatch) => void;
}

// =============================================================================
// エラークラス
// =============================================================================

export class NavigationError extends Error {
  constructor(
    message: string,
    public to: RouteMatch,
    public from: RouteMatch | null,
    public type: 'guard' | 'not-found' | 'load-error' = 'guard'
  ) {
    super(message);
    this.name = 'NavigationError';
  }
}

export class RouteNotFoundError extends NavigationError {
  constructor(path: string) {
    super(`Route not found: ${path}`, {} as RouteMatch, null, 'not-found');
    this.name = 'RouteNotFoundError';
  }
}

// =============================================================================
// パス解析ユーティリティ
// =============================================================================

export class PathMatcher {
  private static paramRegex = /:([^/]+)/g;
  private static wildcardRegex = /\*/g;

  static compile(path: string): RegExp {
    const pattern = path
      .replace(this.paramRegex, '([^/]+)')
      .replace(this.wildcardRegex, '(.*)');
    
    return new RegExp(`^${pattern}$`);
  }

  static extractParams(path: string, template: string): Record<string, string> {
    const params: Record<string, string> = {};
    const regex = this.compile(template);
    const match = path.match(regex);

    if (!match) return params;

    const paramNames = Array.from(template.matchAll(this.paramRegex)).map(m => m[1]);
    
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return params;
  }

  static matches(path: string, template: string): boolean {
    return this.compile(template).test(path);
  }

  static normalize(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }
}

export class QueryString {
  static parse(search: string): Record<string, string> {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    
    params.forEach((value, key) => {
      result[key] = value;
    });
    
    return result;
  }

  static stringify(params: Record<string, string>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }

  static merge(
    current: Record<string, string>,
    updates: Record<string, string>,
    preserve = false
  ): Record<string, string> {
    if (!preserve) return { ...updates };
    
    return { ...current, ...updates };
  }
}

// =============================================================================
// イベントエミッター
// =============================================================================

export class EventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private listeners: Partial<Record<keyof T, T[keyof T][]>> = {};

  on<K extends keyof T>(event: K, listener: T[K]): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event]!.push(listener);
    
    return () => this.off(event, listener);
  }

  off<K extends keyof T>(event: K, listener: T[K]): void {
    const eventListeners = this.listeners[event];
    if (!eventListeners) return;

    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    const eventListeners = this.listeners[event];
    if (!eventListeners) return;

    eventListeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in ${String(event)} listener:`, error);
      }
    });
  }

  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// =============================================================================
// History管理
// =============================================================================

export class RouterHistory {
  private entries: HistoryEntry[] = [];
  private currentIndex = -1;
  private maxSize: number;

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.initializeFromBrowser();
  }

  private initializeFromBrowser(): void {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    this.push(currentPath, window.history.state);
  }

  push(path: string, state?: unknown): void {
    const entry: HistoryEntry = {
      path: PathMatcher.normalize(path),
      state,
      timestamp: Date.now()
    };

    // 現在の位置以降のエントリを削除（新しいブランチを作成）
    this.entries = this.entries.slice(0, this.currentIndex + 1);
    this.entries.push(entry);
    this.currentIndex++;

    // サイズ制限の適用
    if (this.entries.length > this.maxSize) {
      this.entries.shift();
      this.currentIndex--;
    }
  }

  replace(path: string, state?: unknown): void {
    if (this.currentIndex >= 0) {
      this.entries[this.currentIndex] = {
        path: PathMatcher.normalize(path),
        state,
        timestamp: Date.now()
      };
    } else {
      this.push(path, state);
    }
  }

  back(): HistoryEntry | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.entries[this.currentIndex];
    }
    return null;
  }

  forward(): HistoryEntry | null {
    if (this.currentIndex < this.entries.length - 1) {
      this.currentIndex++;
      return this.entries[this.currentIndex];
    }
    return null;
  }

  go(delta: number): HistoryEntry | null {
    const newIndex = this.currentIndex + delta;
    if (newIndex >= 0 && newIndex < this.entries.length) {
      this.currentIndex = newIndex;
      return this.entries[this.currentIndex];
    }
    return null;
  }

  current(): HistoryEntry | null {
    return this.currentIndex >= 0 ? this.entries[this.currentIndex] : null;
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.entries.length - 1;
  }

  getEntries(): ReadonlyArray<HistoryEntry> {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
    this.currentIndex = -1;
  }
}

// =============================================================================
// メインルータークラス
// =============================================================================

export class Router extends EventEmitter<RouterEvents> {
  private routes: Route[] = [];
  private currentMatch: RouteMatch | null = null;
  private history: RouterHistory;
  private globalGuards: RouteGuard[] = [];
  private loadedComponents: Map<string, ComponentType> = new Map();
  private isNavigating = false;

  constructor(routes: Route[] = [], options: {
    historySize?: number;
    enableHashRouting?: boolean;
  } = {}) {
    super();
    this.routes = routes;
    this.history = new RouterHistory(options.historySize);
    this.setupBrowserEvents();
    this.initializeCurrentRoute();
  }

  private setupBrowserEvents(): void {
    window.addEventListener('popstate', (event) => {
      const path = window.location.pathname + window.location.search + window.location.hash;
      this.handleBrowserNavigation(path, event.state);
    });

    // ページ読み込み時とリフレッシュ時の処理
    window.addEventListener('load', () => {
      this.initializeCurrentRoute();
    });
  }

  private async handleBrowserNavigation(path: string, state?: unknown): Promise<void> {
    if (this.isNavigating) return;

    try {
      const match = this.matchRoute(path);
      if (match) {
        await this.performNavigation(match, this.currentMatch, { state });
      }
    } catch (error) {
      this.emit('navigationError', error as NavigationError);
    }
  }

  private initializeCurrentRoute(): void {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const match = this.matchRoute(currentPath);
    
    if (match) {
      this.currentMatch = match;
      this.emit('routeChanged', match);
    }
  }

  // ルート設定
  addRoute(route: Route): void {
    this.routes.push(route);
  }

  addRoutes(routes: Route[]): void {
    this.routes.push(...routes);
  }

  setRoutes(routes: Route[]): void {
    this.routes = routes;
  }

  // グローバルガード
  addGlobalGuard(guard: RouteGuard): void {
    this.globalGuards.push(guard);
  }

  removeGlobalGuard(guard: RouteGuard): void {
    const index = this.globalGuards.indexOf(guard);
    if (index > -1) {
      this.globalGuards.splice(index, 1);
    }
  }

  // ルートマッチング
  private matchRoute(path: string): RouteMatch | null {
    const [pathname, search = '', hash = ''] = path.split(/[?#]/);
    const normalizedPath = PathMatcher.normalize(pathname);
    
    for (const route of this.routes) {
      if (this.matchSingleRoute(route, normalizedPath)) {
        const params = PathMatcher.extractParams(normalizedPath, route.path);
        const query = QueryString.parse(search);
        
        return {
          route,
          params,
          query,
          hash: hash.startsWith('#') ? hash.slice(1) : hash,
          fullPath: path,
          matched: [route] // 単純化、実際はネストルートを考慮
        };
      }
    }
    
    return null;
  }

  private matchSingleRoute(route: Route, path: string): boolean {
    if (route.redirect) {
      return false;
    }
    
    return PathMatcher.matches(path, route.path);
  }

  // ナビゲーション実行
  async navigate(path: string, options: NavigationOptions = {}): Promise<void> {
    if (this.isNavigating) {
      throw new NavigationError('Navigation already in progress', {} as RouteMatch, this.currentMatch);
    }

    const match = this.matchRoute(path);
    if (!match) {
      throw new RouteNotFoundError(path);
    }

    await this.performNavigation(match, this.currentMatch, options);
  }

  private async performNavigation(
    to: RouteMatch,
    from: RouteMatch | null,
    options: NavigationOptions = {}
  ): Promise<void> {
    this.isNavigating = true;

    try {
      // Before navigation hook
      this.emit('beforeNavigate', to, from);

      // グローバルガード実行
      for (const guard of this.globalGuards) {
        const result = await this.executeGuard(guard, to, from);
        if (!this.handleGuardResult(result, to, from)) {
          return;
        }
      }

      // ルート固有のガード実行
      if (to.route.beforeEnter) {
        const result = await this.executeGuard(to.route.beforeEnter, to, from);
        if (!this.handleGuardResult(result, to, from)) {
          return;
        }
      }

      if (to.route.guards) {
        for (const guard of to.route.guards) {
          const result = await this.executeGuard(guard, to, from);
          if (!this.handleGuardResult(result, to, from)) {
            return;
          }
        }
      }

      // コンポーネントのロード
      await this.loadRouteComponent(to.route);

      // ブラウザ履歴の更新
      this.updateBrowserHistory(to.fullPath, options);

      // 内部状態の更新
      this.currentMatch = to;

      // After navigation hook
      this.emit('afterNavigate', to, from);
      this.emit('routeChanged', to);

    } catch (error) {
      this.emit('navigationError', error as NavigationError);
      throw error;
    } finally {
      this.isNavigating = false;
    }
  }

  private async executeGuard(
    guard: RouteGuard,
    to: RouteMatch,
    from: RouteMatch | null
  ): Promise<boolean | string | void> {
    try {
      return await guard(to, from);
    } catch (error) {
      throw new NavigationError(
        `Guard execution failed: ${(error as Error).message}`,
        to,
        from,
        'guard'
      );
    }
  }

  private handleGuardResult(
    result: boolean | string | void,
    to: RouteMatch,
    from: RouteMatch | null
  ): boolean {
    if (result === false) {
      return false;
    }

    if (typeof result === 'string') {
      // リダイレクト
      this.navigate(result, { replace: true });
      return false;
    }

    return true;
  }

  private async loadRouteComponent(route: Route): Promise<void> {
    if (route.component || this.loadedComponents.has(route.path)) {
      return;
    }

    if (route.loader) {
      try {
        const module = await route.loader();
        const component = module.default;
        this.loadedComponents.set(route.path, component);
        route.component = component;
      } catch (error) {
        throw new NavigationError(
          `Failed to load route component: ${(error as Error).message}`,
          {} as RouteMatch,
          this.currentMatch,
          'load-error'
        );
      }
    }
  }

  private updateBrowserHistory(path: string, options: NavigationOptions): void {
    const method = options.replace ? 'replaceState' : 'pushState';
    
    window.history[method](
      options.state || null,
      '',
      path
    );

    if (options.replace) {
      this.history.replace(path, options.state);
    } else {
      this.history.push(path, options.state);
    }
  }

  // ブラウザナビゲーション
  back(): void {
    window.history.back();
  }

  forward(): void {
    window.history.forward();
  }

  go(delta: number): void {
    window.history.go(delta);
  }

  // 現在のルート情報
  getCurrentMatch(): RouteMatch | null {
    return this.currentMatch;
  }

  getCurrentRoute(): Route | null {
    return this.currentMatch?.route || null;
  }

  getHistory(): ReadonlyArray<HistoryEntry> {
    return this.history.getEntries();
  }

  // ルート構築ヘルパー
  buildPath(name: string, params: Record<string, string> = {}, query: Record<string, string> = {}): string {
    const route = this.routes.find(r => r.name === name);
    if (!route) {
      throw new Error(`Route not found: ${name}`);
    }

    let path = route.path;
    
    // パラメータの置換
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });

    // クエリ文字列の追加
    const queryString = QueryString.stringify(query);
    if (queryString) {
      path += `?${queryString}`;
    }

    return path;
  }

  // パス解析ヘルパー
  resolve(path: string): RouteMatch | null {
    return this.matchRoute(path);
  }

  isActive(path: string, exact = false): boolean {
    if (!this.currentMatch) return false;

    if (exact) {
      return this.currentMatch.fullPath === path;
    }

    return this.currentMatch.fullPath.startsWith(path);
  }

  // クリーンアップ
  destroy(): void {
    this.removeAllListeners();
    this.history.clear();
    this.loadedComponents.clear();
    this.routes = [];
    this.currentMatch = null;
  }
}

// =============================================================================
// よく使われるルートガード
// =============================================================================

export const createAuthGuard = (
  isAuthenticated: () => boolean,
  loginPath = '/login'
): RouteGuard => {
  return (to, from) => {
    if (!isAuthenticated()) {
      return loginPath;
    }
    return true;
  };
};

export const createRoleGuard = (
  getUserRoles: () => string[],
  requiredRoles: string[]
): RouteGuard => {
  return (to, from) => {
    const userRoles = getUserRoles();
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      throw new NavigationError(
        'Insufficient permissions',
        to,
        from,
        'guard'
      );
    }
    
    return true;
  };
};

export const createConfirmGuard = (
  message: string,
  condition: (to: RouteMatch, from: RouteMatch | null) => boolean
): RouteGuard => {
  return (to, from) => {
    if (condition(to, from)) {
      return window.confirm(message);
    }
    return true;
  };
};

// =============================================================================
// ルーターインスタンス作成ヘルパー
// =============================================================================

export function createRouter(routes: Route[], options: {
  historySize?: number;
  enableHashRouting?: boolean;
  globalGuards?: RouteGuard[];
} = {}): Router {
  const router = new Router(routes, options);
  
  if (options.globalGuards) {
    options.globalGuards.forEach(guard => {
      router.addGlobalGuard(guard);
    });
  }

  return router;
}

// =============================================================================
// 使用例
// =============================================================================

export function demonstrateRouting(): void {
  console.log('=== ルーティングとナビゲーションのデモンストレーション ===\n');

  // ルート定義
  const routes: Route[] = [
    {
      path: '/',
      name: 'home',
      component: class HomePage {},
      meta: { title: 'Home Page' }
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: class UserDetailPage {},
      guards: [createAuthGuard(() => true)],
      meta: { title: 'User Detail', requiresAuth: true }
    },
    {
      path: '/admin/*',
      name: 'admin',
      loader: async () => ({ default: class AdminPage {} }),
      guards: [
        createAuthGuard(() => true),
        createRoleGuard(() => ['admin'], ['admin'])
      ],
      meta: { title: 'Admin Panel', roles: ['admin'] }
    },
    {
      path: '/profile',
      name: 'profile',
      component: class ProfilePage {},
      beforeEnter: createConfirmGuard(
        '変更が保存されていません。続行しますか？',
        () => false // 実際は状態をチェック
      )
    }
  ];

  // ルーター作成
  const router = createRouter(routes, {
    historySize: 100,
    globalGuards: [
      // グローバル認証ガード
      (to, from) => {
        console.log(`Navigating from ${from?.fullPath || 'null'} to ${to.fullPath}`);
        return true;
      }
    ]
  });

  // イベントリスナー設定
  router.on('beforeNavigate', (to, from) => {
    console.log('Before navigate:', { to: to.fullPath, from: from?.fullPath });
    
    // タイトルの更新
    if (to.route.meta?.title) {
      document.title = to.route.meta.title;
    }
  });

  router.on('afterNavigate', (to, from) => {
    console.log('After navigate:', { to: to.fullPath, from: from?.fullPath });
  });

  router.on('navigationError', (error) => {
    console.error('Navigation error:', error);
  });

  // プログラマティックナビゲーション例
  console.log('1. 基本ナビゲーション');
  try {
    // router.navigate('/');
    console.log('ホームページに遷移 (ブラウザ環境が必要)');
  } catch (error) {
    console.log('ナビゲーションエラー:', (error as Error).message);
  }

  console.log('\n2. パラメータ付きナビゲーション');
  try {
    // router.navigate('/users/123?tab=profile#section1');
    console.log('ユーザー詳細ページに遷移 (パラメータ付き)');
  } catch (error) {
    console.log('ナビゲーションエラー:', (error as Error).message);
  }

  console.log('\n3. パス構築');
  try {
    const userPath = router.buildPath('user-detail', { id: '456' }, { tab: 'settings' });
    console.log('構築されたパス:', userPath);
  } catch (error) {
    console.log('パス構築エラー:', (error as Error).message);
  }

  console.log('\n4. ルートマッチング');
  const match = router.resolve('/users/789?tab=info');
  if (match) {
    console.log('マッチした ルート:', {
      path: match.route.path,
      params: match.params,
      query: match.query
    });
  }

  console.log('\n5. 履歴管理');
  const history = router.getHistory();
  console.log('履歴エントリ数:', history.length);

  // パスマッチャーのデモ
  console.log('\n6. パスマッチングユーティリティ');
  console.log('パスマッチング:', PathMatcher.matches('/users/123', '/users/:id')); // true
  console.log('パラメータ抽出:', PathMatcher.extractParams('/users/123', '/users/:id')); // { id: '123' }
  console.log('パス正規化:', PathMatcher.normalize('/path//to///resource/')); // /path/to/resource

  // クエリ文字列のデモ
  console.log('\n7. クエリ文字列ユーティリティ');
  const queryParams = QueryString.parse('?name=John&age=30&tags=typescript&tags=routing');
  console.log('解析されたクエリ:', queryParams);
  
  const queryString = QueryString.stringify({ search: 'TypeScript', page: '2' });
  console.log('生成されたクエリ文字列:', queryString);
}

// デモの実行
if (typeof window === 'undefined') {
  // Node.js環境では制限されたデモのみ実行
  console.log('ルーティングシステムは主にブラウザ環境で動作します');
  
  // ユーティリティ関数のテスト
  console.log('\n=== ユーティリティ関数のテスト ===');
  demonstrateRouting();
}