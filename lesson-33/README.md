# Lesson 33: 条件型 (Conditional Types)

## 学習目標
TypeScriptの条件型システムを学び、動的で表現力豊かな型システムを構築します。

- 条件型の基本構文 (T extends U ? X : Y)
- 分散型条件型 (Distributive Conditional Types)
- infer キーワードによる型推論
- 再帰的条件型の構築
- 実用的な応用例：API レスポンスハンドリング、型変換
- 高度な型レベルプログラミング

## 内容

### 1. 条件型の基礎

条件型は、型の条件分岐を可能にする強力な機能です。

```typescript
// 基本的な条件型の構文
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;  // true
type Test2 = IsString<number>;  // false
type Test3 = IsString<"hello">; // true

// より実用的な例
type NonNullable<T> = T extends null | undefined ? never : T;

type Example1 = NonNullable<string | null>;      // string
type Example2 = NonNullable<number | undefined>; // number
type Example3 = NonNullable<boolean | null | undefined>; // boolean
```

### 2. 分散型条件型

ユニオン型に対して条件型を適用すると、自動的に分散されます。

```typescript
// 分散型の動作
type ToArray<T> = T extends any ? T[] : never;

type DistributedArrays = ToArray<string | number>; 
// 結果: string[] | number[] (not (string | number)[])

// 分散を防ぐ場合は配列で囲む
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type NonDistributedArray = ToArrayNonDistributive<string | number>; 
// 結果: (string | number)[]

// 実用例：エラー型の分散処理
type ErrorResult<T> = T extends Error ? { error: T } : { data: T };

type APIResults = ErrorResult<Error | string | number>;
// 結果: { error: Error } | { data: string } | { data: number }
```

### 3. infer キーワードによる型推論

```typescript
// 基本的な infer の使用
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type Func = (x: number) => string;
type FuncReturn = ReturnType<Func>; // string

// 配列要素の型を取得
type ArrayElementType<T> = T extends (infer U)[] ? U : never;
type StringArrayElement = ArrayElementType<string[]>; // string
type NumberArrayElement = ArrayElementType<number[]>; // number

// より複雑な例：Promise の結果型を取得
type PromiseType<T> = T extends Promise<infer U> ? U : T;
type AsyncStringType = PromiseType<Promise<string>>; // string
type SyncNumberType = PromiseType<number>; // number

// ネストした Promise の展開
type DeepPromiseType<T> = T extends Promise<infer U> 
    ? DeepPromiseType<U> 
    : T;

type NestedPromise = Promise<Promise<Promise<string>>>;
type UnwrappedType = DeepPromiseType<NestedPromise>; // string

// 関数の引数型を取得
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type FunctionArgs = Parameters<(a: string, b: number) => void>; // [string, number]

// オブジェクトのプロパティ型を取得
type PropertyType<T, K extends keyof T> = T extends { [P in K]: infer U } ? U : never;

interface User {
    id: number;
    name: string;
    email: string;
}

type UserNameType = PropertyType<User, 'name'>; // string
```

### 4. 再帰的条件型

```typescript
// 深いオブジェクトの平坦化
type FlattenObject<T> = T extends Record<string, any>
    ? {
        [K in keyof T]: T[K] extends Record<string, any>
            ? FlattenObject<T[K]>
            : T[K]
    }
    : T;

// タプルの反転
type Reverse<T extends readonly unknown[]> = T extends readonly [...infer Rest, infer Last]
    ? [Last, ...Reverse<Rest>]
    : [];

type ReversedTuple = Reverse<[1, 2, 3, 4]>; // [4, 3, 2, 1]

// 文字列の分割
type Split<S extends string, D extends string> = 
    S extends `${infer T}${D}${infer U}` 
        ? [T, ...Split<U, D>] 
        : [S];

type SplitResult = Split<"a,b,c,d", ",">; // ["a", "b", "c", "d"]

// 配列の長さを取得（型レベル）
type Length<T extends readonly any[]> = T extends { readonly length: infer L } ? L : never;
type ArrayLength = Length<[1, 2, 3, 4, 5]>; // 5

// より複雑な例：JSON パスの型安全性
type PathsToStringProps<T> = T extends string
    ? []
    : {
        [K in Extract<keyof T, string>]: T[K] extends string
            ? [K]
            : T[K] extends Record<string, any>
            ? [K, ...PathsToStringProps<T[K]>]
            : never;
    }[Extract<keyof T, string>];

interface NestedData {
    user: {
        profile: {
            name: string;
            bio: string;
        };
        settings: {
            theme: string;
        };
    };
    app: {
        version: string;
    };
}

type StringPaths = PathsToStringProps<NestedData>;
// 結果: ["user", "profile", "name"] | ["user", "profile", "bio"] | 
//       ["user", "settings", "theme"] | ["app", "version"]
```

### 5. 実用的な型変換システム

