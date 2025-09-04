/**
 * Lesson 35: テンプレートリテラル型 (Template Literal Types) - 解答例
 * 
 * 演習問題の解答と詳細な解説
 */

// =============================================================================
// 演習1: 基本的なテンプレートリテラル型 - 解答
// =============================================================================

type Version = "v1" | "v2" | "v3"
type Resource = "users" | "posts" | "comments"

/**
 * 問題1の解答: APIVersion型の実装
 */
type APIVersion<V extends Version, R extends Resource> = `/api/${V}/${R}`

type UsersV1 = APIVersion<"v1", "users"> // "/api/v1/users"
type PostsV2 = APIVersion<"v2", "posts"> // "/api/v2/posts"
type CommentsV3 = APIVersion<"v3", "comments"> // "/api/v3/comments"

// 使用例
const apiEndpoints: APIVersion<Version, Resource>[] = [
  "/api/v1/users",
  "/api/v2/posts",
  "/api/v3/comments"
]

/**
 * 問題2の解答: EventName型の実装
 */
type ElementName = "button" | "input" | "form" | "div"
type EventType = "click" | "change" | "submit" | "focus"

type EventName<E extends ElementName, T extends EventType> = 
  `on${Capitalize<E>}${Capitalize<T>}`

type ButtonClick = EventName<"button", "click"> // "onButtonClick"
type InputChange = EventName<"input", "change"> // "onInputChange"
type FormSubmit = EventName<"form", "submit"> // "onFormSubmit"
type DivFocus = EventName<"div", "focus"> // "onDivFocus"

// 使用例
type EventHandlers = {
  [K in `${ElementName}${Capitalize<EventType>}` as `on${Capitalize<K>}`]: (event: Event) => void
}

const eventHandlers: Partial<EventHandlers> = {
  onButtonClick: (event) => console.log("Button clicked"),
  onInputChange: (event) => console.log("Input changed"),
  onFormSubmit: (event) => console.log("Form submitted")
}

// =============================================================================
// 演習2: 文字列操作ユーティリティ - 解答
// =============================================================================

/**
 * 問題3の解答: BEMClass型の実装
 */
type BEMClass<
  B extends string, 
  E extends string = never, 
  M extends string = never
> = [E] extends [never]
    ? [M] extends [never]
      ? B
      : `${B}--${M}`
    : [M] extends [never]
    ? `${B}__${E}`
    : `${B}__${E}--${M}`

type ButtonClass = BEMClass<"button"> // "button"
type ButtonElement = BEMClass<"button", "text"> // "button__text"
type ButtonModifier = BEMClass<"button", never, "primary"> // "button--primary"
type ButtonFull = BEMClass<"button", "text", "large"> // "button__text--large"

// 使用例
const cssClasses: BEMClass<"card", "header" | "body" | "footer", "primary" | "secondary">[] = [
  "card",
  "card__header",
  "card__body", 
  "card__footer",
  "card--primary",
  "card--secondary",
  "card__header--primary",
  "card__body--secondary"
]

/**
 * 問題4の解答: CamelToSnakeCase型の実装
 */
type CamelToSnakeCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${CamelToSnakeCase<Rest>}`
    : Rest extends `${infer Second}${infer RestAfterSecond}`
      ? Second extends Lowercase<Second>
        ? `_${Lowercase<First>}${Second}${CamelToSnakeCase<RestAfterSecond>}`
        : `_${Lowercase<First>}${CamelToSnakeCase<Rest>}`
      : `_${Lowercase<First>}`
  : T

// より簡単な実装版
type SimpleCamelToSnake<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Uppercase<First>
    ? `_${Lowercase<First>}${SimpleCamelToSnake<Rest>}`
    : `${First}${SimpleCamelToSnake<Rest>}`
  : T

type Test1 = CamelToSnakeCase<"firstName"> // "first_name"
type Test2 = CamelToSnakeCase<"getUserById"> // "get_user_by_id"
type Test3 = SimpleCamelToSnake<"XMLHttpRequest"> // "_x_m_l_http_request"

// 使用例
type APIMethodsSnake = {
  [K in "getUser" | "createUser" | "updateUserProfile" as CamelToSnakeCase<K>]: () => void
}

const apiMethods: APIMethodsSnake = {
  get_user: () => console.log("Getting user"),
  create_user: () => console.log("Creating user"),
  update_user_profile: () => console.log("Updating profile")
}

// =============================================================================
// 演習3: パターンマッチングとパース - 解答
// =============================================================================

/**
 * 問題5の解答: ParseURLParams型の実装
 */
type ParseURLParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ParseURLParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {}

type UserPostParams = ParseURLParams<"/users/:id/posts/:postId">
// { id: string; postId: string }

type BlogParams = ParseURLParams<"/blog/:year/:month/:day/:slug">
// { year: string; month: string; day: string; slug: string }

// 使用例
function createRouteHandler<T extends string>(
  route: T,
  handler: (params: ParseURLParams<T>) => void
) {
  return { route, handler }
}

const userHandler = createRouteHandler("/users/:id/posts/:postId", (params) => {
  console.log("User ID:", params.id)
  console.log("Post ID:", params.postId)
})

/**
 * 問題6の解答: ParseQueryString型の実装
 */
type ParseQueryString<T extends string> = T extends `${infer Key}=${infer Value}&${infer Rest}`
  ? { [K in Key]: string } & ParseQueryString<Rest>
  : T extends `${infer Key}=${infer Value}`
  ? { [K in Key]: string }
  : {}

type Query1 = ParseQueryString<"name=john&age=30">
// { name: string; age: string }

type Query2 = ParseQueryString<"search=typescript&page=1&limit=10">
// { search: string; page: string; limit: string }

// 使用例
function parseQueryParams<T extends string>(
  query: T
): ParseQueryString<T> {
  const params = {} as ParseQueryString<T>
  const pairs = query.split('&')
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    ;(params as any)[key] = value
  }
  
  return params
}

const queryParams = parseQueryParams("name=alice&role=admin&active=true")
console.log("Parsed params:", queryParams)

// =============================================================================
// 演習4: 型安全なAPI設計 - 解答
// =============================================================================

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type ResourceType = "users" | "posts" | "comments" | "products"

/**
 * 問題7の解答: RESTEndpoints型の実装
 */
type RESTEndpoints<R extends ResourceType> = {
  list: `GET /${R}`
  create: `POST /${R}`
  show: `GET /${R}/:id`
  update: `PUT /${R}/:id`
  destroy: `DELETE /${R}/:id`
}

type UserEndpoints = RESTEndpoints<"users">
// {
//   list: "GET /users"
//   create: "POST /users"
//   show: "GET /users/:id"
//   update: "PUT /users/:id"
//   destroy: "DELETE /users/:id"
// }

type PostEndpoints = RESTEndpoints<"posts">
type CommentEndpoints = RESTEndpoints<"comments">

// 使用例
class APIClient<R extends ResourceType> {
  private resource: R
  
  constructor(resource: R) {
    this.resource = resource
  }
  
  getEndpoints(): RESTEndpoints<R> {
    return {
      list: `GET /${this.resource}`,
      create: `POST /${this.resource}`,
      show: `GET /${this.resource}/:id`,
      update: `PUT /${this.resource}/:id`,
      destroy: `DELETE /${this.resource}/:id`
    } as RESTEndpoints<R>
  }
}

const userClient = new APIClient("users")
const userEndpoints = userClient.getEndpoints()
console.log("User endpoints:", userEndpoints)

/**
 * 問題8の解答: GraphQLField型の実装
 */
type Entity = "User" | "Post" | "Comment"
type Operation = "Query" | "Mutation"

type GraphQLField<O extends Operation, E extends Entity> = O extends "Query"
  ? {
      [K in `get${E}` | `get${E}s`]: string
    }
  : O extends "Mutation"
  ? {
      [K in `create${E}` | `update${E}` | `delete${E}`]: string
    }
  : never

type UserQueries = GraphQLField<"Query", "User">
// { getUser: string; getUsers: string }

type PostMutations = GraphQLField<"Mutation", "Post">
// { createPost: string; updatePost: string; deletePost: string }

// 使用例
const userQueries: UserQueries = {
  getUser: "query GetUser($id: ID!) { user(id: $id) { id name email } }",
  getUsers: "query GetUsers { users { id name email } }"
}

const postMutations: PostMutations = {
  createPost: "mutation CreatePost($input: PostInput!) { createPost(input: $input) { id } }",
  updatePost: "mutation UpdatePost($id: ID!, $input: PostInput!) { updatePost(id: $id, input: $input) { id } }",
  deletePost: "mutation DeletePost($id: ID!) { deletePost(id: $id) }"
}

// =============================================================================
// 演習5: 高度な文字列処理 - 解答
// =============================================================================

/**
 * 問題9の解答: PathJoin型の実装
 */
type PathJoin<T extends readonly string[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends readonly string[]
      ? Rest['length'] extends 0
        ? `/${First}`
        : `/${First}${PathJoin<Rest>}`
      : never
    : never
  : ""

type APIPath = PathJoin<["api", "v1", "users", "profile"]> // "/api/v1/users/profile"
type StaticPath = PathJoin<["assets", "images", "logo.png"]> // "/assets/images/logo.png"

// 使用例
function buildPath<T extends readonly string[]>(...segments: T): PathJoin<T> {
  return ('/' + segments.join('/')) as PathJoin<T>
}

const apiPath = buildPath("api", "v1", "users", "profile")
const imagePath = buildPath("assets", "images", "logo.png")

console.log("API path:", apiPath)
console.log("Image path:", imagePath)

/**
 * 問題10の解答: ExtractEmailDomain型の実装
 */
type ExtractEmailDomain<T extends string> = T extends `${string}@${infer Domain}`
  ? Domain
  : never

type Domain1 = ExtractEmailDomain<"user@example.com"> // "example.com"
type Domain2 = ExtractEmailDomain<"admin@company.co.jp"> // "company.co.jp"
type Domain3 = ExtractEmailDomain<"test@subdomain.example.org"> // "subdomain.example.org"

// 使用例
function extractDomain<T extends string>(email: T): ExtractEmailDomain<T> {
  const atIndex = email.indexOf('@')
  return email.slice(atIndex + 1) as ExtractEmailDomain<T>
}

const domain1 = extractDomain("user@example.com")
const domain2 = extractDomain("admin@company.co.jp")

console.log("Extracted domains:", domain1, domain2)

// =============================================================================
// 演習6: 実用的な応用問題 - 解答
// =============================================================================

type TableName = "users" | "posts" | "comments" | "products"
type ColumnName = "id" | "name" | "email" | "title" | "content" | "created_at"

/**
 * 問題11の解答: SelectQuery型の実装
 */
type SelectQuery<T extends TableName, C extends ColumnName = ColumnName> = 
  `SELECT ${C extends ColumnName ? C : never} FROM ${T}`

type UserNameQuery = SelectQuery<"users", "name"> // "SELECT name FROM users"
type UserEmailQuery = SelectQuery<"users", "email"> // "SELECT email FROM users"

// より高度な実装（複数カラム対応）
type JoinColumns<T extends readonly ColumnName[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends ColumnName
    ? Rest extends readonly ColumnName[]
      ? Rest['length'] extends 0
        ? First
        : `${First}, ${JoinColumns<Rest>}`
      : never
    : never
  : ""

type AdvancedSelectQuery<T extends TableName, C extends readonly ColumnName[]> =
  `SELECT ${JoinColumns<C>} FROM ${T}`

type MultiColumnQuery = AdvancedSelectQuery<"users", ["id", "name", "email"]>
// "SELECT id, name, email FROM users"

/**
 * 問題12の解答: ConfigKey型の実装
 */
type Environment = "dev" | "staging" | "prod"
type Service = "db" | "redis" | "s3" | "api"
type Setting = "host" | "port" | "timeout" | "key"

type ConfigKey<E extends Environment, S extends Service, T extends Setting> = 
  Uppercase<`${E}_${S}_${T}`>

type DbHost = ConfigKey<"prod", "db", "host"> // "PROD_DB_HOST"
type RedisPort = ConfigKey<"staging", "redis", "port"> // "STAGING_REDIS_PORT"
type S3Key = ConfigKey<"dev", "s3", "key"> // "DEV_S3_KEY"
type ApiTimeout = ConfigKey<"prod", "api", "timeout"> // "PROD_API_TIMEOUT"

// 使用例：設定管理システム
type ConfigMap = {
  [K in ConfigKey<Environment, Service, Setting>]?: string
}

const config: ConfigMap = {
  PROD_DB_HOST: "prod-database.example.com",
  PROD_DB_PORT: "5432",
  STAGING_REDIS_HOST: "staging-redis.example.com",
  STAGING_REDIS_PORT: "6379",
  DEV_API_TIMEOUT: "5000"
}

function getConfig<K extends keyof ConfigMap>(key: K): ConfigMap[K] {
  return config[key]
}

console.log("DB Host:", getConfig("PROD_DB_HOST"))
console.log("Redis Port:", getConfig("STAGING_REDIS_PORT"))

// =============================================================================
// 演習7: バリデーション型 - 解答
// =============================================================================

/**
 * 問題13の解答: ValidateURL型の実装
 */
type ValidateURL<T extends string> = T extends `https://${string}` | `http://${string}`
  ? true
  : false

