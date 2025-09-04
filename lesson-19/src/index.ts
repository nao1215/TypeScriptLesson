/**
 * Lesson 19: ユニオン型 (Union Types)
 * 
 * このファイルでは、TypeScriptにおけるユニオン型の定義と使用方法を学びます。
 * ユニオン型を使用することで、複数の型のうちのいずれかを表現できます。
 */

// 1. 基本的なユニオン型
type StringOrNumber = string | number;
type BooleanOrNull = boolean | null;
type Status = "idle" | "loading" | "success" | "error";

function processValue(value: StringOrNumber): string {
    if (typeof value === "string") {
        return `String: ${value.toUpperCase()}`;
    } else {
        return `Number: ${value.toFixed(2)}`;
    }
}

function handleStatus(status: Status): string {
    switch (status) {
        case "idle":
            return "Waiting for action";
        case "loading":
            return "Processing...";
        case "success":
            return "Operation completed successfully";
        case "error":
            return "An error occurred";
    }
}

console.log("=== 1. 基本的なユニオン型 ===");
console.log(processValue("hello"));
console.log(processValue(42.567));
console.log(handleStatus("loading"));
console.log(handleStatus("success"));

// 2. 型ガードを使用したユニオン型処理
type User = {
    id: number;
    name: string;
    email?: string;
};

type ApiResponse<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
    code: number;
};

function isSuccessResponse<T>(response: ApiResponse<T>): response is { success: true; data: T } {
    return response.success;
}

function handleApiResponse<T>(response: ApiResponse<T>): string {
    if (isSuccessResponse(response)) {
        return `Success: ${JSON.stringify(response.data)}`;
    } else {
        return `Error ${response.code}: ${response.error}`;
    }
}

function processUserResponse(response: ApiResponse<User>): User | null {
    if (isSuccessResponse(response)) {
        return response.data;
    } else {
        console.error(`Failed to get user: ${response.error}`);
        return null;
    }
}

console.log("\n=== 2. 型ガードを使用したユニオン型処理 ===");

const successResponse: ApiResponse<User> = {
    success: true,
    data: { id: 1, name: "Alice", email: "alice@example.com" }
};

const errorResponse: ApiResponse<User> = {
    success: false,
    error: "User not found",
    code: 404
};

console.log(handleApiResponse(successResponse));
console.log(handleApiResponse(errorResponse));

const user = processUserResponse(successResponse);
if (user) {
    console.log(`User processed: ${user.name}`);
}

// 3. 判別ユニオン（Discriminated Unions）
interface Circle {
    kind: "circle";
    radius: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Triangle {
    kind: "triangle";
    base: number;
    height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "triangle":
            return (shape.base * shape.height) / 2;
    }
}

function getPerimeter(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return 2 * Math.PI * shape.radius;
        case "rectangle":
            return 2 * (shape.width + shape.height);
        case "triangle":
            // 簡単な三角形として計算（正確な計算には三辺の長さが必要）
            return shape.base + shape.height + Math.sqrt(shape.base ** 2 + shape.height ** 2);
    }
}

function describeShape(shape: Shape): string {
    const area = getArea(shape).toFixed(2);
    const perimeter = getPerimeter(shape).toFixed(2);
    
    switch (shape.kind) {
        case "circle":
            return `Circle with radius ${shape.radius}: Area = ${area}, Perimeter = ${perimeter}`;
        case "rectangle":
            return `Rectangle ${shape.width}x${shape.height}: Area = ${area}, Perimeter = ${perimeter}`;
        case "triangle":
            return `Triangle base=${shape.base}, height=${shape.height}: Area = ${area}, Perimeter = ${perimeter}`;
    }
}

console.log("\n=== 3. 判別ユニオン ===");

const circle: Circle = { kind: "circle", radius: 5 };
const rectangle: Rectangle = { kind: "rectangle", width: 10, height: 6 };
const triangle: Triangle = { kind: "triangle", base: 8, height: 6 };

console.log(describeShape(circle));
console.log(describeShape(rectangle));
console.log(describeShape(triangle));

// 4. 複数のユニオン型の組み合わせ
type Loading = { state: "loading"; progress?: number };
type Success<T> = { state: "success"; data: T };
type Error = { state: "error"; message: string; retryable: boolean };

type AsyncState<T> = Loading | Success<T> | Error;

type NetworkState = AsyncState<any> & {
    lastUpdated?: Date;
};

function handleNetworkState<T>(state: AsyncState<T>): string {
    switch (state.state) {
        case "loading":
            const progress = state.progress !== undefined ? ` (${state.progress}%)` : "";
            return `Loading${progress}...`;
        case "success":
            return `Data loaded: ${JSON.stringify(state.data)}`;
        case "error":
            const retryText = state.retryable ? " (can retry)" : " (cannot retry)";
            return `Error: ${state.message}${retryText}`;
    }
}

function createLoadingState(progress?: number): Loading {
    return { state: "loading", progress };
}

function createSuccessState<T>(data: T): Success<T> {
    return { state: "success", data };
}

function createErrorState(message: string, retryable: boolean = true): Error {
    return { state: "error", message, retryable };
}

console.log("\n=== 4. 複数のユニオン型の組み合わせ ===");

console.log(handleNetworkState(createLoadingState(25)));
console.log(handleNetworkState(createSuccessState(["item1", "item2", "item3"])));
console.log(handleNetworkState(createErrorState("Connection timeout", true)));
console.log(handleNetworkState(createErrorState("Authentication failed", false)));

