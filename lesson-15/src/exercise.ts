/**
 * Lesson 15: 可変長引数 - 演習問題
 * 
 * 以下の関数を実装してください。
 * 可変長引数（Rest Parameters）を適切に使用してください。
 */

/**
 * 演習1: 最長文字列検索
 * 複数の文字列を受け取り、最も長い文字列を返す関数を実装してください。
 * 同じ長さの文字列がある場合は、最初に見つかったものを返してください。
 * 
 * @param strings - 比較対象の文字列群
 * @returns 最も長い文字列（引数がない場合は空文字列）
 */
export function findLongest(...strings: string[]): string {
    // TODO: ここに実装してください
    // ヒント: 配列のreduceメソッドを使用できます
}

/**
 * 演習2: セパレータによる結合
 * 最初の引数をセパレータとし、残りの引数を結合した文字列を返す関数を実装してください。
 * 
 * @param separator - 結合に使用するセパレータ
 * @param values - 結合する文字列群
 * @returns セパレータで結合された文字列
 */
export function joinWithSeparator(separator: string, ...values: string[]): string {
    // TODO: ここに実装してください
    // ヒント: 配列のjoinメソッドを使用できます
}

/**
 * 演習3: 配列の平坦化
 * 複数の配列を受け取り、すべての要素を含む新しい配列を返す関数を実装してください。
 * 
 * @param arrays - 平坦化する配列群
 * @returns すべての要素を含む新しい配列
 */
export function flattenArrays<T>(...arrays: T[][]): T[] {
    // TODO: ここに実装してください
    // ヒント: スプレッド演算子やconcatメソッドを使用できます
}

/**
 * 演習4: 引数マッピング
 * 関数と可変長引数を受け取り、その関数を各引数に適用した結果を配列で返す関数を実装してください。
 * 
 * @param fn - 適用する関数
 * @param args - 関数に渡す引数群
 * @returns 関数適用の結果配列
 */
export function mapArgs<T, U>(fn: (arg: T) => U, ...args: T[]): U[] {
    // TODO: ここに実装してください
    // ヒント: 配列のmapメソッドを使用できます
}

/**
 * 演習5: 統計計算
 * 複数の数値を受け取り、統計情報オブジェクトを返す関数を実装してください。
 * 
 * @param numbers - 統計計算対象の数値群
 * @returns 統計情報（合計、平均、最大値、最小値、個数）
 */
interface Statistics {
    sum: number;
    average: number;
    max: number;
    min: number;
    count: number;
}

export function calculateStatistics(...numbers: number[]): Statistics | null {
    // TODO: ここに実装してください
    // 引数が空の場合はnullを返してください
    // ヒント: Math.max、Math.minを使用できます
}