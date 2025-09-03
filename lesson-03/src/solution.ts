export function calculateCircleArea(radius: number): number {
    if (radius < 0) {
        throw new Error("半径は負の値にできません");
    }
    return Math.PI * radius * radius;
}

export function calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number
): number {
    if (principal < 0 || rate < 0 || time < 0) {
        throw new Error("元金、利率、期間は負の値にできません");
    }
    return principal * Math.pow(1 + rate, time);
}

export function convertTemperature(celsius: number): { fahrenheit: number; kelvin: number } {
    const fahrenheit = (celsius * 9) / 5 + 32;
    const kelvin = celsius + 273.15;
    
    return {
        fahrenheit: Math.round(fahrenheit * 100) / 100,
        kelvin: Math.round(kelvin * 100) / 100
    };
}

export function generateFibonacci(n: number): number[] {
    if (n <= 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];
    
    const fibonacci: number[] = [0, 1];
    for (let i = 2; i < n; i++) {
        fibonacci.push(fibonacci[i - 1] + fibonacci[i - 2]);
    }
    
    return fibonacci;
}

function demonstrateSolutions() {
    console.log("=== Lesson 03: 演習問題の解答例 ===\n");

    console.log("1. 円の面積計算");
    const radius = 5;
    const area = calculateCircleArea(radius);
    console.log(`半径 ${radius} の円の面積: ${area.toFixed(2)}`);
    console.log();

    console.log("2. 複利計算");
    const principal = 100000;
    const rate = 0.05;
    const time = 10;
    const compoundInterest = calculateCompoundInterest(principal, rate, time);
    console.log(`元金: ${principal}円, 利率: ${rate * 100}%, 期間: ${time}年`);
    console.log(`複利計算結果: ${Math.round(compoundInterest)}円`);
    console.log();

    console.log("3. 温度変換");
    const celsius = 25;
    const converted = convertTemperature(celsius);
    console.log(`摂氏 ${celsius}°C = 華氏 ${converted.fahrenheit}°F = ケルビン ${converted.kelvin}K`);
    console.log();

    console.log("4. フィボナッチ数列");
    const fibCount = 10;
    const fibonacci = generateFibonacci(fibCount);
    console.log(`最初の ${fibCount} 個のフィボナッチ数: ${fibonacci.join(', ')}`);
}

if (require.main === module) {
    demonstrateSolutions();
}