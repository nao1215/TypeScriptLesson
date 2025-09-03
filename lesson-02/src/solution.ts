// Lesson 02: 解答例

// 問題1の解答
const productName: string = 'iPhone';
const price: number = 99800;
const inStock: boolean = true;

// 問題2の解答
function calculateTotal(price: number, tax: number): number {
  return price * (1 + tax);
}

// 問題3の解答
function createUserProfile(name: string, age: number, isActive: boolean): string {
  return `名前: ${name}, 年齢: ${age}, アクティブ: ${isActive}`;
}

// テスト
console.log(calculateTotal(1000, 0.1)); // 1100
console.log(createUserProfile('太郎', 25, true));