/**
 * Lesson 35: テンプレートリテラル型 (Template Literal Types)
 * 
 * テンプレートリテラル型の基本から応用まで、包括的な例を学習します。
 */

// =============================================================================
// 1. 基本的なテンプレートリテラル型
// =============================================================================

console.log("=== 基本的なテンプレートリテラル型 ===")

// 基本構文: 文字列リテラル型の組み合わせ
type Greeting<T extends string> = `Hello, ${T}!`

type WelcomeMessage = Greeting<"World"> // "Hello, World!"
type PersonalGreeting = Greeting<"Alice"> // "Hello, Alice!"

// 複数のパラメータを使用
type FullName<F extends string, L extends string> = `${F} ${L}`
type JohnDoe = FullName<"John", "Doe"> // "John Doe"

// ユニオン型の展開
type Color = "red" | "blue" | "green"
type Size = "small" | "medium" | "large"
type Product = `${Size}-${Color}-shirt`
// "small-red-shirt" | "small-blue-shirt" | ... (9通りの組み合わせ)

console.log("テンプレートリテラル型の基本例:")
const products: Product[] = [
  "small-red-shirt",
  "medium-blue-shirt", 
  "large-green-shirt"
]
console.log("Available products:", products)

// =============================================================================
// 2. 組み込み文字列操作ユーティリティ
// =============================================================================

console.log("=== 組み込み文字列操作ユーティリティ ===")

// Uppercase: 大文字化
type UppercaseHello = Uppercase<"hello"> // "HELLO"
type MakeConstant<T extends string> = Uppercase<`${T}_CONSTANT`>
type ApiConstant = MakeConstant<"user"> // "USER_CONSTANT"

// Lowercase: 小文字化
type LowercaseHELLO = Lowercase<"HELLO"> // "hello"

// Capitalize: 先頭文字を大文字化
type CapitalizeHello = Capitalize<"hello"> // "Hello"

// Uncapitalize: 先頭文字を小文字化
type UncapitalizeHello = Uncapitalize<"Hello"> // "hello"

// 実用例: CSSプロパティの生成
type CSSProperty = "margin" | "padding" | "border"
type Direction = "top" | "right" | "bottom" | "left"
type CSSPropertyWithDirection<P extends CSSProperty, D extends Direction> = 
  `${P}${Capitalize<D>}`

type MarginProperties = CSSPropertyWithDirection<"margin", Direction>
// "marginTop" | "marginRight" | "marginBottom" | "marginLeft"

const cssProperties: MarginProperties[] = [
  "marginTop",
  "marginRight", 
  "marginBottom",
  "marginLeft"
]
console.log("CSS margin properties:", cssProperties)

// =============================================================================
// 3. パターンマッチングと情報抽出
// =============================================================================

console.log("=== パターンマッチングと情報抽出 ===")

// ルートパラメータの抽出
type GetRouteParams<T extends string> = T extends `${string}/:${infer Param}/${infer Rest}`
  ? Param | GetRouteParams<`/${Rest}`>
  : T extends `${string}/:${infer Param}`
  ? Param
  : never

type UserRouteParams = GetRouteParams<"/users/:id/posts/:postId">
// "id" | "postId"

type BlogRouteParams = GetRouteParams<"/blog/:year/:month/:slug">
// "year" | "month" | "slug"

// ファイルパスからファイル名を抽出
type GetFileName<T extends string> = T extends `${string}/${infer FileName}`
  ? GetFileName<FileName>
  : T

type FileName1 = GetFileName<"/path/to/file.txt"> // "file.txt"
type FileName2 = GetFileName<"simple.txt"> // "simple.txt"

// HTTPメソッドの判定
type IsGetRequest<T extends string> = T extends `GET ${string}` ? true : false
type IsMutationRequest<T extends string> = 
  T extends `POST ${string}` | `PUT ${string}` | `DELETE ${string}` ? true : false

type GetCheck = IsGetRequest<"GET /users"> // true
type PostCheck = IsGetRequest<"POST /users"> // false
type PutCheck = IsMutationRequest<"PUT /users/1"> // true

console.log("パターンマッチングの例:")
console.log("GET check:", true as GetCheck)
console.log("POST check:", false as PostCheck)
console.log("PUT mutation check:", true as PutCheck)

// =============================================================================
// 4. APIエンドポイントの型安全な生成
// =============================================================================

console.log("=== APIエンドポイントの型安全な生成 ===")

// RESTful APIエンドポイントの型定義
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type ResourceName = "users" | "posts" | "comments" | "products"

