/**
 * Lesson 35: テンプレートリテラル型 (Template Literal Types) - 演習問題
 * 
 * 各問題を解いて、テンプレートリテラル型の理解を深めましょう。
 */

// =============================================================================
// 演習1: 基本的なテンプレートリテラル型
// =============================================================================

/**
 * 問題1: APIVersion型を実装してください
 * バージョン番号とAPIパスを組み合わせる型を作成
 */

type Version = "v1" | "v2" | "v3"
type Resource = "users" | "posts" | "comments"

// TODO: APIVersion<V, R>を実装してください
type APIVersion<V extends Version, R extends Resource> = 
  // ここに実装 (/api/{version}/{resource} の形式)

// テスト例
type UsersV1 = APIVersion<"v1", "users"> // "/api/v1/users"
type PostsV2 = APIVersion<"v2", "posts"> // "/api/v2/posts"

/**
 * 問題2: EventName型を実装してください
 * 要素名とイベント名を組み合わせてイベント名を生成
 */

type ElementName = "button" | "input" | "form" | "div"
type EventType = "click" | "change" | "submit" | "focus"

// TODO: EventName<E, T>を実装してください（on{Element}{Event}形式）
type EventName<E extends ElementName, T extends EventType> = 
  // ここに実装

type ButtonClick = EventName<"button", "click"> // "onButtonClick"
type InputChange = EventName<"input", "change"> // "onInputChange"

// =============================================================================
// 演習2: 文字列操作ユーティリティ
// =============================================================================

/**
 * 問題3: CSSClassName型を実装してください
 * BEMスタイルのクラス名を生成する型を作成
 */

// BEM: Block__Element--Modifier
// TODO: BEMClass<B, E, M>を実装してください
type BEMClass<
  B extends string, 
  E extends string = never, 
  M extends string = never
> = 
  // ここに実装
  // Eがneverでない場合：B__E
  // Mがneverでない場合：B--M または B__E--M

type ButtonClass = BEMClass<"button"> // "button"
type ButtonElement = BEMClass<"button", "text"> // "button__text"
type ButtonModifier = BEMClass<"button", never, "primary"> // "button--primary"
type ButtonFull = BEMClass<"button", "text", "large"> // "button__text--large"

/**
 * 問題4: SnakeCase型を実装してください
 * キャメルケースをスネークケースに変換する型
 */

// TODO: CamelToSnakeCase<T>を実装してください
type CamelToSnakeCase<T extends string> = 
  // ここに実装（再帰的な処理が必要）

type Test1 = CamelToSnakeCase<"firstName"> // "first_name"
type Test2 = CamelToSnakeCase<"getUserById"> // "get_user_by_id"
type Test3 = CamelToSnakeCase<"XMLHttpRequest"> // "xml_http_request"

// =============================================================================
// 演習3: パターンマッチングとパース
// =============================================================================

/**
 * 問題5: URLParams型を実装してください
 * URLからパラメータを抽出し、オブジェクト型を生成
 */

// TODO: ParseURLParams<T>を実装してください
type ParseURLParams<T extends string> = 
  // ここに実装
  // "/users/:id/posts/:postId" → { id: string; postId: string }

type UserPostParams = ParseURLParams<"/users/:id/posts/:postId">
// 期待される型: { id: string; postId: string }

type BlogParams = ParseURLParams<"/blog/:year/:month/:day/:slug">
// 期待される型: { year: string; month: string; day: string; slug: string }

/**
 * 問題6: QueryString型を実装してください
 * クエリ文字列をパースして型を生成
 */

// TODO: ParseQueryString<T>を実装してください
type ParseQueryString<T extends string> = 
  // ここに実装
  // "name=john&age=30&active=true" → { name: string; age: string; active: string }

type Query1 = ParseQueryString<"name=john&age=30">
// 期待される型: { name: string; age: string }

type Query2 = ParseQueryString<"search=typescript&page=1&limit=10">
// 期待される型: { search: string; page: string; limit: string }

// =============================================================================
// 演習4: 型安全なAPI設計
// =============================================================================

/**
 * 問題7: RESTEndpoints型を実装してください
 * RESTfulなAPIエンドポイントを自動生成する型
 */

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type ResourceType = "users" | "posts" | "comments" | "products"

// TODO: RESTEndpoints<R>を実装してください
type RESTEndpoints<R extends ResourceType> = {
  // 以下のエンドポイントを持つオブジェクト型を生成：
  // list: "GET /{resource}"
  // create: "POST /{resource}"  
  // show: "GET /{resource}/:id"
  // update: "PUT /{resource}/:id"
  // destroy: "DELETE /{resource}/:id"
}

type UserEndpoints = RESTEndpoints<"users">
// 期待される型: {
//   list: "GET /users"
//   create: "POST /users"
//   show: "GET /users/:id"
//   update: "PUT /users/:id"
//   destroy: "DELETE /users/:id"
// }

/**
 * 問題8: GraphQLField型を実装してください
 * GraphQLフィールド名を自動生成する型
 */

