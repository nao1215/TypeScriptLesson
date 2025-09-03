/**
 * Lesson 02: TypeScript型システムの実践的活用 - 統合実行ファイル
 * 
 * このファイルは他のすべてのファイルから実装を統合し、
 * TypeScriptの高度な型システムがどのように連携するかを実演します。
 */

import {
    BaseEntity,
    Auditable,
    User as AdvancedUser,
    ApiConfig,
    DynamicForm,
    DatabaseQuery
} from './advanced-interfaces';

import {
    DataStore,
    AsyncCache,
    ApiClient,
    identity,
    createArray,
    deepClone,
    pick,
    omit,
    groupBy
} from './generics-examples';

import {
    Theme,
    AsyncState,
    Notification,
    ApiResponse,
    PaymentMethod,
    getStateMessage,
    sendNotification,
    processPayment,
    isApiSuccess
} from './union-literal-types';

import {
    isUser,
    isProduct,
    isContactForm,
    safeJsonParse,
    createArrayValidator
} from './type-guards';

import {
    BaseUser,
    UserUpdateData,
    UserSummary,
    CacheManager,
    ValidationRules,
    FormErrors,
    updateUser,
    validateUser
} from './utility-types';

console.log('🚀 TypeScript Lesson 02 - 型システムの実践的活用');
console.log('=' .repeat(60));

// ===== 型システム統合デモンストレーション =====

/**
 * 実際のWebアプリケーションでの統合的な処理例
 * 複数の型システム機能を組み合わせた実装
 */
class IntegratedApplicationDemo {
    private userStore = new DataStore<BaseUser>();
    private cache = new AsyncCache<any>(300000); // 5分キャッシュ
    private apiClient = new ApiClient("https://api.example.com/v1");

    constructor() {
        console.log("\n🔧 統合アプリケーション初期化中...");
        this.setupSampleData();
        this.demonstrateIntegration();
    }

    private setupSampleData(): void {
        console.log("\n📊 サンプルデータ準備中...");

        const sampleUsers: BaseUser[] = [
            {
                id: "user-001",
                username: "developer_alice",
                email: "alice@example.com",
                firstName: "Alice",
                lastName: "Johnson",
                dateOfBirth: new Date("1992-03-15"),
                phoneNumber: "+1-555-0101",
                address: {
                    street: "123 Developer St",
                    city: "Tech City",
                    postalCode: "12345",
                    country: "USA"
                },
                preferences: {
                    theme: "dark",
                    language: "en",
                    notifications: {
                        email: true,
                        push: true,
                        sms: false
                    }
                },
                roles: ["developer", "admin"],
                isActive: true,
                lastLogin: new Date("2024-01-20T10:30:00Z"),
                createdAt: new Date("2023-01-15T09:00:00Z"),
                updatedAt: new Date("2024-01-20T10:30:00Z")
            },
            {
                id: "user-002",
                username: "manager_bob",
                email: "bob@example.com",
                firstName: "Bob",
                lastName: "Smith",
                dateOfBirth: new Date("1988-07-22"),
                phoneNumber: "+1-555-0102",
                address: {
                    street: "456 Manager Ave",
                    city: "Business City",
                    postalCode: "67890",
                    country: "USA"
                },
                preferences: {
                    theme: "light",
                    language: "en",
                    notifications: {
                        email: true,
                        push: false,
                        sms: true
                    }
                },
                roles: ["manager", "user"],
                isActive: true,
                lastLogin: new Date("2024-01-19T14:15:00Z"),
                createdAt: new Date("2023-02-01T10:30:00Z"),
                updatedAt: new Date("2024-01-19T14:15:00Z")
            },
            {
                id: "user-003",
                username: "designer_carol",
                email: "carol@example.com",
                firstName: "Carol",
                lastName: "Brown",
                dateOfBirth: new Date("1995-11-08"),
                phoneNumber: "+1-555-0103",
                address: {
                    street: "789 Creative Blvd",
                    city: "Design Town",
                    postalCode: "11111",
                    country: "USA"
                },
                preferences: {
                    theme: "dark",
                    language: "en",
                    notifications: {
                        email: false,
                        push: true,
                        sms: false
                    }
                },
                roles: ["designer", "user"],
                isActive: false, // 非アクティブユーザー
                lastLogin: new Date("2024-01-10T16:45:00Z"),
                createdAt: new Date("2023-03-10T11:15:00Z"),
                updatedAt: new Date("2024-01-18T09:20:00Z")
            }
        ];

        sampleUsers.forEach(user => {
            this.userStore.set(user.username, user);
        });

        console.log(`✅ ${sampleUsers.length}人のユーザーデータを準備完了`);
    }

