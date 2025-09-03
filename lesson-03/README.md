# Lesson 03: 数値型 (Number Type)

## 学習目標
- TypeScriptのnumber型の基本的な使い方を理解する
- 数値の演算と型安全性について学ぶ
- 数値リテラルと型推論について理解する
- 実用的な数値計算の実装方法を身につける

## 概要
TypeScriptの`number`型は、JavaScriptと同様にすべての数値（整数、浮動小数点数）を扱います。TypeScriptでは型安全性により、数値計算でのエラーを事前に防ぐことができます。

## 主な内容

### 1. number型の基本
```typescript
// 明示的な型指定
let age: number = 25;
let price: number = 99.99;

// 型推論（推奨）
let count = 10; // TypeScriptが自動的にnumber型と推論
let temperature = -5.5;
```

### 2. 数値リテラル
```typescript
// 10進数
let decimal = 42;

// 16進数
let hex = 0x2A; // 42

// 8進数
let octal = 0o52; // 42

// 2進数
let binary = 0b101010; // 42

// 大きな数値（ES2020+）
let bigNumber = 1_000_000; // アンダースコアは区切り文字
```

### 3. 数値演算
```typescript
// 基本的な演算
let a = 10;
let b = 3;

let sum = a + b;        // 13
let difference = a - b; // 7
let product = a * b;    // 30
let quotient = a / b;   // 3.333...
let remainder = a % b;  // 1
let power = a ** b;     // 1000
```

### 4. 特殊な数値
```typescript
// 無限大
let infinity = Infinity;
let negInfinity = -Infinity;

// NaN (Not a Number)
let notANumber = NaN;

// 数値かどうかの判定
console.log(Number.isFinite(42));    // true
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isNaN(NaN));      // true
```

## 実践的な使用例

### 例1: 消費税計算
```typescript
function calculateTax(price: number, taxRate: number = 0.1): number {
    return Math.round(price * taxRate);
}

function calculateTotalPrice(price: number, taxRate: number = 0.1): number {
    const tax = calculateTax(price, taxRate);
    return price + tax;
}

const itemPrice = 1000;
const total = calculateTotalPrice(itemPrice);
console.log(`商品価格: ${itemPrice}円, 合計: ${total}円`);
```

### 例2: 統計計算
```typescript
function calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

function findMax(numbers: number[]): number {
    return Math.max(...numbers);
}

function findMin(numbers: number[]): number {
    return Math.min(...numbers);
}

const scores = [85, 92, 78, 96, 88];
console.log(`平均点: ${calculateAverage(scores)}`);
console.log(`最高点: ${findMax(scores)}`);
console.log(`最低点: ${findMin(scores)}`);
```

## よくある落とし穴と対処法

### 1. 浮動小数点の精度問題
```typescript
// 問題のあるコード
console.log(0.1 + 0.2); // 0.30000000000000004

// 対処法
function addDecimals(a: number, b: number, precision: number = 2): number {
    return Number((a + b).toFixed(precision));
}

console.log(addDecimals(0.1, 0.2)); // 0.3
```

### 2. 型安全性の活用
```typescript
// 型安全な関数
function divide(dividend: number, divisor: number): number {
    if (divisor === 0) {
        throw new Error("0で除算はできません");
    }
    return dividend / divisor;
}

// コンパイル時にエラーを検出
// divide("10", "2"); // TypeScriptエラー: 文字列は使用できません
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `calculateCircleArea(radius: number): number` - 円の面積を計算
2. `calculateCompoundInterest(principal: number, rate: number, time: number): number` - 複利計算
3. `convertTemperature(celsius: number): { fahrenheit: number; kelvin: number }` - 温度変換
4. `generateFibonacci(n: number): number[]` - フィボナッチ数列を生成

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-03
```

## 次のレッスン
[Lesson 04: 文字列型](../lesson-04/README.md)では、文字列型の操作とテンプレートリテラルについて学習します。