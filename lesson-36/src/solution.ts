/**
 * Lesson 36: 型推論 (Type Inference) - 解答例
 * 
 * 演習問題の解答と詳細な解説
 */

// =============================================================================
// 演習1: 基本的な型推論 - 解答
// =============================================================================

/**
 * 問題1の解答: 変数の推論される型
 */

const value1 = 42              // number
const value2 = "hello"         // string  
const value3 = [1, 2, 3]       // number[]
const value4 = { name: "Alice", age: 30 } // { name: string; age: number }
const value5 = [1, "two", true] // (string | number | boolean)[]
const value6 = null            // null
const value7 = undefined       // undefined

console.log("=== 基本型推論の確認 ===")
console.log("value1 type:", typeof value1) // "number"
console.log("value2 type:", typeof value2) // "string"
console.log("value3 is array:", Array.isArray(value3)) // true

/**
 * 問題2の解答: 関数の戻り値型推論
 */

function exercise1(x: number, y: number) {
  return x + y // 戻り値型: number
}

function exercise2(name: string) {
  return `Hello, ${name}!` // 戻り値型: string
}

function exercise3(items: string[]) {
  return items.map(item => item.toUpperCase()) // 戻り値型: string[]
}

function exercise4(condition: boolean) {
  if (condition) {
    return "success"
  } else {
    return 404
  }
  // 戻り値型: string | number
}

// 使用例とテスト
console.log("=== 関数戻り値型の確認 ===")
console.log("exercise1(3, 4):", exercise1(3, 4)) // 7
console.log("exercise2('World'):", exercise2("World")) // "Hello, World!"
console.log("exercise3(['a', 'b']):", exercise3(["a", "b"])) // ["A", "B"]
console.log("exercise4(true):", exercise4(true)) // "success"
console.log("exercise4(false):", exercise4(false)) // 404

// =============================================================================
// 演習2: ジェネリック型推論 - 解答
// =============================================================================

/**
 * 問題3の解答: last関数の実装
 */
function last<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[array.length - 1] : undefined
}

// 使用例
const lastNumber = last([1, 2, 3, 4, 5]) // number | undefined として推論
const lastString = last(["a", "b", "c"]) // string | undefined として推論
const lastBoolean = last([true, false]) // boolean | undefined として推論

console.log("=== last関数のテスト ===")
console.log("Last number:", lastNumber) // 5
console.log("Last string:", lastString) // "c"
console.log("Last from empty:", last([])) // undefined

/**
 * 問題4の解答: override関数の実装
 */
function override<T, U>(base: T, updates: U): T & U {
  return { ...base, ...updates }
}

// 使用例
const base = { id: 1, name: "Alice", age: 30 }
const updates = { age: 31, email: "alice@example.com" }
const result = override(base, updates)
// resultの型: { id: number; name: string; age: number; email: string }

console.log("=== override関数のテスト ===")
console.log("Original base:", base)
console.log("Updates:", updates)
console.log("Override result:", result)
console.log("Result age (overridden):", result.age) // 31
console.log("Result email (added):", result.email) // "alice@example.com"

// =============================================================================
// 演習3: 型ナローイングとコントロールフロー分析 - 解答
// =============================================================================

/**
 * 問題5の解答: isPerson型ガード関数の実装
 */
interface Person {
  name: string
  age: number
  email?: string
}

function isPerson(obj: unknown): obj is Person {
  return typeof obj === "object" && 
         obj !== null &&
         "name" in obj &&
         "age" in obj &&
         typeof (obj as Person).name === "string" &&
         typeof (obj as Person).age === "number" &&
         ((obj as Person).email === undefined || typeof (obj as Person).email === "string")
}

// 使用例
function processPerson(input: unknown) {
  if (isPerson(input)) {
    // ここでinputはPerson型として扱われる
    console.log(`Person: ${input.name}, Age: ${input.age}`)
    if (input.email) {
      console.log(`Email: ${input.email}`)
    }
  } else {
    console.log("Input is not a person")
  }
}

