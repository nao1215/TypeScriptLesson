import {
    fetchUserProfile,
    displayUserProfile,
    ConfigManager,
    BlogPostService,
    isNotNull,
    isNotUndefined,
    isNotNullish,
    processValue,
    getDisplayName,
    compareOperators
} from '../src/index';

import {
    safeGetProperty,
    findFirstValid,
    formatOptionalDate,
    mergeWithDefaults,
    safeParseJSON
} from '../src/solution';

describe('Lesson 06: null と undefined', () => {
    describe('基本的なnull/undefinedチェック', () => {
        test('processValue関数', () => {
            expect(processValue("Hello")).toBe("値: Hello");
            expect(processValue(null)).toBe("値はnullです");
            expect(processValue(undefined)).toBe("値はundefinedです");
        });

        test('getDisplayName関数', () => {
            expect(getDisplayName("田中太郎")).toBe("田中太郎");
            expect(getDisplayName(null)).toBe("名前未設定");
            expect(getDisplayName(undefined)).toBe("名前未設定");
        });
    });

    describe('Null合体演算子と||演算子の違い', () => {
        test('compareOperators関数', () => {
            expect(compareOperators("Hello")).toEqual({
                orResult: "Hello",
                nullishResult: "Hello"
            });
            
            expect(compareOperators("")).toEqual({
                orResult: "デフォルト",
                nullishResult: ""
            });
            
            expect(compareOperators(null)).toEqual({
                orResult: "デフォルト",
                nullishResult: "デフォルト"
            });
            
            expect(compareOperators(undefined)).toEqual({
                orResult: "デフォルト",
                nullishResult: "デフォルト"
            });
        });
    });

    describe('型ガード', () => {
        test('isNotNull', () => {
            expect(isNotNull("test")).toBe(true);
            expect(isNotNull(null)).toBe(false);
            expect(isNotNull(undefined)).toBe(true);
            expect(isNotNull(0)).toBe(true);
            expect(isNotNull("")).toBe(true);
        });

        test('isNotUndefined', () => {
            expect(isNotUndefined("test")).toBe(true);
            expect(isNotUndefined(null)).toBe(true);
            expect(isNotUndefined(undefined)).toBe(false);
            expect(isNotUndefined(0)).toBe(true);
            expect(isNotUndefined("")).toBe(true);
        });

        test('isNotNullish', () => {
            expect(isNotNullish("test")).toBe(true);
            expect(isNotNullish(null)).toBe(false);
            expect(isNotNullish(undefined)).toBe(false);
            expect(isNotNullish(0)).toBe(true);
            expect(isNotNullish("")).toBe(true);
        });

        test('配列のフィルタリング', () => {
            const mixedValues = ["Hello", null, "World", undefined, "TypeScript"];
            const result = mixedValues.filter(isNotNullish);
            expect(result).toEqual(["Hello", "World", "TypeScript"]);
        });
    });

    describe('ConfigManager', () => {
        test('デフォルト設定', () => {
            const config = new ConfigManager();
            
            expect(config.getDatabaseUrl()).toBe("postgresql://admin:@localhost:5432");
            expect(config.isCacheEnabled()).toBe(false);
            expect(config.getCacheTtl()).toBe(300);
            expect(config.getLogLevel()).toBe("info");
            expect(config.getLogFile()).toBe(null);
        });

        test('カスタム設定', () => {
            const config = new ConfigManager({
                database: {
                    host: "db.example.com",
                    port: 3306,
                    username: "myuser",
                    password: "mypass"
                },
                cache: {
                    enabled: true,
                    ttl: 600
                },
                logging: {
                    level: "debug",
                    file: "/var/log/app.log"
                }
            });
            
            expect(config.getDatabaseUrl()).toBe("postgresql://myuser:mypass@db.example.com:3306");
            expect(config.isCacheEnabled()).toBe(true);
            expect(config.getCacheTtl()).toBe(600);
            expect(config.getLogLevel()).toBe("debug");
            expect(config.getLogFile()).toBe("/var/log/app.log");
        });

        test('部分的な設定', () => {
            const config = new ConfigManager({
                database: { host: "myhost" },
                cache: { enabled: true }
            });
            
            expect(config.getDatabaseUrl()).toBe("postgresql://admin:@myhost:5432");
            expect(config.isCacheEnabled()).toBe(true);
            expect(config.getCacheTtl()).toBe(300); // デフォルト値
        });
    });

    describe('BlogPostService', () => {
        const blogService = new BlogPostService();
        const sampleUser = { id: 1, name: "田中太郎", role: 'user' as const };
        const adminUser = { id: 2, name: "管理者", role: 'admin' as const };
        
        const publishedPost = {
            id: 1,
            title: "公開記事",
            content: "この記事は公開済みです。".repeat(10),
            author: sampleUser,
            publishedAt: new Date('2023-12-01'),
            tags: ["TypeScript", "プログラミング"],
            category: { id: 1, name: "技術" }
        };
        
        const draftPost = {
            id: 2,
            title: "下書き記事",
            content: "短い内容",
            author: sampleUser,
            publishedAt: null,
            category: null
        };

        test('記事のフォーマット - 公開記事', () => {
            const result = blogService.formatPost(publishedPost);
            
            expect(result.title).toBe("公開記事");
            expect(result.excerpt).toContain("...");
            expect(result.author).toBe("田中太郎");
            expect(result.status).toBe("公開済み");
            expect(result.publishDate).toBe("2023/12/1");
            expect(result.category).toBe("技術");
            expect(result.tags).toEqual(["TypeScript", "プログラミング"]);
        });

        test('記事のフォーマット - 下書き記事', () => {
            const result = blogService.formatPost(draftPost);
            
            expect(result.title).toBe("下書き記事");
            expect(result.excerpt).toBe("短い内容");
            expect(result.status).toBe("下書き");
            expect(result.publishDate).toBe("未公開");
            expect(result.category).toBe("カテゴリなし");
            expect(result.tags).toEqual([]);
        });

        test('編集権限チェック', () => {
            expect(blogService.canEdit(publishedPost, sampleUser)).toBe(true);
            expect(blogService.canEdit(publishedPost, adminUser)).toBe(true);
            expect(blogService.canEdit(publishedPost, null)).toBe(false);
            
            const otherUserPost = { ...publishedPost, author: { id: 999, name: "他のユーザー", role: 'user' as const } };
            expect(blogService.canEdit(otherUserPost, sampleUser)).toBe(false);
            expect(blogService.canEdit(otherUserPost, adminUser)).toBe(true);
        });

        test('公開済み記事の取得', () => {
            const posts = [publishedPost, draftPost];
            const publishedPosts = blogService.getPublishedPosts(posts);
            
            expect(publishedPosts).toHaveLength(1);
            expect(publishedPosts[0].id).toBe(1);
        });

        test('カテゴリ検索', () => {
            const posts = [publishedPost, draftPost];
            
            const techPosts = blogService.searchByCategory(posts, 1);
            expect(techPosts).toHaveLength(1);
            expect(techPosts[0].id).toBe(1);
            
            const noCategoryPosts = blogService.searchByCategory(posts, null);
            expect(noCategoryPosts).toHaveLength(1);
            expect(noCategoryPosts[0].id).toBe(2);
        });
    });

    describe('ユーザープロファイル処理', () => {
        test('ユーザープロファイル取得', async () => {
            const profile = await fetchUserProfile(1);
            
            expect(profile).not.toBeNull();
            expect(profile?.id).toBe(1);
            expect(profile?.name).toBe("田中太郎");
        });

        test('ユーザープロファイル表示', () => {
            const validProfile = {
                id: 1,
                name: "田中太郎",
                avatar: "/custom-avatar.png",
                lastLogin: new Date('2023-12-01')
            };
            
            const result = displayUserProfile(validProfile);
            expect(result).toContain("田中太郎");
            expect(result).toContain("/custom-avatar.png");
            expect(result).toContain("最終ログイン:");
            
            const nullResult = displayUserProfile(null);
            expect(nullResult).toBe("ユーザー情報が取得できませんでした");
        });
    });

    describe('演習問題の解答', () => {
        test('安全なプロパティ取得', () => {
            const user = { name: "田中太郎", age: 30 };
            
            expect(safeGetProperty(user, "name")).toBe("田中太郎");
            expect(safeGetProperty(user, "age")).toBe(30);
            expect(safeGetProperty(null as any, "name")).toBeUndefined();
            expect(safeGetProperty(undefined as any, "age")).toBeUndefined();
        });

        test('最初の有効な値を検索', () => {
            expect(findFirstValid("Hello", "World")).toBe("Hello");
            expect(findFirstValid(null, "World")).toBe("World");
            expect(findFirstValid(null, undefined, "Hello")).toBe("Hello");
            expect(findFirstValid(null, undefined)).toBe(null);
            expect(findFirstValid()).toBe(null);
        });

        test('オプショナル日付のフォーマット', () => {
            expect(formatOptionalDate(new Date('2023-12-25'))).toBe("2023-12-25");
            expect(formatOptionalDate(null)).toBe("日付なし");
            expect(formatOptionalDate(undefined)).toBe("日付なし");
        });

        test('デフォルト値とのマージ', () => {
            const defaults = { name: "デフォルト名", age: 0, city: "東京" };
            
            expect(mergeWithDefaults({ name: "田中太郎" }, defaults)).toEqual({
                name: "田中太郎",
                age: 0,
                city: "東京"
            });
            
            expect(mergeWithDefaults({ name: null } as any, defaults)).toEqual({
                name: "デフォルト名",
                age: 0,
                city: "東京"
            });
            
            expect(mergeWithDefaults({ age: undefined } as any, defaults)).toEqual({
                name: "デフォルト名",
                age: 0,
                city: "東京"
            });
        });

        test('安全なJSONパース', () => {
            expect(safeParseJSON('{"name": "田中太郎"}')).toEqual({ name: "田中太郎" });
            expect(safeParseJSON('{"age": 30}')).toEqual({ age: 30 });
            expect(safeParseJSON('invalid json')).toBe(null);
            expect(safeParseJSON(null)).toBe(null);
            expect(safeParseJSON(undefined)).toBe(null);
            expect(safeParseJSON("")).toBe(null);
            expect(safeParseJSON("   ")).toBe(null);
        });
    });
});