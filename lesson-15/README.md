# Lesson 15: 可変長引数

## 学習目標
このレッスンでは、TypeScriptにおける可変長引数（Rest Parameters）の使い方を学びます。

- Rest Parameters（...args）の基本的な使い方
- 可変長引数の型定義
- スプレッド演算子との関係
- 可変長引数と通常の引数の組み合わせ

## 内容

### 1. 可変長引数の基本
```typescript
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

// 使用例
sum(1, 2, 3);           // 6
sum(10, 20, 30, 40);    // 100
sum();                  // 0
```

### 2. 通常の引数と可変長引数の組み合わせ
```typescript
function greetAll(greeting: string, ...names: string[]): string[] {
    return names.map(name => `${greeting}, ${name}!`);
}

greetAll("Hello", "Alice", "Bob", "Charlie");
// ["Hello, Alice!", "Hello, Bob!", "Hello, Charlie!"]
```

### 3. 可変長引数の型定義
```typescript
// 基本的な型
function processNumbers(...nums: number[]): void {}

// ユニオン型を使用
function handleValues(...values: (string | number)[]): void {}

// より具体的な型制約
function combine<T>(...items: T[]): T[] {
    return items;
}
```

### 4. 分割代入との組み合わせ
```typescript
function processUser(name: string, age: number, ...hobbies: string[]) {
    return {
        name,
        age,
        hobbies,
        hobbyCount: hobbies.length
    };
}

processUser("Alice", 25, "reading", "swimming", "coding");
```

### 5. スプレッド演算子との関係
```typescript
const numbers = [1, 2, 3, 4, 5];

// 配列を個別の引数として展開
const result = sum(...numbers); // sum(1, 2, 3, 4, 5) と同じ

// 配列のコピー
const copy = [...numbers];

// 配列の結合
const extended = [...numbers, 6, 7, 8];
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-15
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 複数の文字列を受け取り、最も長い文字列を返す関数`findLongest`を実装
2. 最初の引数をセパレータとし、残りの引数を結合する関数`joinWithSeparator`を実装
3. 複数の配列を受け取り、すべての要素を含む新しい配列を返す関数`flattenArrays`を実装
4. 関数と可変長引数を受け取り、その関数を各引数に適用した結果を返す関数`mapArgs`を実装

## 次のレッスン
[Lesson 16: オブジェクト型](../lesson-16/README.md) - オブジェクト型の定義と使用方法について学びます。