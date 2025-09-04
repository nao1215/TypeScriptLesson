# Lesson 19: ユニオン型

## 学習目標
このレッスンでは、TypeScriptにおけるユニオン型の定義と使用方法を学びます。

- ユニオン型の基本的な定義方法
- 型ガード（Type Guards）の使用
- 判別ユニオン（Discriminated Unions）
- ユニオン型とインターセクション型の違い
- 実用的なユニオン型の活用例

## 内容

### 1. ユニオン型の基本
```typescript
// 基本的なユニオン型
type StringOrNumber = string | number;
type Status = "loading" | "success" | "error";

function processValue(value: StringOrNumber): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    } else {
        return value.toString();
    }
}
```

### 2. 型ガード
```typescript
function isString(value: unknown): value is string {
    return typeof value === "string";
}

function processUnknown(value: string | number | boolean) {
    if (typeof value === "string") {
        // ここでvalueはstring型として扱われる
        console.log(value.length);
    } else if (typeof value === "number") {
        // ここでvalueはnumber型として扱われる
        console.log(value.toFixed(2));
    } else {
        // ここでvalueはboolean型として扱われる
        console.log(value ? "true" : "false");
    }
}
```

### 3. 判別ユニオン
```typescript
interface Circle {
    kind: "circle";
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

type Shape = Circle | Rectangle;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
    }
}
```

### 4. オプショナルチェーン
```typescript
type User = {
    name: string;
    email?: string;
} | null;

function getUserEmail(user: User): string | undefined {
    return user?.email;
}
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-19
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. APIレスポンスのユニオン型を定義し、成功・失敗を処理するシステムを実装
2. 異なる図形を表現する判別ユニオンを定義し、面積計算システムを実装
3. ユニオン型を活用したイベント処理システムを実装
4. 複雑なデータ構造のユニオン型を使用したデータ変換システムを実装

## 次のレッスン
[Lesson 20: 型アサーション](../lesson-20/README.md) - 型アサーションの使用方法について学びます。