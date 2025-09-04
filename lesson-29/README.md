# Lesson 29: モジュール (Modules)

## 学習目標
このレッスンでは、TypeScriptにおけるモジュールシステムについて学びます。

- ES6モジュール vs CommonJSの違い
- Import/Export構文のバリエーション
- Defaultエクスポート vs Namedエクスポート
- モジュール解決戦略
- Dynamic ImportとTree Shaking

## 内容

### 1. 基本的なエクスポートとインポート

```typescript
// user.ts - Namedエクスポート
export interface User {
    id: string;
    name: string;
    email: string;
}

export function createUser(name: string, email: string): User {
    return {
        id: Math.random().toString(36),
        name,
        email
    };
}

export const DEFAULT_USER: User = {
    id: 'default',
    name: 'Guest',
    email: 'guest@example.com'
};

// utils.ts - Defaultエクスポート
class Logger {
    log(message: string): void {
        console.log(`[LOG] ${message}`);
    }
}

export default Logger;

// main.ts - インポート
import Logger from './utils';
import { User, createUser, DEFAULT_USER } from './user';

const logger = new Logger();
const user = createUser('John', 'john@example.com');
logger.log(`Created user: ${user.name}`);
```

### 2. 名前空間とモジュール

```typescript
// 名前空間を使用したモジュール組織
namespace API {
    export interface Response<T> {
        data: T;
        success: boolean;
        message: string;
    }
    
    export namespace User {
        export interface CreateRequest {
            name: string;
            email: string;
        }
        
        export interface UpdateRequest extends Partial<CreateRequest> {
            id: string;
        }
    }
}

// 使用例
const userResponse: API.Response<User> = {
    data: createUser('Jane', 'jane@example.com'),
    success: true,
    message: 'User created successfully'
};
```

### 3. Dynamic Import

```typescript
// 動的インポートでコード分割
async function loadUserModule() {
    const userModule = await import('./user');
    const user = userModule.createUser('Dynamic', 'dynamic@example.com');
    return user;
}

// 条件付きモジュール読み込み
async function loadFeature(featureName: string) {
    if (featureName === 'advanced') {
        const advancedModule = await import('./advanced-features');
        return advancedModule.default;
    }
    return null;
}
```

### 4. モジュール宣言

```typescript
// types.d.ts - 型宣言ファイル
declare module '*.json' {
    const value: any;
    export default value;
}

declare module 'external-library' {
    export function doSomething(): void;
    export const version: string;
}

// 使用例
import config from './config.json';
import { doSomething } from 'external-library';
```

## 演習問題

1. モジュールベースのアプリケーション設計
2. プラグインシステムの実装
3. ダイナミックインポートを使ったコード分割
4. 型安全なモジュールシステム

## まとめ

モジュールシステムはコードの組織化と再利用性を向上させます。適切なモジュール設計で保守性の高いアプリケーションを構築しましょう。