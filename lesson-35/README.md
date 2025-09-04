# Lesson 35: テンプレートリテラル型 (Template Literal Types)

## 学習目標
- テンプレートリテラル型の基本構文と文字列操作の理解
- 文字列操作ユーティリティ（Uppercase、Lowercase、Capitalize）の活用
- テンプレートリテラル型によるパターンマッチングの実装
- 動的APIエンドポイント生成の構築
- 型安全なルーティングと設定システムの実装

## テンプレートリテラル型とは

テンプレートリテラル型は、TypeScript 4.1で導入された機能で、文字列リテラル型とテンプレートリテラル構文を組み合わせて、型レベルで文字列操作を行える高度な機能です。

## 基本構文

### 基本的なテンプレートリテラル型

```typescript
// 基本構文
type Greeting<T extends string> = `Hello, ${T}!`

type WelcomeMessage = Greeting<"World"> // "Hello, World!"
type PersonalGreeting = Greeting<"Alice"> // "Hello, Alice!"
```

### 複数の型パラメータ

```typescript
// 複数のパラメータを使用
type EventName<T extends string, U extends string> = `on${Capitalize<T>}${Capitalize<U>}`

type ClickHandler = EventName<"button", "click"> // "onButtonClick"
type SubmitHandler = EventName<"form", "submit"> // "onFormSubmit"
```

## 組み込み文字列操作ユーティリティ

### Uppercase、Lowercase、Capitalize、Uncapitalize

```typescript
// 文字列操作ユーティリティの使用
type UppercaseHello = Uppercase<"hello"> // "HELLO"
type LowercaseHELLO = Lowercase<"HELLO"> // "hello"
type CapitalizeHello = Capitalize<"hello"> // "Hello"
type UncapitalizeHello = Uncapitalize<"Hello"> // "hello"

// テンプレートリテラル型との組み合わせ
type MakeConstant<T extends string> = Uppercase<`${T}_CONSTANT`>
type ApiConstant = MakeConstant<"user"> // "USER_CONSTANT"
```

## パターンマッチング

### 文字列パターンの抽出

```typescript
// 文字列パターンからの情報抽出
type GetRouteParams<T extends string> = T extends `${string}/:${infer Param}/${infer Rest}`
  ? Param | GetRouteParams<`/${Rest}`>
  : T extends `${string}/:${infer Param}`
  ? Param
  : never

type UserRouteParams = GetRouteParams<"/users/:id/posts/:postId">
// "id" | "postId"
```

### 条件付き型との組み合わせ

```typescript
// HTTP メソッドの判定
type IsGetRequest<T extends string> = T extends `GET ${string}` ? true : false
type IsMutationRequest<T extends string> = T extends `POST ${string}` | `PUT ${string}` | `DELETE ${string}` ? true : false

type GetCheck = IsGetRequest<"GET /users"> // true
type PostCheck = IsGetRequest<"POST /users"> // false
```

## 実用的な応用例

### APIエンドポイントの型安全な生成

```typescript
// RESTful APIエンドポイントの型定義
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"
type ResourceName = "users" | "posts" | "comments"

type APIEndpoint<M extends HttpMethod, R extends ResourceName, ID extends string = never> =
  M extends "GET" | "DELETE"
    ? [ID] extends [never]
      ? `${M} /${R}`
      : `${M} /${R}/${ID}`
    : M extends "POST"
    ? `${M} /${R}`
    : M extends "PUT"
    ? `${M} /${R}/${ID}`
    : never

type GetUsers = APIEndpoint<"GET", "users"> // "GET /users"
type GetUser = APIEndpoint<"GET", "users", ":id"> // "GET /users/:id"
type CreateUser = APIEndpoint<"POST", "users"> // "POST /users"
type UpdateUser = APIEndpoint<"PUT", "users", ":id"> // "PUT /users/:id"
```

### CSS in JSのスタイル生成

```typescript
// CSS プロパティの動的生成
type CSSProperty = "margin" | "padding" | "border"
type Direction = "top" | "right" | "bottom" | "left"

type CSSPropertyWithDirection<P extends CSSProperty, D extends Direction> = `${P}${Capitalize<D>}`

type MarginTop = CSSPropertyWithDirection<"margin", "top"> // "marginTop"
type PaddingLeft = CSSPropertyWithDirection<"padding", "left"> // "paddingLeft"
type BorderBottom = CSSPropertyWithDirection<"border", "bottom"> // "borderBottom"
```

### イベントハンドラーの型安全な生成

