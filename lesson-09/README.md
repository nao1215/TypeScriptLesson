# Lesson 09: enum型

## 学習目標
- TypeScriptのenum型の基本概念を理解する
- 数値enumと文字列enumの違いと使い方を学ぶ
- constアサーションとenumの使い分けを身につける
- 実用的なenum型の使用パターンを理解する

## 概要
enum（列挙型）は、名前付きの定数のセットを定義するTypeScriptの機能です。関連する定数をグループ化し、型安全性を保ちながら、コードの可読性と保守性を向上させることができます。

## 主な内容

### 1. enum型の基本
```typescript
// 数値enum（デフォルト）
enum Direction {
    Up,    // 0
    Down,  // 1
    Left,  // 2
    Right  // 3
}

// 使用例
let userDirection: Direction = Direction.Up;
console.log(userDirection); // 0
console.log(Direction.Up);  // 0
console.log(Direction[0]);  // "Up" (リバースマッピング)

// 明示的な数値指定
enum Status {
    Inactive = 0,
    Active = 1,
    Pending = 2,
    Suspended = 10
}

// 部分的な指定（以降は自動インクリメント）
enum Priority {
    Low = 1,   // 1
    Medium,    // 2
    High,      // 3
    Urgent = 10, // 10
    Critical   // 11
}
```

### 2. 文字列enum
```typescript
// 文字列enum
enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue",
    Yellow = "yellow"
}

// 使用例
let favoriteColor: Color = Color.Red;
console.log(favoriteColor); // "red"

// 混合enum（推奨しない）
enum MixedEnum {
    No = 0,
    Yes = "yes"
}

// より実用的な文字列enumの例
enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}

enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}
```

### 3. const enum
```typescript
// const enum（コンパイル時にインライン化）
const enum Weekday {
    Monday = "monday",
    Tuesday = "tuesday",
    Wednesday = "wednesday",
    Thursday = "thursday",
    Friday = "friday"
}

// 使用例（コンパイル時に値が直接埋め込まれる）
let today: Weekday = Weekday.Monday;
// コンパイル後: let today = "monday";

// 通常のenumとの違い
enum RegularEnum {
    A = "a",
    B = "b"
}

const enum ConstEnum {
    A = "a",
    B = "b"
}

// RegularEnumはオブジェクトとして残る
// ConstEnumは完全にインライン化される
```

### 4. リバースマッピング
```typescript
enum Size {
    Small = 1,
    Medium = 2,
    Large = 3
}

// 数値enumはリバースマッピングをサポート
console.log(Size.Small);   // 1
console.log(Size[1]);      // "Small"
console.log(Size[2]);      // "Medium"

// 文字列enumはリバースマッピングなし
enum Theme {
    Light = "light",
    Dark = "dark"
}

console.log(Theme.Light);  // "light"
console.log(Theme["light"]); // undefined（リバースマッピングなし）
```

### 5. enumの型安全性
```typescript
enum UserRole {
    Admin = "admin",
    User = "user",
    Guest = "guest"
}

// 型安全な関数
function checkPermission(role: UserRole): boolean {
    switch (role) {
        case UserRole.Admin:
            return true;
        case UserRole.User:
            return true;
        case UserRole.Guest:
            return false;
        default:
            // exhaustive check
            const exhaustiveCheck: never = role;
            return false;
    }
}

// 正しい使用法
checkPermission(UserRole.Admin); // OK
// checkPermission("admin");     // エラー: string は UserRole に代入できない

// enumのキーと値の取得
function getAllRoles(): UserRole[] {
    return Object.values(UserRole);
}

function getAllRoleNames(): string[] {
    return Object.keys(UserRole);
}
```

