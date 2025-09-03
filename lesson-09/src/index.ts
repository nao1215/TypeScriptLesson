// 基本的なenum型の定義
export enum Direction {
    Up,
    Down,
    Left,
    Right
}

export enum Status {
    Inactive = 0,
    Active = 1,
    Pending = 2,
    Suspended = 10
}

export enum Priority {
    Low = 1,
    Medium,
    High,
    Urgent = 10,
    Critical
}

// 文字列enum
export enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue",
    Yellow = "yellow"
}

export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}

// const enum
export const enum Weekday {
    Monday = "monday",
    Tuesday = "tuesday",
    Wednesday = "wednesday",
    Thursday = "thursday",
    Friday = "friday"
}

// ビット演算を使ったenum
export enum FileAccess {
    None = 0,
    Read = 1 << 0,
    Write = 1 << 1,
    ReadWrite = Read | Write,
    Execute = 1 << 2,
    All = Read | Write | Execute
}

// APIクライアントの実装
export enum ApiStatus {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error"
}

export enum HttpStatusCode {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500
}

interface ApiResponse<T> {
    status: ApiStatus;
    data?: T;
    error?: string;
    httpStatus?: HttpStatusCode;
}

export class ApiClient {
    private baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    async request<T>(
        endpoint: string,
        method: HttpMethod = HttpMethod.GET,
        data?: any
    ): Promise<ApiResponse<T>> {
        try {
            const response = await this.mockRequest<T>(method, endpoint, data);
            
            if (response.httpStatus === HttpStatusCode.OK || 
                response.httpStatus === HttpStatusCode.Created) {
                return {
                    status: ApiStatus.Success,
                    data: response.data,
                    httpStatus: response.httpStatus
                };
            } else {
                return {
                    status: ApiStatus.Error,
                    error: `HTTP ${response.httpStatus}`,
                    httpStatus: response.httpStatus
                };
            }
        } catch (error) {
            return {
                status: ApiStatus.Error,
                error: error instanceof Error ? error.message : 'Unknown error',
                httpStatus: HttpStatusCode.InternalServerError
            };
        }
    }
    
    private async mockRequest<T>(
        method: HttpMethod,
        endpoint: string,
        data?: any
    ): Promise<{ data: T; httpStatus: HttpStatusCode }> {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (endpoint.includes('error')) {
            return {
                data: null as any,
                httpStatus: HttpStatusCode.InternalServerError
            };
        }
        
        if (endpoint.includes('notfound')) {
            return {
                data: null as any,
                httpStatus: HttpStatusCode.NotFound
            };
        }
        
        const mockData = {
            id: 1,
            message: `${method} request to ${endpoint}`,
            timestamp: new Date().toISOString()
        } as T;
        
        return {
            data: mockData,
            httpStatus: method === HttpMethod.POST ? HttpStatusCode.Created : HttpStatusCode.OK
        };
    }
    
    getStatusMessage(status: ApiStatus): string {
        switch (status) {
            case ApiStatus.Idle:
                return "待機中";
            case ApiStatus.Loading:
                return "読み込み中...";
            case ApiStatus.Success:
                return "成功";
            case ApiStatus.Error:
                return "エラーが発生しました";
            default:
                const exhaustiveCheck: never = status;
                return "不明な状態";
        }
    }
    
    isSuccessStatus(httpStatus: HttpStatusCode): boolean {
        return httpStatus >= 200 && httpStatus < 300;
    }
    
    isClientError(httpStatus: HttpStatusCode): boolean {
        return httpStatus >= 400 && httpStatus < 500;
    }
    
    isServerError(httpStatus: HttpStatusCode): boolean {
        return httpStatus >= 500 && httpStatus < 600;
    }
}

// ゲーム開発での使用例
export enum GameState {
    Menu = "menu",
    Loading = "loading",
    Playing = "playing",
    Paused = "paused",
    GameOver = "game_over",
    Victory = "victory"
}

export enum PlayerState {
    Idle = "idle",
    Walking = "walking",
    Running = "running",
    Jumping = "jumping",
    Falling = "falling",
    Attacking = "attacking",
    Dead = "dead"
}

export enum ItemType {
    Weapon = "weapon",
    Armor = "armor",
    Consumable = "consumable",
    KeyItem = "key_item",
    Currency = "currency"
}

export enum WeaponType {
    Sword = "sword",
    Bow = "bow",
    Staff = "staff",
    Dagger = "dagger"
}

