/**
 * Lesson 02: ユニオン型とリテラル型の実践的活用
 * 
 * 実際の開発現場でよく使われるユニオン型とリテラル型の
 * 効果的な使い方とパターンを学習します。
 */

// ===== 基本的なリテラル型 =====

type Theme = "light" | "dark" | "auto";
type Status = "idle" | "loading" | "success" | "error";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

// 数値リテラル型
type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 502 | 503;
type Grade = 1 | 2 | 3 | 4 | 5;

// ===== 判別可能なユニオン型（Discriminated Union） =====

interface LoadingState {
    type: "loading";
    message: string;
}

interface SuccessState {
    type: "success";
    data: any;
    timestamp: Date;
}

interface ErrorState {
    type: "error";
    error: string;
    code: number;
    retryable: boolean;
}

interface IdleState {
    type: "idle";
}

type AsyncState = LoadingState | SuccessState | ErrorState | IdleState;

// ===== より複雑な判別可能ユニオン：通知システム =====

interface EmailNotification {
    type: "email";
    recipient: string;
    subject: string;
    body: string;
    priority: "low" | "normal" | "high";
    scheduled?: Date;
}

interface PushNotification {
    type: "push";
    deviceToken: string;
    title: string;
    body: string;
    badge?: number;
    sound?: string;
    category?: string;
}

interface SmsNotification {
    type: "sms";
    phoneNumber: string;
    message: string;
    maxLength: 160;
}

interface SlackNotification {
    type: "slack";
    channel: string;
    username?: string;
    iconEmoji?: string;
    text: string;
    attachments?: Array<{
        color: string;
        title: string;
        text: string;
        fields?: Array<{ title: string; value: string; short: boolean }>;
    }>;
}

type Notification = EmailNotification | PushNotification | SmsNotification | SlackNotification;

// ===== API レスポンスの型定義 =====

interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message: string;
    metadata: {
        requestId: string;
        timestamp: string;
        version: string;
    };
}

interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        requestId: string;
        timestamp: string;
        version: string;
    };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ===== 支払い方法の型定義 =====

interface CreditCardPayment {
    method: "credit_card";
    cardNumber: string; // 実際は暗号化される
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    holderName: string;
}

interface BankTransferPayment {
    method: "bank_transfer";
    bankCode: string;
    accountNumber: string;
    accountHolderName: string;
    transferNote?: string;
}

interface DigitalWalletPayment {
    method: "digital_wallet";
    provider: "paypal" | "apple_pay" | "google_pay" | "line_pay";
    walletId: string;
    biometricAuth?: boolean;
}

interface CryptocurrencyPayment {
    method: "cryptocurrency";
    currency: "bitcoin" | "ethereum" | "litecoin";
    walletAddress: string;
    amount: number;
    networkFee: number;
}

type PaymentMethod = CreditCardPayment | BankTransferPayment | DigitalWalletPayment | CryptocurrencyPayment;

// ===== フォームフィールドの型定義 =====

interface TextFieldConfig {
    type: "text" | "email" | "password" | "url";
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
}

interface NumberFieldConfig {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
}

interface SelectFieldConfig {
    type: "select";
    options: Array<{
        value: string | number;
        label: string;
        disabled?: boolean;
        group?: string;
    }>;
    multiple?: boolean;
}

interface CheckboxFieldConfig {
    type: "checkbox";
    options?: Array<{
        value: string;
        label: string;
        checked?: boolean;
    }>;
}

interface DateFieldConfig {
    type: "date" | "datetime" | "time";
    min?: string;
    max?: string;
    defaultValue?: string;
}

interface FileFieldConfig {
    type: "file";
    accept?: string[];
    multiple?: boolean;
    maxSize?: number; // バイト単位
    maxFiles?: number;
}

type FormFieldConfig = TextFieldConfig | NumberFieldConfig | SelectFieldConfig | 
                      CheckboxFieldConfig | DateFieldConfig | FileFieldConfig;

// ===== 実用的な型ガード関数 =====

function isLoadingState(state: AsyncState): state is LoadingState {
    return state.type === "loading";
}

