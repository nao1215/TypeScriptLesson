/**
 * Lesson 01: 関数を使った実用的なプログラム例
 * 
 * 実際のアプリケーションで使用される様々な関数の実装例です。
 */

// ===== ユーザー認証システム =====

/**
 * ユーザーのメールアドレスが有効かどうかをチェックする関数
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
}

/**
 * パスワードの強度をチェックする関数
 */
function checkPasswordStrength(password: string): string {
    if (password.length < 8) return "弱い";
    if (password.length < 12) return "普通";
    if (!/[A-Z]/.test(password)) return "普通";
    if (!/[a-z]/.test(password)) return "普通";
    if (!/[0-9]/.test(password)) return "普通";
    if (!/[!@#$%^&*]/.test(password)) return "普通";
    return "強い";
}

/**
 * ユーザー名を正規化する関数
 */
function normalizeUsername(username: string): string {
    return username.trim().toLowerCase().replace(/\s+/g, "_");
}

// 認証システムのテスト
console.log("=== ユーザー認証システム ===");
const testEmail: string = "user@example.com";
const testPassword: string = "MySecureP@ss123";
const testUsername: string = "  John Doe  ";

console.log(`メール "${testEmail}" は有効: ${isValidEmail(testEmail)}`);
console.log(`パスワード強度: ${checkPasswordStrength(testPassword)}`);
console.log(`正規化されたユーザー名: "${normalizeUsername(testUsername)}"`);

// ===== 計算ユーティリティ関数 =====

/**
 * 消費税を計算する関数
 */
function calculateTax(price: number, taxRate: number = 0.1): number {
    return Math.floor(price * taxRate);
}

/**
 * 割引価格を計算する関数
 */
function calculateDiscount(originalPrice: number, discountPercent: number): number {
    const discountAmount = originalPrice * (discountPercent / 100);
    return originalPrice - discountAmount;
}

/**
 * 送料を計算する関数
 */
function calculateShipping(weight: number, distance: number): number {
    const baseRate = 500;
    const weightMultiplier = Math.ceil(weight / 1000) * 100; // 1kgごとに100円追加
    const distanceMultiplier = distance > 100 ? 300 : 0; // 100km超で300円追加
    return baseRate + weightMultiplier + distanceMultiplier;
}

/**
 * 配送日数を計算する関数
 */
function calculateDeliveryDays(distance: number, isExpress: boolean): number {
    if (isExpress) return distance > 500 ? 2 : 1;
    if (distance <= 50) return 2;
    if (distance <= 200) return 3;
    if (distance <= 500) return 5;
    return 7;
}

// 計算関数のテスト
console.log("\n=== 商品価格計算システム ===");
const itemPrice: number = 15000;
const itemWeight: number = 2500; // グラム
const deliveryDistance: number = 150; // km
const discountRate: number = 20; // %

const tax = calculateTax(itemPrice);
const discountedPrice = calculateDiscount(itemPrice, discountRate);
const shippingCost = calculateShipping(itemWeight, deliveryDistance);
const deliveryDays = calculateDeliveryDays(deliveryDistance, false);

console.log(`商品価格: ¥${itemPrice.toLocaleString()}`);
console.log(`消費税: ¥${tax.toLocaleString()}`);
console.log(`割引価格 (${discountRate}%off): ¥${discountedPrice.toLocaleString()}`);
console.log(`送料: ¥${shippingCost.toLocaleString()}`);
console.log(`お届け日数: ${deliveryDays}日`);

// ===== 文字列処理ユーティリティ =====

/**
 * 文字列を指定した長さで切り詰める関数
 */
function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + "...";
}

/**
 * 単語の頭文字を大文字にする関数（タイトルケース）
 */
function toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * URLスラッグを生成する関数
 */
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 特殊文字を削除
        .replace(/[\s_-]+/g, '-') // スペースとアンダースコアをハイフンに
        .replace(/^-+|-+$/g, ''); // 先頭と末尾のハイフンを削除
}

/**
 * カンマ区切り数値をフォーマットする関数
 */
function formatNumber(num: number): string {
    return num.toLocaleString('ja-JP');
}

// 文字列処理のテスト
console.log("\n=== 文字列処理ユーティリティ ===");
const longTitle: string = "TypeScriptで作る実践的なWebアプリケーション開発入門";
const rawTitle: string = "hello world from typescript!";
const articleTitle: string = "TypeScript & React でSPA開発";
const bigNumber: number = 1234567890;

console.log(`元のタイトル: "${longTitle}"`);
console.log(`切り詰め (20文字): "${truncateString(longTitle, 20)}"`);
console.log(`タイトルケース: "${toTitleCase(rawTitle)}"`);
console.log(`URLスラッグ: "${createSlug(articleTitle)}"`);
console.log(`数値フォーマット: ${formatNumber(bigNumber)}`);

// ===== 日付・時刻処理関数 =====

/**
 * 営業日を計算する関数（土日祝日を除く）
 */
function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        // 土曜日(6)と日曜日(0)を除く
        if (result.getDay() !== 0 && result.getDay() !== 6) {
            addedDays++;
        }
    }
    
    return result;
}

/**
 * 年齢を計算する関数
 */
function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * 期限までの残り時間を計算する関数
 */
function getTimeUntilDeadline(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return "期限切れ";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `あと${days}日${hours}時間`;
    if (hours > 0) return `あと${hours}時間${minutes}分`;
    return `あと${minutes}分`;
}

// 日付処理のテスト
console.log("\n=== 日付・時刻処理システム ===");
const today = new Date();
const deliveryDate = addBusinessDays(today, 3);
const birthDate = new Date('1990-05-15');
const projectDeadline = new Date();
projectDeadline.setDate(today.getDate() + 5);
projectDeadline.setHours(18, 0, 0, 0);

console.log(`本日: ${today.toLocaleDateString('ja-JP')}`);
console.log(`3営業日後の配送予定: ${deliveryDate.toLocaleDateString('ja-JP')}`);
console.log(`生年月日 ${birthDate.toLocaleDateString('ja-JP')} の年齢: ${calculateAge(birthDate)}歳`);
console.log(`プロジェクト期限まで: ${getTimeUntilDeadline(projectDeadline)}`);

// ===== バリデーション関数群 =====

/**
 * 日本の郵便番号をバリデートする関数
 */
function isValidPostalCode(postalCode: string): boolean {
    const postalRegex = /^\d{3}-\d{4}$/;
    return postalRegex.test(postalCode);
}

/**
 * 日本の電話番号をバリデートする関数
 */
function isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^0\d{1,4}-\d{1,4}-\d{3,4}$/;
    return phoneRegex.test(phone);
}

/**
 * クレジットカード番号をバリデートする関数（Luhnアルゴリズム）
 */
function isValidCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s|-/g, '');
    if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
        return false;
    }
    
    // Luhnアルゴリズムによるチェック
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i));
        
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
}

// バリデーションのテスト
console.log("\n=== バリデーションシステム ===");
const testPostal = "123-4567";
const testPhone = "03-1234-5678";
const testCard = "4532-1234-5678-9012";

console.log(`郵便番号 "${testPostal}" は有効: ${isValidPostalCode(testPostal)}`);
console.log(`電話番号 "${testPhone}" は有効: ${isValidPhoneNumber(testPhone)}`);
console.log(`クレジットカード番号は有効: ${isValidCreditCard(testCard)}`);

export { 
    isValidEmail, 
    checkPasswordStrength, 
    calculateTax, 
    calculateDiscount,
    formatNumber,
    addBusinessDays,
    calculateAge
};