# Lesson 40: パフォーマンス最適化 (Performance Optimization)

## 学習目標
- TypeScriptコンパイラーのパフォーマンス最適化
- 型チェックパフォーマンスのベストプラクティス
- バンドルサイズ最適化テクニック
- 実行時パフォーマンスの考慮事項
- プロファイリングとデバッグ手法

## TypeScriptコンパイラーの最適化

### コンパイル時間の短縮

```json
// tsconfig.json の最適化
{
  "compilerOptions": {
    "incremental": true,                // 増分コンパイル
    "tsBuildInfoFile": ".tsbuildinfo",  // ビルド情報ファイル
    "skipLibCheck": true,               // 型定義ファイルのチェックをスキップ
    "skipDefaultLibCheck": true,        // デフォルトライブラリのチェックをスキップ
    "isolatedModules": true,            // モジュール分離モード
    "composite": true,                  // プロジェクト参照用
    "declaration": true,                // 型定義ファイル生成
    "declarationMap": true              // 型定義マップ生成
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "**/*.test.ts",
    "**/*.spec.ts",
    "dist"
  ]
}
```

### プロジェクト参照の活用

```json
// 親プロジェクトのtsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" },
    { "path": "./packages/ui" }
  ]
}

// 子プロジェクトのtsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../core" }
  ]
}
```

## 型チェックパフォーマンス

### 効率的な型定義

```typescript
// 避けるべき：深い再帰型
type BadDeepType<T, N extends number> = N extends 0 
  ? T 
  : BadDeepType<T[], Subtract<N, 1>> // 非効率

// 推奨：適度な深さに制限
type GoodLimitedType<T, N extends number> = N extends 0 | 1 | 2 | 3 | 4 | 5
  ? N extends 0 ? T
    : N extends 1 ? T[]
    : N extends 2 ? T[][]
    : N extends 3 ? T[][][]
    : N extends 4 ? T[][][][]
    : T[][][][][]
  : never

// インデックスシグネチャの効率的な使用
interface EfficientRecord {
  // 具体的なプロパティを先に定義
  id: string
  name: string
  // 汎用的なプロパティは後に
  [key: string]: unknown
}

// ユニオン型の最適化
type OptimizedUnion = 
  | { type: 'A'; valueA: string }
  | { type: 'B'; valueB: number }
  | { type: 'C'; valueC: boolean }
// 判別可能ユニオンを使用してパフォーマンス向上
```

### コンパイル時の型計算最適化

```typescript
// 効率的な条件付き型
type EfficientConditional<T> = T extends string
  ? string
  : T extends number
  ? number  
  : T extends boolean
  ? boolean
  : unknown

// 非効率な入れ子条件を避ける
type InefficinetNested<T> = T extends { a: infer A }
  ? A extends { b: infer B }
    ? B extends { c: infer C }
      ? C extends { d: infer D }
        ? D  // 深すぎる入れ子
        : never
      : never
    : never
  : never

// 改善版：フラット化
type ExtractDeepProperty<T> = 
  T extends { a: { b: { c: { d: infer D } } } } ? D : never
```

## バンドルサイズの最適化

### Tree Shaking対応

```typescript
// tree-shaking friendly な書き方
export const utils = {
  formatDate: (date: Date) => date.toISOString(),
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  formatPercent: (value: number) => `${(value * 100).toFixed(1)}%`
}

// 個別エクスポートも提供
export const formatDate = utils.formatDate
export const formatCurrency = utils.formatCurrency  
export const formatPercent = utils.formatPercent

// barrel exportの最適化
// index.ts - 個別エクスポートを使用
export { formatDate } from './date-utils'
export { ApiClient } from './api-client'
export { ValidationError } from './errors'

// 避ける：全体エクスポート
// export * from './utils' // tree-shakingが効かない場合がある
```

### 型定義の軽量化

```typescript
// 重い型定義を避ける
type HeavyType = {
  [K in keyof SomeHugeType]: {
    [J in keyof AnotherHugeType]: ComplexTransform<SomeHugeType[K], AnotherHugeType[J]>
  }
}

// 軽量な代替案
type LightweightType<K extends keyof SomeHugeType> = {
  key: K
  value: SomeHugeType[K]
}

// 遅延評価の活用
type LazyType<T> = T extends infer U ? ProcessType<U> : never
```

### 動的インポートの活用

```typescript
// 条件付きでの動的インポート
async function loadUtility(condition: boolean) {
  if (condition) {
    const { heavyUtility } = await import('./heavy-utility')
    return heavyUtility
  }
  return null
}

// 型安全な動的インポート
type ImportedModule = typeof import('./some-module')
type ModuleType = Awaited<ImportedModule>

async function useModule(): Promise<ModuleType> {
  return import('./some-module')
}

// コード分割のためのインターフェース
interface FeatureModule {
  initialize(): void
  cleanup(): void
}

async function loadFeature(featureName: string): Promise<FeatureModule> {
  const module = await import(`./features/${featureName}`)
  return module.default
}
```

## 実行時パフォーマンス

### 型アサーションの最適化

```typescript
// 効率的な型アサーション
function processData(data: unknown): ProcessedData {
  // 1回だけアサーションを行う
  const typedData = data as RawData
  
  return {
    id: typedData.id,
    name: typedData.name,
    processed: true
  }
}

// 避ける：繰り返しアサーション  
function inefficientProcess(data: unknown): ProcessedData {
  return {
    id: (data as RawData).id,        // 繰り返しアサーション
    name: (data as RawData).name,    // 非効率
    processed: true
  }
}
```

