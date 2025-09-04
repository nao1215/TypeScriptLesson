/**
 * Lesson 38: 型ガード (Type Guards)
 * 
 * ユーザー定義型ガード、判別可能ユニオン、アサーション関数の実装例
 */

// =============================================================================
// 1. 組み込み型ガード
// =============================================================================

console.log("=== 組み込み型ガード ===")

// typeof型ガード
function processValue(value: unknown): string {
  if (typeof value === "string") {
    return `String: ${value.toUpperCase()}`
  } else if (typeof value === "number") {
    return `Number: ${value.toFixed(2)}`
  } else if (typeof value === "boolean") {
    return `Boolean: ${value ? "true" : "false"}`
  } else if (typeof value === "object" && value !== null) {
    return `Object: ${JSON.stringify(value)}`
  } else {
    return "Unknown type"
  }
}

console.log(processValue("hello"))
console.log(processValue(42.567))
console.log(processValue(true))
console.log(processValue({ name: "Alice" }))
console.log(processValue(null))

// instanceof型ガード
class User {
  constructor(public name: string, public email: string) {}
  
  greet(): string {
    return `Hello, I'm ${this.name}`
  }
}

class Admin extends User {
  constructor(name: string, email: string, public permissions: string[]) {
    super(name, email)
  }
  
  manage(): string {
    return `${this.name} is managing with permissions: ${this.permissions.join(", ")}`
  }
}

function handleUser(user: User | Admin): string {
  if (user instanceof Admin) {
    // user は Admin 型として扱われる
    return user.manage()
  } else {
    // user は User 型として扱われる
    return user.greet()
  }
}

const regularUser = new User("Alice", "alice@example.com")
const adminUser = new Admin("Bob", "bob@example.com", ["read", "write", "delete"])

console.log("Regular user:", handleUser(regularUser))
console.log("Admin user:", handleUser(adminUser))

// in演算子による型ガード
interface Bird {
  fly(): void
  feathers: number
}

interface Fish {
  swim(): void
  scales: number
}

function move(animal: Bird | Fish): string {
  if ("fly" in animal) {
    // animal は Bird 型として扱われる
    animal.fly()
    return `Bird with ${animal.feathers} feathers is flying`
  } else {
    // animal は Fish 型として扱われる
    animal.swim()
    return `Fish with ${animal.scales} scales is swimming`
  }
}

const bird: Bird = {
  fly: () => console.log("Flying!"),
  feathers: 1000
}

const fish: Fish = {
  swim: () => console.log("Swimming!"),
  scales: 500
}

console.log(move(bird))
console.log(move(fish))

// =============================================================================
// 2. ユーザー定義型ガード
// =============================================================================

console.log("=== ユーザー定義型ガード ===")

// 基本的な型ガード関数
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
         ((obj as Person).email === undefined || 
          typeof (obj as Person).email === "string")
}

function processPerson(input: unknown): string {
  if (isPerson(input)) {
    // input は Person 型として扱われる
    const emailInfo = input.email ? ` (${input.email})` : ""
    return `${input.name}, age ${input.age}${emailInfo}`
  }
  return "Invalid person data"
}

// テストデータ
console.log(processPerson({ name: "Charlie", age: 25 }))
console.log(processPerson({ name: "Diana", age: 30, email: "diana@example.com" }))
console.log(processPerson({ name: "Invalid", age: "not a number" }))
console.log(processPerson("not an object"))

// 配列型ガード
function isStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && 
         arr.every(item => typeof item === "string")
}

function isNumberArray(arr: unknown): arr is number[] {
  return Array.isArray(arr) && 
         arr.every(item => typeof item === "number")
}

// ジェネリック配列型ガード
function isArrayOf<T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard)
}

function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isNumber(value: unknown): value is number {
  return typeof value === "number"
}

// テスト
const mixedData1 = ["hello", "world", "test"]
const mixedData2 = [1, 2, 3, 4, 5]
const mixedData3 = ["hello", 123, true]

console.log("String array check:", isStringArray(mixedData1)) // true
console.log("Number array check:", isNumberArray(mixedData2)) // true
console.log("Mixed array as string:", isStringArray(mixedData3)) // false

console.log("Generic string array:", isArrayOf(mixedData1, isString)) // true
console.log("Generic number array:", isArrayOf(mixedData2, isNumber)) // true

// =============================================================================
// 3. 判別可能ユニオンと網羅性チェック
// =============================================================================

