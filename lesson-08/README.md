# Lesson 08: タプル型

## 学習目標
- TypeScriptのタプル型の基本概念を理解する
- 固定長配列と可変長配列の違いを学ぶ
- Rest要素やOptional要素を使ったタプル型の活用方法を身につける
- 実用的なタプル型の使用パターンを理解する

## 概要
タプル型は、固定された長さと各位置の型が決まっている配列の特殊な形です。通常の配列とは異なり、各要素の型と位置が厳密に定義されているため、より型安全なプログラムを作成できます。

## 主な内容

### 1. タプル型の基本
```typescript
// 基本的なタプル型の宣言
let userInfo: [string, number, boolean] = ["田中太郎", 30, true];

// 各要素へのアクセス
let name: string = userInfo[0];     // "田中太郎"
let age: number = userInfo[1];      // 30
let isActive: boolean = userInfo[2]; // true

// 分割代入（Destructuring）
let [userName, userAge, userActive] = userInfo;

// 配列との違い
let flexibleArray: (string | number | boolean)[] = ["太郎", 30, true, "追加要素"];
let fixedTuple: [string, number, boolean] = ["太郎", 30, true];
// fixedTuple.push("追加"); // エラー: タプルは固定長

// タプル型の型推論
let coordinates = [10, 20] as const; // readonly [10, 20] として推論される
let point: [number, number] = [10, 20]; // 明示的なタプル型
```

### 2. 様々なタプル型のパターン
```typescript
// 異なる型の組み合わせ
type UserRecord = [number, string, string, Date]; // ID, 名前, メール, 登録日
let user: UserRecord = [1, "田中太郎", "tanaka@example.com", new Date()];

// ネストしたタプル型
type Coordinate2D = [number, number];
type Coordinate3D = [number, number, number];
type BoundingBox = [Coordinate2D, Coordinate2D]; // 左上と右下の座標

let box: BoundingBox = [[0, 0], [100, 50]];

// Union型を含むタプル
type Result = [boolean, string | null]; // 成功フラグとエラーメッセージ
let success: Result = [true, null];
let failure: Result = [false, "エラーが発生しました"];

// オブジェクトを含むタプル
interface User {
    id: number;
    name: string;
}

type UserWithMetadata = [User, Date, string]; // ユーザー、作成日、作成者
let userRecord: UserWithMetadata = [
    { id: 1, name: "田中太郎" },
    new Date(),
    "system"
];
```

### 3. Optional要素（オプション要素）
```typescript
// Optional要素を含むタプル（末尾のみ）
type DatabaseConnection = [string, number, string?, string?]; // ホスト、ポート、ユーザー名（オプション）、パスワード（オプション）

let connection1: DatabaseConnection = ["localhost", 5432];
let connection2: DatabaseConnection = ["localhost", 5432, "admin"];
let connection3: DatabaseConnection = ["localhost", 5432, "admin", "password"];

// 関数の戻り値でのOptional要素の活用
function parseCoordinate(input: string): [number, number, number?] {
    const parts = input.split(',').map(Number);
    
    if (parts.length === 2) {
        return [parts[0], parts[1]]; // 2D座標
    } else if (parts.length === 3) {
        return [parts[0], parts[1], parts[2]]; // 3D座標
    } else {
        throw new Error("不正な座標形式");
    }
}

// Optional要素を使った設定パターン
type ApiConfig = [string, number, boolean?]; // URL, タイムアウト, SSL有効フラグ（デフォルト: true）

function createApiClient(config: ApiConfig): void {
    const [url, timeout, ssl = true] = config;
    console.log(`接続先: ${url}, タイムアウト: ${timeout}ms, SSL: ${ssl ? '有効' : '無効'}`);
}

createApiClient(["https://api.example.com", 5000]);
createApiClient(["http://api.example.com", 3000, false]);
```