function isSuccessState(state: AsyncState): state is SuccessState {
    return state.type === "success";
}

function isErrorState(state: AsyncState): state is ErrorState {
    return state.type === "error";
}

function isEmailNotification(notification: Notification): notification is EmailNotification {
    return notification.type === "email";
}

function isPushNotification(notification: Notification): notification is PushNotification {
    return notification.type === "push";
}

function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success === true;
}

function isCreditCardPayment(payment: PaymentMethod): payment is CreditCardPayment {
    return payment.method === "credit_card";
}

// ===== 実用的なユーティリティ関数 =====

function getStateMessage(state: AsyncState): string {
    switch (state.type) {
        case "idle":
            return "待機中です";
        case "loading":
            return state.message;
        case "success":
            return `成功: データを${state.timestamp.toLocaleString("ja-JP")}に取得しました`;
        case "error":
            return `エラー: ${state.error} (コード: ${state.code})${state.retryable ? " - 再試行可能" : ""}`;
        default:
            // TypeScriptがすべてのケースを網羅していることを確認
            const exhaustiveCheck: never = state;
            return exhaustiveCheck;
    }
}

function sendNotification(notification: Notification): Promise<boolean> {
    console.log(`通知を送信中: ${notification.type}`);
    
    switch (notification.type) {
        case "email":
            console.log(`  宛先: ${notification.recipient}`);
            console.log(`  件名: ${notification.subject}`);
            console.log(`  優先度: ${notification.priority}`);
            if (notification.scheduled) {
                console.log(`  送信予約: ${notification.scheduled.toLocaleString("ja-JP")}`);
            }
            break;

        case "push":
            console.log(`  デバイス: ${notification.deviceToken}`);
            console.log(`  タイトル: ${notification.title}`);
            if (notification.badge) {
                console.log(`  バッジ: ${notification.badge}`);
            }
            break;

        case "sms":
            console.log(`  電話番号: ${notification.phoneNumber}`);
            console.log(`  文字数: ${notification.message.length}/${notification.maxLength}`);
            break;

        case "slack":
            console.log(`  チャンネル: ${notification.channel}`);
            if (notification.username) {
                console.log(`  送信者名: ${notification.username}`);
            }
            if (notification.attachments) {
                console.log(`  添付: ${notification.attachments.length}件`);
            }
            break;

        default:
            const exhaustiveCheck: never = notification;
            throw new Error(`未対応の通知タイプ: ${exhaustiveCheck}`);
    }

    // 実際の送信処理をシミュレート
    return Promise.resolve(true);
}

