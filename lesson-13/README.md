# Lesson 13: オプショナル引数

## 学習目標
このレッスンでは、TypeScriptにおけるオプショナル引数の使い方を学びます。

- オプショナル引数の定義方法
- オプショナル引数と必須引数の組み合わせ
- オプショナル引数のデフォルト値
- オプショナルプロパティとの関連

## 内容

### 1. オプショナル引数の基本
```typescript
function greet(name: string, greeting?: string): string {
    if (greeting) {
        return `${greeting}, ${name}!`;
    }
    return `Hello, ${name}!`;
}
```

### 2. 複数のオプショナル引数
```typescript
function createUser(
    name: string,
    age?: number,
    email?: string
): User {
    return {
        name,
        age: age ?? 0,
        email: email ?? "unknown@example.com"
    };
}
```

### 3. オプショナル引数の位置
オプショナル引数は必須引数の後に配置する必要があります。

```typescript
// 正しい
function example(required: string, optional?: number): void {}

// エラー: 必須引数がオプショナル引数の後にある
// function example(optional?: number, required: string): void {}
```

### 4. undefined との違い
```typescript
// オプショナル引数
function optionalParam(value?: string): void {}

// undefined を許可する引数
function undefinedParam(value: string | undefined): void {}

// 呼び出し方の違い
optionalParam();           // OK
optionalParam(undefined);  // OK
// undefinedParam();        // エラー: 引数が必要
undefinedParam(undefined); // OK
```

## 実行方法

```bash
# TypeScriptのコンパイル
npx tsc src/index.ts --outDir dist

# コンパイル結果の実行
node dist/index.js

# テストの実行
npm test -- lesson-13
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. 名前と年齢（オプショナル）を受け取り、プロフィール文字列を返す関数`createProfile`を実装
2. 配列と開始・終了インデックス（両方オプショナル）を受け取り、部分配列を返す関数`slice`を実装
3. 設定オブジェクト（すべてのプロパティがオプショナル）を受け取り、デフォルト値とマージする関数`mergeConfig`を実装

## 次のレッスン
[Lesson 14: デフォルト引数](../lesson-14/README.md) - 引数のデフォルト値の設定方法について学びます。