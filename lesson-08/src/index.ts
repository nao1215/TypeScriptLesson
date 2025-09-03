// 基本的なタプル型の定義と使用例
type UserRecord = [number, string, string, Date];
type Coordinate2D = [number, number];
type Coordinate3D = [number, number, number];
type BoundingBox = [Coordinate2D, Coordinate2D];

// Optional要素を含むタプル
type DatabaseConnection = [string, number, string?, string?];
type ApiConfig = [string, number, boolean?];

// Rest要素を含むタプル
type CommandWithArgs = [string, ...string[]];
type DataWithHeader<T> = [string, ...T[]];

// 座標計算システム
export class GeometryUtils {
    static addPoints2D(p1: Coordinate2D, p2: Coordinate2D): Coordinate2D {
        return [p1[0] + p2[0], p1[1] + p2[1]];
    }
    
    static subtractPoints2D(p1: Coordinate2D, p2: Coordinate2D): [number, number] {
        return [p1[0] - p2[0], p1[1] - p2[1]];
    }
    
    static distance2D(p1: Coordinate2D, p2: Coordinate2D): number {
        const [dx, dy] = this.subtractPoints2D(p1, p2);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static movePoint2D(point: Coordinate2D, vector: [number, number]): Coordinate2D {
        return [point[0] + vector[0], point[1] + vector[1]];
    }
    
    static distance3D(p1: Coordinate3D, p2: Coordinate3D): number {
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        const dz = p1[2] - p2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    static isPointInBounds2D(point: Coordinate2D, bounds: BoundingBox): boolean {
        const [x, y] = point;
        const [[minX, minY], [maxX, maxY]] = bounds;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }
    
    static expandBounds2D(bounds: BoundingBox, margin: number): BoundingBox {
        const [[minX, minY], [maxX, maxY]] = bounds;
        return [
            [minX - margin, minY - margin],
            [maxX + margin, maxY + margin]
        ];
    }
    
    static rotate2D(point: Coordinate2D, angle: number, origin: Coordinate2D = [0, 0]): Coordinate2D {
        const [px, py] = point;
        const [ox, oy] = origin;
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const x = (px - ox) * cos - (py - oy) * sin + ox;
        const y = (px - ox) * sin + (py - oy) * cos + oy;
        
        return [x, y];
    }
}

// API結果処理
type ApiResult<T> = [success: true, data: T] | [success: false, error: string];
type ApiResultWithMeta<T> = [success: true, data: T, metadata: { timestamp: Date; requestId: string }] 
                          | [success: false, error: string, metadata: { timestamp: Date; requestId: string }];
type ValidationResult = [isValid: true] | [isValid: false, errors: string[]];

export class ApiService {
    static async fetchUser(id: number): Promise<ApiResult<{
        id: number;
        name: string;
        email: string;
    }>> {
        try {
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
    
    static async createUser(userData: {
        name: string;
        email: string;
    }): Promise<ApiResult<{ id: number; name: string; email: string }>> {
        const validation = this.validateUserData(userData);
        if (!validation[0]) {
            return [false, `バリデーションエラー: ${validation[1].join(', ')}`];
        }
        
        try {
            const newUser = {
                id: Math.floor(Math.random() * 1000),
                ...userData
            };
            
            return [true, newUser];
        } catch (error) {
            return [false, `ユーザー作成エラー: ${error}`];
        }
    }
    
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

// ファイル処理とパース
type CSVRow = [string, ...string[]];
type LogEntry = [
    timestamp: Date,
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    message: string,
    context?: Record<string, unknown>
];
type ParseResult<T> = [success: true, data: T[]] | [success: false, error: string, lineNumber?: number];

export class FileParser {
    static parseCSV(content: string): ParseResult<CSVRow> {
        try {
            const lines = content.trim().split('\n');
            const rows: CSVRow[] = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim() === '') continue;
                
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
    
    static parseLogFile(content: string): ParseResult<LogEntry> {
        try {
            const lines = content.trim().split('\n');
            const entries: LogEntry[] = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim() === '') continue;
                
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
    
    static filterLogsByLevel(entries: LogEntry[], level: LogEntry[1]): LogEntry[] {
        return entries.filter(entry => entry[1] === level);
    }
    
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

// ユーティリティ関数
export function createApiClient(config: ApiConfig): void {
    const [url, timeout, ssl = true] = config;
    console.log(`接続先: ${url}, タイムアウト: ${timeout}ms, SSL: ${ssl ? '有効' : '無効'}`);
}

export function processCommand(command: CommandWithArgs): void {
    const [cmd, ...args] = command;
    console.log(`コマンド: ${cmd}, 引数: [${args.join(', ')}]`);
}

export function formatDataWithHeader<T>(data: DataWithHeader<T>): string {
    const [header, ...values] = data;
    return `${header}: [${values.join(', ')}]`;
}

function main() {
    console.log("=== Lesson 08: タプル型の例 ===\n");

    console.log("1. 座標計算の例");
    const point1: Coordinate2D = [10, 20];
    const point2: Coordinate2D = [30, 40];
    
    console.log("座標1:", point1);
    console.log("座標2:", point2);
    console.log("距離:", GeometryUtils.distance2D(point1, point2).toFixed(2));
    
    const sum = GeometryUtils.addPoints2D(point1, point2);
    console.log("座標の和:", sum);
    
    const bounds: BoundingBox = [[0, 0], [100, 100]];
    console.log("座標1は範囲内:", GeometryUtils.isPointInBounds2D(point1, bounds));
    
    const rotated = GeometryUtils.rotate2D(point1, Math.PI / 4); // 45度回転
    console.log("45度回転後:", rotated.map(v => v.toFixed(2)));
    console.log();

    console.log("2. API結果処理の例");
    ApiService.fetchUser(1).then(result => {
        ApiService.handleApiResult(
            result,
            (user) => console.log("ユーザー取得成功:", user.name),
            (error) => console.error("エラー:", error)
        );
    });
    
    ApiService.fetchUsers().then(result => {
        if (result[0]) {
            const [, users, metadata] = result;
            console.log(`${users.length}人のユーザーを取得 (リクエストID: ${metadata.requestId})`);
        }
    });
    console.log();

    console.log("3. 設定とコマンドの例");
    createApiClient(["https://api.example.com", 5000]);
    createApiClient(["http://api.example.com", 3000, false]);
    
    processCommand(["git", "commit", "-m", "Initial commit"]);
    processCommand(["npm", "install", "typescript", "--save-dev"]);
    console.log();

    console.log("4. データヘッダーの例");
    const salesData: DataWithHeader<number> = ["月次売上", 100, 200, 150, 300, 250];
    const userList: DataWithHeader<string> = ["アクティブユーザー", "田中", "佐藤", "鈴木"];
    
    console.log(formatDataWithHeader(salesData));
    console.log(formatDataWithHeader(userList));
    console.log();

    console.log("5. CSVパースの例");
    const csvContent = `name,age,city
田中太郎,30,東京
佐藤花子,25,大阪
鈴木一郎,35,名古屋`;
    
    const csvResult = FileParser.parseCSV(csvContent);
    if (csvResult[0]) {
        console.log("CSV解析成功:");
        csvResult[1].forEach(row => {
            const [first, ...rest] = row;
            console.log(`  ${first}: [${rest.join(', ')}]`);
        });
    }
    console.log();

    console.log("6. ログパースの例");
    const logContent = `2023-12-01T10:00:00.000Z [INFO] アプリケーション開始
2023-12-01T10:01:00.000Z [WARN] 設定ファイルが見つかりません
2023-12-01T10:02:00.000Z [ERROR] データベース接続エラー {"code": 500}`;
    
    const logResult = FileParser.parseLogFile(logContent);
    if (logResult[0]) {
        console.log("ログ解析成功:");
        const stats = FileParser.getLogStatistics(logResult[1]);
        console.log(`  総件数: ${stats.total}件`);
        console.log(`  レベル別:`, stats.byLevel);
        
        const errorLogs = FileParser.filterLogsByLevel(logResult[1], 'ERROR');
        console.log(`  エラーログ: ${errorLogs.length}件`);
    }
}

if (require.main === module) {
    main();
}