type APIEndpoint<
  M extends HttpMethod,
  R extends ResourceName, 
  ID extends string = never
> = M extends "GET" | "DELETE"
    ? [ID] extends [never] 
      ? `${M} /${R}`
      : `${M} /${R}/${ID}`
    : M extends "POST"
    ? `${M} /${R}`
    : M extends "PUT" | "PATCH"
    ? `${M} /${R}/${ID}`
    : never

// APIエンドポイントの生成例
type GetUsers = APIEndpoint<"GET", "users"> // "GET /users"
type GetUser = APIEndpoint<"GET", "users", ":id"> // "GET /users/:id"
type CreateUser = APIEndpoint<"POST", "users"> // "POST /users"
type UpdateUser = APIEndpoint<"PUT", "users", ":id"> // "PUT /users/:id"
type DeleteUser = APIEndpoint<"DELETE", "users", ":id"> // "DELETE /users/:id"

// APIクライアントの実装例
interface APIClient {
  request<T>(endpoint: string): Promise<T>
}

declare const apiClient: APIClient

async function fetchUser(id: string) {
  const endpoint: GetUser = "GET /users/:id"
  return apiClient.request(endpoint.replace(":id", id))
}

async function createUser(userData: any) {
  const endpoint: CreateUser = "POST /users"
  return apiClient.request(endpoint)
}

console.log("API endpoints generated successfully")

// =============================================================================
// 5. 型安全なルーティングシステム
// =============================================================================

console.log("=== 型安全なルーティングシステム ===")

// ルートパラメータを抽出する高度な型
type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {}

// ルート定義
type Routes = {
  "/": {}
  "/users": {}
  "/users/:id": { id: string }
  "/users/:id/posts": { id: string }
  "/users/:id/posts/:postId": { id: string; postId: string }
  "/blog/:year/:month/:slug": { year: string; month: string; slug: string }
}

// ルーターの型安全な実装
class TypeSafeRouter {
  navigate<Path extends keyof Routes>(
    path: Path, 
    params: Routes[Path]
  ): void {
    let url = path as string
    
    // パラメータの置換
    if (Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value))
      })
    }
    
    console.log(`Navigating to: ${url}`)
  }
}

const router = new TypeSafeRouter()

// 型安全なナビゲーション
router.navigate("/", {})
router.navigate("/users/:id", { id: "123" })
router.navigate("/users/:id/posts/:postId", { id: "123", postId: "456" })
router.navigate("/blog/:year/:month/:slug", { 
  year: "2024", 
  month: "03", 
  slug: "typescript-tutorial" 
})

// =============================================================================
// 6. イベントハンドラーの動的生成
// =============================================================================

console.log("=== イベントハンドラーの動的生成 ===")

// イベントタイプとハンドラーの生成
type EventType = "click" | "change" | "submit" | "focus" | "blur" | "keydown"
type EventHandlerName<E extends EventType> = `on${Capitalize<E>}`

type EventHandler<E extends EventType> = (event: {
  type: E
  target: HTMLElement
  preventDefault(): void
  stopPropagation(): void
}) => void

type EventHandlers = {
  [K in EventType as EventHandlerName<K>]: EventHandler<K>
}

// イベントハンドラーの実装例
const eventHandlers: EventHandlers = {
  onClick: (event) => {
    console.log(`Clicked on ${event.target.tagName}`)
    event.preventDefault()
  },
  onChange: (event) => {
    console.log(`Value changed on ${event.target.tagName}`)
  },
  onSubmit: (event) => {
    console.log("Form submitted")
    event.preventDefault()
  },
  onFocus: (event) => {
    console.log("Element focused")
  },
  onBlur: (event) => {
    console.log("Element blurred")
  },
  onKeydown: (event) => {
    console.log("Key pressed")
  }
}

console.log("Event handlers created:", Object.keys(eventHandlers))

// =============================================================================
// 7. SQL クエリビルダー
// =============================================================================

console.log("=== SQL クエリビルダー ===")

// SQLクエリの型安全な構築
type TableName = "users" | "posts" | "comments" | "products"
type SelectQuery<T extends TableName, C extends string = "*"> = `SELECT ${C} FROM ${T}`
type WhereClause<T extends string> = ` WHERE ${T}`
type OrderByClause<T extends string> = ` ORDER BY ${T}`
type LimitClause<T extends number> = ` LIMIT ${T}`

type BuildQuery<
  Table extends TableName,
  Columns extends string = "*",
  Where extends string = "",
  OrderBy extends string = "",
  Limit extends number | "" = ""