### 4. Rest要素（残余要素）
```typescript
// Rest要素を使ったタプル
type CommandWithArgs = [string, ...string[]]; // コマンド名 + 可変個数の引数

let gitCommand: CommandWithArgs = ["git", "commit", "-m", "Initial commit"];
let npmCommand: CommandWithArgs = ["npm", "install", "typescript", "--save-dev"];

// ヘッダーとデータを分離
type DataWithHeader<T> = [string, ...T[]]; // ヘッダー + データ配列

let csvData: DataWithHeader<number> = ["売上データ", 100, 200, 150, 300, 250];
let userList: DataWithHeader<string> = ["ユーザー一覧", "田中", "佐藤", "鈴木"];

// 最初と最後の要素が決まっているパターン
type FramedData<T> = [string, ...T[], string]; // 開始マーカー、データ、終了マーカー

let framedNumbers: FramedData<number> = ["START", 1, 2, 3, 4, 5, "END"];
let framedMessages: FramedData<string> = ["BEGIN", "Hello", "World", "FINISH"];

// 複数のRest要素は不可
// type Invalid = [string, ...number[], ...string[]]; // エラー: Rest要素は最後に1つだけ
```

### 5. readonly タプル
```typescript
// 読み取り専用タプル
type ReadonlyPoint = readonly [number, number];
let point: ReadonlyPoint = [10, 20];

// point[0] = 30; // エラー: readonly

// const assertionでの推論
let coordinates = [10, 20] as const; // readonly [10, 20]
let mutableCoordinates: [number, number] = [10, 20]; // 変更可能

// 関数での読み取り専用タプルの使用
function calculateDistance(point1: readonly [number, number], point2: readonly [number, number]): number {
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    return Math.sqrt(dx * dx + dy * dy);
}

// 読み取り専用タプルの型ガード
function isValidCoordinate(value: unknown): value is readonly [number, number] {
    return Array.isArray(value) && 
           value.length === 2 && 
           typeof value[0] === 'number' && 
           typeof value[1] === 'number';
}
```

### 6. ラベル付きタプル
```typescript
// ラベル付きタプル（TypeScript 4.0+）
type NamedPoint = [x: number, y: number];
type UserInfo = [id: number, name: string, email: string, isActive: boolean];

// ラベルは型安全性には影響しないが、可読性が向上
function createPoint(coords: NamedPoint): string {
    const [x, y] = coords;
    return `座標: (${x}, ${y})`;
}

// 関数のパラメータでのラベル付きタプル
type DatabaseQuery = [
    table: string,
    columns: string[],
    conditions?: Record<string, any>,
    limit?: number
];

function buildQuery(params: DatabaseQuery): string {
    const [table, columns, conditions = {}, limit] = params;
    
    let query = `SELECT ${columns.join(', ')} FROM ${table}`;
    
    const whereConditions = Object.entries(conditions)
        .map(([key, value]) => `${key} = '${value}'`);
    
    if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    if (limit) {
        query += ` LIMIT ${limit}`;
    }
    
    return query;
}
```

### 7. タプルの高度な操作
```typescript
// タプルの型操作
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R] ? R : never;
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;

// 使用例
type SampleTuple = [string, number, boolean];
type FirstElement = Head<SampleTuple>; // string
type RestElements = Tail<SampleTuple>;  // [number, boolean]
type LastElement = Last<SampleTuple>;   // boolean

// タプルの長さを取得
type Length<T extends readonly unknown[]> = T['length'];
type SampleLength = Length<SampleTuple>; // 3

// タプルのインデックスアクセス
function getElementAt<T extends readonly unknown[], K extends keyof T>(
    tuple: T, 
    index: K
): T[K] {
    return tuple[index];
}

const sample: [string, number, boolean] = ["hello", 42, true];
const first = getElementAt(sample, 0);  // string
const second = getElementAt(sample, 1); // number
const third = getElementAt(sample, 2);  // boolean
```

## 実践的な使用例

