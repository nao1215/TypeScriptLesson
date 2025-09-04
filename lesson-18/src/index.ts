/**
 * Lesson 18: リテラル型 (Literal Types)
 * 
 * このファイルでは、TypeScriptにおけるリテラル型の定義と使用方法を学びます。
 * リテラル型を使用することで、特定の値のみを許可する厳密な型定義ができます。
 */

// 1. 文字列リテラル型
type Direction = "up" | "down" | "left" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type LogLevel = "debug" | "info" | "warn" | "error";

function move(direction: Direction): string {
    return `Moving ${direction}`;
}

function makeRequest(method: HttpMethod, url: string): string {
    return `${method} request to ${url}`;
}

function log(level: LogLevel, message: string): string {
    return `[${level.toUpperCase()}] ${message}`;
}

console.log("=== 1. 文字列リテラル型 ===");
console.log(move("up"));
console.log(move("down"));
console.log(makeRequest("GET", "/api/users"));
console.log(makeRequest("POST", "/api/users"));
console.log(log("info", "Application started"));
console.log(log("error", "Something went wrong"));

// 2. 数値リテラル型
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500;
type Quarter = 1 | 2 | 3 | 4;

function rollDice(): DiceRoll {
    return (Math.floor(Math.random() * 6) + 1) as DiceRoll;
}

function getStatusMessage(status: HttpStatus): string {
    switch (status) {
        case 200:
            return "OK";
        case 201:
            return "Created";
        case 400:
            return "Bad Request";
        case 401:
            return "Unauthorized";
        case 403:
            return "Forbidden";
        case 404:
            return "Not Found";
        case 500:
            return "Internal Server Error";
    }
}

function getQuarterName(quarter: Quarter): string {
    return `Q${quarter}`;
}

console.log("\n=== 2. 数値リテラル型 ===");
console.log("Dice roll:", rollDice());
console.log("Status 200:", getStatusMessage(200));
console.log("Status 404:", getStatusMessage(404));
console.log("Quarter:", getQuarterName(2));

// 3. 真偽値リテラル型
type AlwaysTrue = true;
type AlwaysFalse = false;

// 実用的な例：設定オブジェクト
type DevelopmentConfig = {
    debug: true;
    production: false;
    logging: true;
};

type ProductionConfig = {
    debug: false;
    production: true;
    logging: false;
};

function createDevelopmentConfig(): DevelopmentConfig {
    return {
        debug: true,
        production: false,
        logging: true
    };
}

function createProductionConfig(): ProductionConfig {
    return {
        debug: false,
        production: true,
        logging: false
    };
}

console.log("\n=== 3. 真偽値リテラル型 ===");
console.log("Development config:", createDevelopmentConfig());
console.log("Production config:", createProductionConfig());

// 4. テンプレートリテラル型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">;        // "onClick"
type HoverEvent = EventName<"hover">;        // "onHover"
type SubmitEvent = EventName<"submit">;      // "onSubmit"

type Color = "red" | "green" | "blue" | "yellow";
type Shade = "light" | "dark";
type ColorVariant = `${Shade}-${Color}`;

type Size = "sm" | "md" | "lg";
type Component = "button" | "input" | "card";
type CSSClass = `${Component}-${Size}`;

function createEventHandler<T extends string>(eventType: T): EventName<T> {
    return `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}` as EventName<T>;
}

function createCSSClass(component: Component, size: Size): CSSClass {
    return `${component}-${size}`;
}

function applyColorVariant(variant: ColorVariant): string {
    return `Applied ${variant} color variant`;
}

console.log("\n=== 4. テンプレートリテラル型 ===");
console.log("Event handler:", createEventHandler("click"));
console.log("Event handler:", createEventHandler("keydown"));
console.log("CSS class:", createCSSClass("button", "lg"));
console.log("CSS class:", createCSSClass("input", "sm"));
console.log(applyColorVariant("light-blue"));
console.log(applyColorVariant("dark-red"));

// 5. オブジェクトリテラル型
type Origin = { readonly x: 0; readonly y: 0 };
type UnitVector = { readonly x: 1; readonly y: 0 } | { readonly x: 0; readonly y: 1 };