function processPayment(payment: PaymentMethod, amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    console.log(`決済処理開始: ${payment.method} - ¥${amount.toLocaleString()}`);

    switch (payment.method) {
        case "credit_card":
            console.log(`  カード番号: ****-****-****-${payment.cardNumber.slice(-4)}`);
            console.log(`  名義: ${payment.holderName}`);
            console.log(`  有効期限: ${payment.expiryMonth}/${payment.expiryYear}`);
            break;

        case "bank_transfer":
            console.log(`  銀行コード: ${payment.bankCode}`);
            console.log(`  口座番号: ${payment.accountNumber}`);
            console.log(`  名義: ${payment.accountHolderName}`);
            break;

        case "digital_wallet":
            console.log(`  プロバイダー: ${payment.provider}`);
            console.log(`  ウォレットID: ${payment.walletId}`);
            if (payment.biometricAuth) {
                console.log("  生体認証: 有効");
            }
            break;

        case "cryptocurrency":
            console.log(`  通貨: ${payment.currency}`);
            console.log(`  ウォレットアドレス: ${payment.walletAddress}`);
            console.log(`  ネットワーク手数料: ¥${payment.networkFee}`);
            break;

        default:
            const exhaustiveCheck: never = payment;
            throw new Error(`未対応の決済方法: ${exhaustiveCheck}`);
    }

    // 決済処理をシミュレート
    return Promise.resolve({
        success: true,
        transactionId: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
}

function validateFormField(fieldConfig: FormFieldConfig, value: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (fieldConfig.type) {
        case "text":
        case "email":
        case "password":
        case "url":
            if (typeof value !== "string") {
                errors.push("文字列である必要があります");
            } else {
                if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
                    errors.push(`最大${fieldConfig.maxLength}文字まで入力可能です`);
                }
                if (fieldConfig.pattern && !new RegExp(fieldConfig.pattern).test(value)) {
                    errors.push("入力形式が正しくありません");
                }
                if (fieldConfig.type === "email" && !/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
                    errors.push("有効なメールアドレスを入力してください");
                }
            }
            break;

        case "number":
            if (typeof value !== "number" || isNaN(value)) {
                errors.push("数値である必要があります");
            } else {
                if (fieldConfig.min !== undefined && value < fieldConfig.min) {
                    errors.push(`${fieldConfig.min}以上の値を入力してください`);
                }
                if (fieldConfig.max !== undefined && value > fieldConfig.max) {
                    errors.push(`${fieldConfig.max}以下の値を入力してください`);
                }
            }
            break;

        case "select":
            const validOptions = fieldConfig.options.map(opt => opt.value);
            if (fieldConfig.multiple) {
                if (!Array.isArray(value)) {
                    errors.push("配列である必要があります");
                } else if (!value.every(v => validOptions.includes(v))) {
                    errors.push("無効な選択肢が含まれています");
                }
            } else {
                if (!validOptions.includes(value)) {
                    errors.push("有効な選択肢を選択してください");
                }
            }
            break;

        case "file":
            if (value instanceof File) {
                if (fieldConfig.maxSize && value.size > fieldConfig.maxSize) {
                    errors.push(`ファイルサイズは${fieldConfig.maxSize}バイト以下にしてください`);
                }
                if (fieldConfig.accept && !fieldConfig.accept.some(type => value.type.includes(type))) {
                    errors.push(`許可されていないファイル形式です: ${value.type}`);
                }
            }
            break;

        default:
            // その他のフィールドタイプの処理
            break;
    }

    return { valid: errors.length === 0, errors };
}

// ===== 実際の使用例とデモ =====

console.log("=== ユニオン型とリテラル型の実践的活用例 ===");

// 非同期状態の管理例
console.log("\n🔄 非同期状態の管理:");

const states: AsyncState[] = [
    { type: "idle" },
    { type: "loading", message: "データを読み込み中..." },
    { type: "success", data: { users: 150, products: 1200 }, timestamp: new Date() },
    { type: "error", error: "ネットワーク接続エラー", code: 500, retryable: true }
];

states.forEach((state, index) => {
    console.log(`状態 ${index + 1}: ${getStateMessage(state)}`);
    
    if (isErrorState(state) && state.retryable) {
        console.log("  → 再試行ボタンを表示");
    }
    
    if (isSuccessState(state)) {
        console.log("  → データ:", state.data);
    }
});

// 通知システムの例
console.log("\n📢 通知システム:");

const notifications: Notification[] = [
    {
        type: "email",
        recipient: "user@example.com",
        subject: "注文が確定しました",
        body: "ご注文いただきありがとうございます。",
        priority: "normal"
    },
    {
        type: "push",
        deviceToken: "device-token-12345",
        title: "新しいメッセージ",
        body: "3件の新しいメッセージがあります",
        badge: 3,
        sound: "default"
    },
    {
        type: "sms",
        phoneNumber: "+81-90-1234-5678",
        message: "認証コード: 123456",
        maxLength: 160
    },
    {
        type: "slack",
        channel: "#general",
        username: "Bot",
        iconEmoji: ":robot_face:",
        text: "デプロイが完了しました！",
        attachments: [{
            color: "good",
            title: "デプロイ詳細",
            text: "バージョン 1.2.3 のデプロイが成功しました",
            fields: [
                { title: "環境", value: "Production", short: true },
                { title: "実行時間", value: "2分30秒", short: true }
            ]
        }]
    }
];

// 各通知を送信
notifications.forEach(async (notification, index) => {
    console.log(`\n通知 ${index + 1}:`);
    const result = await sendNotification(notification);
    console.log(`結果: ${result ? "成功" : "失敗"}`);
});

// API レスポンスの処理例
console.log("\n🌐 API レスポンス処理:");

const responses: ApiResponse<any>[] = [
    {
        success: true,
        data: { message: "Hello, World!" },
        message: "正常に処理されました",
        metadata: {
            requestId: "req-123",
            timestamp: new Date().toISOString(),
            version: "v1.0"
        }
    },
    {
        success: false,
        error: {
            code: "VALIDATION_ERROR",
            message: "入力値が無効です",
            details: { field: "email", reason: "invalid_format" }
        },
        metadata: {
            requestId: "req-124",
            timestamp: new Date().toISOString(),
            version: "v1.0"
        }
    }
];

responses.forEach((response, index) => {
    console.log(`\nレスポンス ${index + 1}:`);
    if (isApiSuccess(response)) {
        console.log(`✅ 成功: ${response.message}`);
        console.log(`データ:`, response.data);
    } else {
        console.log(`❌ エラー: ${response.error.message} (${response.error.code})`);
        if (response.error.details) {
            console.log(`詳細:`, response.error.details);
        }
    }
    console.log(`リクエストID: ${response.metadata.requestId}`);
});

// 決済処理の例
console.log("\n💳 決済処理:");

const paymentMethods: PaymentMethod[] = [
    {
        method: "credit_card",
        cardNumber: "1234567812345678",
        expiryMonth: 12,
        expiryYear: 2028,
        cvv: "123",
        holderName: "TARO YAMADA"
    },
    {
        method: "digital_wallet",
        provider: "apple_pay",
        walletId: "wallet-123456",
        biometricAuth: true
    },
    {
        method: "cryptocurrency",
        currency: "bitcoin",
        walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        amount: 0.001,
        networkFee: 500
    }
];

paymentMethods.forEach(async (payment, index) => {
    console.log(`\n決済 ${index + 1}:`);
    const result = await processPayment(payment, 15000);
    if (result.success) {
        console.log(`✅ 決済成功 - トランザクションID: ${result.transactionId}`);
    } else {
        console.log(`❌ 決済失敗: ${result.error}`);
    }
});

// フォームバリデーションの例
console.log("\n📝 フォームバリデーション:");

const formFields: { config: FormFieldConfig; value: any; label: string }[] = [
    {
        config: { type: "email", maxLength: 100 },
        value: "user@example.com",
        label: "メールアドレス"
    },
    {
        config: { type: "number", min: 0, max: 150 },
        value: 25,
        label: "年齢"
    },
    {
        config: { 
            type: "select", 
            options: [
                { value: "javascript", label: "JavaScript" },
                { value: "typescript", label: "TypeScript" },
                { value: "python", label: "Python" }
            ]
        },
        value: "typescript",
        label: "好きなプログラミング言語"
    }
];

formFields.forEach(({ config, value, label }) => {
    const validation = validateFormField(config, value);
    console.log(`\n${label}: ${JSON.stringify(value)}`);
    console.log(`バリデーション: ${validation.valid ? "✅ 有効" : "❌ 無効"}`);
    if (!validation.valid) {
        validation.errors.forEach(error => console.log(`  - ${error}`));
    }
});

// テーマ切り替えの例
console.log("\n🎨 テーマ設定:");
const themes: Theme[] = ["light", "dark", "auto"];
themes.forEach(theme => {
    console.log(`テーマ: ${theme}`);
    switch (theme) {
        case "light":
            console.log("  ライトモードを適用");
            break;
        case "dark":
            console.log("  ダークモードを適用");
            break;
        case "auto":
            console.log("  システム設定に従います");
            break;
    }
});

export {
    Theme,
    Status,
    HttpMethod,
    LogLevel,
    HttpStatusCode,
    AsyncState,
    Notification,
    ApiResponse,
    PaymentMethod,
    FormFieldConfig,
    isLoadingState,
    isSuccessState,
    isErrorState,
    isApiSuccess,
    getStateMessage,
    sendNotification,
    processPayment,
    validateFormField
};