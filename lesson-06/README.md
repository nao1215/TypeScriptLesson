# Lesson 06: null と undefined

## 学習目標
- TypeScriptにおけるnull型とundefined型の違いを理解する
- Null合体演算子(??)とOptional Chaining(?.)の使い方を学ぶ
- 型安全なNull/Undefinedチェックの方法を身につける
- 実用的なNull/Undefinedハンドリングのパターンを理解する

## 概要
JavaScriptには「値がない」ことを表す2つの特別な値、`null`と`undefined`があります。TypeScriptではこれらを明確に型として扱い、型安全なNull/Undefinedチェックを実現できます。

## 主な内容

### 1. null型とundefined型の基本
```typescript
// undefined: 宣言されているが値が代入されていない
let undefinedValue: undefined = undefined;
let notAssigned: undefined; // デフォルトでundefined

// null: 意図的に「値がない」ことを表現
let nullValue: null = null;

// 通常は他の型との Union型として使用
let maybeString: string | null = null;
let optionalNumber: number | undefined = undefined;
let flexibleValue: string | null | undefined = undefined;
```

### 2. null と undefined の違い
```typescript
// undefined: 未初期化やプロパティが存在しない
interface User {
    name: string;
    email?: string; // オプショナルプロパティ（string | undefinedと同等）
}

let user: User = { name: "田中" };
console.log(user.email); // undefined（プロパティが存在しない）

// null: 意図的に「空」を表現
let currentUser: User | null = null; // 現在ユーザーがログインしていない状態

// 配列の例
let numbers: number[] = [1, 2, 3];
console.log(numbers[10]); // undefined（存在しないインデックス）
```

### 3. 型チェックの方法
```typescript
function processValue(value: string | null | undefined): string {
    // 1. 厳密等価演算子による個別チェック
    if (value === null) {
        return "値はnullです";
    }
    if (value === undefined) {
        return "値はundefinedです";
    }
    return `値: ${value}`;
}

function safeProcessValue(value: string | null | undefined): string {
    // 2. 一括でnull/undefinedをチェック
    if (value == null) { // == null は null と undefined の両方をチェック
        return "値がありません";
    }
    return `値: ${value}`;
}

function modernProcessValue(value: string | null | undefined): string {
    // 3. 現代的なアプローチ（推奨）
    if (value != null) { // != null で null と undefined 以外をチェック
        return `値: ${value}`;
    }
    return "値がありません";
}
```

### 4. Null合体演算子(??)
```typescript
// デフォルト値の設定
function getDisplayName(name: string | null | undefined): string {
    // null や undefined の場合のみデフォルト値を使用
    return name ?? "名前未設定";
}

// 従来の || 演算子との違い
function compareOperators(value: string | null | undefined): void {
    console.log("入力値:", value);
    
    // || 演算子: falsy値すべてでデフォルト値を使用
    console.log("|| 演算子:", value || "デフォルト");
    
    // ?? 演算子: null と undefined の場合のみデフォルト値を使用
    console.log("?? 演算子:", value ?? "デフォルト");
}

// 例：空文字列の場合の違い
compareOperators(""); 
// 入力値: ""
// || 演算子: "デフォルト" (空文字列はfalsyなのでデフォルト値が使われる)
// ?? 演算子: "" (空文字列はnull/undefinedではないので元の値が使われる)

// 連鎖的な使用
let config = {
    theme: null as string | null,
    lang: undefined as string | undefined,
    timezone: "" as string
};

let finalTheme = config.theme ?? config.lang ?? "ja" ?? "デフォルトテーマ";
```

### 5. Optional Chaining(?.)
```typescript
interface Company {
    name: string;
    address?: {
        street: string;
        city: string;
        country?: string;
    };
    employees?: User[];
}

function getCompanyCountry(company: Company | null): string | undefined {
    // 従来の方法（冗長）
    if (company && company.address && company.address.country) {
        return company.address.country;
    }
    return undefined;
}

function getCompanyCountryModern(company: Company | null): string | undefined {
    // Optional Chaining使用（推奨）
    return company?.address?.country;
}

function getFirstEmployeeName(company: Company | null): string | undefined {
    // 配列のOptional Chaining
    return company?.employees?.[0]?.name;
}

function callCompanyMethod(company: Company | null): void {
    // メソッドのOptional Chaining
    (company as any)?.calculateTax?.();
}
```

### 6. 型ガードによる Null/Undefined チェック
```typescript
// カスタム型ガード
function isNotNull<T>(value: T | null): value is T {
    return value !== null;
}

function isNotUndefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

function isNotNullish<T>(value: T | null | undefined): value is T {
    return value != null;
}

// 使用例
function processUsers(users: (User | null | undefined)[]): User[] {
    return users.filter(isNotNullish); // 型安全にnull/undefinedを除去
}

// in演算子による存在チェック
function hasProperty<T extends object, K extends string>(
    obj: T, 
    key: K
): obj is T & Record<K, unknown> {
    return key in obj;
}

function processUserSafely(user: User): void {
    if (hasProperty(user, 'email') && user.email != null) {
        console.log(`メール: ${user.email}`); // 型安全
    }
}
```

## 実践的な使用例

