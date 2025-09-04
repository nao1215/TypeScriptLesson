/**
 * Lesson 63: デバッグ技術 (Debugging Techniques) - 解答例
 * 
 * このファイルは演習問題の解答例と、デバッグベストプラクティスの実装例です。
 */

import {
  BrowserDebugger,
  AutoDebugger,
  NetworkDebugger,
  PerformanceAnalyzer,
  ErrorTracker,
  DebugManager
} from './index';

// =============================================================================
// 解答1: ブラウザデバッグ基礎
// =============================================================================

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', isActive: true },
  { id: 2, name: 'Bob', email: 'bob@example.com', isActive: false },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', isActive: true }
];

/**
 * 解答1: バグを修正したfindUserById関数
 * 
 * 問題: ループの境界条件エラー (i <= users.length)
 * 修正: i < users.length に変更
 */
export function findUserByIdFixed(id: number): User | null {
  // デバッグログを追加
  console.log(`🔍 Searching for user with ID: ${id}`);
  
  for (let i = 0; i < users.length; i++) { // 修正: <= から < に変更
    console.log(`🔍 Checking user at index ${i}:`, users[i]);
    
    if (users[i].id === id) {
      console.log(`✅ User found:`, users[i]);
      return users[i];
    }
  }
  
  console.log(`❌ User with ID ${id} not found`);
  return null;
}

/**
 * デバッグプロセスを含むバージョン
 */
export function findUserByIdWithDebugger(id: number): User | null {
  // 条件付きブレークポイントの設定
  BrowserDebugger.setBreakpoint('id === 2'); // ID=2の時だけブレークポイント
  
  console.log(`🔍 Searching for user with ID: ${id}`);
  
  for (let i = 0; i < users.length; i++) {
    // 変数の状態をログ
    console.log(`Loop iteration ${i}:`, {
      currentIndex: i,
      currentUser: users[i],
      searchId: id,
      isMatch: users[i]?.id === id
    });
    
    if (users[i] && users[i].id === id) { // 安全性チェックを追加
      return users[i];
    }
  }
  
  return null;
}

// =============================================================================
// 解答2: パフォーマンス問題の修正
// =============================================================================

/**
 * 解答2-1: メモ化を使った効率的なFibonacci実装
 */
const fibonacciCache = new Map<number, number>();

export function calculateFibonacciOptimized(n: number): number {
  // キャッシュから値を取得
  if (fibonacciCache.has(n)) {
    return fibonacciCache.get(n)!;
  }
  
  // ベースケース
  if (n <= 1) {
    fibonacciCache.set(n, n);
    return n;
  }
  
  // 再帰計算
  const result = calculateFibonacciOptimized(n - 1) + calculateFibonacciOptimized(n - 2);
  fibonacciCache.set(n, result);
  
  return result;
}

/**
 * 解答2-2: 反復的な実装（さらに効率的）
 */
export function calculateFibonacciIterative(n: number): number {
  if (n <= 1) return n;
  
  let a = 0;
  let b = 1;
  
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}

/**
 * パフォーマンス比較テスト
 */
export function performanceComparisonTest(): void {
  console.log('=== 解答2: Fibonacciパフォーマンス比較 ===');
  
  const testNumber = 40;
  
  // 最適化前（小さい数値でテスト）
  const originalResult = BrowserDebugger.measurePerformance('Original Fibonacci (n=30)', () => {
    return calculateFibonacciOriginal(30); // 安全な数値
  });
  
  // メモ化版
  const memoizedResult = BrowserDebugger.measurePerformance('Memoized Fibonacci', () => {
    return calculateFibonacciOptimized(testNumber);
  });
  
  // 反復版
  const iterativeResult = BrowserDebugger.measurePerformance('Iterative Fibonacci', () => {
    return calculateFibonacciIterative(testNumber);
  });
  
  console.log('Results:', { originalResult, memoizedResult, iterativeResult });
  
  // メモリ使用量の確認
  BrowserDebugger.logMemoryUsage('After Fibonacci calculations');
}

// 元の非効率な実装（比較用）
function calculateFibonacciOriginal(n: number): number {
  if (n <= 1) return n;
  return calculateFibonacciOriginal(n - 1) + calculateFibonacciOriginal(n - 2);
}

// =============================================================================
// 解答3: メモリリーク問題の修正
// =============================================================================

/**
 * 解答3: メモリリークを修正したEventManager
 */