type ValidURL1 = ValidateURL<"https://example.com"> // true
type ValidURL2 = ValidateURL<"http://localhost:3000"> // true
type InvalidURL1 = ValidateURL<"example.com"> // false
type InvalidURL2 = ValidateURL<"ftp://example.com"> // false

// より厳密な実装
type StrictValidateURL<T extends string> = 
  T extends `https://${infer Domain}${infer Path}`
    ? Domain extends `${string}.${string}`
      ? true
      : Domain extends "localhost"
      ? true  
      : false
    : T extends `http://${infer Domain}${infer Path}`
    ? Domain extends `${string}.${string}`
      ? true
      : Domain extends "localhost" | `localhost:${number}`
      ? true
      : false
    : false

/**
 * 問題14の解答: ValidateJSON型の実装
 */
type ValidateJSON<T extends string> = T extends `{${string}}` | `[${string}]`
  ? true
  : false

type ValidJSON1 = ValidateJSON<'{"name": "john"}'> // true
type ValidJSON2 = ValidateJSON<'[1, 2, 3]'> // true
type ValidJSON3 = ValidateJSON<'{"users": [{"id": 1}]}'> // true
type InvalidJSON1 = ValidateJSON<'name: john'> // false
type InvalidJSON2 = ValidateJSON<'(1, 2, 3)'> // false

