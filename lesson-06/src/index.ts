interface ApiResponse<T> {
    data: T | null;
    error?: string;
    status: number;
}

interface UserProfile {
    id: number;
    name: string;
    avatar?: string;
    lastLogin?: Date;
}

interface User {
    id: number;
    name: string;
    email?: string;
    role: 'admin' | 'user' | 'guest';
}

export async function fetchUserProfile(userId: number): Promise<UserProfile | null> {
    try {
        const mockResponse: ApiResponse<UserProfile> = {
            status: 200,
            data: {
                id: userId,
                name: "田中太郎",
                avatar: "/images/user-avatar.png",
                lastLogin: new Date()
            }
        };
        
        if (mockResponse.status === 200 && mockResponse.data != null) {
            return mockResponse.data;
        }
        
        console.error('ユーザー取得エラー:', mockResponse.error ?? '不明なエラー');
        return null;
    } catch (error) {
        console.error('ネットワークエラー:', error);
        return null;
    }
}

export function displayUserProfile(user: UserProfile | null): string {
    if (user == null) {
        return "ユーザー情報が取得できませんでした";
    }
    
    const avatar = user.avatar ?? '/images/default-avatar.png';
    const lastLoginText = user.lastLogin != null 
        ? `最終ログイン: ${user.lastLogin.toLocaleDateString()}`
        : '最終ログイン: 不明';
    
    return `名前: ${user.name}、アバター: ${avatar}、${lastLoginText}`;
}

interface AppConfig {
    database?: {
        host?: string;
        port?: number;
        username?: string;
        password?: string;
    };
    cache?: {
        enabled?: boolean;
        ttl?: number;
    };
    logging?: {
        level?: 'debug' | 'info' | 'warn' | 'error';
        file?: string;
    };
}

export class ConfigManager {
    private config: AppConfig;
    
    constructor(config: AppConfig = {}) {
        this.config = config;
    }
    
    getDatabaseUrl(): string {
        const db = this.config.database;
        
        const host = db?.host ?? 'localhost';
        const port = db?.port ?? 5432;
        const username = db?.username ?? 'admin';
        const password = db?.password ?? '';
        
        return `postgresql://${username}:${password}@${host}:${port}`;
    }
    
    isCacheEnabled(): boolean {
        return this.config.cache?.enabled ?? false;
    }
    
    getCacheTtl(): number {
        return this.config.cache?.ttl ?? 300;
    }
    
    getLogLevel(): string {
        return this.config.logging?.level ?? 'info';
    }
    
    getLogFile(): string | null {
        return this.config.logging?.file ?? null;
    }
    
    updateConfig(updates: Partial<AppConfig>): void {
        this.config = {
            ...this.config,
            ...updates,
            database: { ...this.config.database, ...updates.database },
            cache: { ...this.config.cache, ...updates.cache },
            logging: { ...this.config.logging, ...updates.logging }
        };
    }
}

interface BlogPost {
    id: number;
    title: string;
    content: string;
    author: User;
    publishedAt: Date | null;
    updatedAt?: Date;
    tags?: string[];
    category?: {
        id: number;
        name: string;
    } | null;
}

export class BlogPostService {
    formatPost(post: BlogPost): {
        title: string;
        excerpt: string;
        author: string;
        status: string;
        publishDate: string;
        category: string;
        tags: string[];
    } {
        const excerpt = post.content.length > 100 
            ? post.content.substring(0, 100) + '...'
            : post.content;
        
        const status = post.publishedAt != null ? '公開済み' : '下書き';
        const publishDate = post.publishedAt?.toLocaleDateString() ?? '未公開';
        const categoryName = post.category?.name ?? 'カテゴリなし';
        const tags = post.tags ?? [];
        
        return {
            title: post.title,
            excerpt,
            author: post.author.name,
            status,
            publishDate,
            category: categoryName,
            tags
        };
    }
    
    canEdit(post: BlogPost, currentUser: User | null): boolean {
        if (currentUser == null) {
            return false;
        }
        
        return post.author.id === currentUser.id || 
               currentUser.role === 'admin';
    }
    
