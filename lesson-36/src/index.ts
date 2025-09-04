/**
 * Lesson 36: 型推論 (Type Inference)
 * 
 * TypeScriptの型推論メカニズムを包括的に学習します。
 */

// =============================================================================
// 1. 基本的な型推論
// =============================================================================

console.log("=== 基本的な型推論 ===")

// プリミティブ型の推論
let message = "Hello, TypeScript!" // string型として推論
let count = 42 // number型として推論
let isActive = true // boolean型として推論
let nothing = null // null型として推論
let anything = undefined // undefined型として推論

console.log(`Message: ${message} (type: ${typeof message})`)
console.log(`Count: ${count} (type: ${typeof count})`)
console.log(`IsActive: ${isActive} (type: ${typeof isActive})`)

// 配列の型推論
let numbers = [1, 2, 3, 4, 5] // number[]として推論
let strings = ["apple", "banana", "cherry"] // string[]として推論
let mixed = [1, "two", true, null] // (string | number | boolean | null)[]として推論
let emptyArray = [] // never[]として推論（注意が必要）

console.log("Numbers array:", numbers)
console.log("Mixed array types:", mixed)

// オブジェクトの型推論
let user = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  age: 30
}
// { id: number; name: string; email: string; age: number } として推論

let config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retryCount: 3,
  debug: false
}

console.log("User object:", user)
console.log("Config object:", config)

// =============================================================================
// 2. 関数の型推論
// =============================================================================

console.log("=== 関数の型推論 ===")

// 戻り値の型推論
function add(a: number, b: number) {
  return a + b // number型として推論
}

function greet(name: string) {
  return `Hello, ${name}!` // string型として推論
}

function createUser(name: string, age: number) {
  return {
    id: Math.random(),
    name,
    age,
    createdAt: new Date()
  }
  // { id: number; name: string; age: number; createdAt: Date } として推論
}

// アロー関数の型推論
const multiply = (x: number, y: number) => x * y // (x: number, y: number) => number
const isEven = (n: number) => n % 2 === 0 // (n: number) => boolean

// 高階関数の型推論
function createAdder(base: number) {
  return (value: number) => base + value
}
// (base: number) => (value: number) => number として推論

const addFive = createAdder(5)
console.log("5 + 3 =", addFive(3)) // 8

// 条件分岐による戻り値型の推論
function getLength(input: string | Array<any>) {
  if (typeof input === "string") {
    return input.length // number型として推論
  } else {
    return input.length // number型として推論
  }
}
// (input: string | Array<any>) => number として推論

console.log("String length:", getLength("hello"))
console.log("Array length:", getLength([1, 2, 3, 4]))

// =============================================================================
// 3. コンテキスト型推論
// =============================================================================

console.log("=== コンテキスト型推論 ===")

// イベントハンドラーでの推論
const button = {
  addEventListener: function(event: string, handler: (e: Event) => void) {
    console.log(`Added ${event} handler`)
  }
}

button.addEventListener('click', (event) => {
  // eventは自動的にEvent型として推論される
  console.log('Button clicked:', event.type)
})

// 配列メソッドでの推論
const numbersList = [1, 2, 3, 4, 5]

const doubled = numbersList.map((num) => num * 2) // numはnumber型、戻り値はnumber[]
const evenNumbers = numbersList.filter((num) => num % 2 === 0) // number[]として推論
const stringNumbers = numbersList.map((num) => num.toString()) // string[]として推論

console.log("Doubled:", doubled)
console.log("Even numbers:", evenNumbers)
console.log("String numbers:", stringNumbers)

// Promise での型推論
const fetchData = () => {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve("Data loaded"), 1000)
  })
}

fetchData().then((data) => {
  // dataは自動的にstring型として推論
  console.log("Fetched:", data.toUpperCase())
})

// オブジェクトリテラルでの推論
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

function handleResponse<T>(response: ApiResponse<T>) {
  return response.data
}

const userResponse = handleResponse({
  data: { id: 1, name: "Bob" },
  success: true,
  message: "User fetched successfully"
})
// userResponseは { id: number; name: string } として推論

console.log("API Response data:", userResponse)

// =============================================================================
// 4. ジェネリック型推論
// =============================================================================

console.log("=== ジェネリック型推論 ===")

// 基本的なジェネリック推論
function identity<T>(arg: T): T {
  return arg
}

const stringValue = identity("hello") // Tはstringとして推論
const numberValue = identity(42) // Tはnumberとして推論
const booleanValue = identity(true) // Tはbooleanとして推論
const arrayValue = identity([1, 2, 3]) // Tはnumber[]として推論

console.log("Identity results:", stringValue, numberValue, booleanValue, arrayValue)

// 複数の型パラメータの推論
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 }
}

const person = { name: "Alice", age: 30 }
const contact = { email: "alice@example.com", phone: "123-456-7890" }

const merged = merge(person, contact)
// { name: string; age: number; email: string; phone: string } として推論

console.log("Merged object:", merged)

