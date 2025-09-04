/**
 * Lesson 19: ユニオン型 - 演習問題
 * 
 * 以下のユニオン型と関数を実装してください。
 * ユニオン型と型ガードを適切に使用してください。
 */

/**
 * 演習1: APIレスポンス処理システム
 * APIレスポンスのユニオン型を定義し、成功・失敗を処理するシステムを実装してください。
 */

// TODO: ApiResult 型を定義してください
// 成功: { success: true, data: T }
// 失敗: { success: false, error: string, statusCode: number }
export type ApiResult<T> = // TODO: ここに実装

/**
 * APIレスポンスが成功かどうかを判定する型ガード
 * @param result - APIレスポンス
 * @returns 成功の場合true
 */
export function isSuccess<T>(result: ApiResult<T>): result is { success: true; data: T } {
    // TODO: ここに実装してください
}

/**
 * APIレスポンスを処理し、成功時はデータを、失敗時はnullを返す関数
 * @param result - APIレスポンス
 * @returns データまたはnull
 */
export function extractData<T>(result: ApiResult<T>): T | null {
    // TODO: ここに実装してください
    // 成功時はデータを、失敗時はnullを返してください
}

/**
 * APIレスポンスからエラーメッセージを取得する関数
 * @param result - APIレスポンス
 * @returns エラーメッセージまたはnull
 */
export function getErrorMessage<T>(result: ApiResult<T>): string | null {
    // TODO: ここに実装してください
}

/**
 * 演習2: 図形面積計算システム
 * 異なる図形を表現する判別ユニオンを定義し、面積計算システムを実装してください。
 */

// TODO: 以下のインターフェースを定義してください
// Square: { type: "square", side: number }
// Circle: { type: "circle", radius: number }
// Rectangle: { type: "rectangle", width: number, height: number }
export interface Square {
    // TODO: ここに実装
}

export interface Circle {
    // TODO: ここに実装
}

export interface Rectangle {
    // TODO: ここに実装
}

// TODO: Shape ユニオン型を定義してください
export type Shape = // TODO: ここに実装

/**
 * 図形の面積を計算する関数
 * @param shape - 図形
 * @returns 面積
 */
export function calculateArea(shape: Shape): number {
    // TODO: ここに実装してください
    // switch文を使用してtypeによって処理を分岐してください
}

/**
 * 図形の種類と面積を含む文字列を生成する関数
 * @param shape - 図形
 * @returns 説明文字列
 */
export function describeShape(shape: Shape): string {
    // TODO: ここに実装してください
    // 例: "Square with side 5: Area = 25"
    // 例: "Circle with radius 3: Area = 28.27"
}

/**
 * 演習3: イベント処理システム
 * ユニオン型を活用したイベント処理システムを実装してください。
 */

// TODO: 以下のイベント型を定義してください
// ClickEvent: { type: "click", element: string, position: { x: number, y: number } }
// KeyEvent: { type: "key", key: string, isPressed: boolean }
// NetworkEvent: { type: "network", url: string, status: "pending" | "success" | "error" }
export interface ClickEvent {
    // TODO: ここに実装
}

export interface KeyEvent {
    // TODO: ここに実装
}

export interface NetworkEvent {
    // TODO: ここに実装
}

// TODO: AppEvent ユニオン型を定義してください
export type AppEvent = // TODO: ここに実装

/**
 * イベントを処理してログ文字列を生成する関数
 * @param event - イベント
 * @returns ログ文字列
 */
export function processEvent(event: AppEvent): string {
    // TODO: ここに実装してください
    // 例: "Click on button at (100, 200)"
    // 例: "Key 'Enter' pressed"
    // 例: "Network request to /api/users: success"
}

/**
 * 特定タイプのイベントかどうかを判定する型ガード関数
 * @param event - イベント
 * @returns クリックイベントの場合true
 */
export function isClickEvent(event: AppEvent): event is ClickEvent {
    // TODO: ここに実装してください
}

/**
 * 演習4: データ変換システム
 * 複雑なデータ構造のユニオン型を使用したデータ変換システムを実装してください。
 */

// TODO: 以下のデータ型を定義してください
// TextData: { format: "text", content: string, encoding?: "utf-8" | "ascii" }
// JsonData: { format: "json", data: object, schema?: string }
// BinaryData: { format: "binary", buffer: ArrayBuffer, mimeType?: string }
export interface TextData {
    // TODO: ここに実装
}

export interface JsonData {
    // TODO: ここに実装
}

export interface BinaryData {
    // TODO: ここに実装
}

// TODO: DataFormat ユニオン型を定義してください
export type DataFormat = // TODO: ここに実装

/**
 * データのサイズを計算する関数
 * @param data - データ
 * @returns サイズ（バイト）
 */
export function getDataSize(data: DataFormat): number {
    // TODO: ここに実装してください
    // text: contentの文字数
    // json: JSON.stringifyしたサイズ
    // binary: ArrayBufferのサイズ
}

/**
 * データを文字列に変換する関数
 * @param data - データ
 * @returns 文字列表現
 */
export function serializeData(data: DataFormat): string {
    // TODO: ここに実装してください
    // text: そのままのcontent
    // json: JSON.stringifyした結果
    // binary: "[Binary data: {mimeType}, {size} bytes]"
}

/**
 * データのメタ情報を取得する関数
 * @param data - データ
 * @returns メタ情報
 */
export function getDataMetadata(data: DataFormat): {
    format: string;
    size: number;
    additionalInfo?: string;
} {
    // TODO: ここに実装してください
    // text: encoding情報
    // json: schema情報
    // binary: mimeType情報
}