    getPublishedPosts(posts: BlogPost[]): BlogPost[] {
        return posts.filter(post => post.publishedAt != null);
    }
    
    searchByCategory(posts: BlogPost[], categoryId: number | null): BlogPost[] {
        if (categoryId == null) {
            return posts.filter(post => post.category == null);
        }
        
        return posts.filter(post => post.category?.id === categoryId);
    }
}

export function isNotNull<T>(value: T | null): value is T {
    return value !== null;
}

export function isNotUndefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

export function isNotNullish<T>(value: T | null | undefined): value is T {
    return value != null;
}

export function processValue(value: string | null | undefined): string {
    if (value === null) {
        return "値はnullです";
    }
    if (value === undefined) {
        return "値はundefinedです";
    }
    return `値: ${value}`;
}

export function getDisplayName(name: string | null | undefined): string {
    return name ?? "名前未設定";
}

export function compareOperators(value: string | null | undefined): { orResult: string; nullishResult: string } {
    const orResult = value || "デフォルト";
    const nullishResult = value ?? "デフォルト";
    
    return { orResult, nullishResult };
}

function main() {
    console.log("=== Lesson 06: null と undefined の例 ===\n");

    console.log("1. 基本的なnull/undefinedチェック");
    console.log(processValue("Hello"));
    console.log(processValue(null));
    console.log(processValue(undefined));
    console.log();

    console.log("2. Null合体演算子の例");
    console.log(`名前1: ${getDisplayName("田中太郎")}`);
    console.log(`名前2: ${getDisplayName(null)}`);
    console.log(`名前3: ${getDisplayName(undefined)}`);
    console.log();

    console.log("3. ||演算子と??演算子の違い");
    const testValues = ["Hello", "", null, undefined, 0];
    testValues.forEach(value => {
        const result = compareOperators(value as string | null | undefined);
        console.log(`値: ${JSON.stringify(value)}`);
        console.log(`  || 演算子: ${result.orResult}`);
        console.log(`  ?? 演算子: ${result.nullishResult}`);
    });
    console.log();

    console.log("4. 設定管理の例");
    const configManager = new ConfigManager({
        database: { host: "db.example.com", port: 3306 },
        cache: { enabled: true },
        logging: { level: "debug" }
    });
    
    console.log(`データベースURL: ${configManager.getDatabaseUrl()}`);
    console.log(`キャッシュ有効: ${configManager.isCacheEnabled()}`);
    console.log(`ログレベル: ${configManager.getLogLevel()}`);
    console.log(`ログファイル: ${configManager.getLogFile() ?? "コンソール出力"}`);
    console.log();

    console.log("5. ブログ投稿の例");
    const blogService = new BlogPostService();
    const samplePost: BlogPost = {
        id: 1,
        title: "TypeScript入門",
        content: "TypeScriptは、JavaScriptにオプショナルな静的型付けを追加するプログラミング言語です。型安全性を提供し、大規模なアプリケーション開発に適しています。",
        author: { id: 1, name: "山田太郎", role: "user" },
        publishedAt: new Date(),
        tags: ["TypeScript", "プログラミング"],
        category: { id: 1, name: "技術" }
    };
    
    const formatted = blogService.formatPost(samplePost);
    console.log("フォーマット済み投稿:");
    console.log(`  タイトル: ${formatted.title}`);
    console.log(`  抜粋: ${formatted.excerpt}`);
    console.log(`  著者: ${formatted.author}`);
    console.log(`  状態: ${formatted.status}`);
    console.log(`  公開日: ${formatted.publishDate}`);
    console.log(`  カテゴリ: ${formatted.category}`);
    console.log(`  タグ: ${formatted.tags.join(', ')}`);
    console.log();

    console.log("6. ユーザープロファイルの例");
    fetchUserProfile(1).then(user => {
        console.log(displayUserProfile(user));
    });
    
    console.log("7. 型ガードの例");
    const mixedValues = ["Hello", null, "World", undefined, "TypeScript"];
    const validValues = mixedValues.filter(isNotNullish);
    console.log("有効な値のみ:", validValues);
}

if (require.main === module) {
    main();
}