### 例1: 座標計算システム
```typescript
type Point2D = [x: number, y: number];
type Point3D = [x: number, y: number, z: number];
type Vector2D = [dx: number, dy: number];
type Vector3D = [dx: number, dy: number, dz: number];

type BoundingBox2D = [topLeft: Point2D, bottomRight: Point2D];
type BoundingBox3D = [min: Point3D, max: Point3D];

class GeometryUtils {
    // 2D座標の操作
    static addPoints2D(p1: Point2D, p2: Point2D): Point2D {
        return [p1[0] + p2[0], p1[1] + p2[1]];
    }
    
    static subtractPoints2D(p1: Point2D, p2: Point2D): Vector2D {
        return [p1[0] - p2[0], p1[1] - p2[1]];
    }
    
    static distance2D(p1: Point2D, p2: Point2D): number {
        const [dx, dy] = this.subtractPoints2D(p1, p2);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static movePoint2D(point: Point2D, vector: Vector2D): Point2D {
        return [point[0] + vector[0], point[1] + vector[1]];
    }
    
    // 3D座標の操作
    static addPoints3D(p1: Point3D, p2: Point3D): Point3D {
        return [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
    }
    
    static distance3D(p1: Point3D, p2: Point3D): number {
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        const dz = p1[2] - p2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // バウンディングボックスの操作
    static isPointInBounds2D(point: Point2D, bounds: BoundingBox2D): boolean {
        const [x, y] = point;
        const [[minX, minY], [maxX, maxY]] = bounds;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }
    
    static expandBounds2D(bounds: BoundingBox2D, margin: number): BoundingBox2D {
        const [[minX, minY], [maxX, maxY]] = bounds;
        return [
            [minX - margin, minY - margin],
            [maxX + margin, maxY + margin]
        ];
    }
    
    // 座標変換
    static rotate2D(point: Point2D, angle: number, origin: Point2D = [0, 0]): Point2D {
        const [px, py] = point;
        const [ox, oy] = origin;
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const x = (px - ox) * cos - (py - oy) * sin + ox;
        const y = (px - ox) * sin + (py - oy) * cos + oy;
        
        return [x, y];
    }
    
    static scale2D(point: Point2D, factor: number, origin: Point2D = [0, 0]): Point2D {
        const [px, py] = point;
        const [ox, oy] = origin;
        
        return [
            (px - ox) * factor + ox,
            (py - oy) * factor + oy
        ];
    }
}
```

### 例2: データベース結果の型安全な処理
```typescript
// データベース行の型定義（タプル型）
type UserRow = [id: number, name: string, email: string, createdAt: Date, isActive: boolean];
type ProductRow = [id: number, name: string, price: number, categoryId: number, stock: number];
type OrderRow = [id: number, userId: number, productId: number, quantity: number, orderDate: Date];

// ジョイン結果の型定義
type UserWithOrderRow = [
    // User fields
    userId: number, userName: string, userEmail: string,
    // Order fields
    orderId: number, quantity: number, orderDate: Date,
    // Product fields
    productId: number, productName: string, price: number
];

class DatabaseRowProcessor {
    // 行データをオブジェクトに変換
    static userRowToObject(row: UserRow): {
        id: number;
        name: string;
        email: string;
        createdAt: Date;
        isActive: boolean;
    } {
        const [id, name, email, createdAt, isActive] = row;
        return { id, name, email, createdAt, isActive };
    }
    
    static productRowToObject(row: ProductRow): {
        id: number;
        name: string;
        price: number;
        categoryId: number;
        stock: number;
    } {
        const [id, name, price, categoryId, stock] = row;
        return { id, name, price, categoryId, stock };
    }
    
    // 複数行の処理
    static processUserRows(rows: UserRow[]): Array<{
        id: number;
        name: string;
        email: string;
        createdAt: Date;
        isActive: boolean;
    }> {
        return rows.map(this.userRowToObject);
    }
    
    // ジョイン結果の処理
    static processUserOrderRows(rows: UserWithOrderRow[]): Array<{
        user: { id: number; name: string; email: string };
        order: { id: number; quantity: number; orderDate: Date };
        product: { id: number; name: string; price: number };
    }> {
        return rows.map(row => {
            const [userId, userName, userEmail, orderId, quantity, orderDate, productId, productName, price] = row;
            
            return {
                user: { id: userId, name: userName, email: userEmail },
                order: { id: orderId, quantity, orderDate },
                product: { id: productId, name: productName, price }
            };
        });
    }
    
    // バッチ挿入用のデータ準備
    static prepareUserInsertData(users: Array<{
        name: string;
        email: string;
        isActive?: boolean;
    }>): Array<[string, string, boolean]> {
        return users.map(user => [
            user.name,
            user.email,
            user.isActive ?? true
        ]);
    }
    
    // CSV形式での出力
    static rowsToCSV<T extends readonly unknown[]>(rows: T[]): string {
        if (rows.length === 0) return "";
        
        return rows
            .map(row => row.map(cell => 
                typeof cell === 'string' && cell.includes(',') 
                    ? `"${cell.replace(/"/g, '""')}"` 
                    : String(cell)
            ).join(','))
            .join('\n');
    }
}
```

### 例3: API レスポンスとエラーハンドリング
```typescript
// API レスポンスの型定義（Result パターン）
type ApiResult<T> = [success: true, data: T] | [success: false, error: string];
type ApiResultWithMeta<T> = [success: true, data: T, metadata: { timestamp: Date; requestId: string }] 
                          | [success: false, error: string, metadata: { timestamp: Date; requestId: string }];

