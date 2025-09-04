/**
 * Lesson 34: マップ型 (Mapped Types) - 演習問題
 * 
 * 各問題を解いて、マップ型の理解を深めましょう。
 */

// =============================================================================
// 演習1: 基本的なマップ型の実装
// =============================================================================

/**
 * 問題1: Optionalize型を実装してください
 * すべてのプロパティをオプショナルにする型を作成
 */

// TODO: Optionalize<T>を実装してください
type Optionalize<T> = {
  // ここに実装
}

// テスト用の型
type Product = {
  id: number
  name: string
  price: number
  category: string
}

type OptionalProduct = Optionalize<Product>
// 期待される型: { id?: number; name?: string; price?: number; category?: string }

/**
 * 問題2: Nullify型を実装してください
 * すべてのプロパティにnullを許可する型を作成
 */

// TODO: Nullify<T>を実装してください
type Nullify<T> = {
  // ここに実装
}

type NullableProduct = Nullify<Product>
// 期待される型: { id: number | null; name: string | null; price: number | null; category: string | null }

// =============================================================================
// 演習2: 条件付きマッピング
// =============================================================================

/**
 * 問題3: NumbersOnly型を実装してください
 * 数値型のプロパティのみを抽出する型を作成
 */

// TODO: NumbersOnly<T>を実装してください
type NumbersOnly<T> = {
  // ここに実装
}

type ProductNumbers = NumbersOnly<Product>
// 期待される型: { id: number; price: number }

/**
 * 問題4: StringToNumber型を実装してください
 * 文字列プロパティのみを数値に変換する型を作成
 */

// TODO: StringToNumber<T>を実装してください
type StringToNumber<T> = {
  // ここに実装
}

type ProductStringToNumber = StringToNumber<Product>
// 期待される型: { id: number; name: number; price: number; category: number }

// =============================================================================
// 演習3: キー変換
// =============================================================================

/**
 * 問題5: Suffix型を実装してください
 * すべてのキーに指定されたサフィックスを追加する型を作成
 */

// TODO: Suffix<T, S>を実装してください（Sは文字列リテラル型）
type Suffix<T, S extends string> = {
  // ここに実装
}

type ProductWithSuffix = Suffix<Product, "_field">
// 期待される型: { id_field: number; name_field: string; price_field: number; category_field: string }

/**
 * 問題6: CamelToSnake型を実装してください
 * キャメルケースのキーをスネークケースに変換する型を作成
 */

type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnake<U>}`
  : S

// TODO: ObjectCamelToSnake<T>を実装してください
type ObjectCamelToSnake<T> = {
  // ここに実装（CamelToSnake型を使用）
}

type CamelCaseProduct = {
  productId: number
  productName: string
  unitPrice: number
  categoryName: string
}

type SnakeCaseProduct = ObjectCamelToSnake<CamelCaseProduct>
// 期待される型: { product_id: number; product_name: string; unit_price: number; category_name: string }

// =============================================================================
// 演習4: 複雑なユーティリティ型
// =============================================================================

/**
 * 問題7: DeepPartial型を実装してください
 * ネストしたオブジェクトのすべてのプロパティをオプショナルにする型を作成
 */

// TODO: DeepPartial<T>を実装してください
type DeepPartial<T> = {
  // ここに実装（再帰的な定義が必要）
}

type Company = {
  id: number
  name: string
  address: {
    street: string
    city: string
    country: {
      code: string
      name: string
    }
  }
  employees: {
    id: number
    name: string
    role: string
  }[]
}

type PartialCompany = DeepPartial<Company>
// すべてのネストしたプロパティがオプショナルになる

/**
 * 問題8: FormValidation型を実装してください
 * フォームバリデーション用の型を作成
 */

type ValidationRule<T> = {
  required?: boolean
  validator?: (value: T) => string | null
  errorMessage?: string
}

// TODO: FormValidation<T>を実装してください
type FormValidation<T> = {
  // ここに実装
}

type ProductFormValidation = FormValidation<Product>
// 期待される型: 各プロパティがValidationRule<対応する型>になる

// =============================================================================
// 演習5: 高度なパターン
// =============================================================================

/**
 * 問題9: EventHandlers型を実装してください
 * イベントハンドラー関数の型を生成
 */

// TODO: EventHandlers<T>を実装してください
type EventHandlers<T> = {
  // キーを "on" + Capitalize<キー名> + "Change" に変換
  // 値を (value: 元の型, oldValue: 元の型) => void に変換
}

type ProductEventHandlers = EventHandlers<Product>
// 期待される型: {
//   onIdChange: (value: number, oldValue: number) => void;
//   onNameChange: (value: string, oldValue: string) => void;
//   onPriceChange: (value: number, oldValue: number) => void;
//   onCategoryChange: (value: string, oldValue: string) => void;
// }

/**
 * 問題10: RepositoryMethods型を実装してください
 * CRUD操作のメソッド型を生成
 */

// TODO: RepositoryMethods<T>を実装してください
type RepositoryMethods<T> = {
  // 以下のメソッドを持つ型を作成：
  // - create: (data: T) => Promise<T>
  // - findById: (id: T extends { id: infer ID } ? ID : never) => Promise<T | null>
  // - update: (id: T extends { id: infer ID } ? ID : never, data: Partial<T>) => Promise<T>
  // - delete: (id: T extends { id: infer ID } ? ID : never) => Promise<boolean>
  // - findAll: () => Promise<T[]>
}

type ProductRepository = RepositoryMethods<Product>

// =============================================================================
// 演習6: 実用的な応用問題
// =============================================================================

/**
 * 問題11: APIEndpoints型を実装してください
 * REST APIのエンドポイント型を生成
 */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

type Endpoint = {
  method: HttpMethod
  path: string
  requestBody?: any
  responseBody?: any
}

// TODO: APIEndpoints<T>を実装してください
// エンティティ型からRESTfulなAPIエンドポイントの型を生成
type APIEndpoints<T> = {
  // 以下のエンドポイントを生成：
  // - list: GET /products → T[]
  // - create: POST /products → T
  // - show: GET /products/:id → T
  // - update: PUT /products/:id → T
  // - destroy: DELETE /products/:id → boolean
}

type ProductAPI = APIEndpoints<Product>

/**
 * 問題12: StateManager型を実装してください
 * 状態管理用の型を生成
 */

// TODO: StateManager<T>を実装してください
type StateManager<T> = {
  // state: T
  // setState: (newState: Partial<T>) => void
  // getState: () => T
  // subscribe: (listener: (state: T) => void) => () => void
  // reset: () => void
  // 各プロパティ用のgetter/setter
}

type ProductStateManager = StateManager<Product>

// =============================================================================
// テスト用のダミー実装
// =============================================================================

// 以下は型チェック用のダミー実装です。実際の動作確認に使用してください。

const testOptionalProduct: OptionalProduct = {
  name: "Test Product"
  // 他のプロパティはオプショナル
}

const testNullableProduct: NullableProduct = {
  id: null,
  name: "Test Product",
  price: null,
  category: "Electronics"
}

// console.log("演習問題の型チェックが完了しました")

export {
  Optionalize,
  Nullify,
  NumbersOnly,
  StringToNumber,
  Suffix,
  ObjectCamelToSnake,
  DeepPartial,
  FormValidation,
  EventHandlers,
  RepositoryMethods,
  APIEndpoints,
  StateManager
}