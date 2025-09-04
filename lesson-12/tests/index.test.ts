import { 
    MathOperation, 
    makeDate,
    processValue,
    calculator
} from '../src/index';
import { 
    Comparator,
    sortAscending, 
    sortDescending, 
    getLength, 
    measureTime 
} from '../src/solution';

describe('Lesson 12: 関数の型', () => {
    describe('関数型の基本', () => {
        test('MathOperation型が正しく動作する', () => {
            const add: MathOperation = (x, y) => x + y;
            const multiply: MathOperation = (x, y) => x * y;
            
            expect(add(3, 4)).toBe(7);
            expect(multiply(3, 4)).toBe(12);
        });
    });

    describe('関数のオーバーロード', () => {
        test('makeDate関数が正しく動作する', () => {
            const d1 = makeDate(0);
            expect(d1 instanceof Date).toBe(true);
            expect(d1.getTime()).toBe(0);

            const d2 = makeDate(1, 1, 2023);
            expect(d2 instanceof Date).toBe(true);
            expect(d2.getFullYear()).toBe(2023);
            expect(d2.getMonth()).toBe(1);
            expect(d2.getDate()).toBe(1);
        });
    });

    describe('ジェネリック関数', () => {
        test('processValue関数が正しく動作する', () => {
            const results: any[] = [];
            
            processValue(42, (n) => results.push(n));
            processValue("test", (s) => results.push(s));
            
            expect(results).toEqual([42, "test"]);
        });
    });

    describe('オブジェクト内の関数', () => {
        test('calculator オブジェクトが正しく動作する', () => {
            expect(calculator.add(10, 5)).toBe(15);
            expect(calculator.subtract(10, 5)).toBe(5);
            expect(calculator.multiply(10, 5)).toBe(50);
            expect(calculator.divide(10, 5)).toBe(2);
        });
    });

    describe('演習問題', () => {
        describe('Comparator型とソート関数', () => {
            const ascComparator: Comparator = (a, b) => a - b;
            const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

            test('sortAscending関数が正しく動作する', () => {
                const sorted = sortAscending(numbers, ascComparator);
                expect(sorted).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
                expect(numbers).toEqual([3, 1, 4, 1, 5, 9, 2, 6]);
            });

            test('sortDescending関数が正しく動作する', () => {
                const sorted = sortDescending(numbers, ascComparator);
                expect(sorted).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
                expect(numbers).toEqual([3, 1, 4, 1, 5, 9, 2, 6]);
            });
        });

        describe('getLength関数のオーバーロード', () => {
            test('文字列に対して正しく動作する', () => {
                expect(getLength("hello")).toBe(5);
                expect(getLength("TypeScript")).toBe(10);
                expect(getLength("")).toBe(0);
            });

            test('数値に対して正しく動作する', () => {
                expect(getLength(42)).toBe(42);
                expect(getLength(0)).toBe(0);
                expect(getLength(-10)).toBe(-10);
            });
        });

        describe('measureTime関数', () => {
            test('関数の実行時間を計測できる', () => {
                const slowFunction = () => {
                    let sum = 0;
                    for (let i = 0; i < 1000000; i++) {
                        sum += i;
                    }
                    return sum;
                };

                const { result, time } = measureTime(slowFunction);
                
                expect(result).toBe(499999500000);
                expect(time).toBeGreaterThanOrEqual(0);
                expect(typeof time).toBe('number');
            });

            test('即座に完了する関数も計測できる', () => {
                const { result, time } = measureTime(() => 42);
                
                expect(result).toBe(42);
                expect(time).toBeGreaterThanOrEqual(0);
                expect(typeof time).toBe('number');
            });
        });
    });
});