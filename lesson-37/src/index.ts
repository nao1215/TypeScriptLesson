/**
 * Lesson 37: 高度な型操作 (Advanced Type Manipulation)
 * 
 * 複雑な型変換と計算、再帰的型定義、ブランド型の実装例
 */

// =============================================================================
// 1. 再帰的型定義
// =============================================================================

console.log("=== 再帰的型定義 ===")

// 深くネストしたオブジェクトをreadonly化
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

const jsonData: JSONValue = {
  name: "Alice",
  age: 30,
  active: true,
  tags: ["developer", "typescript"],
  address: {
    city: "Tokyo",
    coordinates: [35.6762, 139.6503]
  }
}

console.log("JSON compatible data:", jsonData)

// =============================================================================
// 2. ブランド型とファントム型
// =============================================================================

console.log("=== ブランド型とファントム型 ===")

// ブランド型の実装
declare const __brand: unique symbol
type Brand<T, B> = T & { readonly [__brand]: B }

type UserId = Brand<number, 'UserId'>
type ProductId = Brand<number, 'ProductId'>
type Email = Brand<string, 'Email'>

function createUserId(id: number): UserId {
  if (id <= 0) throw new Error("Invalid user ID")
  return id as UserId
}

function createProductId(id: number): ProductId {
  if (id <= 0) throw new Error("Invalid product ID") 
  return id as ProductId
}

function createEmail(email: string): Email {
  if (!email.includes("@")) throw new Error("Invalid email")
  return email as Email
}

// 型安全な関数
function getUserById(id: UserId): { id: UserId; name: string } {
  return { id, name: `User ${id}` }
}

function getProductById(id: ProductId): { id: ProductId; name: string } {
  return { id, name: `Product ${id}` }
}

// 使用例
const userId = createUserId(123)
const productId = createProductId(456)

console.log("User:", getUserById(userId))
console.log("Product:", getProductById(productId))

// getUserById(productId) // コンパイルエラー：異なるブランド型

// =============================================================================
// 3. 状態管理でのファントム型
// =============================================================================

console.log("=== 状態管理でのファントム型 ===")

type State = 'draft' | 'published' | 'archived'

type Document<S extends State = State> = {
  id: string
  title: string
  content: string
  state: S
  createdAt: Date
  updatedAt: Date
}

type DraftDocument = Document<'draft'>
type PublishedDocument = Document<'published'>
type ArchivedDocument = Document<'archived'>

// 状態遷移関数
function createDraft(title: string, content: string): DraftDocument {
  const now = new Date()
  return {
    id: Math.random().toString(36),
    title,
    content,
    state: 'draft',
    createdAt: now,
    updatedAt: now
  }
}

function publish(doc: DraftDocument): PublishedDocument {
  return {
    ...doc,
    state: 'published',
    updatedAt: new Date()
  }
}

function archive(doc: PublishedDocument): ArchivedDocument {
  return {
    ...doc,
    state: 'archived',
    updatedAt: new Date()
  }
}

// 使用例
const draft = createDraft("TypeScript Guide", "Learning advanced TypeScript...")
console.log("Draft created:", draft.title, draft.state)

const published = publish(draft)
console.log("Published:", published.title, published.state)

const archived = archive(published)
console.log("Archived:", archived.title, archived.state)

// =============================================================================
// 4. 型レベル計算
// =============================================================================

console.log("=== 型レベル計算 ===")

// 配列の長さを型レベルで計算
type Length<T extends readonly any[]> = T['length']

type ArrayLength1 = Length<[1, 2, 3]> // 3
type ArrayLength2 = Length<['a', 'b']> // 2

// 文字列の長さを型レベルで計算（簡略版）
type StringLength<S extends string, Counter extends any[] = []> = 
  S extends `${string}${infer Rest}`
    ? Counter['length'] extends 50 // 無限再帰防止
      ? Counter['length'] 
      : StringLength<Rest, [...Counter, any]>
    : Counter['length']

// 型レベル加算（小さな数値のみ）
type Add<A extends number, B extends number> = 
  [...Array<A>, ...Array<B>]['length'] extends number
    ? [...Array<A>, ...Array<B>]['length']
    : never

type Sum1 = Add<2, 3> // 5
type Sum2 = Add<1, 4> // 5

console.log("Type-level calculations completed")

// =============================================================================
// 5. 高度なパターンマッチング
// =============================================================================

console.log("=== 高度なパターンマッチング ===")

// URLパラメータの解析
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

type UserRoute = ParseURL<"/users/:id"> // { id: string }
type PostRoute = ParseURL<"/users/:userId/posts/:postId"> // { userId: string; postId: string }

// 型安全なルーターの実装例
class TypeSafeRouter<Routes extends Record<string, any>> {
  constructor(private routes: Routes) {}
  
