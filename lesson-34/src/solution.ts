/**
 * Lesson 34: マップ型 (Mapped Types) - 解答例
 * 
 * 演習問題の解答と詳細な解説
 */

// =============================================================================
// 演習1: 基本的なマップ型の実装 - 解答
// =============================================================================

/**
 * 問題1の解答: Optionalize型の実装
 */
type Optionalize<T> = {
  [K in keyof T]?: T[K]
}

// 使用例とテスト
type Product = {
  id: number
  name: string
  price: number
  category: string
}

type OptionalProduct = Optionalize<Product>
// { id?: number; name?: string; price?: number; category?: string }

const optionalProduct: OptionalProduct = {
  name: "Laptop", // 他のプロパティは省略可能
  price: 999
}

/**
 * 問題2の解答: Nullify型の実装
 */
type Nullify<T> = {
  [K in keyof T]: T[K] | null
}

type NullableProduct = Nullify<Product>

const nullableProduct: NullableProduct = {
  id: 1,
  name: null, // nullが許可される
  price: 999,
  category: "Electronics"
}

// =============================================================================
// 演習2: 条件付きマッピング - 解答
// =============================================================================

/**
 * 問題3の解答: NumbersOnly型の実装
 */
type NumbersOnly<T> = {
  [K in keyof T as T[K] extends number ? K : never]: T[K]
}

type ProductNumbers = NumbersOnly<Product>
// { id: number; price: number }

const productNumbers: ProductNumbers = {
  id: 1,
  price: 999
  // nameとcategoryは数値型でないため除外される
}

/**
 * 問題4の解答: StringToNumber型の実装
 */
type StringToNumber<T> = {
  [K in keyof T]: T[K] extends string ? number : T[K]
}

type ProductStringToNumber = StringToNumber<Product>
// { id: number; name: number; price: number; category: number }

const productStringToNumber: ProductStringToNumber = {
  id: 1,
  name: 123, // 文字列型が数値型に変換される
  price: 999,
  category: 456 // 文字列型が数値型に変換される
}

// =============================================================================
// 演習3: キー変換 - 解答
// =============================================================================

/**
 * 問題5の解答: Suffix型の実装
 */
type Suffix<T, S extends string> = {
  [K in keyof T as `${string & K}${S}`]: T[K]
}

type ProductWithSuffix = Suffix<Product, "_field">
// { id_field: number; name_field: string; price_field: number; category_field: string }

const productWithSuffix: ProductWithSuffix = {
  id_field: 1,
  name_field: "Laptop",
  price_field: 999,
  category_field: "Electronics"
}

/**
 * 問題6の解答: CamelToSnake型の実装
 */

