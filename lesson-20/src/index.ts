/**
 * Lesson 20: 型アサーション (Type Assertions)
 * 
 * このファイルでは、TypeScriptにおける型アサーションの使用方法を学びます。
 * 型アサーションは、TypeScriptコンパイラに特定の型であることを明示的に伝える手段です。
 */

// 1. 基本的な型アサーション
function demonstrateBasicAssertions(): void {
    // unknown 型からのアサーション
    let someValue: unknown = "Hello, TypeScript!";
    
    // as 演算子を使用 (推奨)
    let strLength1: number = (someValue as string).length;
    
    // アングルブラケット構文 (JSXでは使用不可)
    // let strLength2: number = (<string>someValue).length;
    
    console.log("String length:", strLength1);
    
    // any 型からのアサーション
    let anyValue: any = { name: "Alice", age: 25 };
    let userName: string = (anyValue as { name: string; age: number }).name;
    
    console.log("User name:", userName);
}

console.log("=== 1. 基本的な型アサーション ===");
demonstrateBasicAssertions();

// 2. 非 null アサーション演算子
function demonstrateNonNullAssertion(): void {
    function findElementById(id: string): HTMLElement | null {
        // 実際のDOM操作のシミュレーション
        if (id === "existing") {
            return { style: { color: "black" } } as HTMLElement;
        }
        return null;
    }
    
    // 危険: 非 null アサーション演算子の使用
    function processElementUnsafe(id: string): void {
        const element = findElementById(id);
        // element が null ではないことをアサート
        element!.style.color = "red";
        console.log("Element color changed to red (unsafe)");
    }
    
    // 安全: ガードを使用
    function processElementSafe(id: string): void {
        const element = findElementById(id);
        if (element) {
            element.style.color = "blue";
            console.log("Element color changed to blue (safe)");
        } else {
            console.log("Element not found");
        }
    }
    
    // 存在する要素でテスト
    processElementUnsafe("existing");
    processElementSafe("existing");
    processElementSafe("nonexistent");
}

console.log("\n=== 2. 非 null アサーション演算子 ===");
demonstrateNonNullAssertion();

// 3. DOM 要素の型アサーション（シミュレーション）
interface MockElement {
    tagName: string;
    value?: string;
    disabled?: boolean;
    checked?: boolean;
    textContent?: string;
}

interface MockHTMLButtonElement extends MockElement {
    disabled: boolean;
}

interface MockHTMLInputElement extends MockElement {
    value: string;
    type: string;
}

interface MockHTMLCheckboxElement extends MockHTMLInputElement {
    checked: boolean;
}

function demonstrateDOMAssertions(): void {
    // DOM 要素のシミュレーション
    function mockGetElementById(id: string): MockElement | null {
        const elements: Record<string, MockElement> = {
            "myButton": { tagName: "BUTTON", disabled: false },
            "myInput": { tagName: "INPUT", value: "", type: "text" },
            "myCheckbox": { tagName: "INPUT", value: "", type: "checkbox", checked: false }
        };
        return elements[id] || null;
    }
    
    function mockQuerySelector(selector: string): MockElement | null {
        if (selector === ".my-input") {
            return { tagName: "INPUT", value: "initial", type: "text" };
        }
        return null;
    }
    
    // 特定の要素タイプへのアサーション
    const button = mockGetElementById("myButton") as MockHTMLButtonElement;
    const input = mockQuerySelector(".my-input") as MockHTMLInputElement;
    const checkbox = mockGetElementById("myCheckbox") as MockHTMLCheckboxElement;
    
    if (button) {
        button.disabled = true;
        console.log("Button disabled:", button.disabled);
    }
    
    if (input) {
        input.value = "New value";
        console.log("Input value:", input.value);
    }
    
    if (checkbox) {
        checkbox.checked = true;
        console.log("Checkbox checked:", checkbox.checked);
    }
}

console.log("\n=== 3. DOM 要素の型アサーション ===");
demonstrateDOMAssertions();

// 4. オブジェクトの型アサーション
interface User {
    id: number;
    name: string;
    email: string;
    isActive?: boolean;
}

