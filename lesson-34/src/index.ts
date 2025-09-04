/**
 * Lesson 34: マップ型 (Mapped Types)
 * 
 * マップ型の基本から応用まで、包括的な例を学習します。
 */

// =============================================================================
// 1. 基本的なマップ型
// =============================================================================

// 基本構文: 既存の型のすべてのプロパティを変換
type BasicMapped<T> = {
  [K in keyof T]: T[K]
}

// 例: User型の定義
type User = {
  id: number
  name: string
  email: string
  age: number
}

// すべてのプロパティを文字列に変換
type StringifyAll<T> = {
  [K in keyof T]: string
}

type StringUser = StringifyAll<User>
// { id: string; name: string; email: string; age: string }

console.log("=== 基本的なマップ型 ===")
const stringUser: StringUser = {
  id: "1",
  name: "John Doe", 
  email: "john@example.com",
  age: "30"
}
console.log("StringUser:", stringUser)

// =============================================================================
// 2. keyof演算子の活用
// =============================================================================

console.log("=== keyof演算子の活用 ===")

// keyofでオブジェクトのキーを取得
type UserKeys = keyof User // "id" | "name" | "email" | "age"

// 特定のプロパティのみを選択するPick型の実装
type CustomPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type UserBasicInfo = CustomPick<User, "name" | "email">
// { name: string; email: string }

const userBasicInfo: UserBasicInfo = {
  name: "Alice",
  email: "alice@example.com"
}
console.log("UserBasicInfo:", userBasicInfo)

// Omit型の実装（特定のプロパティを除外）
type CustomOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

type UserWithoutId = CustomOmit<User, "id">
// { name: string; email: string; age: number }

const userWithoutId: UserWithoutId = {
  name: "Bob",
  email: "bob@example.com", 
  age: 25
}
console.log("UserWithoutId:", userWithoutId)

// =============================================================================
// 3. 修飾子操作
// =============================================================================

console.log("=== 修飾子操作 ===")

// readonly修飾子を追加
type CustomReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

type ReadonlyUser = CustomReadonly<User>

// readonly修飾子を削除
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}

// オプショナル修飾子を追加
type CustomPartial<T> = {
  [K in keyof T]?: T[K]
}

type PartialUser = CustomPartial<User>

const partialUser: PartialUser = {
  name: "Charlie" // 他のプロパティはオプショナル
}
console.log("PartialUser:", partialUser)

// オプショナル修飾子を削除
type CustomRequired<T> = {
  [K in keyof T]-?: T[K]
}

// オプショナルプロパティを持つ型
type OptionalUser = {
  id?: number
  name?: string
  email?: string
}

type RequiredUser = CustomRequired<OptionalUser>
// { id: number; name: string; email: string }

// =============================================================================
// 4. 条件付きマッピング
// =============================================================================

console.log("=== 条件付きマッピング ===")

// 文字列プロパティのみをnull許可にする
type NullableStrings<T> = {
  [K in keyof T]: T[K] extends string ? T[K] | null : T[K]
}

type NullableUser = NullableStrings<User>
// { id: number; name: string | null; email: string | null; age: number }

const nullableUser: NullableUser = {
  id: 1,
  name: null, // 文字列プロパティはnullが許可される
  email: "test@example.com",
  age: 30
}
console.log("NullableUser:", nullableUser)

// 関数プロパティのみを抽出
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

type FunctionProperties<T> = CustomPick<T, FunctionPropertyNames<T>>

// 例: クラスから関数プロパティのみを抽出
class Calculator {
  value: number = 0
  
  add(x: number): number {
    return this.value + x
  }
  
  multiply(x: number): number {
    return this.value * x
  }
  
  reset(): void {
    this.value = 0
  }
}

type CalculatorMethods = FunctionProperties<Calculator>
// { add: (x: number) => number; multiply: (x: number) => number; reset: () => void }

// =============================================================================
// 5. 再帰的マップ型
// =============================================================================

console.log("=== 再帰的マップ型 ===")

// 深くネストしたオブジェクトをreadonly化
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object 
    ? T[K] extends Function 
      ? T[K] 
      : DeepReadonly<T[K]>
    : T[K]
}

// ネストした型の例
type Profile = {
  user: User
  settings: {
    theme: string
    notifications: {
      email: boolean
      push: boolean
    }
  }
  preferences: string[]
}

type ReadonlyProfile = DeepReadonly<Profile>
// すべてのネストしたプロパティもreadonly

const readonlyProfile: ReadonlyProfile = {
  user: {
    id: 1,
    name: "Dave",
    email: "dave@example.com",
    age: 35
  },
  settings: {
    theme: "dark",
    notifications: {
      email: true,
      push: false
    }
  },
  preferences: ["coding", "music"]
}

// readonlyProfile.user.name = "New Name" // エラー: readonly

console.log("ReadonlyProfile:", readonlyProfile)

// =============================================================================
// 6. 実用的なユーティリティ型
// =============================================================================

console.log("=== 実用的なユーティリティ型 ===")

// APIレスポンス型の生成
type ApiResponse<T> = {
  [K in keyof T]: {
    data: T[K]
    loading: boolean
    error: string | null
    lastUpdated: Date
  }
}

type UserApiResponse = ApiResponse<User>