export enum DamageType {
    Physical = "physical",
    Magical = "magical",
    Fire = "fire",
    Ice = "ice",
    Lightning = "lightning"
}

export class GameEngine {
    private currentState: GameState = GameState.Menu;
    
    changeState(newState: GameState): boolean {
        if (!this.isValidStateTransition(this.currentState, newState)) {
            console.warn(`無効な状態遷移: ${this.currentState} -> ${newState}`);
            return false;
        }
        
        this.onStateExit(this.currentState);
        const previousState = this.currentState;
        this.currentState = newState;
        this.onStateEnter(newState);
        
        console.log(`状態変更: ${previousState} -> ${newState}`);
        return true;
    }
    
    private isValidStateTransition(from: GameState, to: GameState): boolean {
        const validTransitions: Record<GameState, GameState[]> = {
            [GameState.Menu]: [GameState.Loading],
            [GameState.Loading]: [GameState.Playing, GameState.Menu],
            [GameState.Playing]: [GameState.Paused, GameState.GameOver, GameState.Victory, GameState.Menu],
            [GameState.Paused]: [GameState.Playing, GameState.Menu],
            [GameState.GameOver]: [GameState.Menu, GameState.Loading],
            [GameState.Victory]: [GameState.Menu, GameState.Loading]
        };
        
        return validTransitions[from].includes(to);
    }
    
    private onStateEnter(state: GameState): void {
        switch (state) {
            case GameState.Menu:
                console.log("メニュー表示");
                break;
            case GameState.Loading:
                console.log("ゲーム読み込み中...");
                break;
            case GameState.Playing:
                console.log("ゲーム開始");
                break;
            case GameState.Paused:
                console.log("ゲーム一時停止");
                break;
            case GameState.GameOver:
                console.log("ゲームオーバー");
                break;
            case GameState.Victory:
                console.log("勝利！");
                break;
        }
    }
    
    private onStateExit(state: GameState): void {
        switch (state) {
            case GameState.Playing:
                console.log("ゲーム状態保存");
                break;
            case GameState.Paused:
                console.log("タイマー再開");
                break;
        }
    }
    
    getCurrentState(): GameState {
        return this.currentState;
    }
    
    calculateWeaponValue(damage: number, damageType: DamageType): number {
        const baseValue = damage * 10;
        const multipliers: Record<DamageType, number> = {
            [DamageType.Physical]: 1.0,
            [DamageType.Magical]: 1.2,
            [DamageType.Fire]: 1.3,
            [DamageType.Ice]: 1.3,
            [DamageType.Lightning]: 1.4
        };
        
        return Math.floor(baseValue * (multipliers[damageType] || 1.0));
    }
}

// 設定管理システム
export enum Theme {
    Light = "light",
    Dark = "dark",
    Auto = "auto"
}

export enum Language {
    Japanese = "ja",
    English = "en",
    Chinese = "zh",
    Korean = "ko"
}

export enum NotificationLevel {
    All = "all",
    Important = "important",
    Critical = "critical",
    None = "none"
}

export class SettingsManager {
    private theme: Theme = Theme.Auto;
    private language: Language = Language.Japanese;
    private notificationLevel: NotificationLevel = NotificationLevel.Important;
    
    setTheme(theme: Theme): void {
        this.theme = theme;
        this.applyTheme(theme);
    }
    
    setLanguage(language: Language): void {
        this.language = language;
        this.loadLanguageResources(language);
    }
    
    setNotificationLevel(level: NotificationLevel): void {
        this.notificationLevel = level;
        this.updateNotificationPreferences();
    }
    
    private applyTheme(theme: Theme): void {
        switch (theme) {
            case Theme.Light:
                console.log("ライトテーマを適用");
                break;
            case Theme.Dark:
                console.log("ダークテーマを適用");
                break;
            case Theme.Auto:
                console.log("自動テーマを適用");
                break;
        }
    }
    
    private loadLanguageResources(language: Language): void {
        console.log(`言語リソースを読み込み: ${language}`);
    }
    
    private updateNotificationPreferences(): void {
        console.log(`通知設定を更新: ${this.notificationLevel}`);
    }
    
    getTheme(): Theme {
        return this.theme;
    }
    
    getLanguage(): Language {
        return this.language;
    }
    
    getNotificationLevel(): NotificationLevel {
        return this.notificationLevel;
    }
    
    getThemeDescription(theme: Theme): string {
        const descriptions: Record<Theme, string> = {
            [Theme.Light]: "明るいテーマ",
            [Theme.Dark]: "暗いテーマ",
            [Theme.Auto]: "システム設定に従う"
        };
        
        return descriptions[theme];
    }
    
