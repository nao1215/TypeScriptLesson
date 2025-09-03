import {
    calculateTax,
    calculateTotalPrice,
    calculateAverage,
    findMax,
    findMin,
    addDecimals,
    divide
} from '../src/index';

import {
    calculateCircleArea,
    calculateCompoundInterest,
    convertTemperature,
    generateFibonacci
} from '../src/solution';

describe('Lesson 03: 数値型', () => {
    describe('基本的な数値計算', () => {
        test('消費税計算', () => {
            expect(calculateTax(1000)).toBe(100);
            expect(calculateTax(1000, 0.08)).toBe(80);
        });

        test('合計価格計算', () => {
            expect(calculateTotalPrice(1000)).toBe(1100);
            expect(calculateTotalPrice(1000, 0.08)).toBe(1080);
        });

        test('平均値計算', () => {
            expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
            expect(calculateAverage([])).toBe(0);
            expect(calculateAverage([10])).toBe(10);
        });

        test('最大値・最小値', () => {
            const numbers = [5, 2, 8, 1, 9];
            expect(findMax(numbers)).toBe(9);
            expect(findMin(numbers)).toBe(1);
        });

        test('浮動小数点の精度対応', () => {
            expect(addDecimals(0.1, 0.2)).toBe(0.3);
            expect(addDecimals(0.1, 0.2, 1)).toBe(0.3);
        });

        test('安全な除算', () => {
            expect(divide(10, 2)).toBe(5);
            expect(() => divide(10, 0)).toThrow('0で除算はできません');
        });
    });

    describe('演習問題の解答', () => {
        test('円の面積計算', () => {
            expect(calculateCircleArea(5)).toBeCloseTo(78.54, 2);
            expect(calculateCircleArea(1)).toBeCloseTo(Math.PI, 5);
            expect(() => calculateCircleArea(-1)).toThrow();
        });

        test('複利計算', () => {
            expect(calculateCompoundInterest(100, 0.1, 2)).toBeCloseTo(121, 2);
            expect(calculateCompoundInterest(1000, 0.05, 10)).toBeCloseTo(1628.89, 2);
            expect(() => calculateCompoundInterest(-100, 0.1, 2)).toThrow();
        });

        test('温度変換', () => {
            const result = convertTemperature(0);
            expect(result.fahrenheit).toBe(32);
            expect(result.kelvin).toBe(273.15);

            const result2 = convertTemperature(100);
            expect(result2.fahrenheit).toBe(212);
            expect(result2.kelvin).toBe(373.15);
        });

        test('フィボナッチ数列生成', () => {
            expect(generateFibonacci(0)).toEqual([]);
            expect(generateFibonacci(1)).toEqual([0]);
            expect(generateFibonacci(2)).toEqual([0, 1]);
            expect(generateFibonacci(8)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
        });
    });

    describe('特殊な数値の処理', () => {
        test('無限大の判定', () => {
            expect(Number.isFinite(42)).toBe(true);
            expect(Number.isFinite(Infinity)).toBe(false);
            expect(Number.isFinite(-Infinity)).toBe(false);
        });

        test('NaNの判定', () => {
            expect(Number.isNaN(NaN)).toBe(true);
            expect(Number.isNaN(42)).toBe(false);
            expect(Number.isNaN('not a number' as any)).toBe(false);
        });
    });
});