console.log("=== 判別可能ユニオンと網羅性チェック ===")

// Result パターン
type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E }

function handleResult<T>(result: Result<T>): T | null {
  switch (result.success) {
    case true:
      // result は { success: true; data: T } 型
      console.log("Success:", result.data)
      return result.data
    case false:
      // result は { success: false; error: string } 型
      console.error("Error:", result.error)
      return null
    default:
      // 網羅性チェック
      const exhaustiveCheck: never = result
      throw new Error(`Unhandled case: ${exhaustiveCheck}`)
  }
}

// API レスポンス型
type APIResponse = 
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; message: string }
  | { status: "empty" }

function processAPIResponse(response: APIResponse): string {
  switch (response.status) {
    case "loading":
      return "Loading data..."
    case "success":
      return `Success: ${JSON.stringify(response.data)}`
    case "error":
      return `Error: ${response.message}`
    case "empty":
      return "No data available"
    default:
      // 網羅性チェック
      const exhaustiveCheck: never = response
      throw new Error(`Unhandled status: ${exhaustiveCheck}`)
  }
}

// テスト
const successResult: Result<string> = { success: true, data: "Hello World" }
const errorResult: Result<string> = { success: false, error: "Something went wrong" }

console.log(handleResult(successResult))
console.log(handleResult(errorResult))

const loadingResponse: APIResponse = { status: "loading" }
const successResponse: APIResponse = { status: "success", data: { users: 5 } }
const errorResponse: APIResponse = { status: "error", message: "Network timeout" }

console.log(processAPIResponse(loadingResponse))
console.log(processAPIResponse(successResponse))
console.log(processAPIResponse(errorResponse))

// =============================================================================
// 4. アサーション関数
// =============================================================================

console.log("=== アサーション関数 ===")

// 基本的なアサーション関数
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed")
  }
}

