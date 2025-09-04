/**
 * Lesson 35: テンプレートリテラル型 (Template Literal Types) - テストファイル
 */

import { describe, test, expect } from '@jest/globals'

// =============================================================================
// 型定義のテスト
// =============================================================================

describe('Lesson 35: テンプレートリテラル型のテスト', () => {

  // =============================================================================
  // 基本的なテンプレートリテラル型のテスト
  // =============================================================================

  describe('基本的なテンプレートリテラル型', () => {
    test('文字列結合が正常に動作する', () => {
      type Greeting<T extends string> = `Hello, ${T}!`
      
      type WorldGreeting = Greeting<"World">
      type PersonGreeting = Greeting<"Alice">
      
      const worldGreeting: WorldGreeting = "Hello, World!"
      const personGreeting: PersonGreeting = "Hello, Alice!"
      
      expect(worldGreeting).toBe("Hello, World!")
      expect(personGreeting).toBe("Hello, Alice!")
    })

    test('複数パラメータの組み合わせが正常に動作する', () => {
      type FullName<F extends string, L extends string> = `${F} ${L}`
      
      type JohnDoe = FullName<"John", "Doe">
      type JaneSmith = FullName<"Jane", "Smith">
      
      const johnDoe: JohnDoe = "John Doe"
      const janeSmith: JaneSmith = "Jane Smith"
      
      expect(johnDoe).toBe("John Doe")
      expect(janeSmith).toBe("Jane Smith")
    })

    test('ユニオン型の展開が正常に動作する', () => {
      type Size = "small" | "large"
      type Color = "red" | "blue"
      type Product = `${Size}-${Color}-shirt`
      
      const products: Product[] = [
        "small-red-shirt",
        "small-blue-shirt",
        "large-red-shirt",
        "large-blue-shirt"
      ]
      
      expect(products).toHaveLength(4)
      expect(products[0]).toBe("small-red-shirt")
      expect(products[3]).toBe("large-blue-shirt")
    })
  })

  // =============================================================================
  // 文字列操作ユーティリティのテスト
  // =============================================================================

  describe('文字列操作ユーティリティ', () => {
    test('Uppercase変換が正常に動作する', () => {
      type UpperHello = Uppercase<"hello">
      type UpperWorld = Uppercase<"world">
      
      const upperHello: UpperHello = "HELLO"
      const upperWorld: UpperWorld = "WORLD"
      
      expect(upperHello).toBe("HELLO")
      expect(upperWorld).toBe("WORLD")
    })

    test('Capitalize変換が正常に動作する', () => {
      type CapitalHello = Capitalize<"hello">
      type CapitalWorld = Capitalize<"world">
      
      const capitalHello: CapitalHello = "Hello"
      const capitalWorld: CapitalWorld = "World"
      
      expect(capitalHello).toBe("Hello")
      expect(capitalWorld).toBe("World")
    })

    test('CSSプロパティの動的生成が正常に動作する', () => {
      type CSSProperty = "margin" | "padding"
      type Direction = "top" | "bottom"
      
      type CSSProp<P extends CSSProperty, D extends Direction> = `${P}${Capitalize<D>}`
      
      type MarginTop = CSSProp<"margin", "top">
      type PaddingBottom = CSSProp<"padding", "bottom">
      
      const marginTop: MarginTop = "marginTop"
      const paddingBottom: PaddingBottom = "paddingBottom"
      
      expect(marginTop).toBe("marginTop")
      expect(paddingBottom).toBe("paddingBottom")
    })
  })

  // =============================================================================
  // パターンマッチングのテスト
  // =============================================================================

  describe('パターンマッチング', () => {
    test('HTTPメソッドの判定が正常に動作する', () => {
      type IsGetRequest<T extends string> = T extends `GET ${string}` ? true : false
      
      type GetCheck = IsGetRequest<"GET /users">
      type PostCheck = IsGetRequest<"POST /users">
      
      const getCheck: GetCheck = true
      const postCheck: PostCheck = false
      
      expect(getCheck).toBe(true)
      expect(postCheck).toBe(false)
    })

    test('ルートパラメータの抽出が正常に動作する', () => {
      type ExtractParam<T extends string> = T extends `/users/:${infer Param}`
        ? Param
        : never
      
      type UserIdParam = ExtractParam<"/users/:id">
      type UserNameParam = ExtractParam<"/users/:name">
      
      // 型レベルでの検証のため、実際の値は文字列リテラルで確認
      const userIdParam: UserIdParam = "id"
      const userNameParam: UserNameParam = "name"
      
      expect(userIdParam).toBe("id")
      expect(userNameParam).toBe("name")
    })

    test('ファイルパスからファイル名抽出が正常に動作する', () => {
      type GetFileName<T extends string> = T extends `${string}/${infer FileName}`
        ? GetFileName<FileName>
        : T
      
      type FileName1 = GetFileName<"/path/to/file.txt">
      type FileName2 = GetFileName<"simple.txt">
      
      const fileName1: FileName1 = "file.txt"
      const fileName2: FileName2 = "simple.txt"
      
      expect(fileName1).toBe("file.txt")
      expect(fileName2).toBe("simple.txt")
    })
  })

  // =============================================================================
  // APIエンドポイント生成のテスト
  // =============================================================================

  describe('APIエンドポイント生成', () => {
    test('RESTエンドポイント生成が正常に動作する', () => {
      type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"
      type Resource = "users" | "posts"
      
      type APIEndpoint<M extends HttpMethod, R extends Resource> = `${M} /${R}`
      
      type GetUsers = APIEndpoint<"GET", "users">
      type CreatePost = APIEndpoint<"POST", "posts">
      
      const getUsers: GetUsers = "GET /users"
      const createPost: CreatePost = "POST /posts"
      
      expect(getUsers).toBe("GET /users")
      expect(createPost).toBe("POST /posts")
    })

    test('動的ルーティングが正常に動作する', () => {
      type Route<R extends string, ID extends string = never> = 
        [ID] extends [never] 
          ? `/${R}`
          : `/${R}/${ID}`
      
      type UsersRoute = Route<"users">
      type UserRoute = Route<"users", ":id">
      
      const usersRoute: UsersRoute = "/users"
      const userRoute: UserRoute = "/users/:id"
      
      expect(usersRoute).toBe("/users")
      expect(userRoute).toBe("/users/:id")
    })
  })

  // =============================================================================
  // 型安全なルーティングのテスト
  // =============================================================================

  describe('型安全なルーティング', () => {
    test('ルートパラメータの型抽出が正常に動作する', () => {
      type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
        ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
        : T extends `${string}:${infer Param}`
        ? { [K in Param]: string }
        : {}
      
      type UserPostParams = ExtractParams<"/users/:userId/posts/:postId">
      
      const params: UserPostParams = {
        userId: "123",
        postId: "456"
      }
      
      expect(params.userId).toBe("123")
      expect(params.postId).toBe("456")
    })

    test('型安全なルーターが正常に動作する', () => {
      type Routes = {
        "/": {}
        "/users/:id": { id: string }
        "/posts/:postId": { postId: string }
      }
      
      class Router {
        navigate<Path extends keyof Routes>(
          path: Path,
          params: Routes[Path]
        ): string {
          let url = path as string
          
          if (Object.keys(params).length > 0) {
            Object.entries(params).forEach(([key, value]) => {
              url = url.replace(`:${key}`, String(value))
            })
          }
          
          return url
        }
      }
      
      const router = new Router()
      
      const homeUrl = router.navigate("/", {})
      const userUrl = router.navigate("/users/:id", { id: "123" })
      const postUrl = router.navigate("/posts/:postId", { postId: "abc" })
      
      expect(homeUrl).toBe("/")
      expect(userUrl).toBe("/users/123")
      expect(postUrl).toBe("/posts/abc")
    })
  })

  // =============================================================================
  // イベントハンドラーのテスト
  // =============================================================================

  describe('イベントハンドラー', () => {
    test('イベントハンドラー名の生成が正常に動作する', () => {
      type EventType = "click" | "change"
      type EventHandlerName<E extends EventType> = `on${Capitalize<E>}`
      
      type ClickHandler = EventHandlerName<"click">
      type ChangeHandler = EventHandlerName<"change">
      
      const clickHandler: ClickHandler = "onClick"
      const changeHandler: ChangeHandler = "onChange"
      
      expect(clickHandler).toBe("onClick")
      expect(changeHandler).toBe("onChange")
    })

    test('イベントハンドラーオブジェクトが正常に動作する', () => {
      type EventType = "click" | "submit"
      type EventHandlers = {
        [K in EventType as `on${Capitalize<K>}`]: (event: Event) => void
      }
      
      const handlers: EventHandlers = {
        onClick: (event) => console.log("Clicked"),
        onSubmit: (event) => console.log("Submitted")
      }
      
      expect(typeof handlers.onClick).toBe("function")
      expect(typeof handlers.onSubmit).toBe("function")
    })
  })

  // =============================================================================
  // SQL クエリビルダーのテスト
  // =============================================================================

  describe('SQL クエリビルダー', () => {
    test('基本的なSELECTクエリ生成が正常に動作する', () => {
      type SelectQuery<T extends string, C extends string = "*"> = `SELECT ${C} FROM ${T}`
      
      type UsersQuery = SelectQuery<"users">
      type UserNameQuery = SelectQuery<"users", "name">
      
      const usersQuery: UsersQuery = "SELECT * FROM users"
      const userNameQuery: UserNameQuery = "SELECT name FROM users"
      
      expect(usersQuery).toBe("SELECT * FROM users")
      expect(userNameQuery).toBe("SELECT name FROM users")
    })

    test('WHERE句付きクエリが正常に動作する', () => {
      type QueryWithWhere<T extends string, W extends string> = `SELECT * FROM ${T} WHERE ${W}`
      
      type ActiveUsersQuery = QueryWithWhere<"users", "active = 1">
      
      const activeUsersQuery: ActiveUsersQuery = "SELECT * FROM users WHERE active = 1"
      
      expect(activeUsersQuery).toBe("SELECT * FROM users WHERE active = 1")
    })

    test('SQLクエリビルダークラスが正常に動作する', () => {
      class QueryBuilder<T extends string> {
        constructor(private table: T) {}
        
        select(columns: string = "*"): string {
          return `SELECT ${columns} FROM ${this.table}`
        }
        
        where(condition: string): string {
          return `${this.select()} WHERE ${condition}`
        }
      }
      
      const userQuery = new QueryBuilder("users")
      
      expect(userQuery.select()).toBe("SELECT * FROM users")
      expect(userQuery.select("id, name")).toBe("SELECT id, name FROM users")
      expect(userQuery.where("age > 18")).toBe("SELECT * FROM users WHERE age > 18")
    })
  })

  // =============================================================================
  // 環境変数管理のテスト
  // =============================================================================

  describe('環境変数管理', () => {
    test('環境変数キー生成が正常に動作する', () => {
      type Environment = "dev" | "prod"
      type Service = "db" | "api"
      type Setting = "host" | "port"
      
      type EnvKey<E extends Environment, S extends Service, T extends Setting> = 
        Uppercase<`${E}_${S}_${T}`>
      
      type DevDbHost = EnvKey<"dev", "db", "host">
      type ProdApiPort = EnvKey<"prod", "api", "port">
      
      const devDbHost: DevDbHost = "DEV_DB_HOST"
      const prodApiPort: ProdApiPort = "PROD_API_PORT"
      
      expect(devDbHost).toBe("DEV_DB_HOST")
      expect(prodApiPort).toBe("PROD_API_PORT")
    })

    test('設定管理システムが正常に動作する', () => {
      type ConfigKey = "DEV_DB_HOST" | "PROD_API_PORT"
      type Config = { [K in ConfigKey]?: string }
      
      const config: Config = {
        DEV_DB_HOST: "localhost",
        PROD_API_PORT: "8080"
      }
      
      function getConfig<K extends keyof Config>(key: K): Config[K] {
        return config[key]
      }
      
      expect(getConfig("DEV_DB_HOST")).toBe("localhost")
      expect(getConfig("PROD_API_PORT")).toBe("8080")
    })
  })

  // =============================================================================
  // 文字列処理のテスト
  // =============================================================================

  describe('文字列処理', () => {
    test('配列の結合が正常に動作する', () => {
      // 配列結合のシミュレーション
      type Join<T extends readonly string[], D extends string> = 
        T extends readonly [infer F, ...infer R]
          ? F extends string
            ? R extends readonly string[]
              ? R['length'] extends 0
                ? F
                : `${F}${D}${Join<R, D>}`
              : never
            : never
          : ""
      
      type JoinedPath = Join<["api", "v1", "users"], "/">
      
      const joinedPath: JoinedPath = "api/v1/users"
      
      expect(joinedPath).toBe("api/v1/users")
    })

    test('パス結合関数が正常に動作する', () => {
      function joinPath(...segments: string[]): string {
        return segments.join('/')
      }
      
      const apiPath = joinPath("api", "v1", "users")
      const imagePath = joinPath("assets", "images", "logo.png")
      
      expect(apiPath).toBe("api/v1/users")
      expect(imagePath).toBe("assets/images/logo.png")
    })
  })

  // =============================================================================
  // バリデーションのテスト
  // =============================================================================

  describe('バリデーション', () => {
    test('URL検証が正常に動作する', () => {
      type IsHttpUrl<T extends string> = T extends `http://${string}` | `https://${string}` ? true : false
      
      type ValidUrl = IsHttpUrl<"https://example.com">
      type InvalidUrl = IsHttpUrl<"example.com">
      
      const validUrl: ValidUrl = true
      const invalidUrl: InvalidUrl = false
      
      expect(validUrl).toBe(true)
      expect(invalidUrl).toBe(false)
    })

    test('メール検証が正常に動作する', () => {
      type IsEmail<T extends string> = T extends `${string}@${string}.${string}` ? true : false
      
      type ValidEmail = IsEmail<"user@example.com">
      type InvalidEmail = IsEmail<"invalid-email">
      
      const validEmail: ValidEmail = true
      const invalidEmail: InvalidEmail = false
      
      expect(validEmail).toBe(true)
      expect(invalidEmail).toBe(false)
    })

    test('JSON形式検証が正常に動作する', () => {
      type IsJSON<T extends string> = T extends `{${string}}` | `[${string}]` ? true : false
      
      type ValidJSON1 = IsJSON<'{"key": "value"}'>
      type ValidJSON2 = IsJSON<'[1, 2, 3]'>
      type InvalidJSON = IsJSON<'key: value'>
      
      const validJson1: ValidJSON1 = true
      const validJson2: ValidJSON2 = true
      const invalidJson: InvalidJSON = false
      
      expect(validJson1).toBe(true)
      expect(validJson2).toBe(true)
      expect(invalidJson).toBe(false)
    })

    test('実際のバリデーション関数が正常に動作する', () => {
      function validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      }
      
      expect(validateEmail("valid@example.com")).toBe(true)
      expect(validateEmail("invalid-email")).toBe(false)
      
      function validateUrl(url: string): boolean {
        return url.startsWith("http://") || url.startsWith("https://")
      }
      
      expect(validateUrl("https://example.com")).toBe(true)
      expect(validateUrl("example.com")).toBe(false)
    })
  })

  // =============================================================================
  // 統合テスト
  // =============================================================================

  describe('統合テスト', () => {
    test('複雑なテンプレートリテラル型の組み合わせが正常に動作する', () => {
      type Method = "GET" | "POST"
      type Version = "v1" | "v2"
      type Resource = "users" | "posts"
      
      type APIEndpoint<M extends Method, V extends Version, R extends Resource> = 
        `${M} /api/${V}/${R}`
      
      type GetUsersV1 = APIEndpoint<"GET", "v1", "users">
      type PostPostsV2 = APIEndpoint<"POST", "v2", "posts">
      
      const endpoint1: GetUsersV1 = "GET /api/v1/users"
      const endpoint2: PostPostsV2 = "POST /api/v2/posts"
      
      expect(endpoint1).toBe("GET /api/v1/users")
      expect(endpoint2).toBe("POST /api/v2/posts")
    })

    test('実用的なAPI型システムが正常に動作する', () => {
      type ApiRoutes = {
        "GET /users": { response: { id: number; name: string }[] }
        "POST /users": { request: { name: string }; response: { id: number; name: string } }
        "GET /users/:id": { params: { id: string }; response: { id: number; name: string } }
      }
      
      // APIクライアントのシミュレーション
      class ApiClient {
        async request<K extends keyof ApiRoutes>(
          endpoint: K,
          options?: ApiRoutes[K] extends { request: infer R } ? R : 
                   ApiRoutes[K] extends { params: infer P } ? P : {}
        ): Promise<ApiRoutes[K] extends { response: infer R } ? R : never> {
          // 実装のシミュレーション
          if (endpoint === "GET /users") {
            return [{ id: 1, name: "John" }] as any
          }
          if (endpoint === "POST /users") {
            return { id: 1, name: (options as any)?.name || "Unknown" } as any
          }
          if (endpoint === "GET /users/:id") {
            return { id: parseInt((options as any)?.id || "1"), name: "John" } as any
          }
          throw new Error("Unknown endpoint")
        }
      }
      
      const api = new ApiClient()
      
      // 型安全なAPIコール
      api.request("GET /users").then(users => {
        expect(Array.isArray(users)).toBe(true)
      })
      
      api.request("POST /users", { name: "Alice" }).then(user => {
        expect(user.name).toBe("Alice")
      })
      
      api.request("GET /users/:id", { id: "123" }).then(user => {
        expect(user.id).toBe(123)
      })
    })
  })
})