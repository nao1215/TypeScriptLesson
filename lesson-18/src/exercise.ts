/**
 * Lesson 18: リテラル型 - 演習問題
 * 
 * 以下のリテラル型と関数を実装してください。
 * リテラル型を適切に使用して型安全なコードを書いてください。
 */

/**
 * 演習1: スケジュール管理システム
 * 曜日を表現するリテラル型を定義し、スケジュール管理関数を実装してください。
 */

// TODO: Weekday 型を定義してください ("monday" | "tuesday" | ... | "sunday")
export type Weekday = // TODO: ここに実装

// TODO: TimeSlot 型を定義してください ("morning" | "afternoon" | "evening")
export type TimeSlot = // TODO: ここに実装

// TODO: ScheduleEntry 型を定義してください
// - day: Weekday
// - timeSlot: TimeSlot
// - activity: string
export type ScheduleEntry = // TODO: ここに実装

/**
 * 指定した曜日が平日かどうかを判定する関数
 * @param day - 判定する曜日
 * @returns 平日の場合true
 */
export function isWeekday(day: Weekday): boolean {
    // TODO: ここに実装してください
    // 月曜日から金曜日までを平日とする
}

/**
 * スケジュールエントリを作成する関数
 * @param day - 曜日
 * @param timeSlot - 時間帯
 * @param activity - 活動内容
 * @returns スケジュールエントリ
 */
export function createScheduleEntry(day: Weekday, timeSlot: TimeSlot, activity: string): ScheduleEntry {
    // TODO: ここに実装してください
}

/**
 * 指定した曜日のスケジュールを取得する関数
 * @param schedule - 全スケジュール
 * @param day - 取得したい曜日
 * @returns その曜日のスケジュール配列
 */
export function getScheduleByDay(schedule: ScheduleEntry[], day: Weekday): ScheduleEntry[] {
    // TODO: ここに実装してください
}

/**
 * 演習2: HTTP ステータス管理システム
 * HTTPステータスコードとメッセージの対応システムを実装してください。
 */

// TODO: SuccessStatus 型を定義してください (200 | 201 | 204)
export type SuccessStatus = // TODO: ここに実装

// TODO: ClientErrorStatus 型を定義してください (400 | 401 | 403 | 404)
export type ClientErrorStatus = // TODO: ここに実装

// TODO: ServerErrorStatus 型を定義してください (500 | 502 | 503)
export type ServerErrorStatus = // TODO: ここに実装

// TODO: HttpStatus 型を定義してください（上記3つのユニオン）
export type HttpStatus = // TODO: ここに実装

/**
 * HTTPステータスコードからメッセージを取得する関数
 * @param status - HTTPステータスコード
 * @returns ステータスメッセージ
 */
export function getStatusMessage(status: HttpStatus): string {
    // TODO: ここに実装してください
    // 各ステータスコードに対応するメッセージを返してください
    // 例: 200 -> "OK", 404 -> "Not Found", 500 -> "Internal Server Error"
}

/**
 * ステータスコードの種類を判定する関数
 * @param status - HTTPステータスコード
 * @returns ステータスの種類 ("success" | "client_error" | "server_error")
 */
export function getStatusType(status: HttpStatus): "success" | "client_error" | "server_error" {
    // TODO: ここに実装してください
}

/**
 * 演習3: CSS クラス名生成システム
 * テンプレートリテラル型を使用したCSS クラス名生成システムを実装してください。
 */

// TODO: Size 型を定義してください ("xs" | "sm" | "md" | "lg" | "xl")
export type Size = // TODO: ここに実装

// TODO: Color 型を定義してください ("primary" | "secondary" | "success" | "danger" | "warning")
export type Color = // TODO: ここに実装

// TODO: Component 型を定義してください ("btn" | "card" | "modal" | "alert")
export type Component = // TODO: ここに実装

// TODO: ButtonClass 型をテンプレートリテラル型で定義してください
// 形式: "btn-{size}-{color}" (例: "btn-md-primary")
export type ButtonClass = // TODO: ここに実装

// TODO: StateModifier 型を定義してください ("hover" | "active" | "disabled" | "focus")
export type StateModifier = // TODO: ここに実装

// TODO: ModifiedButtonClass 型をテンプレートリテラル型で定義してください
// 形式: "{ButtonClass}-{StateModifier}" (例: "btn-md-primary-hover")
export type ModifiedButtonClass = // TODO: ここに実装

/**
 * ボタンのクラス名を生成する関数
 * @param size - サイズ
 * @param color - カラー
 * @returns ボタンクラス名
 */
export function createButtonClass(size: Size, color: Color): ButtonClass {
    // TODO: ここに実装してください
}

/**
 * 状態付きボタンのクラス名を生成する関数
 * @param buttonClass - ベースのボタンクラス
 * @param modifier - 状態修飾子
 * @returns 修飾されたボタンクラス名
 */
export function addStateModifier(buttonClass: ButtonClass, modifier: StateModifier): ModifiedButtonClass {
    // TODO: ここに実装してください
}

/**
 * 演習4: 設定管理システム
 * リテラル型を使用した型安全な設定管理システムを実装してください。
 */

// TODO: Environment 型を定義してください ("development" | "staging" | "production")
export type Environment = // TODO: ここに実装

// TODO: LogLevel 型を定義してください ("debug" | "info" | "warn" | "error")
export type LogLevel = // TODO: ここに実装

// TODO: DatabaseConfig 型を定義してください
// - host: string
// - port: 5432 | 3306 | 27017 (リテラル型)
// - ssl: boolean
export type DatabaseConfig = // TODO: ここに実装

// TODO: AppConfig 型を定義してください
// - environment: Environment
// - logLevel: LogLevel  
// - database: DatabaseConfig
// - features: { readonly feature1: true } | { readonly feature1: false }
export type AppConfig = // TODO: ここに実装

/**
 * 開発環境の設定を作成する関数
 * @returns 開発環境用の設定
 */
export function createDevelopmentConfig(): AppConfig {
    // TODO: ここに実装してください
    // development環境用の設定を返してください
    // logLevel: "debug", port: 5432, ssl: false, feature1: true
}

/**
 * 本番環境の設定を作成する関数
 * @returns 本番環境用の設定
 */
export function createProductionConfig(): AppConfig {
    // TODO: ここに実装してください
    // production環境用の設定を返してください  
    // logLevel: "error", port: 5432, ssl: true, feature1: false
}

/**
 * 環境に応じてログレベルを調整する関数
 * @param config - 現在の設定
 * @param environment - 新しい環境
 * @returns 更新された設定
 */
export function adjustConfigForEnvironment(config: AppConfig, environment: Environment): AppConfig {
    // TODO: ここに実装してください
    // 環境に応じて適切なlogLevelを設定してください
    // development -> "debug", staging -> "info", production -> "error"
}