    getAvailableThemes(): Theme[] {
        return Object.values(Theme);
    }
    
    getAvailableLanguages(): Language[] {
        return Object.values(Language);
    }
    
    getAvailableNotificationLevels(): NotificationLevel[] {
        return Object.values(NotificationLevel);
    }
}

// ユーティリティ関数
export function hasPermission(access: FileAccess, permission: FileAccess): boolean {
    return (access & permission) === permission;
}

export function combinePermissions(...permissions: FileAccess[]): FileAccess {
    return permissions.reduce((combined, permission) => combined | permission, FileAccess.None);
}

export function getEnumKeys<T extends Record<string, string | number>>(enumObject: T): (keyof T)[] {
    return Object.keys(enumObject).filter(key => isNaN(Number(key))) as (keyof T)[];
}

export function getEnumValues<T extends Record<string, string | number>>(enumObject: T): T[keyof T][] {
    return Object.values(enumObject);
}

export function isValidEnumValue<T extends Record<string, string | number>>(
    enumObject: T,
    value: unknown
): value is T[keyof T] {
    return Object.values(enumObject).includes(value as T[keyof T]);
}

function main() {
    console.log("=== Lesson 09: enum型の例 ===\n");

    console.log("1. 基本的なenumの使用");
    console.log("方向:", Direction.Up, Direction[Direction.Up]);
    console.log("ステータス:", Status.Active, Status[Status.Active]);
    console.log("優先度:", Priority.High, Priority[Priority.High]);
    console.log("色:", Color.Red);
    console.log();

    console.log("2. HTTPクライアントの例");
    const client = new ApiClient("https://api.example.com");
    
    client.request("/users", HttpMethod.GET).then(response => {
        console.log("APIレスポンス:", client.getStatusMessage(response.status));
        if (response.httpStatus) {
            console.log("HTTPステータス:", response.httpStatus);
            console.log("成功:", client.isSuccessStatus(response.httpStatus));
        }
    });
    console.log();

    console.log("3. ゲームエンジンの例");
    const gameEngine = new GameEngine();
    console.log("現在の状態:", gameEngine.getCurrentState());
    
    gameEngine.changeState(GameState.Loading);
    gameEngine.changeState(GameState.Playing);
    gameEngine.changeState(GameState.Paused);
    gameEngine.changeState(GameState.Playing);
    gameEngine.changeState(GameState.Victory);
    console.log();

    console.log("4. 武器の価値計算");
    console.log("物理ダメージ武器:", gameEngine.calculateWeaponValue(100, DamageType.Physical));
    console.log("炎ダメージ武器:", gameEngine.calculateWeaponValue(100, DamageType.Fire));
    console.log("雷ダメージ武器:", gameEngine.calculateWeaponValue(100, DamageType.Lightning));
    console.log();

    console.log("5. 設定管理の例");
    const settings = new SettingsManager();
    console.log("現在のテーマ:", settings.getTheme());
    console.log("テーマ説明:", settings.getThemeDescription(settings.getTheme()));
    
    settings.setTheme(Theme.Dark);
    settings.setLanguage(Language.English);
    settings.setNotificationLevel(NotificationLevel.Critical);
    
    console.log("利用可能なテーマ:", settings.getAvailableThemes());
    console.log();

    console.log("6. ファイル権限の例");
    const readWrite = combinePermissions(FileAccess.Read, FileAccess.Write);
    console.log("読み書き権限:", readWrite);
    console.log("読み込み権限あり:", hasPermission(readWrite, FileAccess.Read));
    console.log("実行権限あり:", hasPermission(readWrite, FileAccess.Execute));
    
    const allAccess = FileAccess.All;
    console.log("全権限:", allAccess);
    console.log("すべての権限あり:", hasPermission(allAccess, FileAccess.Read | FileAccess.Write | FileAccess.Execute));
    console.log();

    console.log("7. enumのユーティリティ");
    console.log("Colorのキー:", getEnumKeys(Color));
    console.log("Colorの値:", getEnumValues(Color));
    console.log("'red'は有効な色:", isValidEnumValue(Color, "red"));
    console.log("'purple'は有効な色:", isValidEnumValue(Color, "purple"));
    console.log();

    console.log("8. const enumの使用例");
    const today: Weekday = Weekday.Monday;
    console.log("今日は平日:", today);
}

if (require.main === module) {
    main();
}