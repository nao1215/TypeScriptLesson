# Lesson 17: 型エイリアス

## 学習目標
このレッスンでは、TypeScriptにおける型エイリアス（Type Aliases）の定義と使用方法を学びます。

- 型エイリアスの基本的な定義方法
- インターフェースとの違い
- プリミティブ型、ユニオン型、関数型のエイリアス
- ジェネリックを使った型エイリアス
- 実用的な型エイリアスの活用例

## 内容

### 1. 型エイリアスの基本
```typescript
// 基本的な型エイリアス
type UserID = string;
type Age = number;
type IsActive = boolean;

// オブジェクト型のエイリアス
type User = {
    id: UserID;
    name: string;
    age: Age;
    isActive: IsActive;
};
```

### 2. ユニオン型のエイリアス
```typescript
type Status = "loading" | "success" | "error";
type Theme = "light" | "dark";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function fetchData(method: HttpMethod, status: Status): void {
    // ...
}
```

### 3. 関数型のエイリアス
```typescript
type EventHandler = (event: Event) => void;
type Validator<T> = (value: T) => boolean;
type Transformer<T, U> = (input: T) => U;

const onClick: EventHandler = (event) => {
    console.log("Clicked:", event.target);
};
```

### 4. ジェネリック型エイリアス
```typescript
type Result<T, E = Error> = {
    success: boolean;
    data?: T;
    error?: E;
};

type Optional<T> = T | undefined;
type Nullable<T> = T | null;
```

### 5. インターフェースとの違い
```typescript
// インターフェース（拡張可能）
interface UserInterface {
    name: string;
}

interface UserInterface {
    age: number;  // 拡張される
}

// 型エイリアス（拡張不可）
type UserType = {
    name: string;
};

// type UserType = {  // エラー: 重複定義
//     age: number;
// };
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-17
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. API レスポンスの型エイリアスを定義し、データ処理関数を実装
2. 状態管理のための型エイリアスを定義し、状態遷移関数を実装
3. 汎用的な型エイリアスを定義し、ユーティリティ関数を実装
4. 複雑な型エイリアスを組み合わせたデータ変換システムを実装

## 次のレッスン
[Lesson 18: リテラル型](../lesson-18/README.md) - リテラル型の定義と使用方法について学びます。