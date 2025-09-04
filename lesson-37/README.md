# Lesson 37: 高度な型操作 (Advanced Type Manipulation)

## 学習目標
- 複雑な型変換と計算の実装
- 再帰的型定義の活用
- 型レベルプログラミングパターンの理解
- ブランド型とファントム型の実装
- 高度なバリデーションとシリアライゼーションパターンの構築

## 高度な型操作とは

高度な型操作は、TypeScriptの型システムを最大限に活用し、実行時の動作を型レベルで表現・制御する技術です。条件付き型、マップ型、テンプレートリテラル型を組み合わせて、複雑な型変換や計算を実現します。

## 再帰的型定義

### 基本的な再帰型

```typescript
// 深くネストしたオブジェクトの処理
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P]
}

// JSON互換性チェック
type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue }
```

### 型レベル計算

```typescript
// 型レベル算術
type Add<A extends number, B extends number> = 
  [...Array<A>, ...Array<B>]['length'] extends number 
    ? [...Array<A>, ...Array<B>]['length'] 
    : never

type Sum = Add<3, 4> // 7

// 文字列長の計算
type Length<S extends string> = S extends `${string}${infer Rest}`
  ? 1 extends 0 ? never : Length<Rest> extends number 
    ? Length<Rest> extends infer L ? L extends number ? L : never : never 
    : never
  : 0
```

## ブランド型とファントム型

### ブランド型の実装

```typescript
// 型安全な識別子
declare const __brand: unique symbol
type Brand<T, B> = T & { [__brand]: B }

type UserId = Brand<number, 'UserId'>
type ProductId = Brand<number, 'ProductId'>

function createUserId(id: number): UserId {
  return id as UserId
}

// 異なるブランド型は互換性がない
function getUserById(id: UserId): User { /* ... */ }
function getProductById(id: ProductId): Product { /* ... */ }

const userId = createUserId(123)
const productId = 456 as ProductId

getUserById(userId) // OK
getUserById(productId) // エラー: 異なるブランド型
```

### ファントム型の活用

```typescript
// 状態を表現するファントム型
type State = 'draft' | 'published' | 'archived'
type Document<S extends State = State> = {
  id: string
  title: string
  content: string
  state: S
}

type DraftDocument = Document<'draft'>
type PublishedDocument = Document<'published'>

// 状態遷移の型安全性
function publish(doc: DraftDocument): PublishedDocument {
  return { ...doc, state: 'published' }
}
```

## 高度なバリデーションパターン

### スキーマベース型生成

```typescript
// スキーマ定義からの型生成
type Schema = {
  user: {
    type: 'object'
    properties: {
      id: { type: 'number' }
      name: { type: 'string' }
      email: { type: 'string'; optional: true }
    }
  }
}

type InferType<S> = S extends { type: 'object'; properties: infer P }
  ? {
      [K in keyof P]: P[K] extends { type: infer T; optional: true }
        ? InferPrimitive<T> | undefined
        : P[K] extends { type: infer T }
        ? InferPrimitive<T>
        : never
    }
  : never

type InferPrimitive<T> = T extends 'string' 
  ? string 
  : T extends 'number' 
  ? number 
  : T extends 'boolean' 
  ? boolean 
  : unknown

type UserType = InferType<Schema['user']>
// { id: number; name: string; email?: string }
```

## 型レベルプログラミングパターン

### 状態マシン型

```typescript
// 型安全な状態マシン
type StateMachine<States extends string, Events extends Record<string, any>> = {
  [S in States]: {
    [E in keyof Events]: Events[E] extends { from: S; to: infer T }
      ? T extends States ? T : never
      : never
  }[keyof Events]
}

type TrafficLightStates = 'red' | 'yellow' | 'green'
type TrafficLightEvents = {
  next: { from: 'red'; to: 'green' } | { from: 'green'; to: 'yellow' } | { from: 'yellow'; to: 'red' }
}

type TrafficLight = StateMachine<TrafficLightStates, TrafficLightEvents>
```