// 使用例：型安全なJSONパーサー
function parseJSON<T extends string>(
  json: T
): ValidateJSON<T> extends true ? unknown : never {
  if (json.startsWith('{') && json.endsWith('}') ||
      json.startsWith('[') && json.endsWith(']')) {
    return JSON.parse(json) as any
  }
  throw new Error("Invalid JSON format")
}

const validJson = '{"name": "john", "age": 30}'
const parsedData = parseJSON(validJson) // 型チェックを通る

// const invalidJson = 'name: john'
// const failedParse = parseJSON(invalidJson) // 型エラー

// =============================================================================
// 追加の実用例
// =============================================================================

/**
 * 追加例1: 型安全なSQL WHERE句ビルダー
 */
type Operator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN"
type WhereCondition<T extends string, O extends Operator, V extends string> = 
  `${T} ${O} ${V}`

type UserConditions = 
  | WhereCondition<"age", ">", "18">
  | WhereCondition<"name", "LIKE", "'John%'">
  | WhereCondition<"status", "IN", "('active', 'pending')">

const userQuery = "SELECT * FROM users WHERE " + 
  ("age > 18" as WhereCondition<"age", ">", "18">)

/**
 * 追加例2: 型安全なCSS Grid Template Areas
 */
type GridArea = "header" | "sidebar" | "main" | "footer"
type GridRow<T extends readonly GridArea[]> = `"${JoinWithSpace<T>}"`