```typescript
// React風のイベントハンドラー型
type EventType = "click" | "change" | "submit" | "focus" | "blur"
type ElementType = "button" | "input" | "form" | "div"

type EventHandlerName<E extends EventType> = `on${Capitalize<E>}`
type EventHandler<E extends EventType, T = Event> = (event: T) => void

type EventHandlers = {
  [K in EventType as EventHandlerName<K>]: EventHandler<K>
}

// 生成される型:
// {
//   onClick: (event: Event) => void
//   onChange: (event: Event) => void
//   onSubmit: (event: Event) => void
//   onFocus: (event: Event) => void
//   onBlur: (event: Event) => void
// }
```

## 高度なパターン

### SQL クエリビルダー

```typescript
// 型安全なSQLクエリの構築
type TableName = "users" | "posts" | "comments"
type SelectQuery<T extends TableName, C extends string = "*"> = `SELECT ${C} FROM ${T}`
type WhereClause<T extends string> = ` WHERE ${T}`
type OrderByClause<T extends string> = ` ORDER BY ${T}`

type BuildQuery<
  Table extends TableName,
  Columns extends string = "*",
  Where extends string = "",
  OrderBy extends string = ""
> = `${SelectQuery<Table, Columns>}${Where extends "" ? "" : WhereClause<Where>}${OrderBy extends "" ? "" : OrderByClause<OrderBy>}`

type UserQuery = BuildQuery<"users", "id, name", "active = 1", "created_at DESC">
// "SELECT id, name FROM users WHERE active = 1 ORDER BY created_at DESC"
```

### URL パスパラメータの抽出

```typescript
// 動的ルートからパラメータを抽出
type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {}

type UserPostParams = ExtractParams<"/users/:userId/posts/:postId">
// { userId: string; postId: string }

type BlogParams = ExtractParams<"/blog/:year/:month/:slug">
// { year: string; month: string; slug: string }
```

### 環境変数の型安全な管理

```typescript
// 環境変数のキー生成
type Environment = "development" | "staging" | "production"
type Service = "database" | "redis" | "api"
type ConfigKey = "url" | "port" | "timeout"

type EnvVarName<E extends Environment, S extends Service, K extends ConfigKey> =
  Uppercase<`${E}_${S}_${K}`>

type DatabaseUrl = EnvVarName<"production", "database", "url">
// "PRODUCTION_DATABASE_URL"

type StagingRedisPort = EnvVarName<"staging", "redis", "port">
// "STAGING_REDIS_PORT"
```

## 型レベル文字列処理

### 文字列の分割と結合

```typescript
// 文字列を特定の文字で分割
type Split<S extends string, D extends string> = S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S]

type SplitPath = Split<"user/profile/settings", "/"> // ["user", "profile", "settings"]
type SplitEmail = Split<"user@example.com", "@"> // ["user", "example.com"]

// 配列を特定の文字で結合
type Join<T extends readonly string[], D extends string> = T extends readonly [infer F, ...infer R]
  ? F extends string
    ? R extends readonly string[]
      ? R['length'] extends 0
        ? F
        : `${F}${D}${Join<R, D>}`
      : never
    : never
  : ""

type JoinedPath = Join<["api", "v1", "users"], "/"> // "api/v1/users"
```

### パターンマッチングによる検証

```typescript
// メールアドレスの簡易検証
type IsEmail<T extends string> = T extends `${string}@${string}.${string}` ? true : false

type ValidEmail = IsEmail<"user@example.com"> // true
type InvalidEmail = IsEmail<"invalid-email"> // false

// URLの検証
type IsHttpUrl<T extends string> = T extends `http://${string}` | `https://${string}` ? true : false

type ValidUrl = IsHttpUrl<"https://example.com"> // true
type InvalidUrl = IsHttpUrl<"ftp://example.com"> // false
```

## まとめ

テンプレートリテラル型は以下の特徴を持ちます：

1. **文字列操作**: 型レベルでの文字列結合と変換
2. **パターンマッチング**: 複雑な文字列パターンの解析と抽出
3. **動的型生成**: 実行時の値に基づく型の動的構築
4. **API型安全性**: エンドポイントやルートの型安全な定義
5. **設定管理**: 環境変数やコンフィグの型安全な管理

テンプレートリテラル型をマスターすることで、より表現力豊かで型安全なTypeScriptコードを書くことができます。

## 次回予告

次のLesson 36では、TypeScriptの型推論について詳しく学習し、コンパイラーがどのように型を自動的に推論するかを理解します。

## 実習

`src/exercise.ts`の演習問題に挑戦してみましょう。様々なテンプレートリテラル型のパターンを実装することで、理解を深めることができます。