# Lesson 11: 関数の基礎

## 学習目標
このレッスンでは、TypeScriptにおける関数の基本的な使い方を学びます。

- 関数の宣言方法
- 引数と戻り値の型指定
- アロー関数の使い方
- 関数式と関数宣言の違い

## 内容

### 1. 関数宣言
```typescript
function add(a: number, b: number): number {
    return a + b;
}
```

### 2. 関数式
```typescript
const multiply = function(a: number, b: number): number {
    return a * b;
};
```

### 3. アロー関数
```typescript
const subtract = (a: number, b: number): number => {
    return a - b;
};

// 単一式の場合は省略記法が使える
const divide = (a: number, b: number): number => a / b;
```

### 4. void型
戻り値がない関数には`void`型を使います。

```typescript
function sayHello(name: string): void {
    console.log(`Hello, ${name}!`);
}
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-11
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 2つの数値を受け取り、大きい方を返す関数`max`を実装
2. 配列を受け取り、その要素の合計を返す関数`sumArray`を実装
3. 文字列を受け取り、その文字列を逆順にして返す関数`reverseString`を実装

## 次のレッスン
[Lesson 12: 関数の型](../lesson-12/README.md) - 関数型の詳細な定義方法について学びます。