    private demonstrateIntegration(): void {
        console.log("\n🎯 型システム統合デモ開始");

        // 1. ジェネリクスとユーティリティ型の組み合わせ
        this.demonstrateGenericsWithUtilityTypes();

        // 2. 型ガードと判別可能ユニオンの連携
        this.demonstrateTypeGuardsWithUnions();

        // 3. 高度なインターフェースとバリデーション
        this.demonstrateAdvancedInterfacesValidation();

        // 4. 実際のAPI通信シミュレーション
        this.demonstrateApiIntegration();

        // 5. 型安全なデータ変換パイプライン
        this.demonstrateDataTransformation();
    }

    private demonstrateGenericsWithUtilityTypes(): void {
        console.log("\n📝 1. ジェネリクス × ユーティリティ型");

        // Partialとジェネリクスの組み合わせ
        const updateData: Partial<BaseUser> = {
            firstName: "Alice Updated",
            preferences: {
                theme: "light",
                language: "ja",
                notifications: {
                    email: true,
                    push: true,
                    sms: true
                }
            }
        };

        updateUser("user-001", updateData);

        // Pickとジェネリクスでサマリーデータを作成
        const userSummaries = this.userStore.values().map(user => 
            pick(user, ["id", "username", "firstName", "lastName", "isActive"])
        );

        console.log("ユーザーサマリー一覧:");
        userSummaries.forEach(summary => {
            console.log(`  ${summary.firstName} ${summary.lastName} (@${summary.username}) - ${summary.isActive ? "アクティブ" : "非アクティブ"}`);
        });

        // グループ化の例
        const usersByRole = groupBy(
            this.userStore.values().filter(user => user.isActive),
            "roles" as keyof BaseUser
        );
        
        console.log("\n役割別アクティブユーザー数:");
        Object.entries(usersByRole).forEach(([role, users]) => {
            console.log(`  ${role}: ${users.length}人`);
        });
    }

    private demonstrateTypeGuardsWithUnions(): void {
        console.log("\n🛡️ 2. 型ガード × 判別可能ユニオン");

        // 非同期状態の管理
        const applicationStates: AsyncState[] = [
            { type: "idle" },
            { type: "loading", message: "ユーザーデータを読み込み中..." },
            { 
                type: "success", 
                data: { users: this.userStore.size(), activeUsers: this.userStore.values().filter(u => u.isActive).length }, 
                timestamp: new Date() 
            },
            { type: "error", error: "データベース接続エラー", code: 500, retryable: true }
        ];

        console.log("アプリケーション状態の処理:");
        applicationStates.forEach((state, index) => {
            const message = getStateMessage(state);
            console.log(`  状態 ${index + 1}: ${message}`);
        });

        // API レスポンスの処理
        const mockApiResponses = [
            {
                success: true,
                data: this.userStore.values(),
                message: "ユーザー一覧を取得しました",
                metadata: {
                    requestId: "req-001",
                    timestamp: new Date().toISOString(),
                    version: "v1.0"
                }
            },
            {
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "認証が必要です"
                },
                metadata: {
                    requestId: "req-002",
                    timestamp: new Date().toISOString(),
                    version: "v1.0"
                }
            }
        ];

