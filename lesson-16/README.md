# Lesson 16: オブジェクト型

## 学習目標
このレッスンでは、TypeScriptにおけるオブジェクト型の定義と使用方法を学びます。

- オブジェクト型の基本的な定義方法
- プロパティの型指定
- オプショナルプロパティ
- 読み取り専用プロパティ
- インデックスシグネチャ

## 内容

### 1. オブジェクト型の基本
```typescript
// インライン型定義
function greetUser(user: { name: string; age: number }): string {
    return `Hello, ${user.name}! You are ${user.age} years old.`;
}

// 別の書き方
let person: {
    name: string;
    age: number;
    email: string;
} = {
    name: "Alice",
    age: 25,
    email: "alice@example.com"
};
```

### 2. オプショナルプロパティ
```typescript
interface User {
    name: string;
    age?: number;        // オプショナル
    email?: string;      // オプショナル
}

const user1: User = { name: "Alice" };                    // OK
const user2: User = { name: "Bob", age: 30 };            // OK
const user3: User = { name: "Charlie", email: "c@ex.com" }; // OK
```

### 3. 読み取り専用プロパティ
```typescript
interface Config {
    readonly apiUrl: string;
    readonly timeout: number;
    retries: number;  // 変更可能
}

const config: Config = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
};

// config.apiUrl = "new url";  // エラー: 読み取り専用
config.retries = 5;            // OK
```

### 4. インデックスシグネチャ
```typescript
// 文字列キーで任意のプロパティを持つオブジェクト
interface StringDictionary {
    [key: string]: string;
}

// 数値キーで任意のプロパティを持つオブジェクト
interface NumberDictionary {
    [index: number]: number;
}

const dict: StringDictionary = {
    name: "Alice",
    city: "Tokyo",
    country: "Japan"
};
```

### 5. ネストしたオブジェクト型
```typescript
interface Address {
    street: string;
    city: string;
    country: string;
    zipCode?: string;
}

interface Person {
    name: string;
    age: number;
    address: Address;
    contact?: {
        email?: string;
        phone?: string;
    };
}
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-16
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 書籍情報を表すオブジェクト型を定義し、書籍を管理する関数を実装
2. 設定オブジェクト（一部プロパティは読み取り専用）を操作する関数を実装
3. インデックスシグネチャを使用した辞書型オブジェクトを操作する関数を実装
4. ネストした型を持つ複雑なオブジェクトを処理する関数を実装

## 次のレッスン
[Lesson 17: 型エイリアス](../lesson-17/README.md) - 型エイリアスの定義と使用方法について学びます。