// 制約付きジェネリックの推論
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const userObj = { id: 1, name: "Charlie", active: true }

const userId = getProperty(userObj, "id") // number として推論
const userName = getProperty(userObj, "name") // string として推論
const userActive = getProperty(userObj, "active") // boolean として推論

console.log("Property values:", userId, userName, userActive)

// 配列の推論
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const firstNumber = first([1, 2, 3]) // number | undefined として推論
const firstString = first(["a", "b", "c"]) // string | undefined として推論

console.log("First elements:", firstNumber, firstString)

// =============================================================================
// 5. コントロールフロー分析と型ナローイング
// =============================================================================

console.log("=== コントロールフロー分析と型ナローイング ===")

// typeof による型ナローイング
function processValue(value: string | number | boolean) {
  if (typeof value === "string") {
    // この分岐内では value は string 型として推論
    console.log("String value:", value.toUpperCase())
    return value.length
  } else if (typeof value === "number") {
    // この分岐内では value は number 型として推論
    console.log("Number value:", value.toFixed(2))
    return value
  } else {
    // この分岐内では value は boolean 型として推論
    console.log("Boolean value:", value ? "true" : "false")
    return value ? 1 : 0
  }
}

console.log("Processing string:", processValue("Hello"))
console.log("Processing number:", processValue(3.14159))
console.log("Processing boolean:", processValue(true))

// null/undefined チェックによる型ナローイング
function greetUser(name: string | null | undefined) {
  if (name != null) { // nullとundefinedの両方をチェック
    // name は string 型として推論
    console.log(`Hello, ${name}!`)
    return name.length
  } else {
    console.log("No name provided")
    return 0
  }
}

console.log("Greeting with name:", greetUser("David"))
console.log("Greeting without name:", greetUser(null))

// in演算子による型ナローイング
interface Bird {
  fly(): void
  layEggs(): void
}

interface Fish {
  swim(): void
  layEggs(): void
}

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    // animal は Bird 型として推論
    animal.fly()
    console.log("Bird is flying")
  } else {
    // animal は Fish 型として推論
    animal.swim()
    console.log("Fish is swimming")
  }
}

const bird: Bird = {
  fly: () => console.log("Flying!"),
  layEggs: () => console.log("Laying eggs")
}

const fish: Fish = {
  swim: () => console.log("Swimming!"),
  layEggs: () => console.log("Laying eggs")
}

move(bird)
move(fish)

// 判別可能ユニオン
type Shape = 
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number }

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // shape は { kind: "circle"; radius: number } として推論
      return Math.PI * shape.radius ** 2
    case "square":
      // shape は { kind: "square"; size: number } として推論
      return shape.size ** 2
    case "rectangle":
      // shape は { kind: "rectangle"; width: number; height: number } として推論
      return shape.width * shape.height
  }
}

const circle: Shape = { kind: "circle", radius: 5 }
const square: Shape = { kind: "square", size: 4 }
const rectangle: Shape = { kind: "rectangle", width: 6, height: 3 }

console.log("Circle area:", getArea(circle))
console.log("Square area:", getArea(square))
console.log("Rectangle area:", getArea(rectangle))

// =============================================================================
// 6. 高度な型推論パターン
// =============================================================================

console.log("=== 高度な型推論パターン ===")

// 条件付き型での推論
type Flatten<T> = T extends Array<infer U> ? U : T

type StringArray = Flatten<string[]> // string
type NumberType = Flatten<number> // number
type NestedArray = Flatten<number[][]> // number[] (一層のみ平坦化)

// 関数の戻り値型を推論
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type FunctionReturn = GetReturnType<() => string> // string
type MethodReturn = GetReturnType<(x: number) => boolean> // boolean

// タプルの推論
function tuple<T extends readonly unknown[]>(...args: T): T {
  return args
}

const coordinates = tuple(10, 20) // [10, 20] として推論（readonly [10, 20]）
const person2 = tuple("Alice", 30, true) // ["Alice", 30, true] として推論

console.log("Coordinates:", coordinates)
console.log("Person tuple:", person2)

// 再帰的な型推論
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

function makeDeepReadonly<T>(obj: T): DeepReadonly<T> {
  // 実装は簡略化
  return obj as DeepReadonly<T>
}

const mutableConfig = {
  database: {
    host: "localhost",
    port: 5432,
    credentials: {
      username: "admin",
      password: "secret"
    }
  },
  api: {
    baseUrl: "https://api.example.com",
    timeout: 5000
  }
}

const readonlyConfig = makeDeepReadonly(mutableConfig)
console.log("Readonly config created:", readonlyConfig.database.host)

// =============================================================================
// 7. 推論の制御と明示的注釈
// =============================================================================

console.log("=== 推論の制御と明示的注釈 ===")

// 型アサーションによる推論の上書き
const input = { value: "123" } as { value: string }
// より複雑な例
const apiResponse = fetch("/api/data").then(r => r.json()) as Promise<{ users: User[] }>

