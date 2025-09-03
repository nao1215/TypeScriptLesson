export function calculateTax(price: number, taxRate: number = 0.1): number {
    return Math.round(price * taxRate);
}

export function calculateTotalPrice(price: number, taxRate: number = 0.1): number {
    const tax = calculateTax(price, taxRate);
    return price + tax;
}

export function calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
}

export function findMax(numbers: number[]): number {
    return Math.max(...numbers);
}

export function findMin(numbers: number[]): number {
    return Math.min(...numbers);
}

export function addDecimals(a: number, b: number, precision: number = 2): number {
    return Number((a + b).toFixed(precision));
}

export function divide(dividend: number, divisor: number): number {
    if (divisor === 0) {
        throw new Error("0で除算はできません");
    }
    return dividend / divisor;
}

function main() {
    console.log("=== Lesson 03: 数値型の例 ===\n");

    console.log("1. 基本的な数値リテラル");
    const decimal = 42;
    const hex = 0x2A;
    const binary = 0b101010;
    console.log(`10進数: ${decimal}`);
    console.log(`16進数: ${hex}`);
    console.log(`2進数: ${binary}`);
    console.log();

    console.log("2. 消費税計算の例");
    const itemPrice = 1000;
    const tax = calculateTax(itemPrice);
    const total = calculateTotalPrice(itemPrice);
    console.log(`商品価格: ${itemPrice}円`);
    console.log(`消費税: ${tax}円`);
    console.log(`合計: ${total}円`);
    console.log();

    console.log("3. 統計計算の例");
    const scores = [85, 92, 78, 96, 88];
    console.log(`テストスコア: ${scores.join(', ')}`);
    console.log(`平均点: ${calculateAverage(scores)}`);
    console.log(`最高点: ${findMax(scores)}`);
    console.log(`最低点: ${findMin(scores)}`);
    console.log();

    console.log("4. 浮動小数点の精度問題と対処法");
    console.log(`0.1 + 0.2 = ${0.1 + 0.2} (精度問題あり)`);
    console.log(`addDecimals(0.1, 0.2) = ${addDecimals(0.1, 0.2)} (対処済み)`);
    console.log();

    console.log("5. 特殊な数値");
    console.log(`Infinity: ${Infinity}`);
    console.log(`-Infinity: ${-Infinity}`);
    console.log(`NaN: ${NaN}`);
    console.log(`Number.isFinite(42): ${Number.isFinite(42)}`);
    console.log(`Number.isNaN(NaN): ${Number.isNaN(NaN)}`);
}

if (require.main === module) {
    main();
}