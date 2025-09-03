describe('Lesson 02: 変数と基本型', () => {
  test('文字列型のテスト', () => {
    const name: string = '太郎';
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  test('数値型のテスト', () => {
    const age: number = 25;
    expect(typeof age).toBe('number');
    expect(age).toBeGreaterThan(0);
  });

  test('真偽値型のテスト', () => {
    const isActive: boolean = true;
    expect(typeof isActive).toBe('boolean');
  });

  test('calculateTotal関数', () => {
    function calculateTotal(price: number, tax: number): number {
      return price * (1 + tax);
    }
    expect(calculateTotal(1000, 0.1)).toBe(1100);
  });
});