        console.log("\nAPI レスポンス処理:");
        mockApiResponses.forEach((response, index) => {
            if (isApiSuccess(response)) {
                console.log(`  レスポンス ${index + 1}: ✅ ${response.message} (${response.data.length}件)`);
            } else {
                console.log(`  レスポンス ${index + 1}: ❌ ${response.error.message} (${response.error.code})`);
            }
        });
    }

    private demonstrateAdvancedInterfacesValidation(): void {
        console.log("\n🏗️ 3. 高度なインターフェース × バリデーション");

        // 動的フォームの処理
        const userRegistrationForm: DynamicForm = {
            formId: "user-registration",
            title: "ユーザー登録フォーム",
            description: "新しいアカウントを作成してください",
            
            fields: {
                username: {
                    type: "text",
                    label: "ユーザー名",
                    placeholder: "英数字とアンダースコアのみ",
                    required: true,
                    validation: {
                        minLength: 3,
                        maxLength: 20,
                        pattern: "^[a-zA-Z0-9_]+$"
                    }
                },
                email: {
                    type: "email",
                    label: "メールアドレス",
                    placeholder: "example@example.com",
                    required: true
                },
                role: {
                    type: "select",
                    label: "役割",
                    required: true,
                    options: [
                        { value: "user", label: "一般ユーザー" },
                        { value: "developer", label: "開発者" },
                        { value: "manager", label: "マネージャー" },
                        { value: "designer", label: "デザイナー" }
                    ]
                }
            },
            
            values: {},
            errors: {},
            
            settings: {
                submitUrl: "/api/users/register",
                method: "POST",
                enctype: "application/json",
                showProgressBar: true,
                allowDraft: true,
                autoSave: false
            }
        };

        console.log("動的フォーム設定:");
        console.log(`  フォームID: ${userRegistrationForm.formId}`);
        console.log(`  タイトル: ${userRegistrationForm.title}`);
        console.log(`  フィールド数: ${Object.keys(userRegistrationForm.fields).length}`);

        // バリデーションルールの適用
        const validationRules: ValidationRules<{ username: string; email: string; role: string }> = {
            username: {
                required: true,
                minLength: 3,
                maxLength: 20,
                pattern: /^[a-zA-Z0-9_]+$/
            },
            email: {
                required: true,
                pattern: /^[^@]+@[^@]+\.[^@]+$/
            },
            role: {
                required: true,
                custom: (value) => ["user", "developer", "manager", "designer"].includes(value)
            }
        };

        const testFormData = {
            username: "test_user_123",
            email: "test@example.com", 
            role: "developer"
        };

        console.log("\nフォームデータ検証:");
        console.log("テストデータ:", JSON.stringify(testFormData, null, 2));
        console.log("✅ バリデーション成功（実際の実装では詳細チェックを実行）");
    }

    private async demonstrateApiIntegration(): Promise<void> {
        console.log("\n🌐 4. API統合とキャッシュシステム");

        // 型安全なAPI設定
        const apiConfig: ApiConfig = {
            baseURL: "https://api.example.com/v1",
            timeout: 10000,
            retries: 3,
            
            authentication: {
                type: "bearer",
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                refreshToken: "refresh_token_here"
            },
            
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "IntegratedApp/2.0"
            }
        };

        console.log("API設定:");
        console.log(`  Base URL: ${apiConfig.baseURL}`);
        console.log(`  認証タイプ: ${apiConfig.authentication.type}`);
        console.log(`  タイムアウト: ${apiConfig.timeout}ms`);

        // キャッシュを使ったデータ取得のシミュレーション
        console.log("\nキャッシュシステム:");
        const userCache = new CacheManager<BaseUser[]>();
        
        // 最初の取得（キャッシュミス）
        console.log("1回目の取得:");
        let cachedUsers = userCache.get("all-users");
        if (!cachedUsers) {
            const users = this.userStore.values();
            userCache.set("all-users", users, 30000); // 30秒TTL
            console.log(`  データベースから${users.length}人のユーザーを取得`);
        }

        // 2回目の取得（キャッシュヒット）
        console.log("2回目の取得:");
        cachedUsers = userCache.get("all-users");
        if (cachedUsers) {
            console.log(`  キャッシュから${cachedUsers.length}人のユーザーを取得`);
        }
    }

    private demonstrateDataTransformation(): void {
        console.log("\n🔄 5. 型安全なデータ変換パイプライン");

        // 複雑なデータ変換パイプラインの例
        const users = this.userStore.values();
        
        // 1. フィルタリング（アクティブユーザーのみ）
        const activeUsers = users.filter(user => user.isActive);
        console.log(`アクティブユーザー: ${activeUsers.length}/${users.length}人`);

        // 2. マッピング（サマリーデータに変換）
        const userProfiles = activeUsers.map(user => ({
            ...pick(user, ["id", "username", "firstName", "lastName", "email"]),
            fullName: `${user.firstName} ${user.lastName}`,
            theme: user.preferences.theme,
            language: user.preferences.language,
            roleCount: user.roles.length,
            daysSinceLastLogin: Math.floor(
                (Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
            )
        }));

        // 3. グループ化（テーマ別）
        const usersByTheme = groupBy(userProfiles, "theme");
        
        console.log("\nテーマ別ユーザー分布:");
        Object.entries(usersByTheme).forEach(([theme, users]) => {
            console.log(`  ${theme}: ${users.length}人`);
            users.forEach(user => {
                console.log(`    - ${user.fullName} (@${user.username}) - ${user.daysSinceLastLogin}日前にログイン`);
            });
        });

        // 4. 統計情報の計算
        const statistics = {
            totalUsers: users.length,
            activeUsers: activeUsers.length,
            averageRoleCount: activeUsers.reduce((sum, user) => sum + user.roles.length, 0) / activeUsers.length,
            themeDistribution: Object.fromEntries(
                Object.entries(usersByTheme).map(([theme, users]) => [theme, users.length])
            ),
            languageDistribution: Object.fromEntries(
                [...new Set(activeUsers.map(user => user.preferences.language))]
                    .map(lang => [
                        lang, 
                        activeUsers.filter(user => user.preferences.language === lang).length
                    ])
            )
        };

        console.log("\n📊 統計情報:");
        console.log(`  総ユーザー数: ${statistics.totalUsers}`);
        console.log(`  アクティブユーザー数: ${statistics.activeUsers}`);
        console.log(`  平均役割数: ${statistics.averageRoleCount.toFixed(2)}`);
        console.log("  テーマ分布:", JSON.stringify(statistics.themeDistribution, null, 4));
        console.log("  言語分布:", JSON.stringify(statistics.languageDistribution, null, 4));
    }

    // 型安全な通知システムの実装
    async demonstrateNotificationSystem(): Promise<void> {
        console.log("\n📢 6. 型安全な通知システム");

        const notifications: Notification[] = [
            {
                type: "email",
                recipient: "alice@example.com",
                subject: "アカウント設定が更新されました",
                body: "あなたのアカウント設定が正常に更新されました。",
                priority: "normal"
            },
            {
                type: "push",
                deviceToken: "device-token-alice-123",
                title: "新機能のお知らせ",
                body: "新しい機能が利用可能になりました！",
                badge: 1,
                sound: "default"
            },
            {
                type: "slack",
                channel: "#general",
                username: "AppBot",
                iconEmoji: ":robot_face:",
                text: "システム統合テストが完了しました",
                attachments: [{
                    color: "good",
                    title: "テスト結果",
                    text: "すべての型システムが正常に動作しています",
                    fields: [
                        { title: "実行時間", value: "2.3秒", short: true },
                        { title: "成功率", value: "100%", short: true }
                    ]
                }]
            }
        ];

        for (const notification of notifications) {
            await sendNotification(notification);
        }
    }

    // 決済システムの統合例
    async demonstratePaymentSystem(): Promise<void> {
        console.log("\n💳 7. 型安全な決済システム");

        const paymentMethods: PaymentMethod[] = [
            {
                method: "credit_card",
                cardNumber: "4111111111111111",
                expiryMonth: 12,
                expiryYear: 2028,
                cvv: "123",
                holderName: "ALICE JOHNSON"
            },
            {
                method: "digital_wallet",
                provider: "apple_pay",
                walletId: "wallet-alice-456",
                biometricAuth: true
            }
        ];

        for (const paymentMethod of paymentMethods) {
            const result = await processPayment(paymentMethod, 9999);
            if (result.success) {
                console.log(`✅ 決済成功: ${result.transactionId}`);
            } else {
                console.log(`❌ 決済失敗: ${result.error}`);
            }
        }
    }
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
    try {
        // 統合デモンストレーションの実行
        const demo = new IntegratedApplicationDemo();
        
        // 追加デモの実行
        await demo.demonstrateNotificationSystem();
        await demo.demonstratePaymentSystem();

        console.log('\n' + '='.repeat(60));
        console.log('🎉 TypeScript型システム統合デモが正常に完了しました！');
        console.log('\n💡 学習のポイント:');
        console.log('  - 高度なインターフェース設計により複雑なデータ構造を型安全に管理');
        console.log('  - ジェネリクスによる再利用可能で型安全なコンポーネント作成');
        console.log('  - ユニオン型とリテラル型で状態や設定を厳密に制御');
        console.log('  - 型ガードによる実行時の型安全性確保');
        console.log('  - ユーティリティ型による効率的な型操作');
        console.log('  - 実際のWebアプリケーション開発での実践的な型システム活用');
        
    } catch (error) {
        console.error('❌ 実行中にエラーが発生しました:', error);
    }
}

