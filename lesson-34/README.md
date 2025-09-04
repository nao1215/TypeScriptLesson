# Lesson 34: マップ型 (Mapped Types)

## 学習目標
- マップ型の基本構文とkeyof演算子の理解
- インデックスシグネチャとテンプレートリテラルキーの活用
- 修飾子操作（+/-readonly、+/-?）の使い方
- 高度なマッピングパターンと変換の実装
- カスタムユーティリティ型の作成

## マップ型とは

マップ型は、既存の型のプロパティを元に新しい型を作成するTypeScriptの高度な機能です。オブジェクト型の各プロパティに対して変換を適用し、新しい型を生成します。

## 基本構文

### 基本的なマップ型

```typescript
// 基本構文
type Mapped<T> = {
  [K in keyof T]: T[K]
}

// 例：すべてのプロパティを文字列に変換
type StringifyAll<T> = {
  [K in keyof T]: string
}

type User = {
  id: number
  name: string
  email: string
}

type StringUser = StringifyAll<User>
// { id: string; name: string; email: string }
```

### keyof演算子の活用

```typescript
// keyof演算子でオブジェクトのキーを取得
type UserKeys = keyof User // "id" | "name" | "email"

// 特定のプロパティのみを選択
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type UserBasicInfo = Pick<User, "name" | "email">
// { name: string; email: string }
```

## 修飾子操作

### readonly修飾子の操作

```typescript
// readonly修飾子を追加
type Readonly<T> = {
  readonly [K in keyof T]: T[K]
}

// readonly修飾子を削除
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}

type ReadonlyUser = Readonly<User>
// { readonly id: number; readonly name: string; readonly email: string }

type MutableUser = Mutable<ReadonlyUser>
// { id: number; name: string; email: string }
```

### オプショナル修飾子の操作

```typescript
// オプショナル修飾子を追加
type Partial<T> = {
  [K in keyof T]?: T[K]
}

// オプショナル修飾子を削除
type Required<T> = {
  [K in keyof T]-?: T[K]
}

type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string }
```

## 高度なマッピングパターン

### 条件付きマッピング

```typescript
// 特定の条件に基づく型変換
type NullableKeys<T> = {
  [K in keyof T]: T[K] extends string ? T[K] | null : T[K]
}

type NullableUser = NullableKeys<User>
// { id: number; name: string | null; email: string | null }
```

### ネストしたオブジェクトの変換

```typescript
// 再帰的なマップ型
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

type Profile = {
  user: User
  settings: {
    theme: string
    notifications: boolean
  }
}

type ReadonlyProfile = DeepReadonly<Profile>
// すべてのネストしたプロパティもreadonly
```

## 実用的なユーティリティ型

### APIレスポンス型の生成

```typescript
// APIレスポンスのラッパー型
type ApiResponse<T> = {
  [K in keyof T]: {
    data: T[K]
    loading: boolean
    error: string | null
  }
}

type UserApiResponse = ApiResponse<User>
// {
//   id: { data: number; loading: boolean; error: string | null }
//   name: { data: string; loading: boolean; error: string | null }
//   email: { data: string; loading: boolean; error: string | null }
// }
```

### フォームバリデーション型

```typescript
// フォームバリデーション用の型
type ValidationRules<T> = {
  [K in keyof T]: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: T[K]) => boolean
  }
}

type UserValidation = ValidationRules<User>
// 各フィールドにバリデーションルールを定義
```

## テンプレートリテラル型との組み合わせ

```typescript
// プロパティ名を動的に生成
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type UserGetters = Getters<User>
// { getId: () => number; getName: () => string; getEmail: () => string }

// Settersも同様に生成
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
}
```

## まとめ

マップ型は以下の特徴を持ちます：

1. **柔軟な型変換**: 既存の型を元に新しい型を動的に生成
2. **修飾子操作**: readonly、オプショナル修飾子の追加・削除
3. **条件付きマッピング**: 型の条件に基づく変換
4. **再帰的変換**: ネストしたオブジェクトの深い変換
5. **テンプレートリテラル型との連携**: 動的なプロパティ名生成

マップ型をマスターすることで、型安全性を保ちながら柔軟で再利用可能な型システムを構築できます。

## 次回予告

次のLesson 35では、テンプレートリテラル型について詳しく学習し、文字列操作やパターンマッチングを型レベルで行う方法を習得します。

## 実習

`src/exercise.ts`の演習問題に挑戦してみましょう。様々なマップ型のパターンを実装することで、理解を深めることができます。