  navigate<Path extends keyof Routes>(
    path: Path, 
    params: Routes[Path]
  ): string {
    let url = path as string
    
    // パラメータの置換
    Object.entries(params || {}).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value))
    })
    
    return url
  }
}

type AppRoutes = {
  "/users/:id": { id: string }
  "/posts/:postId": { postId: string }
  "/users/:userId/posts/:postId": { userId: string; postId: string }
}

const router = new TypeSafeRouter<AppRoutes>({
  "/users/:id": { id: "" },
  "/posts/:postId": { postId: "" },
  "/users/:userId/posts/:postId": { userId: "", postId: "" }
})

console.log("User route:", router.navigate("/users/:id", { id: "123" }))
console.log("Post route:", router.navigate("/users/:userId/posts/:postId", { userId: "123", postId: "abc" }))

// =============================================================================
// 6. 状態マシン型
// =============================================================================

console.log("=== 状態マシン型 ===")

// 型安全な状態マシンの定義
type TrafficLightState = 'red' | 'yellow' | 'green'

type StateTransitions = {
  red: 'green'
  green: 'yellow' 
  yellow: 'red'
}

type StateMachine<States extends string, Transitions extends Record<States, States>> = {
  currentState: States
  transition<S extends States>(
    from: S
  ): Transitions[S] extends States ? StateMachine<States, Transitions> & { currentState: Transitions[S] } : never
}

class TrafficLight implements StateMachine<TrafficLightState, StateTransitions> {
  currentState: TrafficLightState = 'red'
  
  constructor(initialState: TrafficLightState = 'red') {
    this.currentState = initialState
  }
  
  transition<S extends TrafficLightState>(from: S) {
    const transitions: StateTransitions = {
      red: 'green',
      green: 'yellow',
      yellow: 'red'
    }
    
    if (this.currentState !== from) {
      throw new Error(`Current state is ${this.currentState}, not ${from}`)
    }
    
    this.currentState = transitions[from]
    return this as any // 型アサーションで簡略化
  }
  
  getState(): TrafficLightState {
    return this.currentState
  }
}

// 使用例
const trafficLight = new TrafficLight('red')
console.log("Initial state:", trafficLight.getState()) // red

trafficLight.transition('red')
console.log("After transition:", trafficLight.getState()) // green

trafficLight.transition('green')
console.log("After transition:", trafficLight.getState()) // yellow

// =============================================================================
// 7. スキーマベース型生成
// =============================================================================

console.log("=== スキーマベース型生成 ===")

// スキーマ定義
type Schema = {
  user: {
    type: 'object'
    properties: {
      id: { type: 'number' }
      name: { type: 'string' }
      email: { type: 'string'; optional: true }
      active: { type: 'boolean' }
    }
  }
  product: {
    type: 'object'
    properties: {
      id: { type: 'number' }
      title: { type: 'string' }
      price: { type: 'number' }
      description: { type: 'string'; optional: true }
    }
  }
}

// 型生成
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
// { id: number; name: string; email?: string; active: boolean }

type ProductType = InferType<Schema['product']>
// { id: number; title: string; price: number; description?: string }

// バリデーション関数の生成例
function validateUser(obj: unknown): obj is UserType {
  return typeof obj === 'object' &&
         obj !== null &&
         'id' in obj && typeof (obj as any).id === 'number' &&
         'name' in obj && typeof (obj as any).name === 'string' &&
         'active' in obj && typeof (obj as any).active === 'boolean' &&
         (!(obj as any).email || typeof (obj as any).email === 'string')
}

// 使用例
const userData = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  active: true
}

if (validateUser(userData)) {
  console.log("Valid user:", userData.name, userData.id)
  if (userData.email) {
    console.log("Email:", userData.email)
  }
}

// =============================================================================
// まとめ
// =============================================================================

console.log("=== Lesson 37 まとめ ===")
console.log("高度な型操作の主要な機能:")
console.log("1. 再帰的型定義による複雑な構造の表現")
console.log("2. ブランド型による型安全な識別子")
console.log("3. ファントム型による状態管理")
console.log("4. 型レベル計算とパターンマッチング")
console.log("5. 状態マシン型による型安全な状態遷移")
console.log("6. スキーマベース型生成")

export {
  // 型定義
  DeepReadonly,
  JSONValue,
  Brand,
  UserId,
  ProductId,
  Email,
  Document,
  DraftDocument,
  PublishedDocument,
  ArchivedDocument,
  
  // 関数
  createUserId,
  createProductId,
  createEmail,
  getUserById,
  getProductById,
  createDraft,
  publish,
  archive,
  
  // クラス
  TypeSafeRouter,
  TrafficLight,
  validateUser,
  
  // 型計算例
  Length,
  StringLength,
  Add,
  ParseURL,
  ParsePath,
  InferType,
  InferPrimitive,
  UserType,
  ProductType
}