// 非同期操作の結果型
type AsyncOperation<T> = [status: 'pending' | 'completed' | 'failed', result?: T, error?: string];

// バリデーション結果型
type ValidationResult = [isValid: true] | [isValid: false, errors: string[]];

class ApiService {
    // ユーザー取得API
    static async fetchUser(id: number): Promise<ApiResult<{
        id: number;
        name: string;
        email: string;
    }>> {
        try {
            // 模擬API呼び出し
            if (id <= 0) {
                return [false, "無効なユーザーIDです"];
            }
            
            const userData = {
                id,
                name: "田中太郎",
                email: "tanaka@example.com"
            };
            
            return [true, userData];
        } catch (error) {
            return [false, `API呼び出しエラー: ${error}`];
        }
    }
    
    // 複数ユーザー取得（メタデータ付き）
    static async fetchUsers(): Promise<ApiResultWithMeta<Array<{
        id: number;
        name: string;
        email: string;
    }>>> {
        const requestId = `req_${Date.now()}`;
        const timestamp = new Date();
        
        try {
            const users = [
                { id: 1, name: "田中太郎", email: "tanaka@example.com" },
                { id: 2, name: "佐藤花子", email: "sato@example.com" }
            ];
            
            return [true, users, { timestamp, requestId }];
        } catch (error) {
            return [false, `API呼び出しエラー: ${error}`, { timestamp, requestId }];
        }
    }
    
    // バリデーション付きユーザー作成
    static async createUser(userData: {
        name: string;
        email: string;
    }): Promise<ApiResult<{ id: number; name: string; email: string }>> {
        // バリデーション
        const validation = this.validateUserData(userData);
        if (!validation[0]) {
            return [false, `バリデーションエラー: ${validation[1].join(', ')}`];
        }
        
        try {
            // 模擬ユーザー作成
            const newUser = {
                id: Math.floor(Math.random() * 1000),
                ...userData
            };
            
            return [true, newUser];
        } catch (error) {
            return [false, `ユーザー作成エラー: ${error}`];
        }
    }
    
    // データバリデーション
    private static validateUserData(data: {
        name: string;
        email: string;
    }): ValidationResult {
        const errors: string[] = [];
        
        if (!data.name || data.name.trim().length === 0) {
            errors.push("名前は必須です");
        }
        
        if (!data.email || !data.email.includes('@')) {
            errors.push("有効なメールアドレスを入力してください");
        }
        
        return errors.length === 0 ? [true] : [false, errors];
    }
    
    // 結果の処理ヘルパー
    static handleApiResult<T>(
        result: ApiResult<T>,
        onSuccess: (data: T) => void,
        onError: (error: string) => void
    ): void {
        const [success, dataOrError] = result;
        
        if (success) {
            onSuccess(dataOrError);
        } else {
            onError(dataOrError);
        }
    }
}