type JoinWithSpace<T extends readonly string[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends readonly string[]
      ? Rest['length'] extends 0
        ? First
        : `${First} ${JoinWithSpace<Rest>}`
      : never
    : never
  : ""

type CreateGridTemplate<T extends readonly (readonly GridArea[])[]> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends readonly GridArea[]
      ? Rest extends readonly (readonly GridArea[])[]
        ? Rest['length'] extends 0
          ? GridRow<First>
          : `${GridRow<First>} ${CreateGridTemplate<Rest>}`
        : never
      : never
    : ""

type LayoutTemplate = CreateGridTemplate<[
  ["header", "header"],
  ["sidebar", "main"],
  ["footer", "footer"]
]>
// "header header" "sidebar main" "footer footer"

/**
 * 追加例3: 型安全なLocalization Key Generator
 */
type Locale = "en" | "ja" | "fr" | "de"
type Category = "common" | "error" | "success" | "navigation"
type MessageKey = "save" | "cancel" | "delete" | "confirm"

type I18nKey<L extends Locale, C extends Category, K extends MessageKey> = 
  `${L}.${C}.${K}`

type EnglishKeys = I18nKey<"en", Category, MessageKey>
type JapaneseKeys = I18nKey<"ja", Category, MessageKey>

const messages = {
  "en.common.save": "Save",
  "en.common.cancel": "Cancel", 
  "en.error.delete": "Failed to delete",
  "ja.common.save": "保存",
  "ja.common.cancel": "キャンセル",
  "ja.error.delete": "削除に失敗しました"
} as const

function getMessage<K extends keyof typeof messages>(key: K): typeof messages[K] {
  return messages[key]
}

const saveMessage = getMessage("en.common.save")
const cancelMessage = getMessage("ja.common.cancel")

console.log("Localized messages:", saveMessage, cancelMessage)

// =============================================================================
// まとめとベストプラクティス
// =============================================================================

console.log("=== Lesson 35 解答例 まとめ ===")
console.log("テンプレートリテラル型のベストプラクティス:")
console.log("1. 基本的な文字列結合から複雑なパターンマッチングまで")
console.log("2. 型安全なAPI設計とエンドポイント生成")
console.log("3. 設定管理と環境変数の構造化")
console.log("4. SQLクエリとGraphQLの型安全な構築")
console.log("5. バリデーションとパターン検証")
console.log("6. 実用的なユーティリティ型の作成")

export {
  // 基本型
  APIVersion,
  EventName,
  BEMClass,
  CamelToSnakeCase,
  SimpleCamelToSnake,
  
  // パターンマッチング
  ParseURLParams,
  ParseQueryString,
  
  // API設計
  RESTEndpoints,
  GraphQLField,
  
  // 文字列処理
  PathJoin,
  ExtractEmailDomain,
  SelectQuery,
  AdvancedSelectQuery,
  
  // 設定管理
  ConfigKey,
  ConfigMap,
  
  // バリデーション
  ValidateURL,
  ValidateJSON,
  StrictValidateURL,
  
  // 追加例
  WhereCondition,
  CreateGridTemplate,
  I18nKey,
  
  // 関数
  createRouteHandler,
  parseQueryParams,
  buildPath,
  extractDomain,
  getConfig,
  parseJSON,
  getMessage
}