> = `${SelectQuery<Table, Columns>}${Where extends "" ? "" : WhereClause<Where>}${OrderBy extends "" ? "" : OrderByClause<OrderBy>}${Limit extends "" ? "" : Limit extends number ? LimitClause<Limit> : ""}`

// クエリ例
type UserQuery = BuildQuery<"users", "id, name, email", "active = 1", "created_at DESC", 10>
// "SELECT id, name, email FROM users WHERE active = 1 ORDER BY created_at DESC LIMIT 10"

type PostQuery = BuildQuery<"posts", "*", "published = true">
// "SELECT * FROM posts WHERE published = true"

// クエリビルダークラス
class SQLQueryBuilder<T extends TableName> {
  private table: T
  
  constructor(table: T) {
    this.table = table
  }
  
  select<C extends string>(columns: C): SQLQueryBuilder<T> & { columns: C } {
    return Object.assign(this, { columns })
  }
  
  where<W extends string>(condition: W): SQLQueryBuilder<T> & { whereCondition: W } {
    return Object.assign(this, { whereCondition: condition })
  }
  
  build(): string {
    const self = this as any
    let query = `SELECT ${self.columns || '*'} FROM ${this.table}`
    
    if (self.whereCondition) {
      query += ` WHERE ${self.whereCondition}`
    }
    
    return query
  }
}

const userQueryBuilder = new SQLQueryBuilder("users")
const builtQuery = userQueryBuilder
  .select("id, name, email")
  .where("age > 18")
  .build()

console.log("Built SQL query:", builtQuery)

// =============================================================================
// 8. 環境変数の型安全な管理
// =============================================================================

console.log("=== 環境変数の型安全な管理 ===")

// 環境変数のキー生成
type Environment = "development" | "staging" | "production"
type Service = "database" | "redis" | "api" | "storage"
type ConfigKey = "url" | "port" | "timeout" | "key" | "secret"

type EnvVarName<
  E extends Environment, 
  S extends Service, 
  K extends ConfigKey
> = Uppercase<`${E}_${S}_${K}`>

// 環境変数の例
type DatabaseUrl = EnvVarName<"production", "database", "url"> // "PRODUCTION_DATABASE_URL"
type StagingRedisPort = EnvVarName<"staging", "redis", "port"> // "STAGING_REDIS_PORT"
type DevApiKey = EnvVarName<"development", "api", "key"> // "DEVELOPMENT_API_KEY"

// 設定管理システム
type EnvConfig = {
  [K in EnvVarName<Environment, Service, ConfigKey>]?: string
}

const envConfig: Partial<EnvConfig> = {
  PRODUCTION_DATABASE_URL: "postgresql://localhost:5432/prod",
  STAGING_REDIS_PORT: "6380",
  DEVELOPMENT_API_KEY: "dev-api-key-123"
}

function getEnvVar<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
  return envConfig[key]
}

console.log("Database URL:", getEnvVar("PRODUCTION_DATABASE_URL"))
console.log("Redis Port:", getEnvVar("STAGING_REDIS_PORT"))

// =============================================================================
// 9. 型レベル文字列処理
// =============================================================================

console.log("=== 型レベル文字列処理 ===")

// 文字列の分割
type Split<S extends string, D extends string> = S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S]

type SplitPath = Split<"user/profile/settings", "/"> // ["user", "profile", "settings"]
type SplitEmail = Split<"user@example.com", "@"> // ["user", "example.com"]

// 配列の結合
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
type JoinedDomain = Join<["www", "example", "com"], "."> // "www.example.com"

// パスの正規化
type NormalizePath<T extends string> = T extends `/${infer Rest}`
  ? `/${NormalizePath<Rest>}`
  : T extends `${infer Start}//${infer End}`
  ? NormalizePath<`${Start}/${End}`>
  : T

type NormalizedPath1 = NormalizePath<"//api//v1//users//"> // "/api/v1/users/"
type NormalizedPath2 = NormalizePath<"api/v1/users"> // "api/v1/users"

console.log("String processing examples completed")

// =============================================================================
// 10. バリデーションと型チェック
// =============================================================================

console.log("=== バリデーションと型チェック ===")

// メールアドレスの簡易検証
type IsEmail<T extends string> = T extends `${string}@${string}.${string}` ? true : false

type ValidEmail1 = IsEmail<"user@example.com"> // true
type ValidEmail2 = IsEmail<"test@domain.org"> // true
type InvalidEmail1 = IsEmail<"invalid-email"> // false
type InvalidEmail2 = IsEmail<"user@"> // false