// 使用例クラス
class ApiUsageExample {
    static async demonstrateApiUsage(): Promise<void> {
        console.log("=== API使用例 ===");
        
        // 単一ユーザー取得
        const userResult = await ApiService.fetchUser(1);
        ApiService.handleApiResult(
            userResult,
            (user) => console.log("ユーザー取得成功:", user),
            (error) => console.error("エラー:", error)
        );
        
        // 複数ユーザー取得（メタデータ付き）
        const usersResult = await ApiService.fetchUsers();
        if (usersResult[0]) {
            const [, users, metadata] = usersResult;
            console.log("ユーザー一覧:", users.length, "件");
            console.log("リクエストID:", metadata.requestId);
        } else {
            const [, error, metadata] = usersResult;
            console.error("エラー:", error);
        }
        
        // ユーザー作成
        const createResult = await ApiService.createUser({
            name: "新規ユーザー",
            email: "newuser@example.com"
        });
        
        if (createResult[0]) {
            console.log("ユーザー作成成功:", createResult[1]);
        } else {
            console.error("作成失敗:", createResult[1]);
        }
        
        // バリデーションエラーのケース
        const invalidCreateResult = await ApiService.createUser({
            name: "",
            email: "invalid-email"
        });
        
        if (!invalidCreateResult[0]) {
            console.error("バリデーションエラー:", invalidCreateResult[1]);
        }
    }
}
```

### 例4: ファイル処理とパース
```typescript
// ファイル形式の定義
type CSVRow = [string, ...string[]]; // 最初の列 + 残りの列
type TSVRow = [string, ...string[]]; // タブ区切り
type FixedWidthRecord<T extends readonly number[]> = {
    readonly [K in keyof T]: string;
} & { length: T['length'] };

// ログエントリの型
type LogEntry = [
    timestamp: Date,
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    message: string,
    context?: Record<string, unknown>
];

// パース結果の型
type ParseResult<T> = [success: true, data: T[]] | [success: false, error: string, lineNumber?: number];

class FileParser {
    // CSV形式のパース
    static parseCSV(content: string): ParseResult<CSVRow> {
        try {
            const lines = content.trim().split('\n');
            const rows: CSVRow[] = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim() === '') continue;
                
                // 簡単なCSVパース（実際の実装ではより複雑な処理が必要）
                const cells = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
                
                if (cells.length === 0) {
                    return [false, "空の行があります", i + 1];
                }
                
                rows.push([cells[0], ...cells.slice(1)]);
            }
            