type Entity = "User" | "Post" | "Comment"
type Operation = "Query" | "Mutation"

// TODO: GraphQLField<O, E>を実装してください
type GraphQLField<O extends Operation, E extends Entity> = {
  // Queryの場合：
  //   単数形: get{Entity} (例: getUser)
  //   複数形: get{Entity}s (例: getUsers)  
  // Mutationの場合：
  //   create{Entity}、update{Entity}、delete{Entity}
}

type UserQueries = GraphQLField<"Query", "User">
type PostMutations = GraphQLField<"Mutation", "Post">

// =============================================================================
// 演習5: 高度な文字列処理
// =============================================================================

/**
 * 問題9: PathJoin型を実装してください
 * パス配列を結合してURLパスを生成
 */

// TODO: PathJoin<T>を実装してください
type PathJoin<T extends readonly string[]> = 
  // ここに実装（配列をスラッシュで結合）

type APIPath = PathJoin<["api", "v1", "users", "profile"]> // "/api/v1/users/profile"
type StaticPath = PathJoin<["assets", "images", "logo.png"]> // "/assets/images/logo.png"

/**
 * 問題10: EmailDomain型を実装してください
 * メールアドレスからドメイン部分を抽出
 */

// TODO: ExtractEmailDomain<T>を実装してください
type ExtractEmailDomain<T extends string> = 
  // ここに実装

type Domain1 = ExtractEmailDomain<"user@example.com"> // "example.com"
type Domain2 = ExtractEmailDomain<"admin@company.co.jp"> // "company.co.jp"

// =============================================================================
// 演習6: 実用的な応用問題
// =============================================================================

/**
 * 問題11: DatabaseQuery型を実装してください
 * 型安全なSQLクエリビルダーの型を作成
 */

type TableName = "users" | "posts" | "comments" | "products"
type ColumnName = "id" | "name" | "email" | "title" | "content" | "created_at"

// TODO: SelectQuery<T, C>を実装してください
type SelectQuery<T extends TableName, C extends ColumnName = ColumnName> = 
  // ここに実装（"SELECT {columns} FROM {table}"形式）

type UserNameQuery = SelectQuery<"users", "name"> // "SELECT name FROM users"
type PostQuery = SelectQuery<"posts"> // "SELECT id, name, email, title, content, created_at FROM posts"

/**
 * 問題12: ConfigKey型を実装してください
 * 環境別設定キーを自動生成する型
 */

type Environment = "dev" | "staging" | "prod"
type Service = "db" | "redis" | "s3" | "api"
type Setting = "host" | "port" | "timeout" | "key"

// TODO: ConfigKey<E, S, T>を実装してください
type ConfigKey<E extends Environment, S extends Service, T extends Setting> = 
  // ここに実装（{ENV}_{SERVICE}_{SETTING}形式、すべて大文字）

type DbHost = ConfigKey<"prod", "db", "host"> // "PROD_DB_HOST"
type RedisPort = ConfigKey<"staging", "redis", "port"> // "STAGING_REDIS_PORT"

// =============================================================================
// 演習7: バリデーション型
// =============================================================================

/**
 * 問題13: ValidateURL型を実装してください
 * URLの形式をチェックする型
 */

// TODO: ValidateURL<T>を実装してください
type ValidateURL<T extends string> = 
  // HTTPSまたはHTTPで始まっているかチェック

type ValidURL1 = ValidateURL<"https://example.com"> // true
type ValidURL2 = ValidateURL<"http://localhost:3000"> // true  
type InvalidURL = ValidateURL<"example.com"> // false

/**
 * 問題14: ValidateJSON型を実装してください
 * JSON文字列の基本構造をチェックする型
 */

// TODO: ValidateJSON<T>を実装してください  
type ValidateJSON<T extends string> = 
  // {}で囲まれているか、[]で囲まれているかをチェック

type ValidJSON1 = ValidateJSON<'{"name": "john"}'> // true
type ValidJSON2 = ValidateJSON<'[1, 2, 3]'> // true
type InvalidJSON = ValidateJSON<'name: john'> // false

// =============================================================================
// テスト用のダミー実装
// =============================================================================

// 以下は型チェック用のダミー実装です

const apiVersionTest: APIVersion<"v1", "users"> = "/api/v1/users"
const eventNameTest: EventName<"button", "click"> = "onButtonClick"

const bemTest1: BEMClass<"button"> = "button"
const bemTest2: BEMClass<"button", "text"> = "button__text"
const bemTest3: BEMClass<"button", never, "primary"> = "button--primary"

const urlParamsTest: ParseURLParams<"/users/:id"> = { id: "123" }

// console.log("演習問題の型チェックが完了しました")

export {
  APIVersion,
  EventName,
  BEMClass,
  CamelToSnakeCase,
  ParseURLParams,
  ParseQueryString,
  RESTEndpoints,
  GraphQLField,
  PathJoin,
  ExtractEmailDomain,
  SelectQuery,
  ConfigKey,
  ValidateURL,
  ValidateJSON
}