export class EventManagerFixed {
  private listeners: Map<string, Function[]> = new Map();
  private intervalId?: NodeJS.Timeout;
  private isDestroyed = false;

  constructor() {
    this.intervalId = setInterval(() => {
      if (!this.isDestroyed) {
        console.log('EventManager heartbeat:', new Date());
      }
    }, 1000);
    
    console.log('🎉 EventManager created with interval ID:', this.intervalId);
  }

  addEventListener(event: string, callback: Function): void {
    if (this.isDestroyed) {
      console.warn('Cannot add listener to destroyed EventManager');
      return;
    }
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    console.log(`📢 Added listener for event: ${event}`);
  }

  removeEventListener(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`🗑️ Removed listener for event: ${event}`);
        
        // 空の配列を削除
        if (callbacks.length === 0) {
          this.listeners.delete(event);
        }
      }
    }
  }

  emit(event: string, data?: any): void {
    if (this.isDestroyed) {
      console.warn('Cannot emit event on destroyed EventManager');
      return;
    }
    
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 修正された破棄メソッド
   */
  destroy(): void {
    if (this.isDestroyed) {
      console.warn('EventManager is already destroyed');
      return;
    }
    
    console.log('🗑️ Destroying EventManager...');
    
    // インターバルをクリア
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('✅ Interval cleared');
    }
    
    // リスナーをクリア
    this.listeners.clear();
    console.log('✅ Listeners cleared');
    
    // 破棄フラグを設定
    this.isDestroyed = true;
    
    console.log('✅ EventManager destroyed successfully');
  }

  // デバッグ用メソッド
  getDebugInfo(): object {
    return {
      isDestroyed: this.isDestroyed,
      listenerCount: this.listeners.size,
      hasInterval: !!this.intervalId,
      events: Array.from(this.listeners.keys())
    };
  }
}

/**
 * メモリリークテストの修正版
 */
export function memoryLeakTestFixed(): void {
  console.log('=== 解答3: メモリリーク修正テスト ===');
  
  const managers: EventManagerFixed[] = [];
  
  // 初期メモリ使用量
  BrowserDebugger.logMemoryUsage('Before creating managers');
  
  // EventManagerインスタンスを作成
  for (let i = 0; i < 10; i++) { // 数を減らして観察しやすく
    const manager = new EventManagerFixed();
    manager.addEventListener('test', (data) => {
      console.log(`Manager ${i} received:`, data);
    });
    managers.push(manager);
  }
  
  BrowserDebugger.logMemoryUsage('After creating managers');
  
  // 適切な破棄処理
  setTimeout(() => {
    console.log('🗑️ Destroying managers...');
    
    for (let i = 0; i < managers.length; i++) {
      console.log(`Destroying manager ${i}:`, managers[i].getDebugInfo());
      managers[i].destroy();
    }
    
    BrowserDebugger.logMemoryUsage('After destroying managers');
    
    // ガベージコレクションを促進
    BrowserDebugger.forceGC();
    
    setTimeout(() => {
      BrowserDebugger.logMemoryUsage('After GC');
    }, 1000);
    
  }, 5000);
}

// =============================================================================
// 解答4: 非同期エラーハンドリングの改善
// =============================================================================

interface APIResponse {
  id: number;
  title: string;
  body: string;
}

/**
 * 解答4-1: 改善されたfetchPostData関数
 */
export async function fetchPostDataFixed(postId: number): Promise<APIResponse> {
  const debugManager = DebugManager.getInstance();
  
  try {
    console.log(`🌐 Fetching post ${postId}...`);
    
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
    
    // HTTPステータスチェックを追加
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      debugManager.errors.captureError({
        message: error.message,
        stack: error.stack || '',
        filename: __filename,
        lineno: 0,
        colno: 0,
        error,
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        sessionId: Math.random().toString(36),
        breadcrumbs: [],
        context: { 
          postId, 
          status: response.status, 
          statusText: response.statusText 
        }
      });
      throw error;
    }
    
    const data = await response.json();
    
    // レスポンスデータの検証
    if (!data || typeof data.id !== 'number') {
      throw new Error('Invalid response data format');
    }
    
    console.log(`✅ Successfully fetched post ${postId}`);
    return data;
    
  } catch (error) {
    console.error(`❌ Failed to fetch post ${postId}:`, error);
    
    // ネットワークエラーの記録
    debugManager.errors.recordNetworkRequest(
      `https://jsonplaceholder.typicode.com/posts/${postId}`,
      'GET',
      error instanceof Error && error.message.includes('status:') 
        ? parseInt(error.message.split('status: ')[1]) 
        : 0
    );
    
    throw error;
  }
}

