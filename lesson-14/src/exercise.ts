/**
 * Lesson 14: デフォルト引数 - 演習問題
 * 
 * 以下の関数を実装してください。
 * デフォルト引数を適切に使用してください。
 */

/**
 * 演習1: 税込み価格計算
 * 商品の価格と税率（デフォルト8%）を受け取り、税込み価格を計算する関数を実装してください。
 * 
 * @param price - 商品の価格（税抜き）
 * @param taxRate - 税率（デフォルト: 0.08）
 * @returns 税込み価格（小数点以下切り上げ）
 */
export function calculateTaxIncludedPrice(price: number, taxRate?: number): number {
    // TODO: ここに実装してください
    // ヒント: デフォルト引数を使用し、Math.ceil()で切り上げしてください
}

/**
 * 演習2: 配列のソート
 * 数値配列とソートの方向（デフォルト"asc"）を受け取り、ソートした配列を返す関数を実装してください。
 * 
 * @param numbers - ソート対象の数値配列
 * @param direction - ソートの方向（"asc" | "desc", デフォルト: "asc"）
 * @returns ソートされた新しい配列
 */
export function sortArray(numbers: number[], direction?: "asc" | "desc"): number[] {
    // TODO: ここに実装してください
    // ヒント: [...numbers].sort()で新しい配列を作成してソートしてください
}

/**
 * 演習3: ログ出力
 * ログレベル（デフォルト"info"）とメッセージを受け取り、フォーマットされたログを出力する関数を実装してください。
 * 
 * @param message - ログメッセージ
 * @param level - ログレベル（"debug" | "info" | "warn" | "error", デフォルト: "info"）
 * @returns フォーマットされたログ文字列 "[YYYY-MM-DD HH:MM:SS] [LEVEL] message"
 */
export function log(message: string, level?: "debug" | "info" | "warn" | "error"): string {
    // TODO: ここに実装してください
    // ヒント: new Date().toISOString()を使用してタイムスタンプを作成してください
}

/**
 * 演習4: HTTPリクエスト設定
 * URLと設定オブジェクト（各プロパティにデフォルト値あり）を受け取り、
 * リクエスト設定を返す関数を実装してください。
 * 
 * @param url - リクエストURL
 * @param options - リクエスト設定（デフォルト値あり）
 * @returns 完全なリクエスト設定オブジェクト
 */
interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    timeout?: number;
    headers?: Record<string, string>;
    retries?: number;
}

export function createRequestConfig(
    url: string,
    options?: RequestOptions
): Required<RequestOptions> & { url: string } {
    // TODO: ここに実装してください
    // デフォルト値:
    // - method: "GET"
    // - timeout: 5000
    // - headers: { "Content-Type": "application/json" }
    // - retries: 3
}