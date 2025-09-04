/**
 * Lesson 15: 可変長引数 - テストコード
 */

import {
    findLongest,
    joinWithSeparator,
    flattenArrays,
    mapArgs,
    calculateStatistics
} from '../src/solution';

describe('Lesson 15: 可変長引数', () => {
    describe('findLongest', () => {
        test('最も長い文字列を返す', () => {
            expect(findLongest("a", "hello", "hi", "world")).toBe("hello");
        });

        test('同じ長さの場合は最初の文字列を返す', () => {
            expect(findLongest("abc", "def", "ghi")).toBe("abc");
        });

        test('引数が1つの場合はその文字列を返す', () => {
            expect(findLongest("hello")).toBe("hello");
        });

        test('引数がない場合は空文字列を返す', () => {
            expect(findLongest()).toBe("");
        });

        test('空文字列が含まれていても正しく動作する', () => {
            expect(findLongest("", "a", "bb", "ccc")).toBe("ccc");
        });

        test('すべて空文字列の場合', () => {
            expect(findLongest("", "", "")).toBe("");
        });
    });

    describe('joinWithSeparator', () => {
        test('カンマ区切りで結合される', () => {
            expect(joinWithSeparator(",", "a", "b", "c")).toBe("a,b,c");
        });

        test('異なるセパレータで結合される', () => {
            expect(joinWithSeparator(" - ", "apple", "banana", "cherry")).toBe("apple - banana - cherry");
        });

        test('値が1つの場合はそのまま返される', () => {
            expect(joinWithSeparator(",", "hello")).toBe("hello");
        });

        test('値がない場合は空文字列を返す', () => {
            expect(joinWithSeparator(",")).toBe("");
        });

        test('空のセパレータでも動作する', () => {
            expect(joinWithSeparator("", "a", "b", "c")).toBe("abc");
        });
    });

    describe('flattenArrays', () => {
        test('複数の配列を平坦化する', () => {
            expect(flattenArrays([1, 2], [3, 4], [5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
        });

        test('文字列配列も平坦化できる', () => {
            expect(flattenArrays(["a", "b"], ["c"], ["d", "e", "f"])).toEqual(["a", "b", "c", "d", "e", "f"]);
        });

        test('空の配列が含まれていても正しく動作する', () => {
            expect(flattenArrays([1, 2], [], [3, 4])).toEqual([1, 2, 3, 4]);
        });

        test('配列が1つの場合はそのまま返される', () => {
            expect(flattenArrays([1, 2, 3])).toEqual([1, 2, 3]);
        });

        test('引数がない場合は空配列を返す', () => {
            expect(flattenArrays()).toEqual([]);
        });

        test('すべて空配列の場合は空配列を返す', () => {
            expect(flattenArrays([], [], [])).toEqual([]);
        });
    });

    describe('mapArgs', () => {
        const double = (x: number) => x * 2;
        const toUpperCase = (s: string) => s.toUpperCase();

        test('数値を2倍にする', () => {
            expect(mapArgs(double, 1, 2, 3, 4, 5)).toEqual([2, 4, 6, 8, 10]);
        });

        test('文字列を大文字にする', () => {
            expect(mapArgs(toUpperCase, "hello", "world")).toEqual(["HELLO", "WORLD"]);
        });

        test('引数が1つの場合', () => {
            expect(mapArgs(double, 5)).toEqual([10]);
        });

        test('引数がない場合は空配列を返す', () => {
            expect(mapArgs(double)).toEqual([]);
        });

        test('複雑な関数でも動作する', () => {
            const lengthAndUpper = (s: string) => ({ length: s.length, upper: s.toUpperCase() });
            const result = mapArgs(lengthAndUpper, "hello", "world");
            expect(result).toEqual([
                { length: 5, upper: "HELLO" },
                { length: 5, upper: "WORLD" }
            ]);
        });
    });

    describe('calculateStatistics', () => {
        test('正しい統計情報を返す', () => {
            const result = calculateStatistics(1, 2, 3, 4, 5);
            expect(result).toEqual({
                sum: 15,
                average: 3,
                max: 5,
                min: 1,
                count: 5
            });
        });

        test('単一の数値でも正しく動作する', () => {
            const result = calculateStatistics(42);
            expect(result).toEqual({
                sum: 42,
                average: 42,
                max: 42,
                min: 42,
                count: 1
            });
        });

        test('負の数値も正しく処理される', () => {
            const result = calculateStatistics(-3, -1, 0, 1, 3);
            expect(result).toEqual({
                sum: 0,
                average: 0,
                max: 3,
                min: -3,
                count: 5
            });
        });

        test('小数点を含む数値も正しく処理される', () => {
            const result = calculateStatistics(1.5, 2.5, 3.5);
            expect(result).toEqual({
                sum: 7.5,
                average: 2.5,
                max: 3.5,
                min: 1.5,
                count: 3
            });
        });

        test('引数がない場合はnullを返す', () => {
            expect(calculateStatistics()).toBeNull();
        });

        test('同じ数値が複数ある場合も正しく動作する', () => {
            const result = calculateStatistics(5, 5, 5);
            expect(result).toEqual({
                sum: 15,
                average: 5,
                max: 5,
                min: 5,
                count: 3
            });
        });
    });
});