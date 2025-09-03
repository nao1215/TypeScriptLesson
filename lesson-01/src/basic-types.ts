/**
 * Lesson 01: 基本型を使った実用的なプログラム
 * 
 * 実際のアプリケーションで使用される基本型の使い方を示すコードです。
 */

// ===== ユーザー情報管理システム =====

// ユーザーの基本情報
const userId: number = 12345;
const userName: string = "田中太郎";
const userEmail: string = "tanaka@example.com";
const isActive: boolean = true;
const lastLoginDate: string = "2024-01-15";

// ユーザー設定
const notificationEnabled: boolean = true;
const theme: string = "dark";
const language: string = "ja";

// システム情報
const version: string = "1.2.3";
const buildNumber: number = 456;
const debugMode: boolean = false;

console.log("=== ユーザー情報管理システム ===");
console.log(`ユーザーID: ${userId}`);
console.log(`名前: ${userName}`);
console.log(`メール: ${userEmail}`);
console.log(`アクティブ: ${isActive ? "有効" : "無効"}`);
console.log(`最終ログイン: ${lastLoginDate}`);
console.log(`通知: ${notificationEnabled ? "有効" : "無効"}`);
console.log(`テーマ: ${theme}`);
console.log(`システムバージョン: ${version} (Build ${buildNumber})`);

// ===== 商品在庫管理システム =====

const productId: number = 54321;
const productName: string = "MacBook Pro 14インチ";
const price: number = 248000;
const inStock: boolean = true;
const stockCount: number = 25;
const weight: number = 1.6; // kg
const warranty: number = 12; // 月

// 計算された値
const tax: number = 0.1;
const priceWithTax: number = price * (1 + tax);
const totalValue: number = price * stockCount;

console.log("\n=== 商品在庫管理システム ===");
console.log(`商品ID: ${productId}`);
console.log(`商品名: ${productName}`);
console.log(`価格: ¥${price.toLocaleString()}`);
console.log(`税込価格: ¥${Math.floor(priceWithTax).toLocaleString()}`);
console.log(`在庫状況: ${inStock ? "在庫あり" : "在庫なし"}`);
console.log(`在庫数: ${stockCount}台`);
console.log(`総在庫価値: ¥${totalValue.toLocaleString()}`);
console.log(`重量: ${weight}kg`);
console.log(`保証期間: ${warranty}ヶ月`);

// ===== ログシステム =====

const logLevel: string = "INFO";
const timestamp: string = new Date().toISOString();
const logMessage: string = "システム起動完了";
const errorCode: number = 0;
const success: boolean = errorCode === 0;

console.log("\n=== ログシステム ===");
console.log(`[${timestamp}] ${logLevel}: ${logMessage}`);
console.log(`エラーコード: ${errorCode}`);
console.log(`ステータス: ${success ? "成功" : "失敗"}`);

// ===== 設定値の計算例 =====

// サーバー設定
const maxConnections: number = 1000;
const timeoutSeconds: number = 30;
const retryCount: number = 3;
const enableSsl: boolean = true;
const serverName: string = "api-server-01";

// 計算
const timeoutMs: number = timeoutSeconds * 1000;
const totalRetryTime: number = timeoutSeconds * retryCount;

console.log("\n=== サーバー設定 ===");
console.log(`サーバー名: ${serverName}`);
console.log(`最大接続数: ${maxConnections}`);
console.log(`タイムアウト: ${timeoutSeconds}秒 (${timeoutMs}ms)`);
console.log(`リトライ回数: ${retryCount}回`);
console.log(`最大リトライ時間: ${totalRetryTime}秒`);
console.log(`SSL有効: ${enableSsl ? "有効" : "無効"}`);

// ===== 文字列操作の実例 =====

const rawUserInput: string = "  Hello World  ";
const cleanedInput: string = rawUserInput.trim().toLowerCase();
const inputLength: number = cleanedInput.length;
const isValidInput: boolean = inputLength > 0 && inputLength <= 100;

console.log("\n=== 文字列処理 ===");
console.log(`入力値: "${rawUserInput}"`);
console.log(`処理後: "${cleanedInput}"`);
console.log(`文字数: ${inputLength}`);
console.log(`有効な入力: ${isValidInput ? "有効" : "無効"}`);

// ===== 数値計算の実例 =====

const basePrice: number = 1000;
const discountRate: number = 0.15;
const quantity: number = 5;

const discountAmount: number = basePrice * discountRate;
const unitPrice: number = basePrice - discountAmount;
const totalPrice: number = unitPrice * quantity;
const savings: number = discountAmount * quantity;

console.log("\n=== 価格計算システム ===");
console.log(`基本価格: ¥${basePrice}`);
console.log(`割引率: ${discountRate * 100}%`);
console.log(`割引額: ¥${discountAmount}`);
console.log(`単価: ¥${unitPrice}`);
console.log(`数量: ${quantity}個`);
console.log(`合計: ¥${totalPrice}`);
console.log(`節約額: ¥${savings}`);

// 型の確認（開発時のデバッグ用）
console.log("\n=== 型の確認 ===");
console.log(`userId の型: ${typeof userId}`);
console.log(`userName の型: ${typeof userName}`);
console.log(`isActive の型: ${typeof isActive}`);
console.log(`price の型: ${typeof price}`);