// URLの検証
type IsHttpUrl<T extends string> = T extends `http://${string}` | `https://${string}` ? true : false

type ValidUrl1 = IsHttpUrl<"https://example.com"> // true
type ValidUrl2 = IsHttpUrl<"http://localhost:3000"> // true
type InvalidUrl1 = IsHttpUrl<"ftp://example.com"> // false
type InvalidUrl2 = IsHttpUrl<"example.com"> // false

// 電話番号の検証（日本形式）
type IsJapanesePhoneNumber<T extends string> = T extends `0${number}-${number}-${number}` ? true : false

type ValidPhone1 = IsJapanesePhoneNumber<"090-1234-5678"> // true
type ValidPhone2 = IsJapanesePhoneNumber<"03-1234-5678"> // true
type InvalidPhone = IsJapanesePhoneNumber<"123-456-789"> // false

// バリデーター関数
function validateEmail<T extends string>(
  email: T
): email is T & (IsEmail<T> extends true ? T : never) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 使用例
const email1 = "valid@example.com"
const email2 = "invalid-email"

if (validateEmail(email1)) {
  console.log("Valid email:", email1) // 型安全
}

if (validateEmail(email2)) {
  console.log("This won't be reached:", email2)
} else {
  console.log("Invalid email:", email2)
}

// =============================================================================
// 11. 高度な応用例：型安全なCSSフレームワーク
// =============================================================================

console.log("=== 型安全なCSSフレームワーク ===")

// CSS Grid の型安全な定義
type GridArea = "header" | "sidebar" | "main" | "footer"
type GridTemplate = `"${string}"`

type CreateGridTemplate<T extends readonly GridArea[][]> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends readonly GridArea[]
      ? Rest extends readonly GridArea[][]
        ? Rest['length'] extends 0
          ? `"${Join<First, ' '>}"`
          : `"${Join<First, ' '>}" ${CreateGridTemplate<Rest>}`
        : never
      : never
    : ""

type LayoutTemplate = CreateGridTemplate<[
  ["header", "header"],
  ["sidebar", "main"], 
  ["footer", "footer"]
]>
// "header header" "sidebar main" "footer footer"

// Tailwind CSS風のユーティリティクラス生成
type Size = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24
type Direction = "t" | "r" | "b" | "l" | "x" | "y" | ""
type Property = "p" | "m" // padding, margin

type UtilityClass<P extends Property, D extends Direction, S extends Size> =
  D extends ""
    ? `${P}-${S}`
    : `${P}${D}-${S}`

type PaddingClasses = UtilityClass<"p", Direction, Size>
// "p-1" | "p-2" | ... | "pt-1" | "pr-1" | ... | "px-1" | "py-1" | ...

type MarginClasses = UtilityClass<"m", Direction, Size>

console.log("CSS framework types generated successfully")

// =============================================================================
// まとめ
// =============================================================================

console.log("=== Lesson 35 まとめ ===")
console.log("テンプレートリテラル型の主要な機能:")
console.log("1. 基本的な文字列結合と型生成")
console.log("2. 組み込みユーティリティによる文字列操作")
console.log("3. パターンマッチングによる情報抽出") 
console.log("4. APIエンドポイントの動的生成")
console.log("5. 型安全なルーティングシステム")
console.log("6. イベントハンドラーの自動生成")
console.log("7. SQLクエリの型安全な構築")
console.log("8. 環境変数の構造化管理")
console.log("9. 文字列の分割・結合・正規化")
console.log("10. バリデーションとパターンマッチング")
console.log("11. CSSフレームワークの型安全な実装")

export {
  // 基本型
  Greeting,
  FullName,
  Product,
  
  // 文字列操作
  MakeConstant,
  CSSPropertyWithDirection,
  MarginProperties,
  
  // パターンマッチング
  GetRouteParams,
  GetFileName,
  IsGetRequest,
  IsMutationRequest,
  
  // API関連
  APIEndpoint,
  GetUsers,
  CreateUser,
  Routes,
  TypeSafeRouter,
  
  // イベント関連
  EventHandlers,
  EventHandlerName,
  
  // SQL関連
  BuildQuery,
  SQLQueryBuilder,
  
  // 環境変数
  EnvVarName,
  EnvConfig,
  
  // 文字列処理
  Split,
  Join,
  NormalizePath,
  
  // バリデーション
  IsEmail,
  IsHttpUrl,
  IsJapanesePhoneNumber,
  validateEmail,
  
  // CSS関連
  CreateGridTemplate,
  UtilityClass,
  PaddingClasses
}