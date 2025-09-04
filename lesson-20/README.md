# Lesson 20: 型アサーション

## 学習目標
このレッスンでは、TypeScriptにおける型アサーションの使用方法を学びます。

- 型アサーションの基本的な構文
- as 演算子とアングルブラケット構文
- 非 null アサーション演算子 (!)
- 型アサーションの注意点とベストプラクティス
- DOM 操作での型アサーションの活用

## 内容

### 1. 型アサーションの基本
```typescript
// as 演算子を使用
let someValue: unknown = "Hello, TypeScript!";
let strLength: number = (someValue as string).length;

// アングルブラケット構文（JSXでは使用不可）
let strLength2: number = (<string>someValue).length;
```

### 2. 非 null アサーション演算子
```typescript
function processElement(element: HTMLElement | null): void {
    // element が null ではないことを明示的に表明
    element!.style.color = "red";
    
    // 正しい方法（ガードを使用）
    if (element) {
        element.style.color = "red";
    }
}
```

### 3. DOM 要素の型アサーション
```typescript
// 特定の要素タイプへのアサーション
const button = document.getElementById("myButton") as HTMLButtonElement;
const input = document.querySelector(".my-input") as HTMLInputElement;

button.disabled = true;
input.value = "New value";
```

### 4. オブジェクトの型アサーション
```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

// API からのデータを User 型として扱う
const userData = JSON.parse(jsonString) as User;

// 部分的なオブジェクトのアサーション
const partialUser = { name: "Alice" } as Partial<User>;
```

### 5. const アサーション
```typescript
// リテラル型として扱う
const colors = ["red", "green", "blue"] as const;
type Color = typeof colors[number]; // "red" | "green" | "blue"

const config = {
    apiUrl: "https://api.example.com",
    timeout: 5000
} as const;
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-20
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. API レスポンスのデータを適切な型にアサートして処理するシステムを実装
2. DOM 要素の操作で型アサーションを活用したユーティリティ関数を実装
3. ユニオン型から特定の型へのアサーションを使用したデータ処理を実装
4. const アサーションを使用した設定オブジェクトの定義と操作を実装

## まとめ
こちらでTypeScriptの基本的な型システムについての学習が完了しました。次のフェーズでは、さらに高度なTypeScriptの機能やライブラリとの組み合わせについて学んでいきます。