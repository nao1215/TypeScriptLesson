/**
 * Lesson 01: より実践的なTypeScriptプログラム例
 * 
 * 実際の開発でよく遭遇する複合的な処理の実装例です。
 */

// ===== ログ処理システム =====

// ログレベルの定義
type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

// ログエントリの型定義
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    module: string;
    userId?: number;
    requestId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * ログフォーマット関数
 */
function formatLogEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const userInfo = entry.userId ? ` [User:${entry.userId}]` : "";
    const requestInfo = entry.requestId ? ` [Req:${entry.requestId}]` : "";
    return `[${timestamp}] ${entry.level} [${entry.module}]${userInfo}${requestInfo}: ${entry.message}`;
}

/**
 * ログレベル別フィルタリング
 */
function filterLogsByLevel(logs: LogEntry[], minLevel: LogLevel): LogEntry[] {
    const levelPriority: Record<LogLevel, number> = {
        "DEBUG": 1,
        "INFO": 2,
        "WARN": 3,
        "ERROR": 4,
        "FATAL": 5
    };
    
    const minPriority = levelPriority[minLevel];
    return logs.filter(log => levelPriority[log.level] >= minPriority);
}

// サンプルログデータ
const systemLogs: LogEntry[] = [
    {
        timestamp: "2024-01-20T10:30:15.123Z",
        level: "INFO",
        message: "システムが正常に起動しました",
        module: "app.server"
    },
    {
        timestamp: "2024-01-20T10:30:25.456Z",
        level: "DEBUG",
        message: "データベース接続が確立されました",
        module: "database.connection",
        metadata: { connectionString: "postgresql://localhost:5432/mydb" }
    },
    {
        timestamp: "2024-01-20T10:31:02.789Z",
        level: "INFO",
        message: "ユーザーがログインしました",
        module: "auth.service",
        userId: 12345,
        requestId: "req-001-abc"
    },
    {
        timestamp: "2024-01-20T10:35:18.234Z",
        level: "WARN",
        message: "APIレート制限に近づいています",
        module: "api.ratelimit",
        userId: 12345,
        requestId: "req-002-def",
        metadata: { currentRequests: 95, limit: 100 }
    },
    {
        timestamp: "2024-01-20T10:40:33.567Z",
        level: "ERROR",
        message: "支払い処理でエラーが発生しました",
        module: "payment.processor",
        userId: 67890,
        requestId: "req-003-ghi",
        metadata: { orderId: "ORD-20240120-001", amount: 15800, error: "CARD_DECLINED" }
    }
];

console.log("=== ログ処理システム ===");
console.log(`総ログ数: ${systemLogs.length}`);

// 全ログの出力
console.log("\n全ログエントリ:");
systemLogs.forEach(log => {
    console.log(formatLogEntry(log));
});

// ERROR以上のログのみ抽出
const errorLogs = filterLogsByLevel(systemLogs, "ERROR");
console.log(`\nERROR以上のログ (${errorLogs.length}件):`);
errorLogs.forEach(log => {
    console.log(formatLogEntry(log));
});

// ===== データ変換・集計システム =====

// APIレスポンスの型定義
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: string;
    metadata: {
        page?: number;
        limit?: number;
        total?: number;
        processedAt: string;
    };
}

// ユーザーデータの型定義
interface UserData {
    id: number;
    username: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
        bio?: string;
    };
    settings: {
        theme: "light" | "dark";
        language: string;
        notifications: boolean;
    };
    statistics: {
        loginCount: number;
        lastLogin: string;
        accountCreated: string;
    };
}

/**
 * ユーザーデータを整形する関数
 */
