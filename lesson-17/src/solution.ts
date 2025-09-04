/**
 * Lesson 17: 型エイリアス - 解答例
 */

/**
 * 演習1: API レスポンスの型システム
 */
export type StatusCode = 200 | 201 | 400 | 401 | 404 | 500;

export type ResponseData<T> = {
    statusCode: StatusCode;
    data?: T;
    message?: string;
    timestamp: Date;
};

export type UserData = {
    id: string;
    name: string;
    email: string;
};

export type ErrorResponse = {
    code: string;
    details: string;
};

export function processApiResponse<T>(response: ResponseData<T>): T | string {
    if (response.statusCode === 200 || response.statusCode === 201) {
        return response.data!;
    } else {
        return response.message || "Unknown error";
    }
}

/**
 * 演習2: 状態管理システム
 */
export type AppState = "initializing" | "ready" | "loading" | "error";

export type LoadingState = {
    isLoading: boolean;
    progress?: number;
    message?: string;
};

export type AppContext<T> = {
    state: AppState;
    data?: T;
    loading: LoadingState;
    error?: string;
};

export function initializeApp<T>(): AppContext<T> {
    return {
        state: "initializing",
        loading: {
            isLoading: false
        }
    };
}

export function transitionState<T>(
    context: AppContext<T>,
    newState: AppState,
    options?: {
        data?: T;
        error?: string;
        loading?: Partial<LoadingState>;
    }
): AppContext<T> {
    return {
        ...context,
        state: newState,
        data: options?.data !== undefined ? options.data : context.data,
        error: options?.error,
        loading: {
            ...context.loading,
            ...options?.loading
        }
    };
}

/**
 * 演習3: 汎用的なユーティリティ型
 */
export type Predicate<T> = (item: T) => boolean;
export type Mapper<T, U> = (item: T) => U;
export type Reducer<T, U> = (accumulator: U, current: T) => U;
export type AsyncMapper<T, U> = (item: T) => Promise<U>;

export function processArray<T, U, V>(
    items: T[],
    predicate: Predicate<T>,
    mapper: Mapper<T, U>,
    reducer: Reducer<U, V>,
    initialValue: V
): V {
    return items
        .filter(predicate)
        .map(mapper)
        .reduce(reducer, initialValue);
}

export async function processArrayAsync<T, U>(
    items: T[],
    asyncMapper: AsyncMapper<T, U>
): Promise<U[]> {
    return Promise.all(items.map(asyncMapper));
}

/**
 * 演習4: 複雑な型システム
 */
export type DataSource = "api" | "cache" | "database" | "file";
export type Priority = "low" | "medium" | "high" | "urgent";

export type Task<T> = {
    id: string;
    source: DataSource;
    priority: Priority;
    data: T;
    created: Date;
};

export type TaskResult<T, E> = {
    taskId: string;
    success: boolean;
    result?: T;
    error?: E;
    processedAt: Date;
};

export type TaskProcessor<T, U, E> = (task: Task<T>) => Promise<TaskResult<U, E>>;

export function createTask<T>(
    id: string,
    source: DataSource,
    priority: Priority,
    data: T
): Task<T> {
    return {
        id,
        source,
        priority,
        data,
        created: new Date()
    };
}

export async function processTasks<T, U, E>(
    tasks: Task<T>[],
    processor: TaskProcessor<T, U, E>
): Promise<TaskResult<U, E>[]> {
    // 優先度順でソート
    const priorityOrder: Record<Priority, number> = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1
    };
    
    const sortedTasks = tasks.sort((a, b) => {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    // 各タスクを処理
    const results: TaskResult<U, E>[] = [];
    for (const task of sortedTasks) {
        const result = await processor(task);
        results.push(result);
    }
    
    return results;
}