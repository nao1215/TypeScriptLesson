# Lesson 27: ジェネリクスの制約 (Generic Constraints)

## 学習目標
このレッスンでは、TypeScriptにおけるジェネリクスの制約について学びます。

- extends 制約による型の制限
- keyof 制約とインデックスアクセス
- 条件型の基礎
- 複数型パラメータの相互関係
- 高度な制約パターン

## 内容

### 1. extends制約

```typescript
// 基本的なextends制約
function getLength<T extends { length: number }>(arg: T): number {
    return arg.length; // lengthプロパティにアクセス可能
}

// 使用例
const arrayLength = getLength([1, 2, 3]);     // 3
const stringLength = getLength("hello");      // 5
// const numberLength = getLength(42);        // エラー: numberにlengthプロパティなし
```

### 2. keyof制約

```typescript
// keyof を使ったプロパティアクセス
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

interface User {
    id: string;
    name: string;
    age: number;
}

const user: User = { id: '1', name: 'John', age: 30 };

const id = getProperty(user, 'id');     // string
const name = getProperty(user, 'name'); // string
const age = getProperty(user, 'age');   // number
// const invalid = getProperty(user, 'invalid'); // エラー
```

### 3. 条件型の基礎

```typescript
// 条件型による型の分岐
type IsArray<T> = T extends any[] ? true : false;

type StringArrayCheck = IsArray<string[]>; // true
type StringCheck = IsArray<string>;        // false

// 実用的な条件型
type NonNullable<T> = T extends null | undefined ? never : T;

type CleanString = NonNullable<string | null>; // string
```

## 演習問題

1. オブジェクトプロパティ操作システム
2. 型安全なイベントシステム
3. 条件型を使ったユーティリティ関数
4. 高度な制約パターンの実装

## まとめ

ジェネリクスの制約により、型安全性を保ちながら柔軟なAPIを設計できます。次のレッスンではユーティリティ型について学びます。