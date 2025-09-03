export function safeGetProperty<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
    // TODO: オブジェクトから安全にプロパティを取得する関数を実装してください
    // objがnullやundefinedの場合はundefinedを返し、そうでなければobj[key]を返す
    // ヒント: obj != null をチェックしてからobj[key]にアクセス
    // 例: safeGetProperty({name: "太郎"}, "name") → "太郎"
    // 例: safeGetProperty(null, "name") → undefined
    throw new Error("Not implemented yet");
}

export function findFirstValid(...values: (string | null | undefined)[]): string | null {
    // TODO: 引数の中から最初の有効な（null・undefinedでない）文字列を返す関数を実装してください
    // すべてnull・undefinedの場合はnullを返す
    // ヒント: for...of文やfind()メソッドを使用
    // 例: findFirstValid(null, undefined, "Hello") → "Hello"
    // 例: findFirstValid(null, undefined) → null
    throw new Error("Not implemented yet");
}

export function formatOptionalDate(date: Date | null | undefined): string {
    // TODO: 日付を安全にフォーマットする関数を実装してください
    // dateがnull・undefinedの場合は"日付なし"を返し、
    // そうでなければ "YYYY-MM-DD" 形式の文字列を返す
    // ヒント: date?.toISOString().split('T')[0] または date?.getFullYear()等を使用
    // 例: formatOptionalDate(new Date('2023-12-25')) → "2023-12-25"
    // 例: formatOptionalDate(null) → "日付なし"
    throw new Error("Not implemented yet");
}

export function mergeWithDefaults<T extends Record<string, any>>(partial: Partial<T>, defaults: T): T {
    // TODO: オブジェクトをデフォルト値とマージする関数を実装してください
    // partialのプロパティがnull・undefinedの場合はdefaultsの値を使用
    // ヒント: Object.keys()とnull合体演算子(??)を使用
    // 例: mergeWithDefaults({name: "太郎"}, {name: "デフォルト", age: 20}) 
    //     → {name: "太郎", age: 20}
    throw new Error("Not implemented yet");
}

export function safeParseJSON(jsonString: string | null | undefined): unknown | null {
    // TODO: JSON文字列を安全にパースする関数を実装してください
    // jsonStringがnull・undefinedまたは空文字列の場合はnullを返す
    // パースに失敗した場合もnullを返す（try-catch使用）
    // ヒント: jsonString != null && jsonString.trim() !== "" でチェックしてからJSON.parse()
    // 例: safeParseJSON('{"name": "太郎"}') → {name: "太郎"}
    // 例: safeParseJSON(null) → null
    // 例: safeParseJSON('invalid json') → null
    throw new Error("Not implemented yet");
}