// const assertion による厳密な推論
const routes = {
  home: "/",
  about: "/about",
  contact: "/contact"
} as const
// { readonly home: "/"; readonly about: "/about"; readonly contact: "/contact" }

type RouteKeys = keyof typeof routes // "home" | "about" | "contact"
type RoutePaths = typeof routes[RouteKeys] // "/" | "/about" | "/contact"

console.log("Routes:", routes)

// satisfies演算子（TypeScript 4.9+）を想定した例
const colorConfig = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
  alpha: 0.8
} // satisfies { [key: string]: string | number }

// 明示的な型注釈が必要な場面
interface ComplexState {
  users: User[]
  loading: boolean
  error: string | null
  filters: {
    search: string
    category: string | null
    active: boolean
  }
}

// 初期化時には明示的な型注釈が有効
const initialState: ComplexState = {
  users: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    category: null,
    active: true
  }
}

console.log("Initial state:", initialState)

// =============================================================================
// 8. 実用的な推論パターン
// =============================================================================

console.log("=== 実用的な推論パターン ===")

// ファクトリー関数での推論
function createRepository<T>() {
  const data: T[] = []
  
  return {
    add: (item: T) => {
      data.push(item)
      return data.length - 1
    },
    find: (predicate: (item: T) => boolean) => data.find(predicate),
    findById: (id: number) => data[id],
    getAll: () => [...data],
    update: (id: number, updates: Partial<T>) => {
      if (data[id]) {
        data[id] = { ...data[id], ...updates }
      }
      return data[id]
    },
    remove: (id: number) => data.splice(id, 1)[0]
  }
}

interface User {
  id: number
  name: string
  email: string
  active: boolean
}

const userRepository = createRepository<User>()
// 戻り値の型が適切に推論される

const userId = userRepository.add({
  id: 1,
  name: "Eve",
  email: "eve@example.com",
  active: true
})

const foundUser = userRepository.find(user => user.name === "Eve")
console.log("Found user:", foundUser)

// 型ガードとの組み合わせ
function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isNumber(value: unknown): value is number {
  return typeof value === "number"
}

function isUser(value: unknown): value is User {
  return typeof value === "object" && 
         value !== null && 
         "id" in value && 
         "name" in value && 
         "email" in value
}

function processInput(input: unknown) {
  if (isString(input)) {
    // input は string として推論される
    console.log("String input:", input.toUpperCase())
  } else if (isNumber(input)) {
    // input は number として推論される
    console.log("Number input:", input.toFixed(2))
  } else if (isUser(input)) {
    // input は User として推論される
    console.log("User input:", input.name, input.email)
  } else {
    console.log("Unknown input type")
  }
}

processInput("hello")
processInput(42.567)
processInput({ id: 1, name: "Test", email: "test@example.com", active: true })
processInput({ invalid: "object" })

// チェーンメソッドでの推論
class QueryBuilder<T> {
  private conditions: Array<(item: T) => boolean> = []
  
  constructor(private data: T[]) {}
  
  where(condition: (item: T) => boolean): QueryBuilder<T> {
    this.conditions.push(condition)
    return this
  }
  
  select<K extends keyof T>(key: K): Array<T[K]> {
    const filtered = this.data.filter(item => 
      this.conditions.every(condition => condition(item))
    )
    return filtered.map(item => item[key])
  }
  
  execute(): T[] {
    return this.data.filter(item =>
      this.conditions.every(condition => condition(item))
    )
  }
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", active: true },
  { id: 2, name: "Bob", email: "bob@example.com", active: false },
  { id: 3, name: "Charlie", email: "charlie@example.com", active: true }
]

const query = new QueryBuilder(users)
const activeUserNames = query
  .where(user => user.active)
  .select("name") // string[] として推論

const activeUsers = new QueryBuilder(users)
  .where(user => user.active)
  .execute() // User[] として推論

console.log("Active user names:", activeUserNames)
console.log("Active users:", activeUsers)

// =============================================================================
// まとめ
// =============================================================================

console.log("=== Lesson 36 まとめ ===")
console.log("型推論の主要な機能:")
console.log("1. 基本的な値からの型推論")
console.log("2. 関数の戻り値型推論")
console.log("3. コンテキストに基づく型推論")
console.log("4. ジェネリック型パラメータの推論")
console.log("5. コントロールフロー分析による型ナローイング")
console.log("6. 条件付き型での高度な推論")
console.log("7. 推論の制御と明示的注釈")
console.log("8. 実用的な推論パターンの活用")

export {
  // 基本型
  User,
  
  // 関数
  add,
  greet,
  createUser,
  multiply,
  isEven,
  createAdder,
  getLength,
  
  // ジェネリック関数
  identity,
  merge,
  getProperty,
  first,
  
  // 処理関数
  processValue,
  greetUser,
  move,
  getArea,
  
  // ユーティリティ
  tuple,
  makeDeepReadonly,
  createRepository,
  
  // 型ガード
  isString,
  isNumber,
  isUser,
  processInput,
  
  // クラス
  QueryBuilder,
  
  // 型定義
  Shape,
  ComplexState
}