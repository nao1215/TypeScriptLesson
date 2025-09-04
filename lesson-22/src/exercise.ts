/**
 * Lesson 22: クラスの基礎演習問題
 * 
 * 各問題を解いて、クラスの理解を深めましょう。
 * TODO コメントを削除して、実装を完成させてください。
 */

// 演習1: 図書館の本管理システム
console.log("=== 演習1: 図書館の本管理システム ===");

class Book {
    // TODO: 以下のプロパティを定義してください
    // - readonly id: number
    // - title: string
    // - author: string
    // - isbn: string
    // - private _isAvailable: boolean (デフォルト: true)
    // - private _borrower?: string
    // - private _borrowDate?: Date
    // - private _dueDate?: Date

    constructor(id: number, title: string, author: string, isbn: string) {
        // TODO: プロパティの初期化
    }

    // TODO: getter メソッドを実装
    get isAvailable(): boolean {
        // TODO: 実装
        return false;
    }

    get borrower(): string | undefined {
        // TODO: 実装
        return undefined;
    }

    get dueDate(): Date | undefined {
        // TODO: 実装
        return undefined;
    }

    // TODO: 本を借りるメソッド
    borrow(borrowerName: string, days: number = 14): boolean {
        // TODO: 実装
        // - 既に貸出中の場合はfalseを返す
        // - 借り手、貸出日、返却予定日を設定
        // - _isAvailableをfalseに設定
        // - trueを返す
        return false;
    }

    // TODO: 本を返すメソッド
    return(): boolean {
        // TODO: 実装
        // - 貸出中でない場合はfalseを返す
        // - 借り手、貸出日、返却予定日をクリア
        // - _isAvailableをtrueに設定
        // - trueを返す
        return false;
    }

    // TODO: 本の情報を文字列で返すメソッド
    getInfo(): string {
        // TODO: 実装
        return "";
    }

    // TODO: 静的メソッド - ISBNの検証
    static validateISBN(isbn: string): boolean {
        // TODO: ISBN-10またはISBN-13の形式をチェック
        // 簡単な形式チェックでOK
        return false;
    }
}

// TODO: テスト用のサンプルを作成して動作確認


// 演習2: ゲーム用のCharacterクラス
console.log("\n=== 演習2: ゲーム用のCharacterクラス ===");

class GameCharacter {
    // TODO: 以下のプロパティを定義
    // - readonly name: string
    // - private _level: number (初期値: 1)
    // - private _experience: number (初期値: 0)
    // - private _health: number
    // - private _maxHealth: number
    // - private _mana: number
    // - private _maxMana: number
    // - private _stats: { strength: number, intelligence: number, agility: number }

    constructor(name: string, characterClass: 'warrior' | 'mage' | 'rogue') {
        // TODO: 実装
        // - キャラクタークラスに応じて初期ステータスを設定
        // - warrior: HP高、STR高
        // - mage: MP高、INT高 
        // - rogue: AGI高、バランス型
    }

    // TODO: getter/setter メソッド
    get level(): number {
        return 0;
    }

    get experience(): number {
        return 0;
    }

    get health(): number {
        return 0;
    }

    get maxHealth(): number {
        return 0;
    }

    get mana(): number {
        return 0;
    }

    get maxMana(): number {
        return 0;
    }

    get stats() {
        return { strength: 0, intelligence: 0, agility: 0 };
    }

    // TODO: 経験値獲得とレベルアップ
    gainExperience(amount: number): boolean {
        // TODO: 実装
        // - 経験値を加算
        // - レベルアップ条件をチェック（例: level * 100）
        // - レベルアップした場合、ステータス上昇
        return false;
    }

    // TODO: ダメージを受ける
    takeDamage(damage: number): boolean {
        // TODO: 実装
        // - HPを減算
        // - 0以下になったら0に設定
        // - 死亡判定を返す（HP <= 0）
        return false;
    }

    // TODO: 回復
    heal(amount: number): void {
        // TODO: 実装
        // - HPを回復（最大値を超えない）
    }

    // TODO: マナ消費
    useMana(amount: number): boolean {
        // TODO: 実装
        // - マナが足りない場合はfalse
        // - マナを消費してtrue
        return false;
    }

    // TODO: マナ回復
    restoreMana(amount: number): void {
        // TODO: 実装
    }