// テスト
console.log("=== isPerson型ガードのテスト ===")
processPerson({ name: "Bob", age: 25 }) // 有効
processPerson({ name: "Charlie", age: 30, email: "charlie@example.com" }) // 有効
processPerson({ name: "Invalid", age: "not a number" }) // 無効
processPerson("not an object") // 無効

/**
 * 問題6の解答: processMessage関数の実装
 */
type Message = 
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string; duration: number }

function processMessage(message: Message): string {
  switch (message.type) {
    case "text":
      // message は { type: "text"; content: string } として推論
      return `Text: ${message.content}`
    case "image":
      // message は { type: "image"; url: string; alt: string } として推論
      return `Image: ${message.alt} (${message.url})`
    case "video":
      // message は { type: "video"; url: string; duration: number } として推論
      return `Video: ${message.url} (${message.duration}s)`
    default:
      // 網羅性チェック
      const exhaustiveCheck: never = message
      return exhaustiveCheck
  }
}

// テスト
console.log("=== processMessage関数のテスト ===")
console.log(processMessage({ type: "text", content: "Hello World" }))
console.log(processMessage({ type: "image", url: "/image.jpg", alt: "Sample image" }))
console.log(processMessage({ type: "video", url: "/video.mp4", duration: 120 }))

// =============================================================================
// 演習4: 高度な型推論パターン - 解答
// =============================================================================

/**
 * 問題7の解答: unwrap関数とUnwrap型の実装
 */
type Unwrap<T> = T extends Array<infer U> ? U : T

function unwrap<T>(value: T): Unwrap<T> {
  if (Array.isArray(value)) {
    return value[0] as Unwrap<T>
  }
  return value as Unwrap<T>
}

// 使用例
const unwrapped1 = unwrap([1, 2, 3]) // number として推論
const unwrapped2 = unwrap("hello") // string として推論
const unwrapped3 = unwrap([true, false]) // boolean として推論

console.log("=== unwrap関数のテスト ===")
console.log("Unwrapped array:", unwrapped1) // 1
console.log("Unwrapped string:", unwrapped2) // "hello"
console.log("Unwrapped boolean array:", unwrapped3) // true

/**
 * 問題8の解答: DeepFlatten型とflatten関数の実装
 */
type DeepFlatten<T> = T extends Array<infer U> ? DeepFlatten<U> : T

function flatten<T>(value: T): DeepFlatten<T> {
  if (Array.isArray(value)) {
    const result = value.flat(Infinity)
    return result as DeepFlatten<T>
  }
  return value as DeepFlatten<T>
}

// 使用例とテスト
console.log("=== flatten関数のテスト ===")
const nested = [1, [2, [3, [4]]]]
const flattened = flatten(nested) // number として推論
console.log("Flattened:", flattened) // [1, 2, 3, 4]

// =============================================================================
// 演習5: 実用的な推論パターン - 解答
// =============================================================================

/**
 * 問題9の解答: createStateMachine関数の実装
 */
type State = "idle" | "loading" | "success" | "error"

interface StateMachine<T> {
  current: State
  data: T | null
  error: string | null
  
  setState(state: State): void
  setData(data: T): void
  setError(error: string): void
  reset(): void
}

function createStateMachine<T>(initialState: State = "idle"): StateMachine<T> {
  let state: State = initialState
  let data: T | null = null
  let error: string | null = null

  return {
    get current() { return state },
    get data() { return data },
    get error() { return error },
    
    setState(newState: State) {
      state = newState
      if (newState !== "error") error = null
      if (newState !== "success") data = null
    },
    
    setData(newData: T) {
      data = newData
      state = "success"
      error = null
    },
    
    setError(newError: string) {
      error = newError
      state = "error"
      data = null
    },
    
    reset() {
      state = "idle"
      data = null
      error = null
    }
  }
}

