/**
 * Lesson 14: デフォルト引数 - 解答例
 */

/**
 * 演習1: 税込み価格計算
 */
export function calculateTaxIncludedPrice(price: number, taxRate: number = 0.08): number {
    const taxIncludedPrice = price * (1 + taxRate);
    return Math.ceil(taxIncludedPrice);
}

/**
 * 演習2: 配列のソート
 */
export function sortArray(numbers: number[], direction: "asc" | "desc" = "asc"): number[] {
    return [...numbers].sort((a, b) => {
        if (direction === "asc") {
            return a - b;
        } else {
            return b - a;
        }
    });
}

/**
 * 演習3: ログ出力
 */
export function log(message: string, level: "debug" | "info" | "warn" | "error" = "info"): string {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const levelUpper = level.toUpperCase();
    return `[${timestamp}] [${levelUpper}] ${message}`;
}

/**
 * 演習4: HTTPリクエスト設定
 */
interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    timeout?: number;
    headers?: Record<string, string>;
    retries?: number;
}

export function createRequestConfig(
    url: string,
    {
        method = "GET",
        timeout = 5000,
        headers = { "Content-Type": "application/json" },
        retries = 3
    }: RequestOptions = {}
): Required<RequestOptions> & { url: string } {
    return {
        url,
        method,
        timeout,
        headers,
        retries
    };
}