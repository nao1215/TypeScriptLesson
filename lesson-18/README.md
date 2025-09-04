# Lesson 18: リテラル型

## 学習目標
このレッスンでは、TypeScriptにおけるリテラル型の定義と使用方法を学びます。

- 文字列リテラル型
- 数値リテラル型
- 真偽値リテラル型
- テンプレートリテラル型
- リテラル型とユニオン型の組み合わせ

## 内容

### 1. 文字列リテラル型
```typescript
// 特定の文字列値のみ許可
type Direction = "up" | "down" | "left" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function move(direction: Direction): void {
    console.log(`Moving ${direction}`);
}

move("up");    // OK
move("down");  // OK
// move("forward"); // エラー
```

### 2. 数値リテラル型
```typescript
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatus = 200 | 201 | 400 | 401 | 404 | 500;

function rollDice(): DiceRoll {
    return (Math.floor(Math.random() * 6) + 1) as DiceRoll;
}
```

### 3. 真偽値リテラル型
```typescript
type AlwaysTrue = true;
type AlwaysFalse = false;

// 実用的な例
type Config = {
    debug: true;  // 常にtrue
    production: false;  // 常にfalse
};
```

### 4. テンプレートリテラル型
```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">;  // "onClick"
type HoverEvent = EventName<"hover">;  // "onHover"

type Color = "red" | "green" | "blue";
type Shade = "light" | "dark";
type ColorVariant = `${Shade}-${Color}`;  // "light-red" | "light-green" | ...
```

### 5. オブジェクトリテラル型
```typescript
type Point = { x: 10; y: 20 };  // 特定の値を持つオブジェクト
type Origin = { readonly x: 0; readonly y: 0 };
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-18
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 曜日を表現するリテラル型を定義し、スケジュール管理システムを実装
2. HTTPステータスコードとメッセージの対応システムを実装
3. テンプレートリテラル型を使用したCSS クラス名生成システムを実装
4. 設定オブジェクトのリテラル型を使用した型安全な設定管理を実装

## 次のレッスン
[Lesson 19: ユニオン型](../lesson-19/README.md) - ユニオン型の定義と使用方法について学びます。