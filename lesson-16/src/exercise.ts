/**
 * Lesson 16: オブジェクト型 - 演習問題
 * 
 * 以下の関数とインターフェースを実装してください。
 * オブジェクト型を適切に使用してください。
 */

/**
 * 演習1: 書籍管理システム
 * 書籍情報を表すインターフェースと、書籍を管理する関数を実装してください。
 */

// TODO: Book インターフェースを定義してください
// - id (number, 必須)
// - title (string, 必須)
// - author (string, 必須)
// - publishedYear (number, 必須)
// - isbn (string, オプショナル)
// - genre (string, オプショナル)
// - isAvailable (boolean, 必須)
export interface Book {
    // ここに実装してください
}

/**
 * 書籍の配列から、利用可能な書籍のみを返す関数
 * @param books - 書籍の配列
 * @returns 利用可能な書籍の配列
 */
export function getAvailableBooks(books: Book[]): Book[] {
    // TODO: ここに実装してください
}

/**
 * 指定した著者の書籍を検索する関数
 * @param books - 書籍の配列
 * @param author - 検索する著者名
 * @returns 該当する書籍の配列
 */
export function findBooksByAuthor(books: Book[], author: string): Book[] {
    // TODO: ここに実装してください
}

/**
 * 演習2: アプリケーション設定管理
 * 設定オブジェクト（一部プロパティは読み取り専用）を操作する関数を実装してください。
 */

// TODO: AppSettings インターフェースを定義してください
// - appName (string, 読み取り専用)
// - version (string, 読み取り専用)
// - apiEndpoint (string, 読み取り専用)
// - timeout (number, 変更可能)
// - retryCount (number, 変更可能)
// - enableLogging (boolean, 変更可能)
// - theme (string, オプショナル、変更可能)
export interface AppSettings {
    // ここに実装してください
}

/**
 * デフォルト設定を作成する関数
 * @returns デフォルトのAppSettings
 */
export function createDefaultSettings(): AppSettings {
    // TODO: ここに実装してください
    // デフォルト値:
    // - appName: "MyApp"
    // - version: "1.0.0"
    // - apiEndpoint: "https://api.example.com"
    // - timeout: 5000
    // - retryCount: 3
    // - enableLogging: true
}

/**
 * 設定を更新する関数（読み取り専用プロパティは変更しない）
 * @param settings - 現在の設定
 * @param updates - 更新する設定（部分的）
 * @returns 更新された設定
 */
export function updateSettings(
    settings: AppSettings,
    updates: Partial<Pick<AppSettings, 'timeout' | 'retryCount' | 'enableLogging' | 'theme'>>
): AppSettings {
    // TODO: ここに実装してください
}

/**
 * 演習3: 辞書型オブジェクト操作
 * インデックスシグネチャを使用した辞書型オブジェクトを操作する関数を実装してください。
 */

// TODO: Dictionary インターフェースを定義してください（文字列キーと文字列値）
export interface Dictionary {
    // ここに実装してください
}

/**
 * 辞書に新しいキーと値のペアを追加する関数
 * @param dict - 辞書オブジェクト
 * @param key - 追加するキー
 * @param value - 追加する値
 * @returns 更新された辞書（新しいオブジェクト）
 */
export function addToDictionary(dict: Dictionary, key: string, value: string): Dictionary {
    // TODO: ここに実装してください
}

/**
 * 辞書のすべてのキーを取得する関数
 * @param dict - 辞書オブジェクト
 * @returns キーの配列
 */
export function getDictionaryKeys(dict: Dictionary): string[] {
    // TODO: ここに実装してください
}

/**
 * 辞書の値を検索する関数
 * @param dict - 辞書オブジェクト
 * @param searchValue - 検索する値
 * @returns 該当するキーの配列
 */
export function findKeysByValue(dict: Dictionary, searchValue: string): string[] {
    // TODO: ここに実装してください
}

/**
 * 演習4: ネストした型を持つ複雑なオブジェクト
 * 複雑なネスト構造を持つオブジェクトを処理する関数を実装してください。
 */

// TODO: 必要なインターフェースを定義してください
// Company:
// - name (string, 必須)
// - founded (number, 必須)
// - address (Address型, 必須)
// - departments (Department型の配列, 必須)

// Department:
// - name (string, 必須)
// - manager (Employee型, 必須)
// - employees (Employee型の配列, 必須)
// - budget (number, オプショナル)

// Employee:
// - id (number, 必須)
// - name (string, 必須)
// - position (string, 必須)
// - salary (number, 必須)
// - email (string, オプショナル)

// Address:
// - street (string, 必須)
// - city (string, 必須)
// - country (string, 必須)
// - zipCode (string, オプショナル)

export interface Address {
    // ここに実装してください
}

export interface Employee {
    // ここに実装してください
}

export interface Department {
    // ここに実装してください
}

export interface Company {
    // ここに実装してください
}

/**
 * 会社の全従業員数を計算する関数
 * @param company - 会社オブジェクト
 * @returns 全従業員数
 */
export function getTotalEmployeeCount(company: Company): number {
    // TODO: ここに実装してください
}

/**
 * 指定された部署を検索する関数
 * @param company - 会社オブジェクト
 * @param departmentName - 部署名
 * @returns 該当する部署（見つからない場合はundefined）
 */
export function findDepartmentByName(company: Company, departmentName: string): Department | undefined {
    // TODO: ここに実装してください
}

/**
 * 会社の全従業員の平均給与を計算する関数
 * @param company - 会社オブジェクト
 * @returns 平均給与
 */
export function getAverageSalary(company: Company): number {
    // TODO: ここに実装してください
}