// 5. オプショナルチェーンとユニオン型
type UserProfile = {
    id: number;
    name: string;
    avatar?: {
        url: string;
        size: number;
    } | null;
    settings?: {
        theme: "light" | "dark";
        notifications: boolean;
    };
} | null;

function getUserAvatarUrl(profile: UserProfile): string | null {
    return profile?.avatar?.url ?? null;
}

function getUserTheme(profile: UserProfile): "light" | "dark" | "default" {
    return profile?.settings?.theme ?? "default";
}

function formatUserDisplay(profile: UserProfile): string {
    if (!profile) {
        return "Anonymous User";
    }
    
    const avatar = getUserAvatarUrl(profile);
    const theme = getUserTheme(profile);
    
    return `${profile.name} [Theme: ${theme}]${avatar ? " 🖼️" : ""}`;
}

console.log("\n=== 5. オプショナルチェーンとユニオン型 ===");

const fullProfile: UserProfile = {
    id: 1,
    name: "Alice",
    avatar: { url: "https://example.com/avatar.jpg", size: 64 },
    settings: { theme: "dark", notifications: true }
};

const minimalProfile: UserProfile = {
    id: 2,
    name: "Bob"
};

const nullProfile: UserProfile = null;

console.log(formatUserDisplay(fullProfile));
console.log(formatUserDisplay(minimalProfile));
console.log(formatUserDisplay(nullProfile));

// 6. 高度なユニオン型の例
type EventType = "mouse" | "keyboard" | "network" | "custom";

type MouseEvent = {
    type: "mouse";
    action: "click" | "move" | "scroll";
    coordinates: { x: number; y: number };
    button?: "left" | "right" | "middle";
};

type KeyboardEvent = {
    type: "keyboard";
    action: "keydown" | "keyup";
    key: string;
    modifiers: {
        ctrl: boolean;
        alt: boolean;
        shift: boolean;
    };
};

type NetworkEvent = {
    type: "network";
    action: "request" | "response" | "error";
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    status?: number;
};

type CustomEvent = {
    type: "custom";
    name: string;
    data: Record<string, any>;
};

type AppEvent = MouseEvent | KeyboardEvent | NetworkEvent | CustomEvent;

class EventLogger {
    private logs: AppEvent[] = [];

    log(event: AppEvent): void {
        this.logs.push(event);
        console.log(this.formatEvent(event));
    }

    private formatEvent(event: AppEvent): string {
        switch (event.type) {
            case "mouse":
                const coords = `(${event.coordinates.x}, ${event.coordinates.y})`;
                const button = event.button ? ` [${event.button}]` : "";
                return `Mouse ${event.action} at ${coords}${button}`;
            
            case "keyboard":
                const modifiers = Object.entries(event.modifiers)
                    .filter(([, active]) => active)
                    .map(([key]) => key)
                    .join("+");
                const modText = modifiers ? `${modifiers}+` : "";
                return `Keyboard ${event.action}: ${modText}${event.key}`;
            
            case "network":
                const method = event.method ? `${event.method} ` : "";
                const status = event.status ? ` (${event.status})` : "";
                return `Network ${event.action}: ${method}${event.url}${status}`;
            
            case "custom":
                return `Custom event '${event.name}': ${JSON.stringify(event.data)}`;
        }
    }

    getEventsByType<T extends EventType>(type: T): Extract<AppEvent, { type: T }>[] {
        return this.logs.filter((event): event is Extract<AppEvent, { type: T }> => 
            event.type === type
        );
    }

    getEventCount(): Record<EventType, number> {
        const counts: Record<EventType, number> = {
            mouse: 0,
            keyboard: 0,
            network: 0,
            custom: 0
        };
        
        this.logs.forEach(event => {
            counts[event.type]++;
        });
        
        return counts;
    }
}

console.log("\n=== 6. 高度なユニオン型の例 ===");

const logger = new EventLogger();

// イベントの登録
logger.log({
    type: "mouse",
    action: "click",
    coordinates: { x: 100, y: 200 },
    button: "left"
});

logger.log({
    type: "keyboard",
    action: "keydown",
    key: "Enter",
    modifiers: { ctrl: true, alt: false, shift: false }
});

logger.log({
    type: "network",
    action: "response",
    url: "https://api.example.com/users",
    method: "GET",
    status: 200
});

logger.log({
    type: "custom",
    name: "user_action",
    data: { action: "login", userId: 123 }
});

// イベントの集計
console.log("\nEvent counts:", logger.getEventCount());

// 特定タイプのイベントを取得
const mouseEvents = logger.getEventsByType("mouse");
console.log(`Found ${mouseEvents.length} mouse events`);

const networkEvents = logger.getEventsByType("network");
console.log(`Found ${networkEvents.length} network events`);

// 7. Exhaustiveness Checking（網羅性チェック）
type Theme = "light" | "dark" | "auto";

function applyTheme(theme: Theme): string {
    switch (theme) {
        case "light":
            return "Applied light theme";
        case "dark":
            return "Applied dark theme";
        case "auto":
            return "Applied auto theme";
        default:
            // この行に到達することはないはず
            const exhaustiveCheck: never = theme;
            throw new Error(`Unhandled theme: ${exhaustiveCheck}`);
    }
}

console.log("\n=== 7. Exhaustiveness Checking ===");
console.log(applyTheme("light"));
console.log(applyTheme("dark"));
console.log(applyTheme("auto"));