### 6. enumの計算プロパティ
```typescript
// 計算されたenum値
enum FileAccess {
    None = 0,
    Read = 1 << 0,    // 1
    Write = 1 << 1,   // 2
    ReadWrite = Read | Write,  // 3
    Execute = 1 << 2,   // 4
    All = Read | Write | Execute  // 7
}

// ビット演算での使用
function hasPermission(access: FileAccess, permission: FileAccess): boolean {
    return (access & permission) === permission;
}

console.log(hasPermission(FileAccess.ReadWrite, FileAccess.Read));  // true
console.log(hasPermission(FileAccess.Read, FileAccess.Write));      // false

// 関数を使った動的enum（実行時計算）
function computeValue(): number {
    return Math.floor(Date.now() / 1000);
}

enum DynamicEnum {
    Static = 10,
    Dynamic = computeValue(),  // 実行時に計算される
    Next  // Dynamic + 1 になる
}
```

### 7. enumと型システムの統合
```typescript
// enumをキーとして使用
enum TaskStatus {
    Todo = "todo",
    InProgress = "in_progress",
    Done = "done",
    Cancelled = "cancelled"
}

type TaskStatusMap<T> = {
    [K in TaskStatus]: T;
};

const statusMessages: TaskStatusMap<string> = {
    [TaskStatus.Todo]: "作業開始前",
    [TaskStatus.InProgress]: "作業中",
    [TaskStatus.Done]: "完了",
    [TaskStatus.Cancelled]: "キャンセル済み"
};

// enumの部分型
type ActiveStatus = TaskStatus.Todo | TaskStatus.InProgress;

function isActiveTask(status: TaskStatus): status is ActiveStatus {
    return status === TaskStatus.Todo || status === TaskStatus.InProgress;
}

// enumのKeyof操作
type TaskStatusKey = keyof typeof TaskStatus; // "Todo" | "InProgress" | "Done" | "Cancelled"

// enumの値の型
type TaskStatusValue = `${TaskStatus}`; // "todo" | "in_progress" | "done" | "cancelled"
```

## 実践的な使用例

### 例1: Webアプリケーションの状態管理
```typescript
// APIレスポンスの状態
enum ApiStatus {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error"
}

// HTTPステータスコード
enum HttpStatusCode {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500
}

// UIコンポーネントの状態
enum ComponentState {
    Initializing = "initializing",
    Ready = "ready",
    Updating = "updating",
    Error = "error",
    Destroyed = "destroyed"
}

interface ApiResponse<T> {
    status: ApiStatus;
    data?: T;
    error?: string;
    httpStatus?: HttpStatusCode;
}

class ApiClient {
    private baseUrl: string;
    private defaultTimeout: number = 5000;
    
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
        // モック実装
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

// React風のコンポーネント状態管理
class ComponentManager {
    private state: ComponentState = ComponentState.Initializing;
    private onStateChange?: (state: ComponentState) => void;
    
    constructor(onStateChange?: (state: ComponentState) => void) {
        this.onStateChange = onStateChange;
        this.initialize();
    }
    
    private async initialize(): Promise<void> {
        this.setState(ComponentState.Initializing);
        
        try {
            // 初期化処理（モック）
            await new Promise(resolve => setTimeout(resolve, 500));
            this.setState(ComponentState.Ready);
        } catch (error) {
            this.setState(ComponentState.Error);
        }
    }
    
    async update(data: any): Promise<boolean> {
        if (this.state !== ComponentState.Ready) {
            throw new Error(`更新不可能な状態: ${this.state}`);
        }
        
        this.setState(ComponentState.Updating);
        
        try {
            // 更新処理（モック）
            await new Promise(resolve => setTimeout(resolve, 200));
            this.setState(ComponentState.Ready);
            return true;
        } catch (error) {
            this.setState(ComponentState.Error);
            return false;
        }
    }
    
    destroy(): void {
        this.setState(ComponentState.Destroyed);
    }
    
    private setState(newState: ComponentState): void {
        this.state = newState;
        this.onStateChange?.(newState);
    }
    
    getState(): ComponentState {
        return this.state;
    }
    
    canUpdate(): boolean {
        return this.state === ComponentState.Ready;
    }
    
    isDestroyed(): boolean {
        return this.state === ComponentState.Destroyed;
    }
}
```