### 例1: API レスポンスの処理
```typescript
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

async function fetchUserProfile(userId: number): Promise<UserProfile | null> {
    try {
        const response: ApiResponse<UserProfile> = await fetch(`/api/users/${userId}`)
            .then(res => res.json());
        
        if (response.status === 200 && response.data != null) {
            return response.data;
        }
        
        console.error('ユーザー取得エラー:', response.error ?? '不明なエラー');
        return null;
    } catch (error) {
        console.error('ネットワークエラー:', error);
        return null;
    }
}

function displayUserProfile(user: UserProfile | null): string {
    if (user == null) {
        return "ユーザー情報が取得できませんでした";
    }
    
    const avatar = user.avatar ?? '/images/default-avatar.png';
    const lastLoginText = user.lastLogin != null 
        ? `最終ログイン: ${user.lastLogin.toLocaleDateString()}`
        : '最終ログイン: 不明';
    
    return `
        名前: ${user.name}
        アバター: ${avatar}
        ${lastLoginText}
    `;
}
```

### 例2: 設定管理システム
```typescript
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

class ConfigManager {
    private config: AppConfig;
    
    constructor(config: AppConfig = {}) {
        this.config = config;
    }
    
    getDatabaseUrl(): string {
        const db = this.config.database;
        
        // Optional Chainingとnull合体演算子を組み合わせ
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
        return this.config.cache?.ttl ?? 300; // デフォルト5分
    }
    
    getLogLevel(): string {
        return this.config.logging?.level ?? 'info';
    }
    
    getLogFile(): string | null {
        // ログファイルが明示的に設定されていない場合はnullを返す
        return this.config.logging?.file ?? null;
    }
    
    updateConfig(updates: Partial<AppConfig>): void {
        // 深いマージを実行（簡略版）
        this.config = {
            ...this.config,
            ...updates,
            database: { ...this.config.database, ...updates.database },
            cache: { ...this.config.cache, ...updates.cache },
            logging: { ...this.config.logging, ...updates.logging }
        };
    }
}
```

### 例3: データベースエンティティの処理
```typescript
interface BlogPost {
    id: number;
    title: string;
    content: string;
    author: User;
    publishedAt: Date | null; // 下書きの場合はnull
    updatedAt?: Date;
    tags?: string[];
    category?: {
        id: number;
        name: string;
    } | null;
}

class BlogPostService {
    formatPost(post: BlogPost): {
        title: string;
        excerpt: string;
        author: string;
        status: string;
        publishDate: string;
        category: string;
        tags: string[];
    } {
        // 安全な文字列操作
        const excerpt = post.content.length > 100 
            ? post.content.substring(0, 100) + '...'
            : post.content;
        
        // null チェックとフォーマット
        const status = post.publishedAt != null ? '公開済み' : '下書き';
        const publishDate = post.publishedAt?.toLocaleDateString() ?? '未公開';
        
        // Optional Chainingでネストされたプロパティにアクセス
        const categoryName = post.category?.name ?? 'カテゴリなし';
        
        // デフォルト値の提供
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
        // ユーザーがログインしていない場合は編集不可
        if (currentUser == null) {
            return false;
        }
        
        // 投稿者本人または管理者のみ編集可能
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
```

## よくある落とし穴と対処法

### 1. == vs === の使い分け
```typescript
// 危険: 予期しない型変換が発生
function badCheck(value: string | null | undefined): boolean {
    return value == false; // 空文字列でもtrueになってしまう
}

// 安全: 厳密な比較
function goodCheck(value: string | null | undefined): boolean {
    return value == null; // nullとundefinedのみをチェック
}
```

### 2. Optional Chainingの過度な使用
```typescript
// 過度なOptional Chaining（可読性が低い）
function badExample(data: any): string {
    return data?.user?.profile?.settings?.theme?.color?.primary ?? 'blue';
}

// より良いアプローチ
function goodExample(data: { user?: { profile?: UserProfile } }): string {
    const profile = data.user?.profile;
    if (profile == null) {
        return 'blue'; // デフォルトテーマ
    }
    
    // profileが存在することが確定した後で処理
    return profile.settings?.theme?.color?.primary ?? 'blue';
}
```

### 3. 配列要素のnullチェック
```typescript
// 危険: filter後も型にnullが含まれる
function badFilter(items: (string | null)[]): string[] {
    return items.filter(item => item != null) as string[];
}

// 安全: 型ガードを使用
function goodFilter(items: (string | null)[]): string[] {
    return items.filter((item): item is string => item != null);
}
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `safeGetProperty<T, K>(obj: T, key: K): any` - オブジェクトから安全にプロパティを取得
2. `findFirstValid(...values: (string | null | undefined)[]): string | null` - 最初の有効な値を返す
3. `formatOptionalDate(date: Date | null | undefined): string` - 日付を安全にフォーマット
4. `mergeWithDefaults<T>(partial: Partial<T>, defaults: T): T` - デフォルト値とマージ
5. `safeParseJSON(jsonString: string | null | undefined): unknown | null` - JSON文字列を安全にパース

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-06
```

## 次のレッスン
[Lesson 07: 配列型](../lesson-07/README.md)では、TypeScriptの配列型とその操作方法について学習します。