function formatUserData(userData: UserData): string {
    const { profile, statistics } = userData;
    const fullName = `${profile.lastName} ${profile.firstName}`;
    const lastLoginDate = new Date(statistics.lastLogin).toLocaleDateString('ja-JP');
    const accountAge = Math.floor(
        (Date.now() - new Date(statistics.accountCreated).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return `${fullName} (@${userData.username}) - アカウント歴: ${accountAge}日, 最終ログイン: ${lastLoginDate}`;
}

/**
 * 複数のAPIレスポンスを統合する関数
 */
function aggregateApiResponses<T>(responses: ApiResponse<T[]>[]): {
    totalSuccess: number;
    totalFailed: number;
    combinedData: T[];
    latestTimestamp: string;
} {
    let totalSuccess = 0;
    let totalFailed = 0;
    const combinedData: T[] = [];
    let latestTimestamp = "";
    
    responses.forEach(response => {
        if (response.success) {
            totalSuccess++;
            combinedData.push(...response.data);
        } else {
            totalFailed++;
        }
        
        if (response.timestamp > latestTimestamp) {
            latestTimestamp = response.timestamp;
        }
    });
    
    return {
        totalSuccess,
        totalFailed,
        combinedData,
        latestTimestamp
    };
}

// サンプルデータの作成
const userApiResponse: ApiResponse<UserData[]> = {
    success: true,
    data: [
        {
            id: 1,
            username: "tanaka_taro",
            email: "tanaka@example.com",
            profile: {
                firstName: "太郎",
                lastName: "田中",
                avatar: "https://example.com/avatars/tanaka.jpg",
                bio: "フルスタック開発者です"
            },
            settings: {
                theme: "dark",
                language: "ja",
                notifications: true
            },
            statistics: {
                loginCount: 234,
                lastLogin: "2024-01-20T09:15:30Z",
                accountCreated: "2022-03-15T10:30:00Z"
            }
        },
        {
            id: 2,
            username: "sato_hanako",
            email: "sato@example.com",
            profile: {
                firstName: "花子",
                lastName: "佐藤"
            },
            settings: {
                theme: "light",
                language: "en",
                notifications: false
            },
            statistics: {
                loginCount: 89,
                lastLogin: "2024-01-19T14:22:15Z",
                accountCreated: "2023-01-22T15:45:00Z"
            }
        }
    ],
    message: "ユーザーデータを正常に取得しました",
    timestamp: "2024-01-20T10:45:00Z",
    metadata: {
        page: 1,
        limit: 10,
        total: 2,
        processedAt: "2024-01-20T10:45:00.123Z"
    }
};

console.log("\n=== データ変換・集計システム ===");
console.log("API レスポンス処理:");
console.log(`成功: ${userApiResponse.success}`);
console.log(`メッセージ: ${userApiResponse.message}`);
console.log(`データ件数: ${userApiResponse.data.length}`);

console.log("\nユーザーデータの整形:");
userApiResponse.data.forEach(user => {
    console.log(formatUserData(user));
});

// ===== エラーハンドリングシステム =====

// エラーの型定義
interface ApplicationError {
    code: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    timestamp: string;
    context: Record<string, unknown>;
    stack?: string;
}

/**
 * エラーを分類する関数
 */
function categorizeError(error: ApplicationError): string {
    const errorCategories: Record<string, string> = {
        "AUTH_": "認証エラー",
        "VAL_": "バリデーションエラー",
        "DB_": "データベースエラー",
        "NET_": "ネットワークエラー",
        "PAY_": "決済エラー",
        "SYS_": "システムエラー"
    };
    
    for (const [prefix, category] of Object.entries(errorCategories)) {
        if (error.code.startsWith(prefix)) {
            return category;
        }
    }
    
    return "その他のエラー";
}

/**
 * エラーの重要度に応じて処理を決定する関数
 */
function handleError(error: ApplicationError): string {
    const category = categorizeError(error);
    
    switch (error.severity) {
        case "critical":
            return `🚨 緊急対応必要: ${category} - ${error.message}`;
        case "high":
            return `🔴 高優先度: ${category} - ${error.message}`;
        case "medium":
            return `🟡 中優先度: ${category} - ${error.message}`;
        case "low":
            return `🟢 低優先度: ${category} - ${error.message}`;
        default:
            return `❓ 未分類: ${category} - ${error.message}`;
    }
}

// サンプルエラーデータ
const applicationErrors: ApplicationError[] = [
    {
        code: "AUTH_INVALID_TOKEN",
        message: "JWTトークンが無効です",
        severity: "medium",
        timestamp: "2024-01-20T10:30:00Z",
        context: { userId: 12345, endpoint: "/api/users/profile" }
    },
    {
        code: "DB_CONNECTION_TIMEOUT",
        message: "データベース接続がタイムアウトしました",
        severity: "critical",
        timestamp: "2024-01-20T10:35:00Z",
        context: { database: "users_db", timeout: 30000 }
    },
    {
        code: "VAL_EMAIL_INVALID",
        message: "無効なメールアドレス形式です",
        severity: "low",
        timestamp: "2024-01-20T10:40:00Z",
        context: { input: "invalid-email", field: "email" }
    },
    {
        code: "PAY_CARD_DECLINED",
        message: "クレジットカードが拒否されました",
        severity: "high",
        timestamp: "2024-01-20T10:45:00Z",
        context: { orderId: "ORD-001", amount: 15800, cardLast4: "1234" }
    }
];

console.log("\n=== エラーハンドリングシステム ===");
console.log(`総エラー数: ${applicationErrors.length}`);

console.log("\nエラー処理結果:");
applicationErrors.forEach(error => {
    console.log(handleError(error));
});

// 重要度別エラー集計
const errorBySeverity: Record<string, number> = {};
applicationErrors.forEach(error => {
    errorBySeverity[error.severity] = (errorBySeverity[error.severity] || 0) + 1;
});

console.log("\n重要度別エラー数:");
Object.entries(errorBySeverity).forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}件`);
});

// ===== 統計処理システム =====

/**
 * 数値配列の統計情報を計算する関数
 */
function calculateStatistics(numbers: number[]): {
    count: number;
    sum: number;
    average: number;
    median: number;
    min: number;
    max: number;
    range: number;
    standardDeviation: number;
} {
    if (numbers.length === 0) {
        return {
            count: 0,
            sum: 0,
            average: 0,
            median: 0,
            min: 0,
            max: 0,
            range: 0,
            standardDeviation: 0
        };
    }
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const count = numbers.length;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / count;
    
    const median = count % 2 === 0 
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];
    
    const min = sorted[0];
    const max = sorted[count - 1];
    const range = max - min;
    
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - average, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);
    
    return {
        count,
        sum,
        average: Math.round(average * 100) / 100,
        median,
        min,
        max,
        range,
        standardDeviation: Math.round(standardDeviation * 100) / 100
    };
}

// サンプル売上データ
const dailySales: number[] = [
    45000, 52000, 38000, 67000, 71000, 43000, 39000,  // 第1週
    58000, 64000, 49000, 73000, 81000, 56000, 41000,  // 第2週
    62000, 69000, 54000, 78000, 85000, 61000, 47000,  // 第3週
    66000, 72000, 58000, 82000, 89000, 65000, 52000   // 第4週
];

const salesStats = calculateStatistics(dailySales);

console.log("\n=== 統計処理システム ===");
console.log("月間売上統計:");
console.log(`  データ数: ${salesStats.count}日`);
console.log(`  合計売上: ¥${salesStats.sum.toLocaleString()}`);
console.log(`  平均売上: ¥${salesStats.average.toLocaleString()}`);
console.log(`  中央値: ¥${salesStats.median.toLocaleString()}`);
console.log(`  最小売上: ¥${salesStats.min.toLocaleString()}`);
console.log(`  最大売上: ¥${salesStats.max.toLocaleString()}`);
console.log(`  売上レンジ: ¥${salesStats.range.toLocaleString()}`);
console.log(`  標準偏差: ¥${salesStats.standardDeviation.toLocaleString()}`);

// パフォーマンス分析
const aboveAverageCount = dailySales.filter(sale => sale > salesStats.average).length;
const belowAverageCount = dailySales.length - aboveAverageCount;

console.log(`\nパフォーマンス分析:`);
console.log(`  平均以上の日数: ${aboveAverageCount}日 (${Math.round(aboveAverageCount / dailySales.length * 100)}%)`);
console.log(`  平均以下の日数: ${belowAverageCount}日 (${Math.round(belowAverageCount / dailySales.length * 100)}%)`);

export {
    LogLevel,
    LogEntry,
    formatLogEntry,
    filterLogsByLevel,
    ApiResponse,
    UserData,
    formatUserData,
    ApplicationError,
    categorizeError,
    handleError,
    calculateStatistics
};