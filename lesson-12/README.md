# Lesson 12: 関数の型

## 学習目標
このレッスンでは、TypeScriptにおける関数型の詳細な定義方法を学びます。

- 関数型の定義方法
- 型エイリアスを使った関数型の定義
- コールシグネチャ
- オーバーロード

## 内容

### 1. 関数型の基本
```typescript
// 関数型の変数宣言
let myFunc: (x: number, y: number) => number;

myFunc = (a, b) => a + b;
```

### 2. 型エイリアスを使った関数型
```typescript
type MathOperation = (x: number, y: number) => number;

const add: MathOperation = (x, y) => x + y;
const multiply: MathOperation = (x, y) => x * y;
```

### 3. コールシグネチャ
```typescript
type DescribableFunction = {
    description: string;
    (someArg: number): boolean;
};
```

### 4. 関数のオーバーロード
```typescript
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
    if (d !== undefined && y !== undefined) {
        return new Date(y, mOrTimestamp, d);
    } else {
        return new Date(mOrTimestamp);
    }
}
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-12
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 2つの数値を比較する関数型`Comparator`を定義し、それを使って昇順・降順ソート関数を実装
2. 文字列または数値を受け取り、その長さまたは値を返す関数`getLength`をオーバーロードで実装
3. 関数を受け取り、その実行時間を計測する高階関数`measureTime`を実装

## 次のレッスン
[Lesson 13: オプショナル引数](../lesson-13/README.md) - オプショナルな引数の使い方について学びます。