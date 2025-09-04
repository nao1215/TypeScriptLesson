# Lesson 21: インターフェース (Interfaces)

## 学習目標
このレッスンでは、TypeScriptにおけるインターフェースの使用方法を学びます。

- インターフェースの基本的な宣言と使用法
- type エイリアスとインターフェースの違い
- オプショナルプロパティとreadonly修飾子
- メソッドシグネチャとコールシグネチャ
- インターフェースの継承と拡張
- クラスでのインターフェース実装

## 内容

### 1. インターフェースの基本
```typescript
// 基本的なインターフェースの宣言
interface User {
    id: number;
    name: string;
    email: string;
}

// インターフェースを使用した変数の定義
const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};
```

### 2. オプショナルプロパティとreadonly
```typescript
interface Product {
    readonly id: number;        // 読み取り専用
    name: string;
    price: number;
    description?: string;       // オプショナル
    tags?: string[];           // オプショナル配列
}

const product: Product = {
    id: 100,
    name: "Laptop",
    price: 999.99
    // description と tags は省略可能
};

// product.id = 200; // エラー: 読み取り専用プロパティ
```

### 3. メソッドシグネチャ
```typescript
interface Calculator {
    // メソッドシグネチャの記述方法1
    add(a: number, b: number): number;
    
    // メソッドシグネチャの記述方法2
    subtract: (a: number, b: number) => number;
    
    // オプショナルメソッド
    multiply?(a: number, b: number): number;
}

const calc: Calculator = {
    add(a, b) {
        return a + b;
    },
    subtract: (a, b) => a - b
    // multiply は省略可能
};
```

### 4. コールシグネチャとインデックスシグネチャ
```typescript
// コールシグネチャ（関数として呼び出し可能）
interface Greter {
    (name: string): string;
    language: string;
}

// インデックスシグネチャ
interface StringDictionary {
    [key: string]: string;
    length: number;  // 明示的なプロパティも定義可能
}

const dict: StringDictionary = {
    name: "Alice",
    city: "Tokyo",
    length: 2
};
```

### 5. インターフェースの継承
```typescript
interface Animal {
    name: string;
    age: number;
}

interface Dog extends Animal {
    breed: string;
    bark(): void;
}

interface Cat extends Animal {
    breed: string;
    meow(): void;
}

// 複数のインターフェースを継承
interface Pet extends Dog, Animal {
    owner: string;
}
```

### 6. type エイリアス vs インターフェース
```typescript
// type エイリアス
type UserType = {
    id: number;
    name: string;
};

// インターフェース
interface UserInterface {
    id: number;
    name: string;
}

// インターフェースは後から拡張可能（宣言のマージ）
interface UserInterface {
    email: string;  // 既存のインターフェースに追加
}

// type エイリアスではこれはできない（エラーになる）
// type UserType = {
//     email: string;  // エラー: 重複した識別子
// }
```

### 7. クラスでのインターフェース実装
```typescript
interface Flyable {
    fly(): void;
}

interface Swimable {
    swim(): void;
}

class Duck implements Flyable, Swimable {
    fly(): void {
        console.log("Duck is flying");
    }
    
    swim(): void {
        console.log("Duck is swimming");
    }
}

class Airplane implements Flyable {
    fly(): void {
        console.log("Airplane is flying");
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
npm test -- lesson-21
```

## 演習問題

`src/exercise.ts`を完成させてください。

1. ECサイトの商品とカート機能のインターフェースを設計
2. 図書館管理システムのインターフェースを継承を使って実装
3. API レスポンス用のジェネリックインターフェースを作成
4. イベント処理システムのコールシグネチャを持つインターフェースを実装

## 注意点・ベストプラクティス

### よくある間違い
1. **インターフェースとtype エイリアスの使い分けミス**
   - インターフェース：オブジェクトの形状定義、拡張性が必要な場合
   - type エイリアス：ユニオン型、プリミティブ型の別名、複雑な型操作

2. **readonly の誤解**
   - readonly は浅いイミュータビリティのみ提供
   - ネストしたオブジェクトのプロパティは変更可能

3. **オプショナルプロパティの落とし穴**
   - undefined チェックを忘れがち
   - デフォルト値の提供を検討

### 設計原則
- インターフェースは単一責任の原則に従う
- 継承よりもコンポジションを優先する場合も検討
- 将来の拡張性を考慮した設計を心がける

## まとめ
インターフェースはTypeScriptの強力な機能の一つです。適切に設計されたインターフェースは、コードの可読性、保守性、拡張性を大幅に向上させます。次のレッスンではクラスの基礎について学びます。