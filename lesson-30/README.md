# Lesson 30: namespace

## 学習目標
TypeScriptにおけるnamespaceの使用方法を学びます。

- namespace の宣言と使用法
- ネストされたnamespace
- モジュール拡張
- グローバルスコープとモジュールスコープ
- レガシーコードの組織化パターン

## 内容

### 1. 基本的なnamespace
```typescript
namespace Utilities {
    export function formatCurrency(amount: number): string {
        return `$${amount.toFixed(2)}`;
    }
    
    export class Logger {
        static log(message: string): void {
            console.log(`[LOG] ${message}`);
        }
    }
    
    // 非exported（namespaceの内部でのみ使用可能）
    const API_KEY = "secret";
}

// 使用例
Utilities.Logger.log("Hello");
console.log(Utilities.formatCurrency(123.45));
```

### 2. ネストされたnamespace
```typescript
namespace Company {
    export namespace HR {
        export class Employee {
            constructor(public name: string, public id: number) {}
        }
        
        export function calculateSalary(employee: Employee): number {
            return 50000; // 基本給
        }
    }
    
    export namespace Finance {
        export class Budget {
            constructor(public department: string, public amount: number) {}
        }
        
        export function allocateFunds(budget: Budget): boolean {
            return budget.amount > 0;
        }
    }
}

// 使用例
const emp = new Company.HR.Employee("Alice", 123);
const budget = new Company.Finance.Budget("IT", 100000);
```

### 3. namespaceの分割
```typescript
// ファイル1
namespace MyLib {
    export interface Config {
        apiUrl: string;
        timeout: number;
    }
}

// ファイル2
namespace MyLib {
    export class HttpClient {
        constructor(private config: Config) {}
        
        async get(url: string): Promise<any> {
            // 実装
            return {};
        }
    }
}

// 使用時に自動的にマージされる
```

### 4. モジュール拡張
```typescript
// 既存のモジュールにプロパティを追加
declare global {
    namespace NodeJS {
        interface Global {
            customProperty: string;
        }
    }
}

// グローバルオブジェクトの拡張
global.customProperty = "Hello from TypeScript";
```

## 実行方法

```bash
npx tsc src/index.ts --outDir dist
node dist/index.js
npm test -- lesson-30
```

## 演習問題

1. ゲームエンジンのnamespace設計
2. ユーティリティライブラリの組織化
3. APIクライアントのnamespace構造
4. 既存ライブラリの型定義拡張

## まとめ

namespaceは主にレガシーコード管理や型定義ファイルで使用されます。モダンなTypeScriptではES6モジュールが推奨されますが、特定のケースでnamespaceが有用な場合があります。

これでLesson 21-30の中級TypeScript機能の学習が完了しました。次のフェーズでは、より高度な型システムと実際のWebアプリケーション開発について学んでいきます。