// ===== 型推論とコンパイル時チェックの実例 =====

console.log('\n🔍 型推論とコンパイル時チェックの実例:');

// TypeScriptが自動的に推論する型
const inferredString = "TypeScriptが文字列型を推論"; // string
const inferredNumber = 42; // number
const inferredArray = [1, "mixed", true]; // (string | number | boolean)[]
const inferredObject = { name: "TypeScript", version: 5.0 }; // { name: string; version: number }

console.log(`推論された文字列: "${inferredString}" (型: ${typeof inferredString})`);
console.log(`推論された数値: ${inferredNumber} (型: ${typeof inferredNumber})`);
console.log(`推論された配列: [${inferredArray.join(', ')}] (型: mixed array)`);
console.log(`推論されたオブジェクト: ${inferredObject.name} v${inferredObject.version}`);

// ===== エラー例（コメントアウト） =====

console.log('\n⚠️ TypeScriptが防ぐエラーの例（コメントアウト済み）:');
console.log('以下のコードはTypeScriptのコンパイル時にエラーになります:');

/*
// 型の不整合
const wrongAssignment: string = 123;  // ❌ number型をstring型に代入不可

// 存在しないプロパティへのアクセス
const user: BaseUser = getUserSomewhereFromUserStore();
const wrongProperty = user.nonExistentProperty;  // ❌ 存在しないプロパティ

// 不正な引数の型
function processUser(user: BaseUser): void { }
processUser("not a user object");  // ❌ string型をBaseUser型に渡せない

// 配列メソッドの誤用
const numbers: number[] = [1, 2, 3];
const result = numbers.map(num => num.toUpperCase());  // ❌ numberにtoUpperCaseメソッドは存在しない
*/

console.log('  - 型の不整合による代入エラー');
console.log('  - 存在しないプロパティへのアクセス');
console.log('  - 不正な引数の型による関数呼び出しエラー');
console.log('  - 配列メソッドの誤用');
console.log('  - APIレスポンスの型不整合');
console.log('  ➤ これらはすべてコンパイル時に検出され、実行時エラーを防止します');

// メイン処理の実行
main();