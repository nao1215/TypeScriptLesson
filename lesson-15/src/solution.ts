/**
 * Lesson 15: 可変長引数 - 解答例
 */

/**
 * 演習1: 最長文字列検索
 */
export function findLongest(...strings: string[]): string {
    if (strings.length === 0) {
        return "";
    }
    
    return strings.reduce((longest, current) => {
        return current.length > longest.length ? current : longest;
    }, "");
}

/**
 * 演習2: セパレータによる結合
 */
export function joinWithSeparator(separator: string, ...values: string[]): string {
    return values.join(separator);
}

/**
 * 演習3: 配列の平坦化
 */
export function flattenArrays<T>(...arrays: T[][]): T[] {
    return arrays.flat();
    // または以下の方法でも実装可能:
    // return [].concat(...arrays);
    // return arrays.reduce((flattened, array) => [...flattened, ...array], []);
}

/**
 * 演習4: 引数マッピング
 */
export function mapArgs<T, U>(fn: (arg: T) => U, ...args: T[]): U[] {
    return args.map(fn);
}

/**
 * 演習5: 統計計算
 */
interface Statistics {
    sum: number;
    average: number;
    max: number;
    min: number;
    count: number;
}

export function calculateStatistics(...numbers: number[]): Statistics | null {
    if (numbers.length === 0) {
        return null;
    }
    
    const sum = numbers.reduce((total, num) => total + num, 0);
    const average = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    const count = numbers.length;
    
    return {
        sum,
        average,
        max,
        min,
        count
    };
}