/**
 * 解答4-2: Promise.allSettledを使った改善版
 */
export async function fetchMultiplePostsFixed(postIds: number[]): Promise<{
  successful: APIResponse[];
  failed: Array<{ postId: number; error: Error }>;
}> {
  console.log(`🌐 Fetching ${postIds.length} posts...`);
  
  const promises = postIds.map(async (id) => {
    try {
      const data = await fetchPostDataFixed(id);
      return { status: 'fulfilled' as const, value: data, postId: id };
    } catch (error) {
      return { status: 'rejected' as const, reason: error, postId: id };
    }
  });
  
  const results = await Promise.allSettled(promises);
  
  const successful: APIResponse[] = [];
  const failed: Array<{ postId: number; error: Error }> = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
      successful.push(result.value.value);
    } else {
      const postId = postIds[index];
      const error = result.status === 'fulfilled' 
        ? result.value.reason 
        : result.reason;
      failed.push({ postId, error });
    }
  });
  
  console.log(`✅ Fetched ${successful.length} posts successfully, ${failed.length} failed`);
  
  return { successful, failed };
}

/**
 * 改善された非同期エラーテスト
 */
export async function asyncErrorTestFixed(): Promise<void> {
  console.log('=== 解答4: 改善された非同期エラーテスト ===');
  
  const debugManager = DebugManager.getInstance();
  
  // パンくずリストを記録
  debugManager.errors.recordUserAction('Starting async error test');
  
  try {
    const { successful, failed } = await fetchMultiplePostsFixed([1, 999, 2, 1001, 3]);
    
    console.log('Successful posts:', successful);
    console.log('Failed posts:', failed);
    
    // エラー統計の表示
    const errorStats = debugManager.errors.getErrorStats();
    console.log('Error statistics:', errorStats);
    
  } catch (error) {
    console.error('Unexpected error in async test:', error);
  }
}

// =============================================================================
// 解答5: ショッピングカートの修正
// =============================================================================

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * 解答5: バグを修正したShoppingCart
 */
export class ShoppingCartFixed {
  private items: CartItem[] = [];
  private discountRate = 0;
  private debugMode = false;

  constructor(debugMode = false) {
    this.debugMode = debugMode;
    if (this.debugMode) {
      console.log('🛒 ShoppingCart created with debug mode enabled');
    }
  }

