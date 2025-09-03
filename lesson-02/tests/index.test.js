"use strict";
describe('Lesson 02: 変数と基本型', () => {
    test('文字列型のテスト', () => {
        const name = '太郎';
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
    });
    test('数値型のテスト', () => {
        const age = 25;
        expect(typeof age).toBe('number');
        expect(age).toBeGreaterThan(0);
    });
    test('真偽値型のテスト', () => {
        const isActive = true;
        expect(typeof isActive).toBe('boolean');
    });
    test('calculateTotal関数', () => {
        function calculateTotal(price, tax) {
            return price * (1 + tax);
        }
        expect(calculateTotal(1000, 0.1)).toBe(1100);
    });
});
//# sourceMappingURL=index.test.js.map