export function safeGetProperty<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
    if (obj != null) {
        return obj[key];
    }
    return undefined;
}

export function findFirstValid(...values: (string | null | undefined)[]): string | null {
    for (const value of values) {
        if (value != null) {
            return value;
        }
    }
    return null;
}

export function formatOptionalDate(date: Date | null | undefined): string {
    if (date != null) {
        return date.toISOString().split('T')[0];
    }
    return "日付なし";
}

export function mergeWithDefaults<T extends Record<string, any>>(partial: Partial<T>, defaults: T): T {
    const result = { ...defaults };
    
    for (const key of Object.keys(defaults) as (keyof T)[]) {
        const value = partial[key];
        if (value != null) {
            result[key] = value;
        }
    }
    
    return result;
}

export function safeParseJSON(jsonString: string | null | undefined): unknown | null {
    if (jsonString != null && jsonString.trim() !== "") {
        try {
            return JSON.parse(jsonString);
        } catch {
            return null;
        }
    }
    return null;
}

function demonstrateSolutions() {
    console.log("=== Lesson 06: 演習問題の解答例 ===\n");

    console.log("1. 安全なプロパティ取得");
    const user = { name: "田中太郎", age: 30 };
    console.log(`有効なオブジェクト: ${safeGetProperty(user, "name")}`);
    console.log(`nullオブジェクト: ${safeGetProperty(null as any, "name")}`);
    console.log();

    console.log("2. 最初の有効な値を検索");
    console.log(`結果1: ${findFirstValid(null, undefined, "Hello", "World")}`);
    console.log(`結果2: ${findFirstValid(null, undefined)}`);
    console.log(`結果3: ${findFirstValid("First", "Second")}`);
    console.log();

    console.log("3. オプショナル日付のフォーマット");
    console.log(`有効な日付: ${formatOptionalDate(new Date('2023-12-25'))}`);
    console.log(`null日付: ${formatOptionalDate(null)}`);
    console.log(`undefined日付: ${formatOptionalDate(undefined)}`);
    console.log();

    console.log("4. デフォルト値とのマージ");
    const defaults = { name: "デフォルト名", age: 0, city: "東京" };
    const partial1 = { name: "田中太郎", age: 25 };
    const partial2 = { name: null, age: undefined, city: "大阪" };
    
    console.log("マージ結果1:", mergeWithDefaults(partial1, defaults));
    console.log("マージ結果2:", mergeWithDefaults(partial2 as any, defaults));
    console.log();

    console.log("5. 安全なJSONパース");
    console.log("有効なJSON:", safeParseJSON('{"name": "田中太郎", "age": 30}'));
    console.log("不正なJSON:", safeParseJSON('invalid json'));
    console.log("null入力:", safeParseJSON(null));
    console.log("空文字列:", safeParseJSON(""));
    console.log("空白文字列:", safeParseJSON("   "));
}

if (require.main === module) {
    demonstrateSolutions();
}