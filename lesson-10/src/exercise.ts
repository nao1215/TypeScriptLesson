// 演習で使用する型定義
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

export function isValidUser(data: unknown): data is User {
    // TODO: User型の型ガードを実装してください
    // 以下の条件を満たす必要があります:
    // - dataがオブジェクトである
    // - idプロパティが存在し、数値である
    // - nameプロパティが存在し、空でない文字列である
    // - emailプロパティが存在し、@を含む文字列である
    // - isActiveプロパティが存在し、boolean値である
    // ヒント: hasProperty関数とisString, isNumber等の型ガードを組み合わせて使用
    // 例: isValidUser({id: 1, name: "John", email: "john@example.com", isActive: true}) → true
    // 例: isValidUser({id: "1", name: "John"}) → false
    throw new Error("Not implemented yet");
}

export function safeGetArrayLength(value: unknown): number | null {
    // TODO: 値が配列の場合は長さを返し、そうでなければnullを返す関数を実装してください
    // ヒント: Array.isArray()を使用して配列かどうかをチェック
    // 例: safeGetArrayLength([1, 2, 3]) → 3
    // 例: safeGetArrayLength("hello") → null
    // 例: safeGetArrayLength({length: 5}) → null (配列でないのでnull)
    throw new Error("Not implemented yet");
}

export function extractStringProperties(obj: unknown): string[] {
    // TODO: オブジェクトから文字列型のプロパティの値のみを抽出して配列で返す関数を実装してください
    // オブジェクトでない場合は空配列を返す
    // ヒント: Object.values()と型ガードを組み合わせて使用
    // 例: extractStringProperties({a: "hello", b: 42, c: "world"}) → ["hello", "world"]
    // 例: extractStringProperties("not an object") → []
    // 例: extractStringProperties({a: 1, b: true}) → []
    throw new Error("Not implemented yet");
}

export function parseNumberSafely(value: unknown): number | null {
    // TODO: 値を安全に数値に変換する関数を実装してください
    // 以下の場合に有効な数値を返す:
    // - 値が既に数値の場合（NaNでない場合）
    // - 値が数値に変換可能な文字列の場合（"123", "45.67"など）
    // それ以外の場合はnullを返す
    // ヒント: typeof, isNaN, Number()関数を使用
    // 例: parseNumberSafely(42) → 42
    // 例: parseNumberSafely("123") → 123
    // 例: parseNumberSafely("abc") → null
    // 例: parseNumberSafely(null) → null
    throw new Error("Not implemented yet");
}

export function mergeObjects(obj1: unknown, obj2: unknown): Record<string, unknown> {
    // TODO: 2つのオブジェクトを安全にマージする関数を実装してください
    // 両方がオブジェクトの場合はプロパティをマージ（obj2が優先）
    // どちらかがオブジェクトでない場合は、オブジェクトの方を返す
    // 両方がオブジェクトでない場合は空オブジェクトを返す
    // ヒント: isObject型ガードを使用し、スプレッド演算子でマージ
    // 例: mergeObjects({a: 1, b: 2}, {b: 3, c: 4}) → {a: 1, b: 3, c: 4}
    // 例: mergeObjects({a: 1}, "not object") → {a: 1}
    // 例: mergeObjects("not object", "also not object") → {}
    throw new Error("Not implemented yet");
}

// ヘルパー関数（実装済み - 演習で使用可能）
function hasProperty<T extends object, K extends string>(
    obj: T,
    key: K
): obj is T & Record<K, unknown> {
    return key in obj;
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}