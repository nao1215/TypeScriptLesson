/**
 * Lesson 17: 型エイリアス - テストコード
 */

import {
    StatusCode,
    ResponseData,
    UserData,
    ErrorResponse,
    processApiResponse,
    AppState,
    LoadingState,
    AppContext,
    initializeApp,
    transitionState,
    Predicate,
    Mapper,
    Reducer,
    AsyncMapper,
    processArray,
    processArrayAsync,
    DataSource,
    Priority,
    Task,
    TaskResult,
    TaskProcessor,
    createTask,
    processTasks
} from '../src/solution';

describe('Lesson 17: 型エイリアス', () => {
    describe('API レスポンスの型システム', () => {
        test('processApiResponse: 成功時はデータを返す', () => {
            const userData: UserData = { id: "1", name: "Alice", email: "alice@example.com" };
            const response: ResponseData<UserData> = {
                statusCode: 200,
                data: userData,
                timestamp: new Date()
            };
            
            const result = processApiResponse(response);
            expect(result).toEqual(userData);
        });

        test('processApiResponse: 失敗時はメッセージを返す', () => {
            const response: ResponseData<null> = {
                statusCode: 404,
                message: "User not found",
                timestamp: new Date()
            };
            
            const result = processApiResponse(response);
            expect(result).toBe("User not found");
        });

        test('processApiResponse: メッセージがない場合はデフォルトメッセージ', () => {
            const response: ResponseData<null> = {
                statusCode: 500,
                timestamp: new Date()
            };
            
            const result = processApiResponse(response);
            expect(result).toBe("Unknown error");
        });

        test('processApiResponse: 201ステータスコードも成功として扱う', () => {
            const userData: UserData = { id: "2", name: "Bob", email: "bob@example.com" };
            const response: ResponseData<UserData> = {
                statusCode: 201,
                data: userData,
                timestamp: new Date()
            };
            
            const result = processApiResponse(response);
            expect(result).toEqual(userData);
        });
    });

    describe('状態管理システム', () => {
        test('initializeApp: 初期状態を作成', () => {
            const context = initializeApp<string>();
            expect(context.state).toBe("initializing");
            expect(context.data).toBeUndefined();
            expect(context.loading.isLoading).toBe(false);
            expect(context.error).toBeUndefined();
        });

        test('transitionState: 状態遷移', () => {
            const initialContext = initializeApp<string>();
            
            const loadingContext = transitionState(initialContext, "loading", {
                loading: { isLoading: true, message: "Loading data..." }
            });
            
            expect(loadingContext.state).toBe("loading");
            expect(loadingContext.loading.isLoading).toBe(true);
            expect(loadingContext.loading.message).toBe("Loading data...");
        });

        test('transitionState: データ付きの状態遷移', () => {
            const initialContext = initializeApp<string>();
            
            const readyContext = transitionState(initialContext, "ready", {
                data: "Hello World",
                loading: { isLoading: false }
            });
            
            expect(readyContext.state).toBe("ready");
            expect(readyContext.data).toBe("Hello World");
            expect(readyContext.loading.isLoading).toBe(false);
        });

        test('transitionState: エラー状態への遷移', () => {
            const initialContext = initializeApp<string>();
            
            const errorContext = transitionState(initialContext, "error", {
                error: "Something went wrong",
                loading: { isLoading: false }
            });
            
            expect(errorContext.state).toBe("error");
            expect(errorContext.error).toBe("Something went wrong");
        });
    });

    describe('汎用的なユーティリティ型', () => {
        test('processArray: フィルタ、マップ、リデュース', () => {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            const isEven: Predicate<number> = (n) => n % 2 === 0;
            const double: Mapper<number, number> = (n) => n * 2;
            const sum: Reducer<number, number> = (acc, n) => acc + n;
            
            const result = processArray(numbers, isEven, double, sum, 0);
            // 偶数: [2, 4, 6, 8, 10] -> [4, 8, 12, 16, 20] -> 60
            expect(result).toBe(60);
        });

        test('processArray: 文字列処理', () => {
            const words = ["hello", "world", "typescript", "is", "awesome"];
            
            const isLongWord: Predicate<string> = (w) => w.length > 4;
            const toUpperCase: Mapper<string, string> = (w) => w.toUpperCase();
            const concatenate: Reducer<string, string> = (acc, w) => acc + w + " ";
            
            const result = processArray(words, isLongWord, toUpperCase, concatenate, "");
            expect(result.trim()).toBe("HELLO WORLD TYPESCRIPT AWESOME");
        });

        test('processArrayAsync: 非同期処理', async () => {
            const numbers = [1, 2, 3];
            
            const asyncDouble: AsyncMapper<number, number> = async (n) => {
                return new Promise(resolve => setTimeout(() => resolve(n * 2), 10));
            };
            
            const results = await processArrayAsync(numbers, asyncDouble);
            expect(results).toEqual([2, 4, 6]);
        });
    });

    describe('複雑な型システム', () => {
        test('createTask: タスク作成', () => {
            const data = { message: "Test data" };
            const task = createTask("task1", "api", "high", data);
            
            expect(task.id).toBe("task1");
            expect(task.source).toBe("api");
            expect(task.priority).toBe("high");
            expect(task.data).toEqual(data);
            expect(task.created).toBeInstanceOf(Date);
        });

        test('processTasks: タスクの優先度順処理', async () => {
            const tasks = [
                createTask("task1", "api", "low", "Low priority"),
                createTask("task2", "cache", "urgent", "Urgent task"),
                createTask("task3", "database", "medium", "Medium priority"),
                createTask("task4", "file", "high", "High priority")
            ];
            
            const processor: TaskProcessor<string, string, string> = async (task) => {
                return {
                    taskId: task.id,
                    success: true,
                    result: `Processed: ${task.data}`,
                    processedAt: new Date()
                };
            };
            
            const results = await processTasks(tasks, processor);
            
            // 優先度順: urgent, high, medium, low
            expect(results).toHaveLength(4);
            expect(results[0].taskId).toBe("task2"); // urgent
            expect(results[1].taskId).toBe("task4"); // high
            expect(results[2].taskId).toBe("task3"); // medium
            expect(results[3].taskId).toBe("task1"); // low
        });

        test('processTasks: エラー処理', async () => {
            const tasks = [
                createTask("task1", "api", "high", "Valid data"),
                createTask("task2", "api", "low", "Invalid data")
            ];
            
            const processor: TaskProcessor<string, string, string> = async (task) => {
                if (task.data === "Invalid data") {
                    return {
                        taskId: task.id,
                        success: false,
                        error: "Processing failed",
                        processedAt: new Date()
                    };
                }
                
                return {
                    taskId: task.id,
                    success: true,
                    result: `Processed: ${task.data}`,
                    processedAt: new Date()
                };
            };
            
            const results = await processTasks(tasks, processor);
            
            expect(results[0].success).toBe(true);
            expect(results[0].result).toBe("Processed: Valid data");
            
            expect(results[1].success).toBe(false);
            expect(results[1].error).toBe("Processing failed");
        });

        test('processTasks: 空の配列', async () => {
            const tasks: Task<string>[] = [];
            
            const processor: TaskProcessor<string, string, string> = async (task) => {
                return {
                    taskId: task.id,
                    success: true,
                    processedAt: new Date()
                };
            };
            
            const results = await processTasks(tasks, processor);
            expect(results).toHaveLength(0);
        });
    });
});