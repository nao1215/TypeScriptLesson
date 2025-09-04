# Lesson 38: 型ガード (Type Guards)

## 学習目標
- ユーザー定義型ガード関数の実装
- 組み込み型ガード（typeof、instanceof、in）の活用
- 判別可能ユニオンと網羅性チェックの理解
- アサーション関数と型述語の使い分け
- 型安全なエラーハンドリングパターンの構築

## 型ガードとは

型ガードは、実行時に値の型を確認し、TypeScriptコンパイラーにその型情報を伝える仕組みです。これにより、実行時の型安全性を確保しながら、コンパイル時の型チェックも活用できます。

## 組み込み型ガード

### typeof型ガード

```typescript
function processValue(value: unknown): string {
  if (typeof value === "string") {
    // この分岐内では value は string 型
    return value.toUpperCase()
  } else if (typeof value === "number") {
    // この分岐内では value は number 型
    return value.toString()
  } else if (typeof value === "boolean") {
    // この分岐内では value は boolean 型
    return value ? "true" : "false"
  } else {
    return "unknown type"
  }
}
```

### instanceof型ガード

```typescript
class User {
  constructor(public name: string) {}
  greet() { return `Hello, I'm ${this.name}` }
}

class Admin extends User {
  constructor(name: string, public permissions: string[]) {
    super(name)
  }
  manage() { return "Managing system..." }
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
```

### in演算子による型ガード

```typescript
interface Bird {
  fly(): void
  feathers: number
}

interface Fish {
  swim(): void
  scales: number
}

function move(animal: Bird | Fish): void {
  if ("fly" in animal) {
    // animal は Bird 型として扱われる
    animal.fly()
  } else {
    // animal は Fish 型として扱われる
    animal.swim()
  }
}
```

## ユーザー定義型ガード

### 基本的な型ガード関数

```typescript
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

// 使用例
function processPerson(input: unknown) {
  if (isPerson(input)) {
    // input は Person 型として扱われる
    console.log(`${input.name} is ${input.age} years old`)
  }
}
```

### 配列型ガード

```typescript
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
```

## 判別可能ユニオンと網羅性チェック

### 基本的な判別可能ユニオン

```typescript
type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E }

function handleResult<T>(result: Result<T>): T | null {
  switch (result.success) {
    case true:
      // result は { success: true; data: T } 型
      return result.data
    case false:
      // result は { success: false; error: string } 型
      console.error("Error:", result.error)
      return null
  }
}

// より複雑な判別可能ユニオン
type APIResponse = 
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; message: string }
  | { status: "empty" }

function processAPIResponse(response: APIResponse): void {
  switch (response.status) {
    case "loading":
      console.log("Loading...")
      break
    case "success":
      console.log("Data:", response.data)
      break
    case "error":
      console.error("Error:", response.message)
      break
    case "empty":
      console.log("No data available")
      break
    default:
      // 網羅性チェック
      const exhaustiveCheck: never = response
      throw new Error(`Unhandled case: ${exhaustiveCheck}`)
  }
}
```

## アサーション関数

### 基本的なアサーション関数

```typescript
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed")
  }
}

function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error("Value is not a number")
  }
}

// 使用例
function processInput(input: unknown) {
  assertIsNumber(input)
  // この行以降、input は number 型として扱われる
  console.log(input.toFixed(2))
}
```

### 条件付きアサーション

```typescript
function assertIsDefined<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error("Value is null or undefined")
  }
}

function processValue<T>(value: T | null | undefined): T {
  assertIsDefined(value)
  // value は T 型として扱われる
  return value
}
```

## 実用的な型ガードパターン

### API レスポンス検証

```typescript
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

async function fetchUser(id: number): Promise<APIUser> {
  const response = await fetch(`/api/users/${id}`)
  const data = await response.json()
  
  if (!isAPIUser(data)) {
    throw new Error("Invalid user data from API")
  }
  
  return data // data は APIUser 型として扱われる
}
```

### 環境変数検証

```typescript
interface Config {
  DATABASE_URL: string
  PORT: number
  SECRET_KEY: string
  DEBUG: boolean
}

function validateEnv(env: Record<string, string | undefined>): Config {
  function assertString(value: string | undefined, name: string): asserts value is string {
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`Missing required environment variable: ${name}`)
    }
  }
  
  function assertNumber(value: string | undefined, name: string): number {
    assertString(value, name)
    const num = parseInt(value, 10)
    if (isNaN(num)) {
      throw new Error(`Environment variable ${name} must be a number`)
    }
    return num
  }
  
  function assertBoolean(value: string | undefined): boolean {
    return value === "true" || value === "1"
  }
  
  assertString(env.DATABASE_URL, "DATABASE_URL")
  assertString(env.SECRET_KEY, "SECRET_KEY")
  
  return {
    DATABASE_URL: env.DATABASE_URL,
    PORT: assertNumber(env.PORT, "PORT"),
    SECRET_KEY: env.SECRET_KEY,
    DEBUG: assertBoolean(env.DEBUG)
  }
}
```

## エラーハンドリングとの組み合わせ

### Result パターンと型ガード

```typescript
type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E }

function isSuccess<T, E>(result: Result<T, E>): result is { success: true; value: T } {
  return result.success === true
}

function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false
}

// 使用例
function handleOperation<T>(result: Result<T>): T {
  if (isSuccess(result)) {
    return result.value // T 型として扱われる
  } else {
    throw result.error // Error 型として扱われる
  }
}

// チェーン処理
function mapResult<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return { success: true, value: transform(result.value) }
  } else {
    return result
  }
}
```

## まとめ

型ガードは以下の特徴を持ちます：

1. **実行時型チェック**: 動的な型検証とコンパイル時型情報の連携
2. **ユーザー定義型ガード**: カスタムな型検証ロジック
3. **判別可能ユニオン**: パターンマッチングによる型安全性
4. **アサーション関数**: 前提条件の型レベル表現
5. **実用的パターン**: API、設定、エラーハンドリングでの活用

型ガードを適切に活用することで、実行時の型安全性とコンパイル時の型チェックを両立できます。

## 次回予告

次のLesson 39では、高度なエラーハンドリングについて学習し、Result/Eitherパターンや関数型エラーハンドリングを習得します。

## 実習

`src/exercise.ts`の演習問題に挑戦してみましょう。様々な型ガードパターンを実装することで、理解を深めることができます。