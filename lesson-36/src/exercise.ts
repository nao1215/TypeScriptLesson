/**
 * Lesson 36: 型推論 (Type Inference) - 演習問題
 * 
 * 各問題を解いて、型推論の理解を深めましょう。
 */

// =============================================================================
// 演習1: 基本的な型推論
// =============================================================================

/**
 * 問題1: 以下の変数の推論される型を答えてください
 */

const value1 = 42
const value2 = "hello"
const value3 = [1, 2, 3]
const value4 = { name: "Alice", age: 30 }
const value5 = [1, "two", true]
const value6 = null
const value7 = undefined

// TODO: 上記の変数の推論される型をコメントで記述してください
// value1: ?
// value2: ?
// value3: ?
// value4: ?
// value5: ?
// value6: ?
// value7: ?

/**
 * 問題2: 関数の戻り値型推論
 * 以下の関数の戻り値型を推論してください
 */

function exercise1(x: number, y: number) {
  return x + y
}

function exercise2(name: string) {
  return `Hello, ${name}!`
}

function exercise3(items: string[]) {
  return items.map(item => item.toUpperCase())
}

function exercise4(condition: boolean) {
  if (condition) {
    return "success"
  } else {
    return 404
  }
}

// TODO: 上記の関数の戻り値型をコメントで記述してください
// exercise1: ?
// exercise2: ?
// exercise3: ?
// exercise4: ?

// =============================================================================
// 演習2: ジェネリック型推論
// =============================================================================

/**
 * 問題3: ジェネリック関数の型推論を活用した実装
 * 配列の最後の要素を取得する関数を実装してください
 */

// TODO: last関数を実装してください（型推論を活用）
function last<T>(/* パラメータを定義 */) {
  // 実装
}

// 使用例（これらがコンパイルエラーなく動作するように実装）
const lastNumber = last([1, 2, 3, 4, 5]) // number | undefined として推論されるべき
const lastString = last(["a", "b", "c"]) // string | undefined として推論されるべき

/**
 * 問題4: 複数の型パラメータを持つ関数の実装
 * 2つのオブジェクトを結合し、共通のプロパティは第2引数で上書きする関数を実装
 */

// TODO: override関数を実装してください
function override<T, U>(/* パラメータを定義 */) {
  // 実装
}

// 使用例
const base = { id: 1, name: "Alice", age: 30 }
const updates = { age: 31, email: "alice@example.com" }
const result = override(base, updates)
// resultは { id: number; name: string; age: number; email: string } として推論されるべき

// =============================================================================
// 演習3: 型ナローイングとコントロールフロー分析
// =============================================================================

/**
 * 問題5: 型ガード関数の実装
 * オブジェクトが特定の構造を持っているかチェックする型ガード関数を実装
 */

interface Person {
  name: string
  age: number
  email?: string
}

// TODO: isPerson型ガード関数を実装してください
function isPerson(/* パラメータ */): /* 戻り値型 */ {
  // 実装
}

// 使用例
function processPerson(input: unknown) {
  if (isPerson(input)) {
    // ここでinputはPerson型として扱われるべき
    console.log(input.name, input.age)
  }
}

/**
 * 問題6: 判別可能ユニオンを使った関数の実装
 * 異なる種類のメッセージを処理する関数を実装
 */

type Message = 
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string; duration: number }

// TODO: processMessage関数を実装してください
function processMessage(message: Message): string {
  // 実装（switch文を使って各メッセージタイプに応じた処理）
}

// =============================================================================
// 演習4: 高度な型推論パターン
// =============================================================================

/**
 * 問題7: 条件付き型での推論を活用した関数
 * 配列の場合は最初の要素、そうでなければそのまま返す関数を実装
 */

// TODO: unwrap関数とUnwrap型を実装してください
type Unwrap<T> = /* 型定義 */

function unwrap<T>(/* パラメータ */): Unwrap<T> {
  // 実装
}

// 使用例
const unwrapped1 = unwrap([1, 2, 3]) // number として推論されるべき
const unwrapped2 = unwrap("hello") // string として推論されるべき

/**
 * 問題8: 再帰的な型推論
 * ネストしたオブジェクトをフラット化する関数の型定義
 */

// TODO: DeepFlatten型を実装してください
type DeepFlatten<T> = /* 型定義 */

// TODO: flatten関数を実装してください（簡単な実装でOK）
function flatten<T>(/* パラメータ */): DeepFlatten<T> {
  // 実装
}

// =============================================================================
// 演習5: 実用的な推論パターン
// =============================================================================

/**
 * 問題9: ファクトリーパターンでの型推論
 * 型安全なステートマシンを作成する関数を実装
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

// TODO: createStateMachine関数を実装してください
function createStateMachine<T>(/* パラメータ */): StateMachine<T> {
  // 実装
}

// 使用例
interface User {
  id: number
  name: string
}

const userStateMachine = createStateMachine<User>()
// userStateMachineの型が適切に推論されることを確認

/**
 * 問題10: チェーンメソッドでの型推論
 * 型安全なクエリビルダーを実装
 */

interface QueryCondition<T> {
  field: keyof T
  operator: "eq" | "ne" | "gt" | "lt" | "contains"
  value: any
}

// TODO: TypeSafeQueryBuilder クラスを実装してください
class TypeSafeQueryBuilder<T> {
  // プライベートフィールド
  
  constructor(/* パラメータ */) {
    // 実装
  }
  
  // TODO: whereメソッドを実装（チェーン可能）
  where(/* パラメータ */): TypeSafeQueryBuilder<T> {
    // 実装
  }
  
  // TODO: selectメソッドを実装（指定されたフィールドのみを選択）
  select<K extends keyof T>(/* パラメータ */): /* 戻り値型 */ {
    // 実装
  }
  
  // TODO: executeメソッドを実装
  execute(): T[] {
    // 実装
  }
}

// 使用例
const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
]

const queryBuilder = new TypeSafeQueryBuilder(users)
const names = queryBuilder
  .where({ field: "id", operator: "gt", value: 0 })
  .select("name") // string[] として推論されるべき

// =============================================================================
// 演習6: 推論の制御
// =============================================================================

/**
 * 問題11: const assertionと推論の制御
 * 設定オブジェクトを適切に型推論させる実装
 */

// TODO: createConfig関数を実装してください
// constアサーションを使って、より厳密な型推論を行う
function createConfig(/* パラメータ */) {
  // 実装
}

// 使用例
const config = createConfig({
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
})

// configの型がリテラル型として推論されることを期待

/**
 * 問題12: 型推論の限界への対処
 * 空の配列から始めて、適切な型推論を維持する方法
 */

// TODO: createTypedArray関数を実装してください
function createTypedArray<T>(): {
  items: T[]
  add: (item: T) => void
  getAll: () => T[]
  filter: (predicate: (item: T) => boolean) => T[]
} {
  // 実装
}

// 使用例
const stringArray = createTypedArray<string>()
stringArray.add("hello")
const filtered = stringArray.filter(str => str.length > 3) // string[] として推論

// =============================================================================
// テスト用のダミー実装
// =============================================================================

// console.log("演習問題の型チェックが完了しました")

export {
  // 実装する関数たち
  last,
  override, 
  isPerson,
  processMessage,
  unwrap,
  flatten,
  createStateMachine,
  TypeSafeQueryBuilder,
  createConfig,
  createTypedArray,
  
  // 型定義
  Person,
  Message,
  State,
  StateMachine,
  QueryCondition,
  Unwrap,
  DeepFlatten
}