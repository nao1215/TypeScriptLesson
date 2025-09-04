# Lesson 28: ユーティリティ型 (Utility Types)

## 学習目標
このレッスンでは、TypeScriptにおけるユーティリティ型について学びます。

- 組み込みユーティリティ型 (Partial, Required, Pick, Omit)
- RecordやExclude/Extractの使用法
- ReturnTypeやParametersの活用
- カスタムユーティリティ型の作成
- 高度な型変換技法

## 内容

### 1. 基本的なユーティリティ型

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    age: number;
}

// Partial - すべてのプロパティをオプショナルに
type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string; age?: number }

// Required - すべてのプロパティを必須に
type RequiredUser = Required<PartialUser>;
// { id: string; name: string; email: string; age: number }

// Pick - 特定のプロパティを選択
type UserSummary = Pick<User, 'id' | 'name'>;
// { id: string; name: string }

// Omit - 特定のプロパティを除外
type UserWithoutId = Omit<User, 'id'>;
// { name: string; email: string; age: number }
```

### 2. Record型

```typescript
// Record<K, T> - キーと値の型を指定してオブジェクト型を作成
type UserRoles = Record<string, boolean>;
// { [key: string]: boolean }

type SpecificRoles = Record<'admin' | 'user' | 'guest', boolean>;
// { admin: boolean; user: boolean; guest: boolean }
```

### 3. 条件型ユーティリティ

```typescript
// ReturnType - 関数の戻り値型を取得
function getUser(): User {
    return { id: '1', name: 'John', email: 'john@example.com', age: 30 };
}

type GetUserReturn = ReturnType<typeof getUser>; // User

// Parameters - 関数の引数型をタプルで取得
function updateUser(id: string, updates: Partial<User>): User {
    // 実装...
    return {} as User;
}

type UpdateUserParams = Parameters<typeof updateUser>;
// [string, Partial<User>]
```

## 演習問題

1. APIレスポンス型の変換システム
2. フォームバリデーションシステム
3. カスタムユーティリティ型の作成
4. 高度な型操作システム

## まとめ

ユーティリティ型は型の変換や操作を簡単にし、コードの再利用性を高めます。次のレッスンではモジュールについて学びます。