import { add, multiply, subtract, divide, sayHello, greet, isEven, double, processArray } from '../src/index';
import { max, sumArray, reverseString } from '../src/solution';

describe('Lesson 11: 関数の基礎', () => {
    describe('基本的な関数', () => {
        test('add関数が正しく動作する', () => {
            expect(add(5, 3)).toBe(8);
            expect(add(-1, 1)).toBe(0);
            expect(add(0, 0)).toBe(0);
        });

        test('multiply関数が正しく動作する', () => {
            expect(multiply(4, 7)).toBe(28);
            expect(multiply(3, 0)).toBe(0);
            expect(multiply(-2, 3)).toBe(-6);
        });

        test('subtract関数が正しく動作する', () => {
            expect(subtract(10, 4)).toBe(6);
            expect(subtract(5, 5)).toBe(0);
            expect(subtract(0, 5)).toBe(-5);
        });

        test('divide関数が正しく動作する', () => {
            expect(divide(20, 4)).toBe(5);
            expect(divide(10, 2)).toBe(5);
            expect(divide(7, 2)).toBe(3.5);
        });
    });

    describe('void型の関数', () => {
        test('sayHello関数が正しく動作する', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            sayHello('World');
            expect(consoleSpy).toHaveBeenCalledWith('Hello, World!');
            consoleSpy.mockRestore();
        });
    });

    describe('複数の引数を持つ関数', () => {
        test('greet関数が正しく動作する', () => {
            expect(greet('Bob', 30)).toBe('My name is Bob and I am 30 years old.');
            expect(greet('Alice', 25)).toBe('My name is Alice and I am 25 years old.');
        });
    });

    describe('真偽値を返す関数', () => {
        test('isEven関数が正しく動作する', () => {
            expect(isEven(4)).toBe(true);
            expect(isEven(5)).toBe(false);
            expect(isEven(0)).toBe(true);
            expect(isEven(-2)).toBe(true);
        });
    });

    describe('高階関数', () => {
        test('double関数が正しく動作する', () => {
            expect(double(5)).toBe(10);
            expect(double(0)).toBe(0);
            expect(double(-3)).toBe(-6);
        });

        test('processArray関数が正しく動作する', () => {
            const numbers = [1, 2, 3];
            expect(processArray(numbers, n => n * 2)).toEqual([2, 4, 6]);
            expect(processArray(numbers, n => n + 1)).toEqual([2, 3, 4]);
            expect(processArray([], n => n * 2)).toEqual([]);
        });
    });

    describe('演習問題', () => {
        test('max関数が正しく動作する', () => {
            expect(max(5, 3)).toBe(5);
            expect(max(2, 8)).toBe(8);
            expect(max(5, 5)).toBe(5);
            expect(max(-1, -3)).toBe(-1);
        });

        test('sumArray関数が正しく動作する', () => {
            expect(sumArray([1, 2, 3, 4, 5])).toBe(15);
            expect(sumArray([10, 20, 30])).toBe(60);
            expect(sumArray([])).toBe(0);
            expect(sumArray([-1, 1])).toBe(0);
        });

        test('reverseString関数が正しく動作する', () => {
            expect(reverseString('hello')).toBe('olleh');
            expect(reverseString('TypeScript')).toBe('tpircSepyT');
            expect(reverseString('')).toBe('');
            expect(reverseString('a')).toBe('a');
        });
    });
});