    // TODO: キャラクター情報表示
    getCharacterInfo(): string {
        // TODO: 実装
        return "";
    }

    // TODO: 静的メソッド - レベルアップに必要な経験値計算
    static getRequiredExperience(level: number): number {
        // TODO: 実装
        return 0;
    }
}

// TODO: 異なるクラスのキャラクターを作成してテスト


// 演習3: ショッピングカートシステム
console.log("\n=== 演習3: ショッピングカートシステム ===");

class ShoppingItem {
    // TODO: プロパティ定義
    // - readonly id: number
    // - name: string
    // - price: number
    // - category: string
    // - private _stock: number

    constructor(id: number, name: string, price: number, category: string, stock: number) {
        // TODO: 実装
    }

    // TODO: getter/setter
    get stock(): number {
        return 0;
    }

    // TODO: 在庫減少
    reduceStock(quantity: number): boolean {
        // TODO: 在庫チェックと減少処理
        return false;
    }

    // TODO: 在庫増加
    addStock(quantity: number): void {
        // TODO: 実装
    }

    // TODO: 商品情報
    getItemInfo(): string {
        return "";
    }
}

class CartItem {
    constructor(
        public item: ShoppingItem,
        private _quantity: number
    ) {
        // TODO: 数量検証
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        // TODO: 数量検証と設定
    }

    get totalPrice(): number {
        // TODO: 実装
        return 0;
    }
}

class ShoppingCart {
    private items: CartItem[] = [];
    private _discount: number = 0;

    // TODO: アイテム追加
    addItem(item: ShoppingItem, quantity: number): boolean {
        // TODO: 実装
        return false;
    }

    // TODO: アイテム削除
    removeItem(itemId: number): boolean {
        return false;
    }

    // TODO: 数量変更
    updateQuantity(itemId: number, quantity: number): boolean {
        return false;
    }

    // TODO: 小計
    get subtotal(): number {
        return 0;
    }

    // TODO: 割引設定/取得
    set discount(value: number) {
        // 0-100%の範囲チェック
    }

    get discount(): number {
        return this._discount;
    }

    // TODO: 合計金額（割引適用後）
    get total(): number {
        return 0;
    }

    // TODO: カート内容表示
    displayCart(): void {
        // TODO: 実装
    }

    // TODO: カートクリア
    clear(): void {
        this.items = [];
    }
}

// TODO: ショッピングシステムのテスト


// 演習4: 温度変換器クラス
console.log("\n=== 演習4: 温度変換器クラス ===");

class Temperature {
    private _celsius: number;

    constructor(temperature: number, unit: 'C' | 'F' | 'K' = 'C') {
        // TODO: 単位に応じてセルシウス温度に変換して保存
    }

    // TODO: セルシウス温度取得
    get celsius(): number {
        return this._celsius;
    }

    // TODO: セルシウス温度設定
    set celsius(value: number) {
        // TODO: 絶対零度チェック
    }

    // TODO: 華氏温度取得
    get fahrenheit(): number {
        return 0;
    }

    // TODO: 華氏温度設定
    set fahrenheit(value: number) {
        // TODO: 実装
    }

    // TODO: ケルビン温度取得
    get kelvin(): number {
        return 0;
    }

    // TODO: ケルビン温度設定
    set kelvin(value: number) {
        // TODO: 実装
    }

    // TODO: 温度比較
    isHotterThan(other: Temperature): boolean {
        return false;
    }

    isCoolerThan(other: Temperature): boolean {
        return false;
    }

    equals(other: Temperature): boolean {
        return false;
    }

    // TODO: 温度情報表示
    toString(): string {
        return "";
    }

    // TODO: 静的変換メソッド
    static celsiusToFahrenheit(celsius: number): number {
        return 0;
    }

    static fahrenheitToCelsius(fahrenheit: number): number {
        return 0;
    }

    static celsiusToKelvin(celsius: number): number {
        return 0;
    }

    static kelvinToCelsius(kelvin: number): number {
        return 0;
    }

    // TODO: 静的定数
    static readonly ABSOLUTE_ZERO_CELSIUS: number = -273.15;
    static readonly WATER_FREEZING_CELSIUS: number = 0;
    static readonly WATER_BOILING_CELSIUS: number = 100;
}

// TODO: 温度変換システムのテスト

console.log("\n=== 演習問題完了 ===");
console.log("solution.ts で解答例を確認してください。");