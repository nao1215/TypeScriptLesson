# Lesson 36: 型推論 (Type Inference)

## 学習目標
- TypeScriptの型推論メカニズムの理解
- コントロールフロー分析と型ナローイングの活用
- ジェネリック型推論ルールの把握
- 推論を活用するベストプラクティスの習得
- 明示的な型注釈と推論のバランスの理解

## 型推論とは

型推論は、TypeScriptコンパイラーが変数や関数の戻り値の型を自動的に決定する機能です。開発者が明示的に型を指定しなくても、コンテキストから適切な型を推測します。

## 基本的な型推論

### 変数の型推論

```typescript
// 基本的な型推論
let message = "Hello, World!" // string型として推論
let count = 42 // number型として推論
let isActive = true // boolean型として推論

// 配列の型推論
let numbers = [1, 2, 3, 4, 5] // number[]として推論
let mixed = [1, "two", true] // (string | number | boolean)[]として推論

// オブジェクトの型推論
let user = {
  id: 1,
  name: "Alice", 
  email: "alice@example.com"
}
// { id: number; name: string; email: string }として推論
```

### 関数の型推論

```typescript
// 戻り値の型推論
function add(a: number, b: number) {
  return a + b // number型として推論
}

// アロー関数の型推論
const multiply = (x: number, y: number) => x * y // (x: number, y: number) => number

// 高階関数の型推論
function createAdder(base: number) {
  return (value: number) => base + value
}
// (base: number) => (value: number) => number として推論
```

## コンテキスト型推論

### 関数の引数における推論

```typescript
// イベントハンドラーでの推論
window.addEventListener('click', (event) => {
  // eventは自動的にMouseEvent型として推論される
  console.log(event.clientX, event.clientY)
})

// 配列メソッドでの推論
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map((num) => num * 2) // numはnumber型として推論
const strings = numbers.map((num) => num.toString()) // string[]として推論
```

### オブジェクトリテラルの推論

```typescript
interface User {
  id: number
  name: string
  email?: string
}

// インターフェースからの推論
const createUser = (userData: User) => userData

const newUser = createUser({
  id: 1,
  name: "Bob"
  // emailはオプショナルなので省略可能
})
```

## ジェネリック型推論

### 基本的なジェネリック推論

```typescript
// 型引数の自動推論
function identity<T>(arg: T): T {
  return arg
}

const stringValue = identity("hello") // T は string として推論
const numberValue = identity(42) // T は number として推論
const arrayValue = identity([1, 2, 3]) // T は number[] として推論
```

### 複雑なジェネリック推論

```typescript
// 複数の型パラメータの推論
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 }
}

const merged = merge(
  { name: "Alice", age: 30 },
  { email: "alice@example.com", active: true }
)
// { name: string; age: number; email: string; active: boolean } として推論
```

## コントロールフロー分析

### 型ナローイング

```typescript
function processValue(value: string | number) {
  if (typeof value === "string") {
    // この分岐内では value は string 型として推論
    console.log(value.toUpperCase())
  } else {
    // この分岐内では value は number 型として推論
    console.log(value.toFixed(2))
  }
}

// null チェックによる型ナローイング
function greet(name: string | null) {
  if (name !== null) {
    // name は string 型として推論
    console.log(`Hello, ${name}!`)
  }
}
```

### 判別可能ユニオン

```typescript
type Shape = 
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number }

function getArea(shape: Shape) {
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
```

## 高度な型推論パターン

### 条件付き型での推論

```typescript
// 条件付き型における推論
type Flatten<T> = T extends Array<infer U> ? U : T

type StringArray = Flatten<string[]> // string
type NumberType = Flatten<number> // number

// より複雑な条件付き推論
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type FunctionReturn = GetReturnType<() => string> // string
type MethodReturn = GetReturnType<(x: number) => boolean> // boolean
```

### インデックス型での推論