// 使用例
interface User {
  id: number
  name: string
}

const userStateMachine = createStateMachine<User>()

console.log("=== StateMachine のテスト ===")
console.log("Initial state:", userStateMachine.current) // "idle"

userStateMachine.setState("loading")
console.log("Loading state:", userStateMachine.current) // "loading"

userStateMachine.setData({ id: 1, name: "Test User" })
console.log("Success state:", userStateMachine.current) // "success"
console.log("User data:", userStateMachine.data) // { id: 1, name: "Test User" }

userStateMachine.setError("Network error")
console.log("Error state:", userStateMachine.current) // "error"
console.log("Error message:", userStateMachine.error) // "Network error"

/**
 * 問題10の解答: TypeSafeQueryBuilder クラスの実装
 */
interface QueryCondition<T> {
  field: keyof T
  operator: "eq" | "ne" | "gt" | "lt" | "contains"
  value: any
}

class TypeSafeQueryBuilder<T> {
  private conditions: QueryCondition<T>[] = []
  
  constructor(private data: T[]) {}
  
  where(condition: QueryCondition<T>): TypeSafeQueryBuilder<T> {
    this.conditions.push(condition)
    return this
  }
  
  select<K extends keyof T>(field: K): Array<T[K]> {
    const filtered = this.execute()
    return filtered.map(item => item[field])
  }
  
  execute(): T[] {
    return this.data.filter(item => {
      return this.conditions.every(condition => {
        const fieldValue = item[condition.field]
        
        switch (condition.operator) {
          case "eq":
            return fieldValue === condition.value
          case "ne":
            return fieldValue !== condition.value
          case "gt":
            return fieldValue > condition.value
          case "lt":
            return fieldValue < condition.value
          case "contains":
            return String(fieldValue).includes(String(condition.value))
          default:
            return false
        }
      })
    })
  }
}

// 使用例
const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
]

const queryBuilder = new TypeSafeQueryBuilder(users)
const names = queryBuilder
  .where({ field: "id", operator: "gt", value: 0 })
  .select("name") // string[] として推論

console.log("=== QueryBuilder のテスト ===")
console.log("Filtered names:", names) // ["Alice", "Bob", "Charlie"]

const filteredUsers = new TypeSafeQueryBuilder(users)
  .where({ field: "name", operator: "contains", value: "a" })
  .execute()

console.log("Users with 'a' in name:", filteredUsers) // [{ id: 3, name: "Charlie" }]

// =============================================================================
// 演習6: 推論の制御 - 解答
// =============================================================================

/**
 * 問題11の解答: createConfig関数の実装
 */
function createConfig<T extends Record<string, any>>(config: T): T {
  return config
}

// as const を使用した実装
function createConfigConst<T extends Record<string, any>>(config: T) {
  return config as const
}

// 使用例
const config = createConfig({
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
} as const) // const assertionを使用

console.log("=== Config creation のテスト ===")
console.log("Config:", config)
console.log("API URL:", config.apiUrl)

// より厳密なリテラル型を得る方法
const strictConfig = createConfigConst({
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
})

/**
 * 問題12の解答: createTypedArray関数の実装
 */
function createTypedArray<T>() {
  const items: T[] = []
  
  return {
    items: items as readonly T[],
    
    add(item: T): void {
      items.push(item)
    },
    
    getAll(): T[] {
      return [...items]
    },
    
    filter(predicate: (item: T) => boolean): T[] {
      return items.filter(predicate)
    },
    
    map<U>(transform: (item: T) => U): U[] {
      return items.map(transform)
    },
    
    find(predicate: (item: T) => boolean): T | undefined {
      return items.find(predicate)
    },
    
    length: () => items.length,
    
    clear(): void {
      items.length = 0
    }
  }
}

// 使用例
const stringArray = createTypedArray<string>()
stringArray.add("hello")
stringArray.add("world")
stringArray.add("TypeScript")

