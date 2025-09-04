/**
 * Lesson 33: 条件型 (Conditional Types)
 * TypeScript の条件型システムと型レベルプログラミング
 */

console.log('=== Conditional Types Demo ===\n');

// 1. 基本的な条件型
console.log('1. 基本的な条件型:');

type IsString<T> = T extends string ? true : false;
type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// 型の検査
type Test1 = IsString<string>;           // true
type Test2 = IsString<number>;           // false
type Test3 = IsArray<string[]>;          // true
type Test4 = IsArray<string>;            // false
type Test5 = IsFunction<() => void>;     // true
type Test6 = IsFunction<string>;         // false

// NonNullable の実装
type MyNonNullable<T> = T extends null | undefined ? never : T;

type NonNullString = MyNonNullable<string | null>;      // string
type NonNullNumber = MyNonNullable<number | undefined>; // number

function demonstrateBasicConditionalTypes() {
    // 実行時での条件型の使用例
    function processValue<T>(value: T): MyNonNullable<T> {
        if (value === null || value === undefined) {
            throw new Error('値がnullまたはundefinedです');
        }
        return value as MyNonNullable<T>;
    }
    
    try {
        const result1 = processValue("hello");
        const result2 = processValue(42);
        console.log(`  処理結果: "${result1}", ${result2}`);
        
        // const result3 = processValue(null); // 実行時エラー
    } catch (error) {
        console.log(`  エラー: ${error}`);
    }
}

demonstrateBasicConditionalTypes();
console.log();

// 2. 分散型条件型
console.log('2. 分散型条件型 (Distributive Conditional Types):');

type ToArray<T> = T extends any ? T[] : never;
type DistributedArrays = ToArray<string | number | boolean>;
// 結果: string[] | number[] | boolean[]

// 分散を防ぐ場合
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;
type NonDistributedArray = ToArrayNonDistributive<string | number>;
// 結果: (string | number)[]

// 実用例：エラーハンドリングの分散
type Result<T, E = Error> = T extends Error ? { error: T } : { data: T };
type APIResults = Result<string | number | Error>;
// 結果: { data: string } | { data: number } | { error: Error }

function demonstrateDistributiveTypes() {
    // 分散型を活用したエラーハンドリング
    function handleAPIResult<T>(result: T): Result<T> {
        if (result instanceof Error) {
            return { error: result } as Result<T>;
        }
        return { data: result } as Result<T>;
    }
    
    const successResult = handleAPIResult("成功データ");
    const errorResult = handleAPIResult(new Error("APIエラー"));
    
    console.log('  成功結果:', successResult);
    console.log('  エラー結果:', errorResult);
}

demonstrateDistributiveTypes();
console.log();

// 3. infer キーワードによる型推論
console.log('3. infer キーワードによる型推論:');

// 関数の戻り値型を取得
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// 配列要素の型を取得
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Promise の結果型を取得
type PromiseType<T> = T extends Promise<infer U> ? U : T;

// ネストした Promise の展開
type DeepPromiseType<T> = T extends Promise<infer U> 
    ? DeepPromiseType<U> 
    : T;

// 関数の引数型を取得
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

function demonstrateInfer() {
    // 型推論のデモ関数
    function exampleFunction(name: string, age: number): Promise<{ message: string }> {
        return Promise.resolve({ message: `Hello ${name}, you are ${age} years old` });
    }
    
    type ExampleReturn = MyReturnType<typeof exampleFunction>;
    // 結果: Promise<{ message: string }>
    
    type ExamplePromiseType = PromiseType<ExampleReturn>;
    // 結果: { message: string }
    
    type ExampleParams = MyParameters<typeof exampleFunction>;
    // 結果: [string, number]
    
    // 実際の使用例
    async function useInferredTypes() {
        const result = await exampleFunction("Alice", 25);
        console.log('  推論された関数の実行結果:', result);
        
        // 配列要素の型推論
        const stringArray: string[] = ["apple", "banana", "cherry"];
        type StringArrayElement = ArrayElement<typeof stringArray>; // string
        
        const firstElement = stringArray[0]; // TypeScriptが自動的にstring型と推論
        console.log('  配列の最初の要素:', firstElement);
    }
    
    return useInferredTypes();
}

demonstrateInfer().then(() => console.log());

// 4. 再帰的条件型
console.log('4. 再帰的条件型:');

// タプルの反転
type Reverse<T extends readonly unknown[]> = T extends readonly [...infer Rest, infer Last]
    ? [Last, ...Reverse<Rest>]
    : [];

