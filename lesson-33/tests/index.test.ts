/**
 * Lesson 33 テスト: 条件型 (Conditional Types)
 */

describe('Lesson 33: 条件型 (Conditional Types)', () => {
    describe('基本的な条件型', () => {
        test('IsString型が正しく動作する', () => {
            type IsString<T> = T extends string ? true : false;
            
            type Test1 = IsString<string>;  // true
            type Test2 = IsString<number>;  // false
            type Test3 = IsString<'hello'>; // true
            
            // TypeScriptのコンパイル時テスト
            const test1: Test1 = true;
            const test2: Test2 = false;
            const test3: Test3 = true;
            
            expect(test1).toBe(true);
            expect(test2).toBe(false);
            expect(test3).toBe(true);
        });

        test('NonNullable型が正しく動作する', () => {
            type MyNonNullable<T> = T extends null | undefined ? never : T;
            
            function processValue<T>(value: T): MyNonNullable<T> {
                if (value === null || value === undefined) {
                    throw new Error('値がnullまたはundefinedです');
                }
                return value as MyNonNullable<T>;
            }
            
            expect(processValue("hello")).toBe("hello");
            expect(processValue(42)).toBe(42);
            expect(() => processValue(null)).toThrow();
            expect(() => processValue(undefined)).toThrow();
        });
    });

    describe('分散型条件型', () => {
        test('ToArray型が分散的に動作する', () => {
            type ToArray<T> = T extends any ? T[] : never;
            
            // 分散型は string[] | number[] となる
            function createArrays<T>(value: T): ToArray<T> {
                return [value] as ToArray<T>;
            }
            
            const stringArray = createArrays("hello" as string | number);
            const numberArray = createArrays(42 as string | number);
            
            expect(Array.isArray(stringArray)).toBe(true);
            expect(Array.isArray(numberArray)).toBe(true);
        });

        test('Result型によるエラーハンドリングが正しく動作する', () => {
            type Result<T> = T extends Error ? { error: T } : { data: T };
            
            function handleResult<T>(result: T): Result<T> {
                if (result instanceof Error) {
                    return { error: result } as Result<T>;
                }
                return { data: result } as Result<T>;
            }
            
            const success = handleResult("成功データ");
            const error = handleResult(new Error("エラーメッセージ"));
            
            expect(success).toEqual({ data: "成功データ" });
            expect(error).toEqual({ error: expect.any(Error) });
        });
    });

    describe('infer キーワードによる型推論', () => {
        test('ReturnType型が関数の戻り値型を正しく推論する', () => {
            type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
            
            function testFunction(): string {
                return "test result";
            }
            
            type TestReturn = MyReturnType<typeof testFunction>; // string
            
            const result: TestReturn = testFunction();
            expect(typeof result).toBe('string');
            expect(result).toBe("test result");
        });

        test('ArrayElement型が配列要素の型を正しく推論する', () => {
            type ArrayElement<T> = T extends (infer U)[] ? U : never;
            
            function getFirstElement<T extends any[]>(arr: T): ArrayElement<T> {
                return arr[0] as ArrayElement<T>;
            }
            
            const stringArray = ["apple", "banana", "cherry"];
            const numberArray = [1, 2, 3, 4, 5];
            
            const firstString = getFirstElement(stringArray);
            const firstNumber = getFirstElement(numberArray);
            
            expect(firstString).toBe("apple");
            expect(firstNumber).toBe(1);
        });

        test('PromiseType型がPromiseの結果型を正しく推論する', async () => {
            type PromiseType<T> = T extends Promise<infer U> ? U : T;
            
            async function unwrapPromise<T>(value: T): Promise<PromiseType<T>> {
                if (value instanceof Promise) {
                    return await value as PromiseType<T>;
                }
                return value as PromiseType<T>;
            }
            
            const promisedString = Promise.resolve("async result");
            const syncString = "sync result";
            
            const result1 = await unwrapPromise(promisedString);
            const result2 = await unwrapPromise(syncString);
            
            expect(result1).toBe("async result");
            expect(result2).toBe("sync result");
        });
    });

    describe('再帰的条件型', () => {
        test('Reverse型がタプルを正しく反転する', () => {
            type Reverse<T extends readonly unknown[]> = T extends readonly [...infer Rest, infer Last]
                ? [Last, ...Reverse<Rest>]
                : [];
            
            function reverseArray<T extends readonly unknown[]>(arr: T): Reverse<T> {
                return arr.slice().reverse() as Reverse<T>;
            }
            
            const originalTuple = [1, "hello", true] as const;
            const reversedTuple = reverseArray(originalTuple);
            
            expect(reversedTuple).toEqual([true, "hello", 1]);
        });

        test('Length型が配列の長さを型レベルで取得する', () => {
            type Length<T extends readonly any[]> = T extends { readonly length: infer L } ? L : never;
            
            function getArrayLength<T extends readonly any[]>(arr: T): Length<T> {
                return arr.length as Length<T>;
            }
            
            const fixedArray = [1, 2, 3, 4, 5] as const;
            const length = getArrayLength(fixedArray);
            
            expect(length).toBe(5);
        });

        test('DeepReadonly型が深いオブジェクトを読み取り専用にする', () => {
            type DeepReadonly<T> = T extends (infer U)[]
                ? DeepReadonly<U>[]
                : T extends object
                ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
                : T;
            
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
                        notifications: [true, false]
                    }
                }
            };
            
            const readonlyData: DeepReadonly<MutableData> = mutableData;
            
            expect(readonlyData.user.name).toBe("Alice");
            expect(readonlyData.user.settings.theme).toBe("dark");
            expect(readonlyData.user.settings.notifications).toEqual([true, false]);
        });
    });

    describe('実用的な型変換', () => {
        test('APIResponse型が正しく動作する', () => {
            type APIResponse<T> = T extends { error: any }
                ? { success: false; error: T['error'] }
                : { success: true; data: T };
            
            function processAPIResponse<T>(response: T): APIResponse<T> {
                if (typeof response === 'object' && response !== null && 'error' in response) {
                    return { success: false, error: (response as any).error };
                }
                return { success: true, data: response };
            }
            
            const successResponse = processAPIResponse({ id: 1, name: "Alice" });
            const errorResponse = processAPIResponse({ error: "Not found" });
            
            expect(successResponse).toEqual({ success: true, data: { id: 1, name: "Alice" } });
            expect(errorResponse).toEqual({ success: false, error: "Not found" });
        });

        test('EntityToDTO型がエンティティを正しくDTOに変換する', () => {
            type EntityToDTO<T> = {
                [K in keyof T as T[K] extends Function ? never : K]: T[K] extends Date
                    ? string
                    : T[K] extends object
                    ? EntityToDTO<T[K]>
                    : T[K];
            };
            
            class TestEntity {
                id!: number;
                name!: string;
                createdAt!: Date;
                
                save() {
                    return "saved";
                }
            }
            
            function entityToDTO<T>(entity: T): EntityToDTO<T> {
                const result: any = {};
                
                for (const key in entity) {
                    const value = entity[key];
                    
                    if (typeof value === 'function') {
                        continue;
                    }
                    
                    if (value instanceof Date) {
                        result[key] = value.toISOString();
                    } else {
                        result[key] = value;
                    }
                }
                
                return result as EntityToDTO<T>;
            }
            
            const entity = new TestEntity();
            entity.id = 1;
            entity.name = "Test";
            entity.createdAt = new Date('2023-01-01');
            
            const dto = entityToDTO(entity);
            
            expect(dto.id).toBe(1);
            expect(dto.name).toBe("Test");
            expect(dto.createdAt).toBe('2023-01-01T00:00:00.000Z');
            expect(dto).not.toHaveProperty('save');
        });
    });

    describe('高度な型レベルプログラミング', () => {
        test('Head/Tail型が配列操作を正しく行う', () => {
            type Head<T extends readonly any[]> = T extends readonly [infer H, ...any[]] ? H : never;
            type Tail<T extends readonly any[]> = T extends readonly [any, ...infer Rest] ? Rest : [];
            
            function head<T extends readonly any[]>(arr: T): Head<T> {
                return arr[0] as Head<T>;
            }
            
            function tail<T extends readonly any[]>(arr: T): Tail<T> {
                return arr.slice(1) as Tail<T>;
            }
            
            const testArray = [1, "hello", true, 42] as const;
            
            const firstElement = head(testArray);
            const restElements = tail(testArray);
            
            expect(firstElement).toBe(1);
            expect(restElements).toEqual(["hello", true, 42]);
        });

        test('Filter型が型レベルでフィルタリングを行う', () => {
            type Filter<T extends readonly any[], U> = T extends readonly [infer First, ...infer Rest]
                ? First extends U
                    ? [First, ...Filter<Rest, U>]
                    : Filter<Rest, U>
                : [];
            
            function filterByType<T extends readonly any[], U>(
                arr: T,
                typeGuard: (value: any) => value is U
            ): Filter<T, U> {
                return arr.filter(typeGuard) as Filter<T, U>;
            }
            
            const mixedArray = [1, "hello", 2, "world", 3] as const;
            const numbersOnly = filterByType(mixedArray, (value): value is number => typeof value === 'number');
            
            expect(numbersOnly).toEqual([1, 2, 3]);
        });
    });
});

export {};