interface UserResponse {
    success: boolean;
    data: User;
    message: string;
}

function demonstrateObjectAssertions(): void {
    // JSON データのアサーション
    const jsonString = '{"id": 1, "name": "Alice", "email": "alice@example.com", "isActive": true}';
    const userData = JSON.parse(jsonString) as User;
    
    console.log("User data:", userData);
    console.log("User name:", userData.name);
    
    // API レスポンスのアサーション
    const apiResponse = {
        success: true,
        data: userData,
        message: "User retrieved successfully"
    } as UserResponse;
    
    if (apiResponse.success) {
        console.log("API Response:", apiResponse.message);
        console.log("Retrieved user:", apiResponse.data.name);
    }
    
    // 部分的なオブジェクトのアサーション
    const partialUser = { name: "Bob" } as Partial<User>;
    console.log("Partial user:", partialUser.name);
    
    // 空のオブジェクトからのアサーション
    const emptyUser = {} as User;
    // 注意: これは危険な操作です
    console.log("Empty user (dangerous):", emptyUser.name); // undefined
}

console.log("\n=== 4. オブジェクトの型アサーション ===");
demonstrateObjectAssertions();

// 5. const アサーション
function demonstrateConstAssertions(): void {
    // 配列の const アサーション
    const colors = ["red", "green", "blue"] as const;
    type Color = typeof colors[number]; // "red" | "green" | "blue"
    
    console.log("Colors:", colors);
    
    // オブジェクトの const アサーション
    const config = {
        apiUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3
    } as const;
    
    type ApiUrl = typeof config.apiUrl; // "https://api.example.com"
    type Timeout = typeof config.timeout; // 5000
    
    console.log("Config:", config);
    
    // ネストしたオブジェクトの const アサーション
    const apiConfig = {
        endpoints: {
            users: "/api/users",
            posts: "/api/posts",
            comments: "/api/comments"
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    } as const;
    
    type Endpoints = typeof apiConfig.endpoints;
    type Methods = typeof apiConfig.methods[number];
    
    console.log("API Config:", apiConfig);
    
    // タプルの const アサーション
    const coordinates = [10, 20] as const;
    type Coordinates = typeof coordinates; // readonly [10, 20]
    
    console.log("Coordinates:", coordinates);
}

console.log("\n=== 5. const アサーション ===");
demonstrateConstAssertions();

// 6. ユニオン型での型アサーション
type Shape = 
    | { type: "circle"; radius: number }
    | { type: "square"; side: number }
    | { type: "rectangle"; width: number; height: number };

function demonstrateUnionTypeAssertions(): void {
    // ユニオン型から特定の型へのアサーション
    function processShape(shape: Shape): void {
        // 安全な方法: 型ガードを使用
        if (shape.type === "circle") {
            console.log(`Circle with radius: ${shape.radius}`);
        } else if (shape.type === "square") {
            console.log(`Square with side: ${shape.side}`);
        } else {
            console.log(`Rectangle: ${shape.width} x ${shape.height}`);
        }
    }
    
    // 危険な方法: 型アサーションで特定の型に強制変換
    function processShapeUnsafe(shape: Shape): void {
        const circle = shape as { type: "circle"; radius: number };
        console.log(`Assumed circle radius: ${circle.radius}`);
        // 注意: circle.radius はランタイムエラーを起こす可能性あり
    }
    
    const circle: Shape = { type: "circle", radius: 5 };
    const square: Shape = { type: "square", side: 10 };
    const rectangle: Shape = { type: "rectangle", width: 15, height: 8 };
    
    console.log("Safe processing:");
    processShape(circle);
    processShape(square);
    processShape(rectangle);
    
    console.log("\nUnsafe processing:");
    processShapeUnsafe(circle); // 動作する
    // processShapeUnsafe(square); // ランタイムエラーが発生する可能性
}

console.log("\n=== 6. ユニオン型での型アサーション ===");
demonstrateUnionTypeAssertions();

// 7. 型アサーションのベストプラクティス
function demonstrateBestPractices(): void {
    // ベストプラクティス 1: 型ガードを優先する
    function isString(value: unknown): value is string {
        return typeof value === "string";
    }
    
    function processUnknown(value: unknown): void {
        // 推奨: 型ガードを使用
        if (isString(value)) {
            console.log(`String value: ${value.toUpperCase()}`);
        } else {
            console.log("Not a string value");
        }
        
        // 非推奨: 直接型アサーション
        // console.log(`Asserted string: ${(value as string).toUpperCase()}`);
    }
    
    // ベストプラクティス 2: 型アサーションより型絶縮を使用
    interface ApiData {
        id: number;
        name: string;
    }
    
    function processApiData(data: unknown): void {
        // 推奨: 型絶縮を使用
        if (data && typeof data === "object" && "id" in data && "name" in data) {
            const typedData = data as ApiData;
            console.log(`API Data: ${typedData.name} (ID: ${typedData.id})`);
        }
    }
    
    // ベストプラクティス 3: 部分的な型アサーションではなく、特定のプロパティを検証
    function validateAndProcess(data: unknown): void {
        if (
            data &&
            typeof data === "object" &&
            "id" in data &&
            typeof (data as any).id === "number" &&
            "name" in data &&
            typeof (data as any).name === "string"
        ) {
            const validData = data as ApiData;
            console.log(`Valid data: ${validData.name}`);
        } else {
            console.log("Invalid data structure");
        }
    }
    
    console.log("ベストプラクティスの例:");
    processUnknown("hello");
    processUnknown(123);
    
    processApiData({ id: 1, name: "Alice" });
    processApiData({ invalid: true });
    
    validateAndProcess({ id: 1, name: "Bob" });
    validateAndProcess({ id: "invalid", name: "Charlie" });
}

console.log("\n=== 7. 型アサーションのベストプラクティス ===");
demonstrateBestPractices();

// 8. 実用的な型アサーションの例
interface ApiError {
    code: number;
    message: string;
    details?: any;
}

interface ApiSuccess<T> {
    success: true;
    data: T;
}

interface ApiFailure {
    success: false;
    error: ApiError;
}

type ApiResult<T> = ApiSuccess<T> | ApiFailure;

function demonstratePracticalExample(): void {
    // API レスポンス処理の例
    function handleApiResponse(response: unknown): void {
        // 基本的な構造検証
        if (
            response &&
            typeof response === "object" &&
            "success" in response &&
            typeof (response as any).success === "boolean"
        ) {
            const apiResponse = response as ApiResult<any>;
            
            if (apiResponse.success) {
                console.log("API Success:", apiResponse.data);
            } else {
                console.log("API Error:", apiResponse.error.message);
            }
        } else {
            console.log("Invalid API response structure");
        }
    }
    
    // 設定オブジェクトの作成
    function createConfig() {
        return {
            api: {
                baseUrl: "https://api.example.com",
                timeout: 5000,
                endpoints: {
                    users: "/users",
                    posts: "/posts"
                }
            },
            ui: {
                theme: "dark",
                language: "ja"
            }
        } as const;
    }
    
    const config = createConfig();
    type Config = typeof config;
    type Theme = typeof config.ui.theme;
    
    console.log("実用例:");
    
    // 成功レスポンス
    handleApiResponse({
        success: true,
        data: { users: ["Alice", "Bob"] }
    });
    
    // 失敗レスポンス
    handleApiResponse({
        success: false,
        error: {
            code: 404,
            message: "Resource not found"
        }
    });
    
    // 無効なレスポンス
    handleApiResponse("invalid response");
    
    console.log("Config theme:", config.ui.theme);
    console.log("Config API URL:", config.api.baseUrl);
}

console.log("\n=== 8. 実用的な型アサーションの例 ===");
demonstratePracticalExample();

console.log("\n=== まとめ ===");
console.log("型アサーションは強力な機能ですが、慎重に使用してください。");
console.log("最初に型ガードや型絶縮を検討し、どうしても必要な場合のみ使用してください。");
console.log("TypeScriptの基本型システムの学習が完了しました！");