  addItem(product: Product, quantity: number): void {
    // 入力検証を追加
    if (!product || typeof product.id !== 'number') {
      throw new Error('Invalid product');
    }
    
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    
    if (quantity > product.stock) {
      throw new Error(`Not enough stock. Available: ${product.stock}, Requested: ${quantity}`);
    }
    
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // 在庫チェック
      if (newQuantity > product.stock) {
        throw new Error(`Not enough stock. Available: ${product.stock}, Total requested: ${newQuantity}`);
      }
      
      existingItem.quantity = newQuantity;
      
      if (this.debugMode) {
        console.log(`📦 Updated quantity for ${product.name}: ${existingItem.quantity}`);
      }
    } else {
      this.items.push({ 
        product: { ...product }, // ディープコピーで参照問題を回避
        quantity 
      });
      
      if (this.debugMode) {
        console.log(`➕ Added new item: ${product.name} x${quantity}`);
      }
    }
  }

  removeItem(productId: number): void {
    const initialLength = this.items.length;
    
    // 逆順でループして安全に削除
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].product.id === productId) {
        const removedItem = this.items[i];
        this.items.splice(i, 1);
        
        if (this.debugMode) {
          console.log(`🗑️ Removed item: ${removedItem.product.name}`);
        }
      }
    }
    
    if (this.items.length === initialLength && this.debugMode) {
      console.log(`⚠️ No items found with product ID: ${productId}`);
    }
  }

  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }
    
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      if (newQuantity > item.product.stock) {
        throw new Error(`Not enough stock. Available: ${item.product.stock}, Requested: ${newQuantity}`);
      }
      
      item.quantity = newQuantity;
      
      if (this.debugMode) {
        console.log(`🔄 Updated quantity for ${item.product.name}: ${newQuantity}`);
      }
    } else {
      throw new Error(`Product with ID ${productId} not found in cart`);
    }
  }

  applyDiscount(rate: number): void {
    // 入力検証を強化
    if (typeof rate !== 'number' || isNaN(rate)) {
      throw new Error('Discount rate must be a valid number');
    }
    
    if (rate < 0 || rate > 1) {
      throw new Error('Discount rate must be between 0 and 1');
    }
    
    this.discountRate = rate;
    
    if (this.debugMode) {
      console.log(`💰 Applied discount: ${(rate * 100).toFixed(1)}%`);
    }
  }

  calculateSubtotal(): number {
    let subtotal = 0;
    
    for (const item of this.items) {
      if (item.product.price < 0) {
        console.warn(`⚠️ Negative price detected for ${item.product.name}`);
      }
      subtotal += item.product.price * item.quantity;
    }
    
    return Math.round(subtotal * 100) / 100; // 浮動小数点誤差を回避
  }

  calculateDiscount(): number {
    const subtotal = this.calculateSubtotal();
    return Math.round(subtotal * this.discountRate * 100) / 100;
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const total = subtotal - discount;
    
    if (this.debugMode) {
      console.log(`💰 Calculation: Subtotal=${subtotal}, Discount=${discount}, Total=${total}`);
    }
    
    return Math.max(0, Math.round(total * 100) / 100); // 負の値を防ぎ、浮動小数点誤差を回避
  }

  getItems(): CartItem[] {
    return this.items.map(item => ({
      product: { ...item.product }, // ディープコピー
      quantity: item.quantity
    }));
  }

  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
    this.discountRate = 0;
    
    if (this.debugMode) {
      console.log('🗑️ Cart cleared');
    }
  }

  // デバッグ用メソッド
  getDebugInfo(): object {
    return {
      itemCount: this.items.length,
      totalQuantity: this.getItemCount(),
      subtotal: this.calculateSubtotal(),
      discountRate: this.discountRate,
      discount: this.calculateDiscount(),
      total: this.calculateTotal(),
      items: this.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        lineTotal: item.product.price * item.quantity
      }))
    };
  }
}

// テスト用データ
const sampleProducts: Product[] = [
  { id: 1, name: 'Laptop', price: 1000, stock: 5 },
  { id: 2, name: 'Mouse', price: 50, stock: 10 },
  { id: 3, name: 'Keyboard', price: 100, stock: 8 }
];

/**
 * 修正されたショッピングカートテスト
 */
export function shoppingCartTestFixed(): void {
  console.log('=== 解答5: 修正されたショッピングカートテスト ===');
  
  const cart = new ShoppingCartFixed(true); // デバッグモード有効
  
  try {
    console.log('\n📦 商品追加テスト');
    cart.addItem(sampleProducts[0], 1); // Laptop x1
    cart.addItem(sampleProducts[1], 2); // Mouse x2
    cart.addItem(sampleProducts[0], 1); // Laptop x1 (既存に追加)
    
    console.log('カート内容:', cart.getDebugInfo());
    
    console.log('\n💰 割引適用テスト');
    cart.applyDiscount(0.1); // 10%割引
    console.log('割引後の詳細:', cart.getDebugInfo());
    
    console.log('\n🔄 数量更新テスト');
    cart.updateQuantity(1, 1); // Laptopを1個に変更
    console.log('数量更新後:', cart.getDebugInfo());
    
    console.log('\n🗑️ 商品削除テスト');
    cart.removeItem(2); // Mouseを削除
    console.log('削除後:', cart.getDebugInfo());
    
    console.log('\n⚠️ エラーケーステスト');
    try {
      cart.addItem(sampleProducts[0], 10); // 在庫不足エラー
    } catch (error) {
      console.log('期待されたエラー:', error.message);
    }
    
    try {
      cart.applyDiscount(1.5); // 無効な割引率エラー
    } catch (error) {
      console.log('期待されたエラー:', error.message);
    }
    
    console.log('\n✅ 最終状態:', cart.getDebugInfo());
    
  } catch (error) {
    console.error('予期しないエラーが発生しました:', error);
  }
}

// =============================================================================
// 解答の実行とベストプラクティス
// =============================================================================

/**
 * デバッグベストプラクティスのデモンストレーション
 */
export class DebuggingBestPractices {
  private static debugManager = DebugManager.getInstance();