type DefaultSettings = {
    readonly theme: "light";
    readonly language: "en";
    readonly autoSave: true;
    readonly notifications: true;
};

function createOrigin(): Origin {
    return { x: 0, y: 0 };
}

function getDefaultSettings(): DefaultSettings {
    return {
        theme: "light",
        language: "en",
        autoSave: true,
        notifications: true
    };
}

console.log("\n=== 5. オブジェクトリテラル型 ===");
console.log("Origin:", createOrigin());
console.log("Default settings:", getDefaultSettings());

// 6. 実用的な例：状態管理
type LoadingState = "idle" | "loading" | "success" | "error";

interface ApiState<T> {
    status: LoadingState;
    data?: T;
    error?: string;
}

type UserData = {
    id: number;
    name: string;
    email: string;
};

class ApiManager<T> {
    private state: ApiState<T> = { status: "idle" };

    getState(): ApiState<T> {
        return this.state;
    }

    setLoading(): void {
        this.state = { status: "loading" };
    }

    setSuccess(data: T): void {
        this.state = { status: "success", data };
    }

    setError(error: string): void {
        this.state = { status: "error", error };
    }
}

console.log("\n=== 6. 実用的な例：状態管理 ===");
const userApi = new ApiManager<UserData>();

console.log("Initial state:", userApi.getState());

userApi.setLoading();
console.log("Loading state:", userApi.getState());

userApi.setSuccess({ id: 1, name: "Alice", email: "alice@example.com" });
console.log("Success state:", userApi.getState());

userApi.setError("Network error");
console.log("Error state:", userApi.getState());

// 7. 高度なテンプレートリテラル型
type HttpUrl = `http://${string}`;
type HttpsUrl = `https://${string}`;
type Url = HttpUrl | HttpsUrl;

type Route = `/${string}`;
type ApiRoute = `/api${Route}`;
type Version = "v1" | "v2" | "v3";
type VersionedApiRoute = `/api/${Version}${Route}`;

function validateUrl(url: string): url is Url {
    return url.startsWith("http://") || url.startsWith("https://");
}

function createApiRoute(version: Version, route: Route): VersionedApiRoute {
    return `/api/${version}${route}`;
}

function isValidRoute(path: string): path is Route {
    return path.startsWith("/");
}

console.log("\n=== 7. 高度なテンプレートリテラル型 ===");
console.log("URL validation:", validateUrl("https://example.com"));
console.log("URL validation:", validateUrl("ftp://example.com"));

console.log("API route:", createApiRoute("v1", "/users"));
console.log("API route:", createApiRoute("v2", "/posts/123"));

console.log("Route validation:", isValidRoute("/users"));
console.log("Route validation:", isValidRoute("users"));

// 8. 複合リテラル型
type Theme = "light" | "dark";
type Language = "en" | "ja" | "es" | "fr";

type LocaleTheme = `${Language}-${Theme}`;

type Permission = "read" | "write" | "delete";
type Resource = "user" | "post" | "comment";
type Action = `${Permission}_${Resource}`;

type Priority = "low" | "medium" | "high";
type Status = "open" | "in_progress" | "closed";
type TicketState = `${Status}-${Priority}`;

function createLocaleTheme(language: Language, theme: Theme): LocaleTheme {
    return `${language}-${theme}`;
}

function checkPermission(action: Action): boolean {
    // 権限チェックのロジック
    const validActions: Action[] = [
        "read_user", "write_user",
        "read_post", "write_post", "delete_post",
        "read_comment", "write_comment"
    ];
    return validActions.includes(action);
}

function createTicketState(status: Status, priority: Priority): TicketState {
    return `${status}-${priority}`;
}

console.log("\n=== 8. 複合リテラル型 ===");
console.log("Locale theme:", createLocaleTheme("ja", "dark"));
console.log("Locale theme:", createLocaleTheme("en", "light"));

console.log("Permission check:", checkPermission("read_user"));
console.log("Permission check:", checkPermission("delete_user"));

console.log("Ticket state:", createTicketState("in_progress", "high"));
console.log("Ticket state:", createTicketState("closed", "low"));