function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error(`Expected number, got ${typeof value}`)
  }
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`)
  }
}

// 使用例
function processInput(input: unknown): string {
  assertIsString(input)
  // この行以降、input は string 型として扱われる
  return input.toUpperCase()
}

function calculateSquare(input: unknown): number {
  assertIsNumber(input)
  // この行以降、input は number 型として扱われる
  return input * input
}

// テスト
console.log("Processed string:", processInput("hello world"))
console.log("Square of 5:", calculateSquare(5))

try {
  processInput(123) // エラーが発生する
} catch (error) {
  console.error("Assertion error:", (error as Error).message)
}

// 条件付きアサーション
function assertIsDefined<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error("Value is null or undefined")
  }
}

function processNullableValue<T>(value: T | null | undefined): T {
  assertIsDefined(value)
  // value は T 型として扱われる
  return value
}

// テスト
console.log("Defined value:", processNullableValue("hello"))

try {
  processNullableValue(null)
} catch (error) {
  console.error("Null assertion error:", (error as Error).message)
}

// =============================================================================
// 5. 実用的な型ガードパターン
// =============================================================================

console.log("=== 実用的な型ガードパターン ===")

// API レスポンス検証
interface APIUser {
  id: number
  name: string
  email: string
  created_at: string
}

function isAPIUser(obj: unknown): obj is APIUser {
  return typeof obj === "object" &&
         obj !== null &&
         "id" in obj && typeof (obj as APIUser).id === "number" &&
         "name" in obj && typeof (obj as APIUser).name === "string" &&
         "email" in obj && typeof (obj as APIUser).email === "string" &&
         "created_at" in obj && typeof (obj as APIUser).created_at === "string"
}

// モックAPIレスポンス処理
function processAPIData(data: unknown): APIUser | null {
  if (isAPIUser(data)) {
    console.log(`Valid user: ${data.name} (${data.email})`)
    return data
  } else {
    console.error("Invalid user data from API")
    return null
  }
}

// テストデータ
const validUserData = {
  id: 1,
  name: "Eve",
  email: "eve@example.com",
  created_at: "2024-01-01T00:00:00Z"
}

const invalidUserData = {
  id: "not a number",
  name: "Invalid User"
}

console.log("Valid data:", processAPIData(validUserData))
console.log("Invalid data:", processAPIData(invalidUserData))

// 環境変数検証
interface Config {
  DATABASE_URL: string
  PORT: number
  SECRET_KEY: string
  DEBUG: boolean
}

function assertString(value: string | undefined, name: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
}

function parseNumber(value: string | undefined, name: string): number {
  assertString(value, name)
  const num = parseInt(value, 10)
  if (isNaN(num)) {
    throw new Error(`Environment variable ${name} must be a number`)
  }
  return num
}

function parseBoolean(value: string | undefined): boolean {
  return value === "true" || value === "1"
}

function validateEnv(env: Record<string, string | undefined>): Config {
  assertString(env.DATABASE_URL, "DATABASE_URL")
  assertString(env.SECRET_KEY, "SECRET_KEY")
  
  return {
    DATABASE_URL: env.DATABASE_URL,
    PORT: parseNumber(env.PORT, "PORT"),
    SECRET_KEY: env.SECRET_KEY,
    DEBUG: parseBoolean(env.DEBUG)
  }
}

// モック環境変数でのテスト
const mockEnv = {
  DATABASE_URL: "postgresql://localhost:5432/mydb",
  PORT: "3000",
  SECRET_KEY: "my-secret-key",
  DEBUG: "true"
}

try {
  const config = validateEnv(mockEnv)
  console.log("Configuration loaded:", config)
} catch (error) {
  console.error("Configuration error:", (error as Error).message)
}

// =============================================================================
// 6. 複雑な型ガードパターン
// =============================================================================

console.log("=== 複雑な型ガードパターン ===")

// 再帰的な型ガード
type NestedObject = {
  [key: string]: string | number | boolean | NestedObject
}

function isNestedObject(obj: unknown): obj is NestedObject {
  if (typeof obj !== "object" || obj === null) {
    return false
  }
  
  return Object.values(obj).every(value => {
    return typeof value === "string" ||
           typeof value === "number" ||
           typeof value === "boolean" ||
           isNestedObject(value)
  })
}

const nestedData = {
  name: "Alice",
  age: 30,
  active: true,
  address: {
    city: "Tokyo",
    country: "Japan",
    coordinates: {
      lat: 35.6762,
      lng: 139.6503
    }
  }
}

console.log("Nested object validation:", isNestedObject(nestedData))

// エラーハンドリングとの組み合わせ
type SafeResult<T> = 
  | { success: true; value: T }
  | { success: false; error: string }

function safeParseJSON(json: string): SafeResult<unknown> {
  try {
    const value = JSON.parse(json)
    return { success: true, value }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

function safeCast<T>(
  value: unknown, 
  guard: (value: unknown) => value is T
): SafeResult<T> {
  if (guard(value)) {
    return { success: true, value }
  } else {
    return { success: false, error: "Type guard failed" }
  }
}

// 使用例
const jsonString = '{"name": "Frank", "age": 35}'
const parseResult = safeParseJSON(jsonString)

if (parseResult.success) {
  const castResult = safeCast(parseResult.value, isPerson)
  if (castResult.success) {
    console.log("Successfully parsed person:", castResult.value.name)
  } else {
    console.log("Cast to person failed:", castResult.error)
  }
} else {
  console.log("JSON parse failed:", parseResult.error)
}

// =============================================================================
// まとめ
// =============================================================================

console.log("=== Lesson 38 まとめ ===")
console.log("型ガードの主要な機能:")
console.log("1. typeof, instanceof, in演算子による組み込み型ガード")
console.log("2. ユーザー定義型ガード関数による型安全性")
console.log("3. 判別可能ユニオンと網羅性チェック")
console.log("4. アサーション関数による前提条件の表現")
console.log("5. 実用的なパターン（API検証、環境変数等）")
console.log("6. エラーハンドリングとの組み合わせ")

export {
  // クラス
  User,
  Admin,
  
  // 型定義  
  Person,
  Bird,
  Fish,
  Result,
  APIResponse,
  APIUser,
  Config,
  NestedObject,
  SafeResult,
  
  // 型ガード関数
  isPerson,
  isStringArray,
  isNumberArray,
  isArrayOf,
  isString,
  isNumber,
  isAPIUser,
  isNestedObject,
  
  // アサーション関数
  assert,
  assertIsNumber,
  assertIsString,
  assertIsDefined,
  assertString,
  
  // ユーティリティ関数
  processValue,
  handleUser,
  move,
  processPerson,
  handleResult,
  processAPIResponse,
  processInput,
  calculateSquare,
  processNullableValue,
  processAPIData,
  validateEnv,
  parseNumber,
  parseBoolean,
  safeParseJSON,
  safeCast
}