            return [true, rows];
        } catch (error) {
            return [false, `CSVパースエラー: ${error}`];
        }
    }
    
    // ログファイルのパース
    static parseLogFile(content: string): ParseResult<LogEntry> {
        try {
            const lines = content.trim().split('\n');
            const entries: LogEntry[] = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim() === '') continue;
                
                // ログ形式: "2023-12-01T10:00:00.000Z [INFO] メッセージ {context}"
                const match = line.match(/^(\S+)\s+\[(\w+)\]\s+([^{]+)(\{.*\})?$/);
                
                if (!match) {
                    return [false, "無効なログ形式です", i + 1];
                }
                
                const [, timestampStr, level, message, contextStr] = match;
                
                try {
                    const timestamp = new Date(timestampStr);
                    if (isNaN(timestamp.getTime())) {
                        return [false, "無効なタイムスタンプです", i + 1];
                    }
                    
                    const logLevel = level as LogEntry[1];
                    if (!['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(logLevel)) {
                        return [false, "無効なログレベルです", i + 1];
                    }
                    
                    let context: Record<string, unknown> | undefined;
                    if (contextStr) {
                        try {
                            context = JSON.parse(contextStr);
                        } catch {
                            return [false, "無効なコンテキストJSONです", i + 1];
                        }
                    }
                    
                    entries.push([timestamp, logLevel, message.trim(), context]);
                } catch (error) {
                    return [false, `ログエントリのパースエラー: ${error}`, i + 1];
                }
            }
            
            return [true, entries];
        } catch (error) {
            return [false, `ログファイルパースエラー: ${error}`];
        }
    }
    
    // 構造化データの変換
    static logEntriesToObjects(entries: LogEntry[]): Array<{
        timestamp: Date;
        level: string;
        message: string;
        context?: Record<string, unknown>;
    }> {
        return entries.map(entry => {
            const [timestamp, level, message, context] = entry;
            return { timestamp, level, message, context };
        });
    }
    
    // フィルタリング
    static filterLogsByLevel(
        entries: LogEntry[], 
        level: LogEntry[1]
    ): LogEntry[] {
        return entries.filter(entry => entry[1] === level);
    }
    
    static filterLogsByTimeRange(
        entries: LogEntry[],
        startTime: Date,
        endTime: Date
    ): LogEntry[] {
        return entries.filter(entry => {
            const timestamp = entry[0];
            return timestamp >= startTime && timestamp <= endTime;
        });
    }
    
    // 統計情報
    static getLogStatistics(entries: LogEntry[]): {
        total: number;
        byLevel: Record<string, number>;
        timeRange: [Date, Date] | null;
    } {
        if (entries.length === 0) {
            return {
                total: 0,
                byLevel: {},
                timeRange: null
            };
        }
        
        const byLevel = entries.reduce((acc, entry) => {
            const level = entry[1];
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const timestamps = entries.map(entry => entry[0]);
        const minTime = new Date(Math.min(...timestamps.map(t => t.getTime())));
        const maxTime = new Date(Math.max(...timestamps.map(t => t.getTime())));
        
        return {
            total: entries.length,
            byLevel,
            timeRange: [minTime, maxTime]
        };
    }
}
```

## よくある落とし穴と対処法

### 1. タプル型と配列型の混同
```typescript
// 危険: 配列として扱ってしまう
function badProcessing(point: [number, number]): void {
    point.push(30); // エラー: タプルは固定長
    // point.forEach(value => console.log(value)); // 型安全でない
}

// 安全: タプルとして適切に扱う
function goodProcessing(point: [number, number]): void {
    const [x, y] = point; // 分割代入を使用
    console.log(`座標: (${x}, ${y})`);
    
    // 配列メソッドが必要な場合は明示的にキャスト
    const asArray = point as number[];
    asArray.forEach(value => console.log(value));
}
```

### 2. Optional要素の誤解
```typescript
// 危険: Optional要素の位置を間違える
// type Invalid = [string, number?, boolean]; // エラー: Optional要素は末尾のみ

// 正しい: Optional要素は末尾から
type Valid = [string, number, boolean?];
type AlsoValid = [string, number?, boolean?];

// Optional要素の安全な使用
function handleOptionalTuple(data: [string, number?]): void {
    const [name, age] = data;
    
    if (age !== undefined) {
        console.log(`${name} は ${age} 歳です`);
    } else {
        console.log(`${name} の年齢は不明です`);
    }
}
```

### 3. Rest要素の制限
```typescript
// 危険: Rest要素の誤った使用
// type Invalid1 = [...string[], number]; // エラー: Rest要素は末尾のみ
// type Invalid2 = [string, ...number[], ...boolean[]]; // エラー: Rest要素は1つのみ

// 正しい: Rest要素は末尾に1つだけ
type ValidRest = [string, ...number[]];
type AlsoValidRest = [string, number, ...boolean[]];

// Rest要素の安全な使用
function processCommand(command: [string, ...string[]]): void {
    const [cmd, ...args] = command;
    console.log(`コマンド: ${cmd}`);
    console.log(`引数: ${args.join(', ')}`);
}
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `swapTuple<T, U>(tuple: [T, U]): [U, T]` - タプルの要素を入れ替え
2. `addThree(point: [number, number]): [number, number, number]` - 2D座標に0のZ座標を追加
3. `parseNameAge(input: string): [string, number] | null` - "名前,年齢"形式の文字列をパース
4. `zipArrays<T, U>(arr1: T[], arr2: U[]): [T, U][]` - 2つの配列をタプル配列に変換
5. `getFirstLast<T>(array: T[]): [T, T] | null` - 配列の最初と最後の要素をタプルで取得

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-08
```

## 次のレッスン
[Lesson 09: enum型](../lesson-09/README.md)では、名前付き定数のセットを定義するenum型について学習します。