### オブジェクト作成の最適化

```typescript
// 効率的なオブジェクト作成
class EfficientClass {
  // プロパティの事前宣言
  private readonly _cache = new Map<string, any>()
  
  constructor(
    public readonly id: string,
    public readonly name: string
  ) {
    // コンストラクタでの初期化は最小限に
  }
  
  // メソッドの最適化
  public process(input: string): string {
    // キャッシュの活用
    if (this._cache.has(input)) {
      return this._cache.get(input)
    }
    
    const result = this.expensiveOperation(input)
    this._cache.set(input, result)
    return result
  }
  
  private expensiveOperation(input: string): string {
    // 重い処理
    return input.toUpperCase()
  }
}

// ファクトリー関数の最適化
const createOptimizedObject = (() => {
  const template = { type: 'default', version: 1 }
  
  return (id: string, data: any) => ({
    ...template,
    id,
    data,
    timestamp: Date.now()
  })
})()
```

## プロファイリングとデバッグ

### コンパイル時間の測定

```bash
# TypeScript コンパイル時間の測定
npx tsc --diagnostics

# より詳細な情報
npx tsc --extendedDiagnostics

# 特定ファイルの分析
npx tsc --generateTrace trace
```

### 型チェック時間の分析

```typescript
// 型チェック時間が長い場合の調査用
type SlowType<T> = {
  [K in keyof T]: T[K] extends object ? SlowType<T[K]> : T[K]
}

// 代替案：型の複雑さを制限
type FastType<T, Depth extends number = 3> = Depth extends 0 
  ? T
  : {
    [K in keyof T]: T[K] extends object 
      ? FastType<T[K], Subtract<Depth, 1>>
      : T[K]
  }
```

### メモリ使用量の最適化

```typescript
// メモリ効率の良い設計
interface MemoryEfficientConfig {
  // 必要な設定のみを保持
  readonly database: {
    readonly url: string
    readonly pool: { min: number; max: number }
  }
  readonly cache: {
    readonly ttl: number
    readonly maxSize: number
  }
}

// 避ける：不要なデータの保持
interface MemoryInefficient {
  // 全設定を保持（多くは使用されない）
  allPossibleConfigs: Record<string, any>
  historicalData: any[]
  debugInfo: Record<string, any>
}

// WeakMapの活用
class MemoryEfficientCache<T extends object, U> {
  private cache = new WeakMap<T, U>()
  
  set(key: T, value: U): void {
    this.cache.set(key, value)
  }
  
  get(key: T): U | undefined {
    return this.cache.get(key)
  }
}
```

## ベストプラクティス

### 型定義の分離

```typescript
// 型定義を専用ファイルに分離
// types/api.ts
export interface User {
  id: string
  name: string
  email: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// utils/type-guards.ts  
import { User } from '../types/api'

export function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' &&
         obj !== null &&
         'id' in obj &&
         'name' in obj &&
         'email' in obj
}
```

### パフォーマンス監視

```typescript
// パフォーマンス測定ユーティリティ
class PerformanceMonitor {
  private static measurements = new Map<string, number[]>()
  
  static measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const end = performance.now()
      const duration = end - start
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, [])
      }
      this.measurements.get(name)!.push(duration)
    }
  }
  
  static getStats(name: string) {
    const measurements = this.measurements.get(name) || []
    return {
      count: measurements.length,
      total: measurements.reduce((a, b) => a + b, 0),
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements)
    }
  }
}

// 使用例
const result = PerformanceMonitor.measure('data-processing', () => {
  return processLargeDataset(data)
})
```

## 実用的な最適化例

### 大規模アプリケーションでの型管理

```typescript
// 型の名前空間を使用した整理
export namespace API {
  export interface User {
    id: string
    name: string
    email: string
  }
  
  export interface Post {
    id: string
    userId: string
    title: string
    content: string
  }
  
  export type Response<T> = {
    data: T
    meta: {
      total: number
      page: number
      limit: number
    }
  }
}

// 条件付きコンパイル
declare const __DEV__: boolean

export const apiClient = __DEV__ 
  ? (() => import('./api-client-dev'))()
  : (() => import('./api-client-prod'))()
```

## まとめ

TypeScriptのパフォーマンス最適化は以下の特徴を持ちます：

1. **コンパイル時最適化**: 増分コンパイルとプロジェクト参照
2. **型定義効率化**: 複雑な型の適切な制限と最適化
3. **バンドル最適化**: Tree shakingと動的インポート
4. **実行時効率**: 型アサーションとオブジェクト作成の最適化
5. **監視と分析**: プロファイリングツールの活用

これらの技術を適切に適用することで、大規模なTypeScriptアプリケーションでも高いパフォーマンスを維持できます。

## 総まとめ

100のTypeScript Lessonを通じて、基礎から高度な技術まで幅広く学習しました。これらの知識を実際のプロジェクトで活用し、より良いTypeScriptコードを書いていってください。

## 実習

`src/exercise.ts`の演習問題に挑戦してみましょう。パフォーマンス最適化の様々な技術を実装することで、理解を深めることができます。