const userApiResponse: UserApiResponse = {
  id: {
    data: 1,
    loading: false,
    error: null,
    lastUpdated: new Date()
  },
  name: {
    data: "Eve",
    loading: false,
    error: null,
    lastUpdated: new Date()
  },
  email: {
    data: "eve@example.com",
    loading: false,
    error: null,
    lastUpdated: new Date()
  },
  age: {
    data: 28,
    loading: true,
    error: "Network timeout",
    lastUpdated: new Date(Date.now() - 60000)
  }
}

console.log("UserApiResponse:", userApiResponse)

// フォームフィールド型の生成
type FormField<T> = {
  value: T
  touched: boolean
  error?: string
  validate?: (value: T) => string | undefined
}

type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>
}

type UserForm = FormFields<User>

const userForm: UserForm = {
  id: {
    value: 1,
    touched: false
  },
  name: {
    value: "Frank",
    touched: true,
    validate: (value) => value.length < 2 ? "名前は2文字以上入力してください" : undefined
  },
  email: {
    value: "frank@example.com",
    touched: true,
    validate: (value) => !value.includes("@") ? "有効なメールアドレスを入力してください" : undefined
  },
  age: {
    value: 25,
    touched: false,
    validate: (value) => value < 0 ? "年齢は0以上を入力してください" : undefined
  }
}

console.log("UserForm:", userForm)

// =============================================================================
// 7. キー変換パターン
// =============================================================================

console.log("=== キー変換パターン ===")

// プロパティ名に接頭辞を追加
type Prefix<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K]
}

type PrefixedUser = Prefix<User, "user_">
// { user_id: number; user_name: string; user_email: string; user_age: number }

// プロパティ名を大文字に変換
type UppercaseKeys<T> = {
  [K in keyof T as Uppercase<string & K>]: T[K]
}

type UppercaseUser = UppercaseKeys<User>
// { ID: number; NAME: string; EMAIL: string; AGE: number }

// Getters/Settersパターン
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
}

type UserGetters = Getters<User>
// { getId: () => number; getName: () => string; getEmail: () => string; getAge: () => number }

type UserSetters = Setters<User>
// { setId: (value: number) => void; setName: (value: string) => void; ... }

// =============================================================================
// 8. 高度な変換パターン
// =============================================================================

console.log("=== 高度な変換パターン ===")

// 型の値を配列に変換
type Arrayify<T> = {
  [K in keyof T]: T[K][]
}

type ArrayUser = Arrayify<User>
// { id: number[]; name: string[]; email: string[]; age: number[] }

// Promise化
type Promisify<T> = {
  [K in keyof T]: Promise<T[K]>
}

type AsyncUser = Promisify<User>
// { id: Promise<number>; name: Promise<string>; email: Promise<string>; age: Promise<number> }

// 型の値をObservable化（例）
interface Observable<T> {
  subscribe(observer: (value: T) => void): void
  unsubscribe(): void
}

type Observify<T> = {
  [K in keyof T]: Observable<T[K]>
}

type ObservableUser = Observify<User>

// =============================================================================
// 9. 複雑な例：型安全なSQL Query Builder
// =============================================================================

console.log("=== 型安全なSQL Query Builder ===")

// テーブル定義
type UserTable = {
  id: number
  name: string
  email: string
  age: number
  created_at: Date
}

// 選択可能なフィールド型
type SelectableFields<T> = {
  [K in keyof T]?: boolean
}

// WHERE句の条件型
type WhereConditions<T> = {
  [K in keyof T]?: T[K] | {
    gt?: T[K]
    lt?: T[K]
    gte?: T[K]
    lte?: T[K]
    in?: T[K][]
    like?: string
  }
}

// クエリビルダーの型
type QueryBuilder<T> = {
  select: <K extends keyof T>(fields: SelectableFields<T>) => QueryBuilder<Pick<T, K>>
  where: (conditions: WhereConditions<T>) => QueryBuilder<T>
  orderBy: <K extends keyof T>(field: K, direction: 'ASC' | 'DESC') => QueryBuilder<T>
  limit: (count: number) => QueryBuilder<T>
  execute: () => Promise<T[]>
}

// 使用例の型定義（実装は簡略化）
declare function createQueryBuilder<T>(table: string): QueryBuilder<T>

// 型安全なクエリの構築例
const userQuery = createQueryBuilder<UserTable>("users")
  .select({ name: true, email: true, age: true })
  .where({ 
    age: { gt: 18 },
    name: { like: "John%" }
  })
  .orderBy("created_at", "DESC")
  .limit(10)

console.log("SQL Query Builder型チェック完了")

// =============================================================================
// まとめ
// =============================================================================

console.log("=== Lesson 34 まとめ ===")
console.log("マップ型の主要な機能:")
console.log("1. 基本的なプロパティ変換")
console.log("2. 修飾子操作（readonly, optional）")
console.log("3. 条件付きマッピング")
console.log("4. 再帰的変換")
console.log("5. キー名変換")
console.log("6. 実用的なユーティリティ型の作成")

export {
  User,
  StringUser,
  UserBasicInfo,
  ReadonlyUser,
  PartialUser,
  NullableUser,
  ReadonlyProfile,
  UserApiResponse,
  UserForm,
  PrefixedUser,
  UppercaseUser,
  UserGetters,
  UserSetters,
  ArrayUser,
  AsyncUser,
  ObservableUser,
  QueryBuilder
}