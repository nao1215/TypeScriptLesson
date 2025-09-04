/**
 * Lesson 14: デフォルト引数 - テストコード
 */

import {
    calculateTaxIncludedPrice,
    sortArray,
    log,
    createRequestConfig
} from '../src/solution';

describe('Lesson 14: デフォルト引数', () => {
    describe('calculateTaxIncludedPrice', () => {
        test('デフォルト税率（8%）で計算される', () => {
            expect(calculateTaxIncludedPrice(1000)).toBe(1080);
        });

        test('指定した税率で計算される', () => {
            expect(calculateTaxIncludedPrice(1000, 0.1)).toBe(1100);
        });

        test('小数点以下は切り上げされる', () => {
            expect(calculateTaxIncludedPrice(999, 0.08)).toBe(1079); // 998.92 → 1079
        });

        test('税率0%の場合', () => {
            expect(calculateTaxIncludedPrice(1000, 0)).toBe(1000);
        });
    });

    describe('sortArray', () => {
        const testArray = [3, 1, 4, 1, 5, 9, 2, 6];

        test('デフォルト（昇順）でソートされる', () => {
            expect(sortArray(testArray)).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
        });

        test('昇順でソートされる', () => {
            expect(sortArray(testArray, "asc")).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
        });

        test('降順でソートされる', () => {
            expect(sortArray(testArray, "desc")).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
        });

        test('元の配列は変更されない', () => {
            const original = [3, 1, 4];
            const sorted = sortArray(original);
            expect(original).toEqual([3, 1, 4]);
            expect(sorted).toEqual([1, 3, 4]);
        });

        test('空の配列も正常に処理される', () => {
            expect(sortArray([])).toEqual([]);
            expect(sortArray([], "desc")).toEqual([]);
        });
    });

    describe('log', () => {
        test('デフォルトレベル（info）でログが作成される', () => {
            const result = log("Test message");
            expect(result).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] \[INFO\] Test message$/);
        });

        test('指定したレベルでログが作成される', () => {
            const result = log("Error occurred", "error");
            expect(result).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] \[ERROR\] Error occurred$/);
        });

        test('各ログレベルが正しく処理される', () => {
            expect(log("Debug", "debug")).toContain("[DEBUG]");
            expect(log("Info", "info")).toContain("[INFO]");
            expect(log("Warning", "warn")).toContain("[WARN]");
            expect(log("Error", "error")).toContain("[ERROR]");
        });

        test('タイムスタンプの形式が正しい', () => {
            const result = log("Test");
            const timestampMatch = result.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
            expect(timestampMatch).toBeTruthy();
            
            if (timestampMatch) {
                const timestamp = timestampMatch[1];
                expect(new Date(timestamp.replace(' ', 'T') + 'Z')).toBeInstanceOf(Date);
            }
        });
    });

    describe('createRequestConfig', () => {
        test('デフォルト設定が適用される', () => {
            const config = createRequestConfig("https://api.example.com/users");
            expect(config).toEqual({
                url: "https://api.example.com/users",
                method: "GET",
                timeout: 5000,
                headers: { "Content-Type": "application/json" },
                retries: 3
            });
        });

        test('部分的な設定が適用される', () => {
            const config = createRequestConfig(
                "https://api.example.com/users",
                { method: "POST", timeout: 10000 }
            );
            expect(config).toEqual({
                url: "https://api.example.com/users",
                method: "POST",
                timeout: 10000,
                headers: { "Content-Type": "application/json" },
                retries: 3
            });
        });

        test('すべての設定が上書きされる', () => {
            const customHeaders = { "Authorization": "Bearer token" };
            const config = createRequestConfig(
                "https://api.example.com/users",
                {
                    method: "PUT",
                    timeout: 15000,
                    headers: customHeaders,
                    retries: 5
                }
            );
            expect(config).toEqual({
                url: "https://api.example.com/users",
                method: "PUT",
                timeout: 15000,
                headers: customHeaders,
                retries: 5
            });
        });

        test('空のオプションでもデフォルト値が適用される', () => {
            const config = createRequestConfig("https://api.example.com/users", {});
            expect(config.method).toBe("GET");
            expect(config.timeout).toBe(5000);
            expect(config.headers).toEqual({ "Content-Type": "application/json" });
            expect(config.retries).toBe(3);
        });
    });
});