  /**
   * 1. ログの構造化
   */
  static structuredLogging(): void {
    console.log('=== デバッグベストプラクティス: 構造化ログ ===');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'User action performed',
      userId: 'user-123',
      action: 'button_click',
      metadata: {
        buttonId: 'submit-btn',
        page: '/checkout',
        sessionId: 'session-456'
      }
    };
    
    console.log('構造化ログの例:', JSON.stringify(logEntry, null, 2));
  }

  /**
   * 2. 条件付きデバッグ
   */
  static conditionalDebugging(): void {
    console.log('=== デバッグベストプラクティス: 条件付きデバッグ ===');
    
    const debugEnabled = process.env.NODE_ENV === 'development' || 
                         typeof window !== 'undefined' && window.location.search.includes('debug=true');
    
    if (debugEnabled) {
      console.log('🐛 Debug mode enabled');
      
      // 自動デバッガーでの条件付きブレークポイント設定例
      const autoDebugger = AutoDebugger.getInstance();
      autoDebugger.addConditionalBreakpoint('highMemoryUsage', () => {
        if (typeof window !== 'undefined' && 'memory' in performance) {
          const memory = (performance as any).memory;
          const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
          return usagePercent > 80; // 80%以上でブレークポイント
        }
        return false;
      });
    }
  }

  /**
   * 3. パフォーマンス監視の統合
   */
  static integratePerformanceMonitoring(): void {
    console.log('=== デバッグベストプラクティス: パフォーマンス監視 ===');
    
    // 重要な処理のパフォーマンス監視
    const monitoredFunction = BrowserDebugger.measurePerformance('criticalOperation', () => {
      // 重い処理のシミュレーション
      let result = 0;
      for (let i = 0; i < 100000; i++) {
        result += Math.random();
      }
      return result;
    });
    
    console.log('監視された処理の結果:', monitoredFunction);
  }

  /**
   * 4. エラー境界の実装
   */
  static implementErrorBoundaries(): void {
    console.log('=== デバッグベストプラクティス: エラー境界 ===');
    
    const errorBoundary = (fn: () => any, context: string) => {
      try {
        return fn();
      } catch (error) {
        // エラー情報をキャプチャ
        this.debugManager.errors.captureError({
          message: error.message,
          stack: error.stack || '',
          filename: __filename,
          lineno: 0,
          colno: 0,
          error,
          timestamp: new Date(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
          url: typeof window !== 'undefined' ? window.location.href : 'N/A',
          sessionId: Math.random().toString(36),
          breadcrumbs: [],
          context: { errorBoundary: context }
        });
        
        // フォールバック値を返すか、エラーを再スロー
        console.error(`Error in ${context}:`, error);
        return null;
      }
    };
    
    // 使用例
    const safeResult = errorBoundary(() => {
      throw new Error('Simulated error');
    }, 'safeOperation');
    
    console.log('Error boundary result:', safeResult);
  }

  /**
   * 全てのベストプラクティスを実行
   */
  static runAllBestPractices(): void {
    console.log('🎯 Running all debugging best practices...\n');
    
    this.structuredLogging();
    console.log('');
    
    this.conditionalDebugging();
    console.log('');
    
    this.integratePerformanceMonitoring();
    console.log('');
    
    this.implementErrorBoundaries();
    console.log('');
    
    console.log('✅ All best practices demonstrated');
  }
}

/**
 * 全ての解答と実演の実行
 */
export function runAllSolutions(): void {
  console.log('🎯 Lesson 63: デバッグ技術解答例を開始します...\n');

  // 解答1: ブラウザデバッグ基礎
  console.log('User found:', findUserByIdFixed(1));
  console.log('User not found:', findUserByIdFixed(999));
  console.log('');

  // 解答2: パフォーマンス問題
  performanceComparisonTest();
  console.log('');

  // 解答3: メモリリーク問題
  memoryLeakTestFixed();
  console.log('');

  // 解答4: 非同期エラーハンドリング
  asyncErrorTestFixed();
  console.log('');

  // 解答5: ショッピングカート
  shoppingCartTestFixed();
  console.log('');

  // ベストプラクティス
  DebuggingBestPractices.runAllBestPractices();

  console.log('✅ 全ての解答例が完了しました。');
}

// Node.js環境での実行時は自動で解答を実行
if (typeof window === 'undefined' && require.main === module) {
  runAllSolutions();
}