```typescript
// keyof 演算子との組み合わせ
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const person = { name: "Alice", age: 30, active: true }

const name = getValue(person, "name") // string として推論
const age = getValue(person, "age") // number として推論
const active = getValue(person, "active") // boolean として推論
```

## 推論の制御

### 明示的な型アサーション

```typescript
// 型アサーションによる推論の上書き
const input = document.getElementById("myInput") as HTMLInputElement
// HTMLElement | null ではなく HTMLInputElement として扱う

// const assertion
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const
// readonly { apiUrl: "https://api.example.com"; timeout: 5000 } として推論
```

### 型の明示による推論のガイド

```typescript
// 初期値による型の制約
const items: string[] = [] // 明示的に string[] として指定
// const items = [] だと never[] として推論される

// ジェネリック型の明示
const promise = new Promise<number>((resolve) => {
  resolve(42)
})
// Promise<number> として明示
```

## ベストプラクティス

### 推論を活用する場面

```typescript
// 推論が適切に働く場面
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
] // 配列の要素から型が適切に推論される

// 関数の戻り値型は推論に任せる
function processUsers(users: User[]) {
  return users.filter(user => user.active)
    .map(user => ({
      id: user.id,
      displayName: user.name.toUpperCase()
    }))
} // 戻り値型は自動的に推論される
```

### 明示的な型注釈が必要な場面

```typescript
// パブリックAPIでは明示的な型注釈を使用
export function fetchUserById(id: number): Promise<User | null> {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
}

// 複雑な型では明示的に指定
interface ComplexState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: ComplexState = {
  users: [],
  loading: false,
  error: null
}
```

### 推論の限界を理解する

```typescript
// 推論が期待通りに働かない例
const mixedArray = [] // never[] として推論される
mixedArray.push("hello") // エラー: never[] に string は追加できない

// 解決策: 明示的な型注釈
const mixedArray: (string | number)[] = []
mixedArray.push("hello") // OK
mixedArray.push(42) // OK
```

## 型推論とパフォーマンス

### 推論コストの考慮

```typescript
// 深い推論は計算コストが高い
type DeepNested<T, N extends number> = N extends 0 
  ? T 
  : DeepNested<T[], Subtract<N, 1>>

// 適度な深さで推論を止める
type ReasonableDepth<T> = T extends Array<infer U> 
  ? Array<ReasonableDepth<U>>
  : T
```

## 実用的な推論パターン

### ファクトリー関数での推論

```typescript
// 型安全なファクトリー関数
function createRepository<T>() {
  const data: T[] = []
  
  return {
    add: (item: T) => data.push(item),
    find: (predicate: (item: T) => boolean) => data.find(predicate),
    getAll: () => [...data]
  }
}

const userRepo = createRepository<User>()
// 戻り値の型が適切に推論される
```

### 型ガードとの組み合わせ

```typescript
// 型ガード関数
function isString(value: unknown): value is string {
  return typeof value === "string"
}

function processInput(input: unknown) {
  if (isString(input)) {
    // input は string として推論される
    console.log(input.toUpperCase())
  }
}
```

## まとめ

TypeScriptの型推論は以下の特徴を持ちます：

1. **自動型決定**: 文脈から適切な型を自動推論
2. **コントロールフロー分析**: 条件分岐による型ナローイング
3. **ジェネリック推論**: 型引数の自動決定
4. **コンテキスト推論**: 使用場所に応じた型推論
5. **推論制御**: アサーションや明示的注釈による制御

型推論を適切に理解し活用することで、型安全性を保ちながら効率的なTypeScriptコードを書くことができます。

## 次回予告

次のLesson 37では、高度な型操作について学習し、複雑な型変換やブランド型などの高度なパターンを習得します。

## 実習

`src/exercise.ts`の演習問題に挑戦してみましょう。型推論の様々なパターンを理解することで、より効果的なTypeScriptコードを書けるようになります。