### 例2: ゲーム開発での状態管理
```typescript
// ゲーム状態
enum GameState {
    Menu = "menu",
    Loading = "loading",
    Playing = "playing",
    Paused = "paused",
    GameOver = "game_over",
    Victory = "victory"
}

// プレイヤーの状態
enum PlayerState {
    Idle = "idle",
    Walking = "walking",
    Running = "running",
    Jumping = "jumping",
    Falling = "falling",
    Attacking = "attacking",
    Dead = "dead"
}

// アイテムの種類
enum ItemType {
    Weapon = "weapon",
    Armor = "armor",
    Consumable = "consumable",
    KeyItem = "key_item",
    Currency = "currency"
}

// 武器の種類
enum WeaponType {
    Sword = "sword",
    Bow = "bow",
    Staff = "staff",
    Dagger = "dagger"
}

// 敵の種類
enum EnemyType {
    Goblin = "goblin",
    Orc = "orc",
    Dragon = "dragon",
    Skeleton = "skeleton"
}

// ダメージの種類
enum DamageType {
    Physical = "physical",
    Magical = "magical",
    Fire = "fire",
    Ice = "ice",
    Lightning = "lightning"
}

interface GameObject {
    id: string;
    position: { x: number; y: number };
    state: PlayerState;
}

interface Player extends GameObject {
    health: number;
    maxHealth: number;
    level: number;
    experience: number;
    inventory: Item[];
}

interface Item {
    id: string;
    name: string;
    type: ItemType;
    value: number;
    description: string;
}

interface Weapon extends Item {
    type: ItemType.Weapon;
    weaponType: WeaponType;
    damage: number;
    damageType: DamageType;
}

interface Enemy extends GameObject {
    enemyType: EnemyType;
    health: number;
    maxHealth: number;
    damage: number;
    experience: number;
}

class GameEngine {
    private currentState: GameState = GameState.Menu;
    private player?: Player;
    private enemies: Enemy[] = [];
    private gameObjects: GameObject[] = [];
    
    // 状態遷移の管理
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
                this.showMenu();
                break;
            case GameState.Loading:
                this.loadGame();
                break;
            case GameState.Playing:
                this.startGame();
                break;
            case GameState.Paused:
                this.pauseGame();
                break;
            case GameState.GameOver:
                this.showGameOver();
                break;
            case GameState.Victory:
                this.showVictory();
                break;
        }
    }
    
    private onStateExit(state: GameState): void {
        switch (state) {
            case GameState.Playing:
                this.saveGameState();
                break;
            case GameState.Paused:
                this.resumeTimers();
                break;
        }
    }
    
    // プレイヤーの状態管理
    updatePlayerState(player: Player, newState: PlayerState): boolean {
        if (!this.canChangePlayerState(player.state, newState)) {
            return false;
        }
        
        player.state = newState;
        this.onPlayerStateChange(player, newState);
        return true;
    }
    
    private canChangePlayerState(from: PlayerState, to: PlayerState): boolean {
        // 死亡状態からは他の状態に遷移できない
        if (from === PlayerState.Dead) {
            return false;
        }
        
        // 特定の状態からの制限
        const restrictions: Record<PlayerState, PlayerState[]> = {
            [PlayerState.Attacking]: [PlayerState.Idle, PlayerState.Dead],
            [PlayerState.Jumping]: [PlayerState.Falling, PlayerState.Dead],
            [PlayerState.Falling]: [PlayerState.Idle, PlayerState.Dead]
        };
        
        if (restrictions[from]) {
            return restrictions[from].includes(to);
        }
        
        return true;
    }
    
    private onPlayerStateChange(player: Player, state: PlayerState): void {
        switch (state) {
            case PlayerState.Attacking:
                this.processAttack(player);
                break;
            case PlayerState.Dead:
                this.onPlayerDeath(player);
                break;
            case PlayerState.Jumping:
                this.applyJumpPhysics(player);
                break;
        }
    }
    
    // アイテム管理
    createWeapon(name: string, weaponType: WeaponType, damage: number, damageType: DamageType): Weapon {
        return {
            id: this.generateId(),
            name,
            type: ItemType.Weapon,
            weaponType,
            damage,
            damageType,
            value: this.calculateWeaponValue(damage, damageType),
            description: `${name}: ${damage} ${damageType} damage`
        };
    }
    
    private calculateWeaponValue(damage: number, damageType: DamageType): number {
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
    
    // 敵の生成
    spawnEnemy(type: EnemyType, position: { x: number; y: number }): Enemy {
        const stats = this.getEnemyStats(type);
        
        const enemy: Enemy = {
            id: this.generateId(),
            position,
            state: PlayerState.Idle,
            enemyType: type,
            health: stats.health,
            maxHealth: stats.health,
            damage: stats.damage,
            experience: stats.experience
        };
        
        this.enemies.push(enemy);
        return enemy;
    }
    
    private getEnemyStats(type: EnemyType): { health: number; damage: number; experience: number } {
        const stats: Record<EnemyType, { health: number; damage: number; experience: number }> = {
            [EnemyType.Goblin]: { health: 30, damage: 5, experience: 10 },
            [EnemyType.Orc]: { health: 60, damage: 12, experience: 25 },
            [EnemyType.Skeleton]: { health: 40, damage: 8, experience: 15 },
            [EnemyType.Dragon]: { health: 200, damage: 30, experience: 100 }
        };
        
        return stats[type];
    }
    
    // ダメージ計算
    calculateDamage(attacker: Player | Enemy, target: Player | Enemy, damageType: DamageType): number {
        let baseDamage = 'damage' in attacker ? attacker.damage : 10;
        
        // ダメージタイプによる補正
        const typeMultiplier = this.getDamageTypeMultiplier(damageType, target);
        
        return Math.floor(baseDamage * typeMultiplier);
    }
    
    private getDamageTypeMultiplier(damageType: DamageType, target: Player | Enemy): number {
        // 簡略化された属性相性システム
        if (target instanceof Object && 'enemyType' in target) {
            const enemy = target as Enemy;
            
            switch (enemy.enemyType) {
                case EnemyType.Dragon:
                    return damageType === DamageType.Ice ? 1.5 : 1.0;
                case EnemyType.Skeleton:
                    return damageType === DamageType.Physical ? 0.5 : 1.0;
                default:
                    return 1.0;
            }
        }
        
        return 1.0;
    }
    
    // ヘルパーメソッド（モック実装）
    private showMenu(): void { console.log("メニュー表示"); }
    private loadGame(): void { 
        console.log("ゲーム読み込み中..."); 
        setTimeout(() => this.changeState(GameState.Playing), 1000);
    }
    private startGame(): void { console.log("ゲーム開始"); }
    private pauseGame(): void { console.log("ゲーム一時停止"); }
    private showGameOver(): void { console.log("ゲームオーバー"); }
    private showVictory(): void { console.log("勝利！"); }
    private saveGameState(): void { console.log("ゲーム状態保存"); }
    private resumeTimers(): void { console.log("タイマー再開"); }
    private processAttack(player: Player): void { console.log("攻撃処理"); }
    private onPlayerDeath(player: Player): void { 
        console.log("プレイヤー死亡"); 
        this.changeState(GameState.GameOver);
    }
    private applyJumpPhysics(player: Player): void { console.log("ジャンプ物理演算"); }
    private generateId(): string { return Math.random().toString(36).substr(2, 9); }
    
    getCurrentState(): GameState {
        return this.currentState;
    }
    
    getPlayer(): Player | undefined {
        return this.player;
    }
    
    getEnemies(): Enemy[] {
        return [...this.enemies];
    }
}
```

