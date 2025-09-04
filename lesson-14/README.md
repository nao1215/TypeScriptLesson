# Lesson 14: デフォルト引数

## 学習目標
このレッスンでは、TypeScriptにおけるデフォルト引数の使い方を学びます。

- デフォルト引数の定義方法
- デフォルト値の型推論
- オプショナル引数との違い
- デフォルト引数とオーバーロードの組み合わせ

## 内容

### 1. デフォルト引数の基本
```typescript
function greet(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
}

// 使用例
greet("Alice");           // "Hello, Alice!"
greet("Bob", "Hi");       // "Hi, Bob!"
```

### 2. 複数のデフォルト引数
```typescript
function createUser(
    name: string,
    age: number = 20,
    role: string = "user"
): User {
    return {
        name,
        age,
        role
    };
}
```

### 3. デフォルト値の型推論
TypeScriptは、デフォルト値から引数の型を自動的に推論します。

```typescript
// 型注釈を省略できる
function multiply(a: number, b = 1) {
    return a * b; // bはnumber型として推論される
}
```

### 4. オブジェクトのデストラクチャリングとデフォルト値
```typescript
function processOptions({
    timeout = 5000,
    retries = 3,
    debug = false
}: {
    timeout?: number;
    retries?: number;
    debug?: boolean;
} = {}) {
    console.log(`Options: timeout=${timeout}, retries=${retries}, debug=${debug}`);
}

processOptions(); // すべてデフォルト値
processOptions({ timeout: 10000 }); // timeoutのみ指定
```

### 5. デフォルト引数の位置
デフォルト引数は任意の位置に配置できますが、通常は最後に配置します。

```typescript
// 推奨パターン
function example1(required: string, optional: number = 10): void {}

// 途中にデフォルト引数がある場合
function example2(a: string, b: number = 5, c: string): void {}
example2("hello", undefined, "world"); // bにデフォルト値を使用したい場合
```

### 6. 関数式とアロー関数でのデフォルト引数
```typescript
// 関数式
const add = function(a: number, b: number = 0): number {
    return a + b;
};

// アロー関数
const subtract = (a: number, b: number = 0): number => a - b;
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-14
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 商品の価格と税率（デフォルト8%）を受け取り、税込み価格を計算する関数`calculateTaxIncludedPrice`を実装
2. 配列とソートの方向（デフォルトは"asc"）を受け取り、ソートした配列を返す関数`sortArray`を実装
3. ログレベル（デフォルト"info"）とメッセージを受け取り、フォーマットされたログを出力する関数`log`を実装

## 次のレッスン
[Lesson 15: 可変長引数](../lesson-15/README.md) - 可変長引数の使用方法について学びます。