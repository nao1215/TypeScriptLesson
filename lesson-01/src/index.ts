/**
 * Lesson 01: TypeScriptの基本構文 - 実用的なコード集
 * 
 * このファイルは各種TypeScript機能の使用例を示すメインファイルです。
 * 他のファイルとあわせて読むことで、TypeScriptの基本を理解できます。
 */

// 他のファイルから関数をインポート
import { isValidEmail, calculateTax, formatNumber } from './functions';
import { userProfile, productCatalog } from './objects';
import { tasks, customers } from './arrays';

console.log('🚀 TypeScript Lesson 01 - 実用的なコード例');
console.log('=' .repeat(50));

// ===== 基本的なTypeScript機能の統合例 =====

/**
 * Eコマースシステムのメイン処理
 */
function processEcommerceOrder(): void {
    console.log('\n📱 Eコマース注文処理システム');
    
    // 顧客情報の検証
    const customerEmail: string = "customer@example.com";
    const isValidCustomer: boolean = isValidEmail(customerEmail);
    
    console.log(`顧客メール: ${customerEmail}`);
    console.log(`メール有効性: ${isValidCustomer ? "✅ 有効" : "❌ 無効"}`);
    
    if (!isValidCustomer) {
        console.log("❌ 注文処理を中止します");
        return;
    }
    
    // 商品情報の取得と表示
    const selectedProduct = productCatalog[0]; // 最初の商品を選択
    const quantity: number = 2;
    
    console.log(`\n選択商品: ${selectedProduct.name}`);
    console.log(`単価: ¥${formatNumber(selectedProduct.price)}`);
    console.log(`数量: ${quantity}個`);
    
    // 価格計算
    const subtotal: number = selectedProduct.price * quantity;
    const tax: number = calculateTax(subtotal);
    const total: number = subtotal + tax;
    
    console.log(`小計: ¥${formatNumber(subtotal)}`);
    console.log(`消費税: ¥${formatNumber(tax)}`);
    console.log(`合計: ¥${formatNumber(total)}`);
    
    // 在庫チェック
    const hasStock: boolean = selectedProduct.stockCount >= quantity;
    console.log(`在庫状況: ${hasStock ? "✅ 在庫あり" : "❌ 在庫不足"}`);
    
    if (hasStock) {
        console.log("✅ 注文処理が完了しました");
    } else {
        console.log("❌ 在庫不足のため注文できません");
    }
}

/**
 * ユーザー管理システムの処理例
 */
function processUserManagement(): void {
    console.log('\n👤 ユーザー管理システム');
    
    // ユーザープロファイルの表示
    console.log(`ユーザーID: ${userProfile.id}`);
    console.log(`名前: ${userProfile.lastName} ${userProfile.firstName}`);
    console.log(`メール: ${userProfile.email}`);
    console.log(`アクティブ: ${userProfile.isActive ? "有効" : "無効"}`);
    console.log(`権限: ${userProfile.roles.join(", ")}`);
    
    // 設定情報の表示
    console.log(`\nユーザー設定:`);
    console.log(`  テーマ: ${userProfile.preferences.theme}`);
    console.log(`  言語: ${userProfile.preferences.language}`);
    console.log(`  通知: ${userProfile.preferences.notifications ? "有効" : "無効"}`);
    
    // 統計情報の表示
    console.log(`\n統計情報:`);
    console.log(`  作成日: ${userProfile.metadata.createdAt}`);
    console.log(`  最終ログイン: ${userProfile.metadata.lastLogin}`);
    console.log(`  ログイン回数: ${userProfile.metadata.loginCount}回`);
}

/**
 * タスク管理システムの処理例
 */
