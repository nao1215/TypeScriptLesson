// ヘルパー関数
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

// 演習の解答
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

export function isValidUser(data: unknown): data is User {
    if (!isObject(data)) {
        return false;
    }
    
    // idプロパティのチェック
    if (!hasProperty(data, "id") || !isNumber(data.id)) {
        return false;
    }
    
    // nameプロパティのチェック
    if (!hasProperty(data, "name") || !isString(data.name) || data.name.trim().length === 0) {
        return false;
    }
    
    // emailプロパティのチェック
    if (!hasProperty(data, "email") || !isString(data.email) || !data.email.includes("@")) {
        return false;
    }
    
    // isActiveプロパティのチェック
    if (!hasProperty(data, "isActive") || typeof data.isActive !== "boolean") {
        return false;
    }
    
    return true;
}

export function safeGetArrayLength(value: unknown): number | null {
    if (Array.isArray(value)) {
        return value.length;
    }
    return null;
}

export function extractStringProperties(obj: unknown): string[] {
    if (!isObject(obj)) {
        return [];
    }
    
    return Object.values(obj).filter(isString);
}

export function parseNumberSafely(value: unknown): number | null {
    // 既に数値の場合
    if (isNumber(value)) {
        return value;
    }
    
    // 文字列の場合、数値に変換を試みる
    if (isString(value)) {
        const parsed = Number(value);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    
    return null;
}

export function mergeObjects(obj1: unknown, obj2: unknown): Record<string, unknown> {
    const isObj1 = isObject(obj1);
    const isObj2 = isObject(obj2);
    
    if (isObj1 && isObj2) {
        // 両方がオブジェクトの場合はマージ（obj2が優先）
        return { ...obj1, ...obj2 };
    } else if (isObj1) {
        // obj1のみがオブジェクトの場合
        return { ...obj1 };
    } else if (isObj2) {
        // obj2のみがオブジェクトの場合
        return { ...obj2 };
    } else {
        // 両方ともオブジェクトでない場合
        return {};
    }
}

function demonstrateSolutions() {
    console.log("=== Lesson 10: 演習問題の解答例 ===\n");

    console.log("1. User型の検証");
    const userInputs = [
        { id: 1, name: "John Doe", email: "john@example.com", isActive: true },
        { id: 2, name: "Jane Smith", email: "jane@example.com", isActive: false },
        { id: "3", name: "Invalid User", email: "invalid@example.com", isActive: true }, // idが文字列
        { id: 4, name: "", email: "empty@example.com", isActive: true }, // 名前が空
        { id: 5, name: "No Email", email: "no-at-symbol", isActive: true }, // 無効なメール
        { id: 6, name: "Missing Active", email: "missing@example.com" }, // isActiveがない
        "not an object",
        null
    ];
    
    userInputs.forEach((input, index) => {
        const isValid = isValidUser(input);
        console.log(`入力${index + 1}: ${isValid ? "有効なUser" : "無効"}`);
        if (isValid) {
            console.log(`  ID: ${input.id}, 名前: ${input.name}, アクティブ: ${input.isActive}`);
        }
    });
    console.log();

    console.log("2. 配列の長さを安全に取得");
    const lengthInputs = [
        [1, 2, 3, 4, 5],
        [],
        ["a", "b", "c"],
        "hello",
        { length: 5 },
        null,
        42,
        { 0: "a", 1: "b", length: 2 } // 配列っぽいが配列ではない
    ];
    
    lengthInputs.forEach((input, index) => {
        const length = safeGetArrayLength(input);
        console.log(`入力${index + 1}: 長さ = ${length}`);
    });
    console.log();

    console.log("3. 文字列プロパティの抽出");
    const propertyInputs = [
        { a: "hello", b: 42, c: "world", d: true, e: "test" },
        { x: 1, y: 2, z: 3 },
        { name: "John", age: 30, city: "Tokyo", active: true },
        [],
        "not an object",
        null,
        {}
    ];
    
    propertyInputs.forEach((input, index) => {
        const strings = extractStringProperties(input);
        console.log(`入力${index + 1}: 文字列プロパティ = [${strings.join(", ")}]`);
    });
    console.log();

    console.log("4. 数値の安全な変換");
    const numberInputs = [
        42,
        "123",
        "45.67",
        "-10",
        "0",
        "abc",
        "",
        "123abc",
        true,
        null,
        undefined,
        NaN,
        Infinity
    ];
    
    numberInputs.forEach((input, index) => {
        const parsed = parseNumberSafely(input);
        console.log(`入力${index + 1} (${JSON.stringify(input)}): ${parsed}`);
    });
    console.log();

    console.log("5. オブジェクトのマージ");
    const mergeTests = [
        [{ a: 1, b: 2 }, { b: 3, c: 4 }],
        [{ x: "hello" }, { y: "world" }],
        [{ a: 1 }, "not an object"],
        ["not an object", { b: 2 }],
        ["not an object", "also not an object"],
        [{}, {}],
        [{ a: 1, b: { nested: true } }, { a: 2, c: 3 }]
    ];
    
    mergeTests.forEach(([obj1, obj2], index) => {
        const merged = mergeObjects(obj1, obj2);
        console.log(`マージ${index + 1}:`);
        console.log(`  obj1: ${JSON.stringify(obj1)}`);
        console.log(`  obj2: ${JSON.stringify(obj2)}`);
        console.log(`  結果: ${JSON.stringify(merged)}`);
    });
    console.log();

    console.log("6. 実用例: API レスポンスの処理");
    
    // API からの様々なレスポンスを模擬
    const apiResponses = [
        `{"id": 1, "name": "John Doe", "email": "john@example.com", "isActive": true}`,
        `{"id": "2", "name": "Jane", "email": "jane@example.com", "isActive": false}`, // 不正なid
        `{"name": "Invalid", "email": "invalid-email", "isActive": true}`, // idがない
        `{"id": 3, "name": "", "email": "empty@example.com", "isActive": true}`, // 空の名前
        `invalid json`,
        `null`
    ];
    
    apiResponses.forEach((response, index) => {
        console.log(`APIレスポンス${index + 1}:`);
        
        try {
            const parsed = JSON.parse(response);
            
            if (isValidUser(parsed)) {
                console.log(`  有効なユーザー: ${parsed.name} (${parsed.email})`);
            } else {
                console.log(`  無効なユーザーデータ`);
                
                // 部分的なデータでも安全に処理
                const id = parseNumberSafely(isObject(parsed) && hasProperty(parsed, "id") ? parsed.id : null);
                const strings = extractStringProperties(parsed);
                
                console.log(`    部分データ - ID: ${id}, 文字列: [${strings.join(", ")}]`);
            }
        } catch (error) {
            console.log(`  JSON解析エラー: ${error instanceof Error ? error.message : "不明なエラー"}`);
        }
    });
}

if (require.main === module) {
    demonstrateSolutions();
}