const filtered = stringArray.filter(str => str.length > 5) // string[] として推論
const upperCased = stringArray.map(str => str.toUpperCase()) // string[] として推論

console.log("=== TypedArray のテスト ===")
console.log("All items:", stringArray.getAll()) // ["hello", "world", "TypeScript"]
console.log("Filtered (length > 5):", filtered) // ["TypeScript"]  
console.log("Upper cased:", upperCased) // ["HELLO", "WORLD", "TYPESCRIPT"]
console.log("Found item:", stringArray.find(str => str.startsWith("Type"))) // "TypeScript"

// 数値配列の例
const numberArray = createTypedArray<number>()
numberArray.add(1)
numberArray.add(2)
numberArray.add(3)

const doubled = numberArray.map(n => n * 2) // number[] として推論
const evens = numberArray.filter(n => n % 2 === 0) // number[] として推論

console.log("Number array:", numberArray.getAll()) // [1, 2, 3]
console.log("Doubled:", doubled) // [2, 4, 6]
console.log("Evens:", evens) // [2]

// =============================================================================
// 追加の高度な例
// =============================================================================

/**
 * 追加例1: 条件付き型での複雑な推論
 */
type ApiResponse<T> = T extends { id: infer ID }
  ? { data: T; id: ID; success: true }
  : { data: T; success: true }

function createApiResponse<T>(data: T): ApiResponse<T> {
  if (typeof data === "object" && data !== null && "id" in data) {
    return { data, id: (data as any).id, success: true } as ApiResponse<T>
  }
  return { data, success: true } as ApiResponse<T>
}

const userResponse = createApiResponse({ id: 1, name: "Alice" })
const stringResponse = createApiResponse("just a string")

console.log("=== ApiResponse のテスト ===")
console.log("User response:", userResponse)
console.log("String response:", stringResponse)

/**
 * 追加例2: 再帰的な型推論パターン
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

function mergeDeep<T>(base: T, partial: DeepPartial<T>): T {
  // 簡単な実装
  return { ...base, ...partial } as T
}

const fullConfig = {
  api: {
    url: "https://api.example.com",
    timeout: 5000,
    retries: 3
  },
  ui: {
    theme: "dark",
    language: "en"
  }
}

const partialUpdate: DeepPartial<typeof fullConfig> = {
  api: {
    timeout: 10000 // 他のプロパティは省略可能
  }
}

const updatedConfig = mergeDeep(fullConfig, partialUpdate)
console.log("=== DeepPartial merge のテスト ===")
console.log("Updated config:", updatedConfig)

// =============================================================================
// まとめとベストプラクティス
// =============================================================================

console.log("=== Lesson 36 解答例 まとめ ===")
console.log("型推論のベストプラクティス:")
console.log("1. 基本的な型推論を信頼し、明示的な型注釈は必要な場合のみ使用")
console.log("2. ジェネリック関数では型引数の推論を活用")
console.log("3. 型ガードとコントロールフロー分析で型安全性を向上")
console.log("4. 条件付き型で高度な型変換を実現")
console.log("5. const assertionで厳密なリテラル型を取得")
console.log("6. ファクトリーパターンで再利用可能な型安全なコードを作成")

export {
  // 基本関数
  exercise1,
  exercise2, 
  exercise3,
  exercise4,
  last,
  override,
  
  // 型ガード
  isPerson,
  processMessage,
  processPerson,
  
  // 高度な関数
  unwrap,
  flatten,
  
  // クラスとファクトリー
  createStateMachine,
  TypeSafeQueryBuilder,
  createConfig,
  createConfigConst,
  createTypedArray,
  
  // 追加例
  createApiResponse,
  mergeDeep,
  
  // 型定義
  Person,
  Message,
  State,
  StateMachine,
  QueryCondition,
  Unwrap,
  DeepFlatten,
  ApiResponse,
  DeepPartial
}