type ReversedTuple = Reverse<[1, 2, 3, 4]>; // [4, 3, 2, 1]

// 文字列の分割（型レベル）
type Split<S extends string, D extends string> = 
    S extends `${infer T}${D}${infer U}` 
        ? [T, ...Split<U, D>] 
        : [S];

type SplitResult = Split<"apple,banana,cherry", ",">; // ["apple", "banana", "cherry"]

// 配列の長さを型レベルで取得
type Length<T extends readonly any[]> = T extends { readonly length: infer L } ? L : never;
type ArrayLength = Length<[1, 2, 3, 4, 5]>; // 5

// 深いオブジェクトの型変換
type DeepReadonly<T> = T extends (infer U)[]
    ? DeepReadonly<U>[]
    : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

function demonstrateRecursiveTypes() {
    console.log('  再帰的条件型のデモ:');
    
    // 型安全な配列反転関数
    function reverseArray<T extends readonly unknown[]>(arr: T): Reverse<T> {
        return arr.slice().reverse() as Reverse<T>;
    }
    
    const originalTuple = [1, "hello", true, 42] as const;
    const reversedTuple = reverseArray(originalTuple);
    console.log(`    元の配列: [${originalTuple.join(', ')}]`);
    console.log(`    反転後: [${reversedTuple.join(', ')}]`);
    
    // 文字列分割の実装
    function splitString<S extends string, D extends string>(
        str: S, 
        delimiter: D
    ): Split<S, D> {
        return str.split(delimiter) as Split<S, D>;
    }
    
    const csvData = "apple,banana,cherry";
    const splitData = splitString(csvData, ",");
    console.log(`    分割前: "${csvData}"`);
    console.log(`    分割後: [${splitData.map(s => `"${s}"`).join(', ')}]`);
    
    // Deep readonly の使用例
    interface MutableData {
        user: {
            name: string;
            settings: {
                theme: string;
                notifications: boolean[];
            };
        };
    }
    
    const mutableData: MutableData = {
        user: {
            name: "Alice",
            settings: {
                theme: "dark",
                notifications: [true, false, true]
            }
        }
    };
    
    const readonlyData: DeepReadonly<MutableData> = mutableData;
    console.log('    読み取り専用データ:', readonlyData.user.name);
    
    // readonlyData.user.name = "Bob"; // エラー: 読み取り専用プロパティです
}

demonstrateRecursiveTypes();
console.log();

// 5. 実用的な型変換システム
console.log('5. 実用的な型変換システム:');

// API レスポンスの型変換
type APIResponse<T> = T extends { error: any }
    ? { success: false; error: T['error'] }
    : { success: true; data: T };