// 補助的な型：文字列をスネークケースに変換
type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnake<U>}`
  : S

// より実用的な実装（先頭の大文字も考慮）
type CamelToSnakeAdvanced<S extends string> = 
  S extends `${infer First}${infer Rest}`
    ? First extends Lowercase<First>
      ? `${First}${CamelToSnakeAdvanced<Rest>}`
      : `_${Lowercase<First>}${CamelToSnakeAdvanced<Rest>}`
    : S

type ObjectCamelToSnake<T> = {
  [K in keyof T as CamelToSnakeAdvanced<string & K>]: T[K]
}

type CamelCaseProduct = {
  productId: number
  productName: string
  unitPrice: number
  categoryName: string
}

type SnakeCaseProduct = ObjectCamelToSnake<CamelCaseProduct>
// { product_id: number; product_name: string; unit_price: number; category_name: string }

const snakeCaseProduct: SnakeCaseProduct = {
  product_id: 1,
  product_name: "Laptop",
  unit_price: 999,
  category_name: "Electronics"
}

// =============================================================================
// 演習4: 複雑なユーティリティ型 - 解答
// =============================================================================

/**
 * 問題7の解答: DeepPartial型の実装
 */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : T[K] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : DeepPartial<T[K]>
    : T[K]
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

const partialCompany: PartialCompany = {
  name: "Tech Corp",
  address: {
    city: "Tokyo"
    // street、countryは省略可能
  }
  // employees、idも省略可能
}

/**
 * 問題8の解答: FormValidation型の実装
 */
type ValidationRule<T> = {
  required?: boolean
  validator?: (value: T) => string | null
  errorMessage?: string
}

type FormValidation<T> = {
  [K in keyof T]: ValidationRule<T[K]>
}

type ProductFormValidation = FormValidation<Product>

const productFormValidation: ProductFormValidation = {
  id: {
    required: true,
    validator: (value) => value > 0 ? null : "IDは正の数である必要があります"
  },
  name: {
    required: true,
    validator: (value) => value.length >= 2 ? null : "製品名は2文字以上である必要があります",
    errorMessage: "製品名を入力してください"
  },
  price: {
    required: true,
    validator: (value) => value > 0 ? null : "価格は正の数である必要があります"
  },
  category: {
    required: false,
    validator: (value) => value.length > 0 ? null : "カテゴリを選択してください"
  }
}

// =============================================================================
// 演習5: 高度なパターン - 解答
// =============================================================================

/**
 * 問題9の解答: EventHandlers型の実装
 */
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K], oldValue: T[K]) => void
}

type ProductEventHandlers = EventHandlers<Product>

const productEventHandlers: ProductEventHandlers = {
  onIdChange: (value, oldValue) => {
    console.log(`ID changed from ${oldValue} to ${value}`)
  },
  onNameChange: (value, oldValue) => {
    console.log(`Name changed from "${oldValue}" to "${value}"`)
  },
  onPriceChange: (value, oldValue) => {
    console.log(`Price changed from ${oldValue} to ${value}`)
  },
  onCategoryChange: (value, oldValue) => {
    console.log(`Category changed from "${oldValue}" to "${value}"`)
  }
}

/**
 * 問題10の解答: RepositoryMethods型の実装
 */
type ExtractId<T> = T extends { id: infer ID } ? ID : never

type RepositoryMethods<T> = {
  create: (data: Omit<T, 'id'>) => Promise<T>
  findById: (id: ExtractId<T>) => Promise<T | null>
  update: (id: ExtractId<T>, data: Partial<Omit<T, 'id'>>) => Promise<T>
  delete: (id: ExtractId<T>) => Promise<boolean>
  findAll: () => Promise<T[]>
}

type ProductRepository = RepositoryMethods<Product>

// 使用例（型定義のみ）
declare const productRepository: ProductRepository

async function example() {
  const product = await productRepository.create({
    name: "New Product",
    price: 999,
    category: "Electronics"
  })
  
  const foundProduct = await productRepository.findById(1)
  
  await productRepository.update(1, { price: 899 })
  
  await productRepository.delete(1)
  
  const allProducts = await productRepository.findAll()
}

// =============================================================================
// 演習6: 実用的な応用問題 - 解答
// =============================================================================

/**
 * 問題11の解答: APIEndpoints型の実装
 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

type Endpoint<TRequest = unknown, TResponse = unknown> = {
  method: HttpMethod
  path: string
  requestBody?: TRequest
  responseBody?: TResponse
}

type APIEndpoints<T> = {
  list: Endpoint<never, T[]>
  create: Endpoint<Omit<T, 'id'>, T>
  show: Endpoint<never, T>
  update: Endpoint<Partial<Omit<T, 'id'>>, T>
  destroy: Endpoint<never, boolean>
}

type ProductAPI = APIEndpoints<Product>

const productAPI: ProductAPI = {
  list: {
    method: "GET",
    path: "/products",
    responseBody: [] as Product[]
  },
  create: {
    method: "POST", 
    path: "/products",
    requestBody: {
      name: "New Product",
      price: 999,
      category: "Electronics"
    } as Omit<Product, 'id'>,
    responseBody: {} as Product
  },
  show: {
    method: "GET",
    path: "/products/:id",
    responseBody: {} as Product
  },
  update: {
    method: "PUT",
    path: "/products/:id",
    requestBody: {} as Partial<Omit<Product, 'id'>>,
    responseBody: {} as Product
  },
  destroy: {
    method: "DELETE",
    path: "/products/:id",
    responseBody: true
  }
}

/**
 * 問題12の解答: StateManager型の実装
 */
type StateManager<T> = {
  state: T
  setState: (newState: Partial<T>) => void
  getState: () => T
  subscribe: (listener: (state: T) => void) => () => void
  reset: () => void
} & {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
}

type ProductStateManager = StateManager<Product>

// 使用例（実装サンプル）
class ProductStateManagerImpl implements ProductStateManager {
  state: Product
  private initialState: Product
  private listeners: ((state: Product) => void)[] = []

  constructor(initialState: Product) {
    this.state = { ...initialState }
    this.initialState = { ...initialState }
  }

  setState = (newState: Partial<Product>) => {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  getState = () => ({ ...this.state })

  subscribe = (listener: (state: Product) => void) => {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  reset = () => {
    this.state = { ...this.initialState }
    this.notifyListeners()
  }

  // Getter methods
  getId = () => this.state.id
  getName = () => this.state.name
  getPrice = () => this.state.price
  getCategory = () => this.state.category

  // Setter methods
  setId = (value: number) => this.setState({ id: value })
  setName = (value: string) => this.setState({ name: value })
  setPrice = (value: number) => this.setState({ price: value })
  setCategory = (value: string) => this.setState({ category: value })

  private notifyListeners = () => {
    this.listeners.forEach(listener => listener(this.state))
  }
}

// =============================================================================
// 追加の実用例
// =============================================================================

/**
 * 追加例1: Database Schema Generator
 */
type DatabaseColumn<T> = {
  type: string
  nullable: boolean
  default?: T
  primaryKey?: boolean
  unique?: boolean
}

type DatabaseSchema<T> = {
  [K in keyof T]: DatabaseColumn<T[K]>
}

type ProductSchema = DatabaseSchema<Product>

const productSchema: ProductSchema = {
  id: {
    type: "INTEGER",
    nullable: false,
    primaryKey: true
  },
  name: {
    type: "VARCHAR(255)",
    nullable: false
  },
  price: {
    type: "DECIMAL(10,2)",
    nullable: false,
    default: 0
  },
  category: {
    type: "VARCHAR(100)",
    nullable: true
  }
}

/**
 * 追加例2: GraphQL Resolver Generator
 */
type GraphQLResolvers<T> = {
  [K in keyof T as `resolve${Capitalize<string & K>}`]: (parent: T, args: any, context: any) => T[K] | Promise<T[K]>
}

type ProductResolvers = GraphQLResolvers<Product>

const productResolvers: ProductResolvers = {
  resolveId: (parent) => parent.id,
  resolveName: (parent) => parent.name,
  resolvePrice: (parent) => parent.price,
  resolveCategory: async (parent, args, context) => {
    // 非同期処理でカテゴリ情報を取得
    return parent.category
  }
}

// =============================================================================
// まとめとベストプラクティス
// =============================================================================

console.log("=== Lesson 34 解答例 まとめ ===")
console.log("マップ型のベストプラクティス:")
console.log("1. 型安全性を保ちながら動的に型を生成")
console.log("2. 条件付き型と組み合わせた高度な変換")
console.log("3. キー変換による命名規則の統一")
console.log("4. 再帰的な型定義によるネストした構造の処理")
console.log("5. 実用的なユーティリティ型による開発効率向上")

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
  StateManager,
  ProductStateManagerImpl,
  DatabaseSchema,
  GraphQLResolvers
}