```typescript
// API レスポンスの型変換
type APIResponse<T> = T extends { error: any }
    ? { success: false; error: T['error'] }
    : { success: true; data: T };

type UserAPIResponse = APIResponse<{ id: number; name: string }>;
// 結果: { success: true; data: { id: number; name: string } }

type ErrorAPIResponse = APIResponse<{ error: string }>;
// 結果: { success: false; error: string }

// データベースエンティティの変換
type EntityToDTO<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K] extends Date
        ? string
        : T[K] extends object
        ? EntityToDTO<T[K]>
        : T[K];
};

class UserEntity {
    id!: number;
    name!: string;
    email!: string;
    createdAt!: Date;
    updatedAt!: Date;
    
    save() {
        // メソッド
    }
}

type UserDTO = EntityToDTO<UserEntity>;
// 結果: {
//     id: number;
//     name: string;
//     email: string;
//     createdAt: string;
//     updatedAt: string;
// }

// フォームバリデーションシステム
type ValidationRule<T> = T extends string
    ? { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp }
    : T extends number
    ? { required?: boolean; min?: number; max?: number }
    : T extends boolean
    ? { required?: boolean }
    : { required?: boolean };

type FormValidation<T> = {
    [K in keyof T]: ValidationRule<T[K]>;
};

interface LoginForm {
    username: string;
    password: string;
    rememberMe: boolean;
    age: number;
}

type LoginValidation = FormValidation<LoginForm>;
// 結果: {
//     username: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp };
//     password: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp };
//     rememberMe: { required?: boolean };
//     age: { required?: boolean; min?: number; max?: number };
// }
```

### 6. 高度な型レベルプログラミング

```typescript
// 型レベルでの算術演算
type Add<A extends number, B extends number> = 
    [...Array<A>, ...Array<B>]['length'] extends number ? 
    [...Array<A>, ...Array<B>]['length'] : never;

// 型レベルでの比較
type IsEqual<T, U> = T extends U ? U extends T ? true : false : false;

// 型レベルでの配列操作
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer Rest] ? Rest : [];

type FirstElement = Head<[1, 2, 3, 4]>; // 1
type RestElements = Tail<[1, 2, 3, 4]>; // [2, 3, 4]

// 型レベルでのフィルタリング
type Filter<T extends readonly any[], U> = T extends readonly [infer First, ...infer Rest]
    ? First extends U
        ? [First, ...Filter<Rest, U>]
        : Filter<Rest, U>
    : [];

type NumbersOnly = Filter<[1, "hello", 2, "world", 3], number>; // [1, 2, 3]

// 型レベルでのマップ操作
type Map<T extends readonly any[], U> = T extends readonly [infer First, ...infer Rest]
    ? [First extends any ? U : never, ...Map<Rest, U>]
    : [];

// より複雑な例：SQL クエリの型安全性
type SQLOperator = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
type SQLClause<T extends SQLOperator, Table, Columns = keyof Table> = 
    T extends 'SELECT'
        ? { operation: T; table: Table; columns: Columns[] }
        : T extends 'INSERT'
        ? { operation: T; table: Table; values: Partial<Table> }
        : T extends 'UPDATE'
        ? { operation: T; table: Table; set: Partial<Table>; where: Partial<Table> }
        : T extends 'DELETE'
        ? { operation: T; table: Table; where: Partial<Table> }
        : never;

interface UsersTable {
    id: number;
    name: string;
    email: string;
    age: number;
}

type SelectQuery = SQLClause<'SELECT', UsersTable, 'name' | 'email'>;
// 結果: { operation: 'SELECT'; table: UsersTable; columns: ('name' | 'email')[] }

type InsertQuery = SQLClause<'INSERT', UsersTable>;
// 結果: { operation: 'INSERT'; table: UsersTable; values: Partial<UsersTable> }
```

### 7. リアルワールドでの応用例

```typescript
// React コンポーネントの Props 推論
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// イベントハンドラーの型推論
type EventHandlerType<T> = T extends `on${infer EventName}`
    ? EventName extends keyof HTMLElementEventMap
        ? (event: HTMLElementEventMap[EventName]) => void
        : (event: Event) => void
    : never;

// API エンドポイントの型生成
type APIEndpoint<T extends string> = T extends `${infer Method} ${infer Path}`
    ? Method extends 'GET' | 'POST' | 'PUT' | 'DELETE'
        ? { method: Method; path: Path }
        : never
    : never;

type UserEndpoints = 
    | APIEndpoint<'GET /users'>
    | APIEndpoint<'POST /users'>
    | APIEndpoint<'PUT /users/:id'>
    | APIEndpoint<'DELETE /users/:id'>;

// 環境変数の型安全性
type EnvVarType<T extends string> = T extends `${string}_URL`
    ? string
    : T extends `${string}_PORT`
    ? number
    : T extends `${string}_ENABLED`
    ? boolean
    : string;

type ProcessEnv = {
    [K in keyof NodeJS.ProcessEnv]: EnvVarType<K>;
};
```

## 実行方法

```bash
npx tsc src/index.ts --outDir dist
node dist/index.js
npm test -- lesson-33
```

## 演習問題

1. 型安全なパスバリデーションシステムの実装
2. JSON スキーマから TypeScript 型を生成するシステム
3. GraphQL クエリの型推論システム
4. 関数の引数と戻り値から API 仕様を生成するシステム
5. 型レベルでの正規表現マッチングシステム

## まとめ

条件型は TypeScript の最も強力で表現力豊かな機能の一つです。infer キーワードと組み合わせることで、複雑な型推論と変換が可能になり、実行時エラーを大幅に減らすことができます。

次のレッスンでは、マップ型を使用してオブジェクト型の動的な変換と操作方法を学習します。