// データベースエンティティからDTOへの変換
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
        return "保存完了";
    }
    
    delete() {
        return "削除完了";
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

function demonstrateTypeTransformations() {
    console.log('  型変換システムのデモ:');
    
    // API レスポンスのハンドリング
    function processAPIResponse<T>(response: T): APIResponse<T> {
        if (typeof response === 'object' && response !== null && 'error' in response) {
            return { success: false, error: (response as any).error };
        }
        return { success: true, data: response };
    }
    
    const successResponse = processAPIResponse({ id: 1, name: "Alice" });
    const errorResponse = processAPIResponse({ error: "ユーザーが見つかりません" });
    
    console.log('    成功レスポンス:', successResponse);
    console.log('    エラーレスポンス:', errorResponse);
    
    // エンティティからDTOへの変換
    function entityToDTO<T>(entity: T): EntityToDTO<T> {
        const result: any = {};
        
        for (const key in entity) {
            const value = entity[key];
            
            if (typeof value === 'function') {
                continue; // 関数は除外
            }
            
            if (value instanceof Date) {
                result[key] = value.toISOString();
            } else if (typeof value === 'object' && value !== null) {
                result[key] = entityToDTO(value);
            } else {
                result[key] = value;
            }
        }
        
        return result as EntityToDTO<T>;
    }
    
    const userEntity = new UserEntity();
    userEntity.id = 1;
    userEntity.name = "Bob Smith";
    userEntity.email = "bob@example.com";
    userEntity.createdAt = new Date();
    userEntity.updatedAt = new Date();
    
    const userDTO = entityToDTO(userEntity);
    console.log('    エンティティ変換結果:', userDTO);
}

demonstrateTypeTransformations();
console.log();

// 6. 高度な型レベルプログラミング
console.log('6. 高度な型レベルプログラミング:');

// 型レベルでの配列操作
type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;
type Tail<T extends readonly any[]> = T extends readonly [any, ...infer Rest] ? Rest : [];

// 型レベルでのフィルタリング
type Filter<T extends readonly any[], U> = T extends readonly [infer First, ...infer Rest]
    ? First extends U
        ? [First, ...Filter<Rest, U>]
        : Filter<Rest, U>
    : [];

type NumbersOnly = Filter<[1, "hello", 2, "world", 3], number>; // [1, 2, 3]

// 型レベルでの検索
type Find<T extends readonly any[], U> = T extends readonly [infer First, ...infer Rest]
    ? First extends U
        ? First
        : Find<Rest, U>
    : never;

type FirstString = Find<[1, 2, "hello", 3, "world"], string>; // "hello"

function demonstrateAdvancedTypeLevel() {
    console.log('  高度な型レベルプログラミングのデモ:');
    
    // 型安全な配列操作
    function head<T extends readonly any[]>(arr: T): Head<T> {
        return arr[0] as Head<T>;
    }
    
    function tail<T extends readonly any[]>(arr: T): Tail<T> {
        return arr.slice(1) as Tail<T>;
    }
    
    const mixedArray = [1, "hello", true, 42, "world"] as const;
    
    const firstElement = head(mixedArray);  // 型: 1
    const restElements = tail(mixedArray);  // 型: ["hello", true, 42, "world"]
    
    console.log(`    配列の先頭: ${firstElement}`);
    console.log(`    配列の残り: [${restElements.join(', ')}]`);
    
    // 型レベルでのフィルタリング実装
    function filterNumbers<T extends readonly any[]>(arr: T): Filter<T, number> {
        return arr.filter((item): item is number => typeof item === 'number') as Filter<T, number>;
    }
    
    const numbersOnly = filterNumbers(mixedArray);
    console.log(`    数値のみ: [${numbersOnly.join(', ')}]`);
}

demonstrateAdvancedTypeLevel();
console.log();

// 7. 実用的な応用例
console.log('7. 実用的な応用例:');

// イベントハンドラーの型推論
type EventHandlerType<T> = T extends `on${infer EventName}`
    ? EventName extends 'Click' | 'Change' | 'Submit'
        ? (event: Event) => void
        : never
    : never;

// パスパラメータの型推論
type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type UserRouteParams = ExtractParams<'/users/:userId/posts/:postId'>;
// 結果: { userId: string; postId: string }

// 環境変数の型推論
type EnvVarType<T extends string> = T extends `${string}_URL`
    ? string
    : T extends `${string}_PORT`
    ? number
    : T extends `${string}_ENABLED`
    ? boolean
    : string;

function demonstratePracticalApplications() {
    console.log('  実用的な応用例のデモ:');
    
    // 型安全なイベントハンドラー
    function createEventHandler<T extends string>(
        eventName: T
    ): T extends `on${string}` ? EventHandlerType<T> : never {
        return ((event: Event) => {
            console.log(`    ${eventName} イベントが発生しました:`, event.type);
        }) as any;
    }
    
    const clickHandler = createEventHandler('onClick');
    const changeHandler = createEventHandler('onChange');
    
    // シミュレーションイベントの作成
    const mockClickEvent = new Event('click');
    const mockChangeEvent = new Event('change');
    
    if (clickHandler) clickHandler(mockClickEvent);
    if (changeHandler) changeHandler(mockChangeEvent);
    
    // パスパラメータの解析
    function parseRoute<T extends string>(
        route: T,
        path: string
    ): ExtractParams<T> | null {
        // 簡単な実装例（実際にはより複雑な解析が必要）
        const routeParts = route.split('/');
        const pathParts = path.split('/');
        
        if (routeParts.length !== pathParts.length) {
            return null;
        }
        
        const params: any = {};
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const pathPart = pathParts[i];
            
            if (routePart.startsWith(':')) {
                const paramName = routePart.slice(1);
                params[paramName] = pathPart;
            } else if (routePart !== pathPart) {
                return null;
            }
        }
        
        return params as ExtractParams<T>;
    }
    
    const userRoute = '/users/:userId/posts/:postId';
    const actualPath = '/users/123/posts/456';
    
    const routeParams = parseRoute(userRoute, actualPath);
    if (routeParams) {
        console.log(`    ルートパラメータ: userId=${routeParams.userId}, postId=${routeParams.postId}`);
    }
}

demonstratePracticalApplications();

console.log('\n=== Conditional Types Demo Complete ===');

export {};