function processTaskManagement(): void {
    console.log('\n📋 タスク管理システム');
    
    // 高優先度タスクの抽出
    const highPriorityTasks = tasks.filter(task => 
        task.priority === "高" || task.priority === "緊急"
    );
    
    console.log(`総タスク数: ${tasks.length}`);
    console.log(`高優先度タスク: ${highPriorityTasks.length}件`);
    
    // 担当者別タスク数の集計
    const tasksByAssignee: Record<string, number> = {};
    tasks.forEach(task => {
        tasksByAssignee[task.assignee] = (tasksByAssignee[task.assignee] || 0) + 1;
    });
    
    console.log('\n担当者別タスク数:');
    Object.entries(tasksByAssignee).forEach(([assignee, count]) => {
        console.log(`  ${assignee}: ${count}件`);
    });
    
    // ステータス別の集計
    const tasksByStatus: Record<string, number> = {};
    tasks.forEach(task => {
        tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
    });
    
    console.log('\nステータス別タスク数:');
    Object.entries(tasksByStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}件`);
    });
}

/**
 * 顧客分析システムの処理例
 */
function processCustomerAnalysis(): void {
    console.log('\n📊 顧客分析システム');
    
    // VIP顧客の抽出（10万円以上購入）
    const vipCustomers = customers.filter(customer => customer.totalSpent >= 100000);
    
    console.log(`総顧客数: ${customers.length}`);
    console.log(`VIP顧客数: ${vipCustomers.length}`);
    
    // 平均統計の計算
    const avgSpent: number = customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length;
    const avgOrders: number = customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length;
    
    console.log(`\n顧客統計:`);
    console.log(`  平均購入額: ¥${formatNumber(Math.round(avgSpent))}`);
    console.log(`  平均注文数: ${Math.round(avgOrders)}回`);
    
    // ロイヤルティ層別分析
    const loyaltyStats: Record<string, number> = {};
    customers.forEach(customer => {
        loyaltyStats[customer.loyaltyTier] = (loyaltyStats[customer.loyaltyTier] || 0) + 1;
    });
    
    console.log('\nロイヤルティ層別顧客数:');
    Object.entries(loyaltyStats).forEach(([tier, count]) => {
        console.log(`  ${tier}: ${count}人`);
    });
}

/**
 * メイン処理の実行
 */
function main(): void {
    try {
        processEcommerceOrder();
        processUserManagement();
        processTaskManagement();
        processCustomerAnalysis();
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 全ての処理が正常に完了しました！');
        console.log('\n💡 学習のポイント:');
        console.log('  - 型注釈により安全で読みやすいコードが書ける');
        console.log('  - 関数の引数と戻り値の型を明示することでバグを防げる');
        console.log('  - オブジェクトや配列の構造を型で定義することで保守性が向上');
        console.log('  - 実際のアプリケーションでは複数のデータ型を組み合わせる');
        
    } catch (error) {
        console.error('❌ 処理中にエラーが発生しました:', error);
    }
}

// ===== 型推論の例 =====

// TypeScriptは明示的な型注釈なしでも型を推論できます
const autoString = "TypeScriptが型を推論"; // string型と推論
const autoNumber = 42; // number型と推論
const autoBoolean = true; // boolean型と推論
const autoArray = [1, 2, 3, 4, 5]; // number[]型と推論

console.log('\n🔍 型推論の例:');
console.log(`文字列: "${autoString}" (型: ${typeof autoString})`);
console.log(`数値: ${autoNumber} (型: ${typeof autoNumber})`);
console.log(`真偽値: ${autoBoolean} (型: ${typeof autoBoolean})`);
console.log(`配列: [${autoArray.join(', ')}] (型: ${typeof autoArray})`);

// ===== エラー例（コメントアウト） =====

// 以下のコードはTypeScriptのコンパイル時にエラーになります
// const wrongAssignment: string = 123;  // ❌ number型をstring型に代入不可
// const wrongFunction = add("hello", "world");  // ❌ string型をnumber型の引数に渡せない
// const wrongProperty = userProfile.nonExistentProperty;  // ❌ 存在しないプロパティにアクセス不可

// メイン処理の実行
main();