### パーサーコンビネーター型

```typescript
// 型レベルパーサー
type ParseInt<S extends string> = S extends `${infer N extends number}${infer R}`
  ? N extends number ? [N, R] : never
  : never

type ParseString<S extends string, D extends string> = 
  S extends `${infer Str}${D}${infer R}` ? [Str, R] : [S, '']

// URL パラメータの解析
type ParseURL<U extends string> = U extends `/${infer Path}` 
  ? ParsePath<Path>
  : never

type ParsePath<P extends string> = P extends `${infer Segment}/${infer Rest}`
  ? Segment extends `:${infer Param}`
    ? { [K in Param]: string } & ParsePath<Rest>
    : ParsePath<Rest>
  : P extends `:${infer Param}`
  ? { [K in Param]: string }
  : {}
```

## 実用的なパターン

### API型定義ジェネレーター

```typescript
// OpenAPI風スキーマから型生成
type APISchema = {
  paths: {
    '/users': {
      get: { response: { users: Array<{ id: number; name: string }> } }
      post: { body: { name: string }; response: { id: number; name: string } }
    }
    '/users/:id': {
      get: { params: { id: string }; response: { id: number; name: string } }
      put: { params: { id: string }; body: { name?: string }; response: { id: number; name: string } }
    }
  }
}

type ExtractAPI<S extends { paths: any }> = {
  [Path in keyof S['paths']]: {
    [Method in keyof S['paths'][Path]]: S['paths'][Path][Method] extends {
      response: infer R
    } 
      ? (
          S['paths'][Path][Method] extends { params: infer P }
            ? S['paths'][Path][Method] extends { body: infer B }
              ? (params: P, body: B) => Promise<R>
              : (params: P) => Promise<R>
            : S['paths'][Path][Method] extends { body: infer B }
            ? (body: B) => Promise<R>
            : () => Promise<R>
        )
      : never
  }
}

type APIClient = ExtractAPI<APISchema>
```

### 型安全なORMパターン

```typescript
// データベーステーブル定義
type TableSchema = {
  users: {
    id: number
    name: string
    email: string
    created_at: Date
  }
  posts: {
    id: number
    user_id: number
    title: string
    content: string
    published: boolean
  }
}

// クエリビルダー型
type QueryBuilder<T extends keyof TableSchema> = {
  select<K extends keyof TableSchema[T]>(
    ...fields: K[]
  ): QueryBuilder<T> & { _select: Pick<TableSchema[T], K> }
  
  where<K extends keyof TableSchema[T]>(
    field: K, 
    value: TableSchema[T][K]
  ): QueryBuilder<T>
  
  join<U extends keyof TableSchema, FK extends keyof TableSchema[T]>(
    table: U,
    foreignKey: FK,
    primaryKey: keyof TableSchema[U]
  ): QueryBuilder<T> & QueryBuilder<U>
  
  execute(): Promise<
    this extends { _select: infer S } ? S[] : TableSchema[T][]
  >
}
```

## まとめ

高度な型操作は以下の特徴を持ちます：

1. **再帰的定義**: 複雑な構造を型レベルで表現
2. **ブランド型**: 型安全な識別子とドメインモデリング
3. **型レベル計算**: コンパイル時での値計算
4. **パターンマッチング**: 複雑な条件分岐と型変換
5. **実用的応用**: API、ORM、バリデーションでの活用

これらの技術をマスターすることで、極めて型安全で表現力豊かなTypeScriptコードを書くことができます。

## 次回予告

次のLesson 38では、型ガードについて詳しく学習し、ランタイムでの型安全性を確保する方法を習得します。

## 実習

`src/exercise.ts`の演習問題に挑戦してみましょう。高度な型操作の様々なパターンを実装することで、理解を深めることができます。