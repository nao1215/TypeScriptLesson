/**
 * Lesson 63: デバッグ技術 (Debugging Techniques) - 演習問題
 * 
 * このファイルは、デバッグ技術の習得を目的とした実践的な演習問題です。
 * 各関数には意図的にバグや最適化の余地が含まれています。
 */

// =============================================================================
// 演習1: ブラウザデバッグ基礎
// =============================================================================

/**
 * 演習1: 以下の関数にはバグがあります。デバッガーを使って問題を特定し、修正してください。
 * 
 * 要求仕様:
 * - ユーザーリストから指定されたIDのユーザーを検索
 * - 見つからない場合はnullを返す
 * - ユーザーが見つかった場合はユーザー情報を返す
 */

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

// TODO: この関数にバグがあります。デバッガーを使って特定し、修正してください
export function findUserById(id: number): User | null {
  for (let i = 0; i <= users.length; i++) { // バグ: 境界条件エラー
    if (users[i].id === id) {
      return users[i];
    }
  }
  return null;
}

// デバッグのヒント:
// 1. BrowserDebugger.setBreakpoint() を使用してブレークポイントを設定
// 2. ループの境界条件を確認
// 3. users[i] がundefinedになるケースを調査

/**
 * 演習1のテスト関数
 */
export function testFindUserById(): void {
  console.log('=== 演習1: findUserById テスト ===');
  
  try {
    console.log('User 1:', findUserById(1));
    console.log('User 2:', findUserById(2));
    console.log('User 999:', findUserById(999));
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// =============================================================================
// 演習2: パフォーマンス問題の特定
// =============================================================================

/**
 * 演習2: 以下の関数には深刻なパフォーマンス問題があります。
 * パフォーマンスプロファイラーを使って問題を特定し、最適化してください。
 */

// TODO: この関数のパフォーマンス問題を特定し、最適化してください
export function calculateFibonacci(n: number): number {
  if (n <= 1) return n;
  
  // 非効率な再帰実装（意図的なパフォーマンス問題）
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

// パフォーマンステスト用の関数
export function performanceFibonacciTest(): void {
  console.log('=== 演習2: Fibonacci パフォーマンステスト ===');
  
  // BrowserDebugger.measurePerformance を使ってパフォーマンスを測定
  const result = calculateFibonacci(35);
  console.log('Result:', result);
}

// 最適化のヒント:
// 1. BrowserDebugger.measurePerformance() でパフォーマンスを測定
// 2. メモ化（memoization）の導入を検討
// 3. 反復的な解法への変更を検討

// =============================================================================
// 演習3: メモリリーク問題
// =============================================================================

/**
 * 演習3: 以下のクラスにはメモリリークの問題があります。
 * メモリプロファイラーを使って問題を特定し、修正してください。
 */

// TODO: メモリリークの問題を修正してください
export class EventManager {
  private listeners: Map<string, Function[]> = new Map();
  private intervalId?: NodeJS.Timeout;

  constructor() {
    // 意図的なメモリリーク: インターバルが適切にクリアされない
    this.intervalId = setInterval(() => {
      console.log('EventManager heartbeat:', new Date());
    }, 1000);
  }

  addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // TODO: destroyメソッドを適切に実装してメモリリークを防ぐ
  destroy(): void {
    // 実装が不完全
    this.listeners.clear();
    // intervalIdのクリアが抜けている
  }
}

// メモリリークテスト用の関数
export function memoryLeakTest(): void {
  console.log('=== 演習3: メモリリークテスト ===');
  
  const managers: EventManager[] = [];
  
  // 大量のEventManagerインスタンスを作成
  for (let i = 0; i < 100; i++) {
    const manager = new EventManager();
    manager.addEventListener('test', (data) => {
      console.log(`Manager ${i} received:`, data);
    });
    managers.push(manager);
  }

  // 一部を破棄（不適切な破棄）
  for (let i = 0; i < 50; i++) {
    managers[i].destroy(); // 不完全な破棄
  }

  // PerformanceAnalyzer.detectMemoryLeaks() を使ってメモリリークを検出
  console.log('メモリリーク検出を開始...');
}

// =============================================================================
// 演習4: 非同期エラーハンドリング
// =============================================================================

/**
 * 演習4: 以下の非同期処理にはエラーハンドリングの問題があります。
 * エラートラッキングシステムを使って問題を特定し、修正してください。
 */

interface APIResponse {
  id: number;
  title: string;
  body: string;
}

// TODO: エラーハンドリングを改善してください
export async function fetchPostData(postId: number): Promise<APIResponse> {
  // 意図的な問題: エラーハンドリングが不完全
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  
  // レスポンスのステータスチェックが不完全
  const data = await response.json();
  return data;
}

// 複数の投稿を並列取得する関数（エラーハンドリングの問題あり）
export async function fetchMultiplePosts(postIds: number[]): Promise<APIResponse[]> {
  // Promise.all使用時のエラーハンドリングが不適切
  const promises = postIds.map(id => fetchPostData(id));
  return Promise.all(promises);
}

// 非同期エラーテスト用の関数
export async function asyncErrorTest(): Promise<void> {
  console.log('=== 演習4: 非同期エラーテスト ===');
  
  try {
    // 存在しない投稿IDでテスト
    const invalidPosts = await fetchMultiplePosts([1, 999, 2]);
    console.log('Posts:', invalidPosts);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 修正のヒント:
// 1. HTTPステータスコードの適切なチェック
// 2. Promise.allSettled()の使用を検討
// 3. ErrorTrackerを使ってエラー情報を収集
// 4. ネットワークエラーと論理エラーの区別

// =============================================================================
// 演習5: 複雑なデバッグシナリオ
// =============================================================================

/**
 * 演習5: ショッピングカート機能にバグがあります。
 * 統合デバッグツールを使って問題を特定し、修正してください。
 */

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

export class ShoppingCart {
  private items: CartItem[] = [];
  private discountRate = 0;

  addItem(product: Product, quantity: number): void {
    // TODO: バグがあります。同じ商品を複数回追加すると問題が発生します
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }

  removeItem(productId: number): void {
    // TODO: 削除時のインデックス処理にバグがあります
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].product.id === productId) {
        this.items.splice(i, 1);
        i--; // この行が抜けている場合がある
      }
    }
  }

  applyDiscount(rate: number): void {
    // TODO: 割引率の検証が不十分です
    this.discountRate = rate;
  }

  calculateTotal(): number {
    // TODO: 計算ロジックにバグがあります
    let total = 0;
    
    for (const item of this.items) {
      total += item.product.price * item.quantity;
    }
    
    // 割引適用
    total *= (1 - this.discountRate);
    
    return total;
  }

  getItems(): CartItem[] {
    return this.items;
  }
}

// テスト用データ
const sampleProducts: Product[] = [
  { id: 1, name: 'Laptop', price: 1000, stock: 5 },
  { id: 2, name: 'Mouse', price: 50, stock: 10 },
  { id: 3, name: 'Keyboard', price: 100, stock: 8 }
];

// ショッピングカートテスト用の関数
export function shoppingCartTest(): void {
  console.log('=== 演習5: ショッピングカートテスト ===');
  
  const cart = new ShoppingCart();
  
  try {
    // 商品を追加
    cart.addItem(sampleProducts[0], 1);
    cart.addItem(sampleProducts[1], 2);
    cart.addItem(sampleProducts[0], 1); // 同じ商品を再度追加
    
    console.log('カート内容:', cart.getItems());
    console.log('合計金額:', cart.calculateTotal());
    
    // 割引を適用
    cart.applyDiscount(0.1); // 10%割引
    console.log('割引後合計:', cart.calculateTotal());
    
    // 商品を削除
    cart.removeItem(1);
    console.log('削除後カート内容:', cart.getItems());
    console.log('削除後合計金額:', cart.calculateTotal());
    
  } catch (error) {
    console.error('ショッピングカートでエラーが発生しました:', error);
  }
}

// =============================================================================
// 全演習の実行
// =============================================================================

/**
 * 全ての演習を実行する関数
 */
export function runAllExercises(): void {
  console.log('🎯 Lesson 63: デバッグ技術演習を開始します...\n');

  // 演習1: ブラウザデバッグ基礎
  testFindUserById();
  console.log('');

  // 演習2: パフォーマンス問題
  performanceFibonacciTest();
  console.log('');

  // 演習3: メモリリーク問題
  memoryLeakTest();
  console.log('');

  // 演習4: 非同期エラーハンドリング
  asyncErrorTest();
  console.log('');

  // 演習5: 複雑なデバッグシナリオ
  shoppingCartTest();
  console.log('');

  console.log('✅ 全ての演習が完了しました。デバッグツールを使って各問題を解決してください。');
}

// =============================================================================
// デバッグ練習用のヘルパー関数
// =============================================================================

/**
 * デバッグ練習用のヘルパークラス
 */
export class DebugExerciseHelper {
  static logExecutionFlow(functionName: string, step: string): void {
    console.log(`🔍 [${functionName}] ${step}`);
  }

  static logVariableState(variableName: string, value: any): void {
    console.log(`📊 ${variableName}:`, JSON.stringify(value, null, 2));
  }

  static createPerformanceTest(name: string, iterations: number, fn: () => void): void {
    console.time(name);
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    console.timeEnd(name);
  }

  static createMemorySnapshot(label: string): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`🧠 [${label}] Memory: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }
  }
}

// Node.js環境での実行時は自動で演習を実行
if (typeof window === 'undefined' && require.main === module) {
  runAllExercises();
}