### 例3: 設定管理システム
```typescript
// アプリケーション設定
enum Theme {
    Light = "light",
    Dark = "dark",
    Auto = "auto"
}

enum Language {
    Japanese = "ja",
    English = "en",
    Chinese = "zh",
    Korean = "ko"
}

enum NotificationLevel {
    All = "all",
    Important = "important",
    Critical = "critical",
    None = "none"
}

enum DataSyncFrequency {
    RealTime = "realtime",
    Every5Minutes = "5min",
    Every15Minutes = "15min",
    Every30Minutes = "30min",
    Hourly = "1hour",
    Manual = "manual"
}

enum PrivacyLevel {
    Public = "public",
    FriendsOnly = "friends",
    Private = "private"
}

interface AppSettings {
    theme: Theme;
    language: Language;
    notifications: {
        level: NotificationLevel;
        email: boolean;
        push: boolean;
        inApp: boolean;
    };
    sync: {
        frequency: DataSyncFrequency;
        wifiOnly: boolean;
    };
    privacy: {
        profileVisibility: PrivacyLevel;
        dataSharing: boolean;
        analytics: boolean;
    };
    advanced: {
        debugMode: boolean;
        experimentalFeatures: boolean;
    };
}

class SettingsManager {
    private settings: AppSettings;
    private readonly defaultSettings: AppSettings = {
        theme: Theme.Auto,
        language: Language.Japanese,
        notifications: {
            level: NotificationLevel.Important,
            email: true,
            push: true,
            inApp: true
        },
        sync: {
            frequency: DataSyncFrequency.Every15Minutes,
            wifiOnly: true
        },
        privacy: {
            profileVisibility: PrivacyLevel.FriendsOnly,
            dataSharing: false,
            analytics: true
        },
        advanced: {
            debugMode: false,
            experimentalFeatures: false
        }
    };
    
    constructor() {
        this.settings = this.loadSettings();
    }
    
    // 設定の取得
    getTheme(): Theme {
        return this.settings.theme;
    }
    
    getLanguage(): Language {
        return this.settings.language;
    }
    
    getNotificationLevel(): NotificationLevel {
        return this.settings.notifications.level;
    }
    
    getSyncFrequency(): DataSyncFrequency {
        return this.settings.sync.frequency;
    }
    
    // 設定の更新
    setTheme(theme: Theme): void {
        this.settings.theme = theme;
        this.saveSettings();
        this.applyTheme(theme);
    }
    
    setLanguage(language: Language): void {
        this.settings.language = language;
        this.saveSettings();
        this.loadLanguageResources(language);
    }
    
    setNotificationLevel(level: NotificationLevel): void {
        this.settings.notifications.level = level;
        this.saveSettings();
        this.updateNotificationPreferences();
    }
    
    setSyncFrequency(frequency: DataSyncFrequency): void {
        this.settings.sync.frequency = frequency;
        this.saveSettings();
        this.configureSyncSchedule();
    }
    
    // バリデーション
    validateSettings(settings: Partial<AppSettings>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (settings.theme && !Object.values(Theme).includes(settings.theme)) {
            errors.push(`無効なテーマ: ${settings.theme}`);
        }
        
        if (settings.language && !Object.values(Language).includes(settings.language)) {
            errors.push(`無効な言語: ${settings.language}`);
        }
        
        if (settings.notifications?.level && 
            !Object.values(NotificationLevel).includes(settings.notifications.level)) {
            errors.push(`無効な通知レベル: ${settings.notifications.level}`);
        }
        
        if (settings.sync?.frequency && 
            !Object.values(DataSyncFrequency).includes(settings.sync.frequency)) {
            errors.push(`無効な同期頻度: ${settings.sync.frequency}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // 設定のインポート/エクスポート
    exportSettings(): string {
        return JSON.stringify(this.settings, null, 2);
    }
    
    importSettings(settingsJson: string): boolean {
        try {
            const importedSettings = JSON.parse(settingsJson) as Partial<AppSettings>;
            const validation = this.validateSettings(importedSettings);
            
            if (!validation.isValid) {
                console.error("設定のインポートに失敗:", validation.errors);
                return false;
            }
            
            this.settings = { ...this.defaultSettings, ...importedSettings };
            this.saveSettings();
            this.applyAllSettings();
            return true;
        } catch (error) {
            console.error("設定のパースに失敗:", error);
            return false;
        }
    }
    
    // 設定のリセット
    resetToDefaults(): void {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applyAllSettings();
    }
    
    resetSection<K extends keyof AppSettings>(section: K): void {
        this.settings[section] = { ...this.defaultSettings[section] };
        this.saveSettings();
        this.applyAllSettings();
    }
    
    // 設定の適用
    private applyAllSettings(): void {
        this.applyTheme(this.settings.theme);
        this.loadLanguageResources(this.settings.language);
        this.updateNotificationPreferences();
        this.configureSyncSchedule();
    }
    
    private applyTheme(theme: Theme): void {
        switch (theme) {
            case Theme.Light:
                document.body.className = 'theme-light';
                break;
            case Theme.Dark:
                document.body.className = 'theme-dark';
                break;
            case Theme.Auto:
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.body.className = isDark ? 'theme-dark' : 'theme-light';
                break;
        }
    }
    
    private loadLanguageResources(language: Language): void {
        console.log(`言語リソースを読み込み中: ${language}`);
        // 実際の実装では、i18nライブラリを使用
    }
    
    private updateNotificationPreferences(): void {
        const level = this.settings.notifications.level;
        console.log(`通知設定を更新: ${level}`);
        
        // 通知レベルに応じた設定
        switch (level) {
            case NotificationLevel.All:
                // すべての通知を有効
                break;
            case NotificationLevel.Important:
                // 重要な通知のみ
                break;
            case NotificationLevel.Critical:
                // クリティカルな通知のみ
                break;
            case NotificationLevel.None:
                // 通知を無効
                break;
        }
    }
    
    private configureSyncSchedule(): void {
        const frequency = this.settings.sync.frequency;
        console.log(`同期スケジュールを設定: ${frequency}`);
        
        // 同期頻度に応じたスケジュール設定
        switch (frequency) {
            case DataSyncFrequency.RealTime:
                // リアルタイム同期を開始
                break;
            case DataSyncFrequency.Manual:
                // 自動同期を停止
                break;
            default:
                // 指定間隔での同期をスケジュール
                const intervals: Record<DataSyncFrequency, number> = {
                    [DataSyncFrequency.Every5Minutes]: 5 * 60 * 1000,
                    [DataSyncFrequency.Every15Minutes]: 15 * 60 * 1000,
                    [DataSyncFrequency.Every30Minutes]: 30 * 60 * 1000,
                    [DataSyncFrequency.Hourly]: 60 * 60 * 1000,
                    [DataSyncFrequency.RealTime]: 0,
                    [DataSyncFrequency.Manual]: 0
                };
                
                if (intervals[frequency] > 0) {
                    console.log(`${intervals[frequency]}ms間隔で同期を設定`);
                }
                break;
        }
    }
    
    // ストレージ操作
    private loadSettings(): AppSettings {
        try {
            const stored = localStorage.getItem('app-settings');
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<AppSettings>;
                return { ...this.defaultSettings, ...parsed };
            }
        } catch (error) {
            console.error("設定の読み込みに失敗:", error);
        }
        
        return { ...this.defaultSettings };
    }
    
    private saveSettings(): void {
        try {
            localStorage.setItem('app-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error("設定の保存に失敗:", error);
        }
    }
    
    // 設定情報の取得
    getSettings(): AppSettings {
        return { ...this.settings };
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
    
    getAvailableSyncFrequencies(): DataSyncFrequency[] {
        return Object.values(DataSyncFrequency);
    }
    
    // 設定の説明文を取得
    getThemeDescription(theme: Theme): string {
        const descriptions: Record<Theme, string> = {
            [Theme.Light]: "明るいテーマ",
            [Theme.Dark]: "暗いテーマ", 
            [Theme.Auto]: "システム設定に従う"
        };
        
        return descriptions[theme];
    }
    
    getNotificationLevelDescription(level: NotificationLevel): string {
        const descriptions: Record<NotificationLevel, string> = {
            [NotificationLevel.All]: "すべての通知を受信",
            [NotificationLevel.Important]: "重要な通知のみ受信",
            [NotificationLevel.Critical]: "緊急の通知のみ受信",
            [NotificationLevel.None]: "通知を受信しない"
        };
        
        return descriptions[level];
    }
    
    getSyncFrequencyDescription(frequency: DataSyncFrequency): string {
        const descriptions: Record<DataSyncFrequency, string> = {
            [DataSyncFrequency.RealTime]: "リアルタイム同期",
            [DataSyncFrequency.Every5Minutes]: "5分ごと",
            [DataSyncFrequency.Every15Minutes]: "15分ごと",
            [DataSyncFrequency.Every30Minutes]: "30分ごと",
            [DataSyncFrequency.Hourly]: "1時間ごと",
            [DataSyncFrequency.Manual]: "手動同期のみ"
        };
        
        return descriptions[frequency];
    }
}
```

## よくある落とし穴と対処法

### 1. enumと文字列の混用
```typescript
enum Status {
    Active = "active",
    Inactive = "inactive"
}

// 危険: 文字列リテラルとenumの混用
function badCheck(status: Status): boolean {
    return status === "active"; // エラー: string は Status と比較できない
}

// 安全: enumを使用
function goodCheck(status: Status): boolean {
    return status === Status.Active;
}

// または、型ガードを使用
function isActive(status: Status): status is Status.Active {
    return status === Status.Active;
}
```

### 2. 数値enumのリバースマッピングの誤解
```typescript
enum Size {
    Small = 1,
    Medium,  // 2
    Large    // 3
}

// 注意: 数値enumはリバースマッピングを持つ
console.log(Size[1]);     // "Small"
console.log(Size["1"]);   // "Small"

// 意図しない値が混入する可能性
function processSize(size: Size): void {
    console.log(`Processing size: ${size}`);
}

processSize(Size.Small);  // OK: "Processing size: 1"
processSize(1 as Size);   // 危険だが動作する: "Processing size: 1"
processSize(999 as Size); // 危険: "Processing size: 999"

// より安全なアプローチ: 文字列enumまたはValidation
enum SafeSize {
    Small = "small",
    Medium = "medium",
    Large = "large"
}

function isValidSize(value: unknown): value is SafeSize {
    return Object.values(SafeSize).includes(value as SafeSize);
}
```

### 3. const enumの制限
```typescript
const enum ConstEnum {
    A = "a",
    B = "b"
}

// OK: 直接参照
let value = ConstEnum.A;

// エラー: const enumは実行時にオブジェクトとして存在しない
// console.log(Object.keys(ConstEnum)); // エラー
// console.log(ConstEnum["A"]);         // エラー

// 通常のenumを使用する必要がある場合
enum RegularEnum {
    A = "a",
    B = "b"
}

function getAllKeys<T extends Record<string, string>>(enumObject: T): (keyof T)[] {
    return Object.keys(enumObject) as (keyof T)[];
}

const keys = getAllKeys(RegularEnum); // OK
// const constKeys = getAllKeys(ConstEnum); // エラー
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `getStatusColor(status: TaskStatus): string` - タスクステータスに対応する色を返す
2. `isValidTransition(from: TaskStatus, to: TaskStatus): boolean` - 状態遷移が有効かチェック
3. `getPriorityLevel(priority: Priority): number` - 優先度の数値レベルを取得
4. `getNextWorkday(day: Weekday): Weekday` - 次の平日を取得
5. `calculatePermissions(access: FileAccess[]): FileAccess` - アクセス権限の組み合わせを計算

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-09
```

## 次のレッスン
[Lesson 10: any型とunknown型](../lesson-10/README.md)では、型安全性の観点から重要なany型とunknown型について学習します。