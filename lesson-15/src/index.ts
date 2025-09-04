/**
 * Lesson 15: 可変長引数 (Rest Parameters)
 * 
 * このファイルでは、TypeScriptにおける可変長引数の使い方を学びます。
 * Rest Parameters（...args）を使用することで、任意の数の引数を受け取る関数を作成できます。
 */

// 1. 基本的な可変長引数
function sum(...numbers: number[]): number {
    console.log("受け取った引数:", numbers);
    return numbers.reduce((total, num) => total + num, 0);
}

console.log("=== 1. 基本的な可変長引数 ===");
console.log("sum():", sum());                    // 0
console.log("sum(5):", sum(5));                  // 5
console.log("sum(1, 2, 3):", sum(1, 2, 3));     // 6
console.log("sum(10, 20, 30, 40):", sum(10, 20, 30, 40)); // 100

// 2. 通常の引数と可変長引数の組み合わせ
function greetAll(greeting: string, ...names: string[]): string[] {
    return names.map(name => `${greeting}, ${name}!`);
}

function createMessage(prefix: string, suffix: string, ...words: string[]): string {
    const middle = words.join(" ");
    return `${prefix} ${middle} ${suffix}`;
}

console.log("\n=== 2. 通常の引数と可変長引数の組み合わせ ===");
console.log(greetAll("Hello", "Alice", "Bob", "Charlie"));
console.log(greetAll("Good morning"));  // 空の配列でも動作

console.log(createMessage("Start:", "End", "TypeScript", "is", "awesome"));
console.log(createMessage("Begin:", "Finish"));

// 3. 様々な型の可変長引数
function logValues(...values: (string | number | boolean)[]): void {
    values.forEach((value, index) => {
        console.log(`  ${index}: ${typeof value} = ${value}`);
    });
}

function findMaxNumber(...numbers: number[]): number {
    if (numbers.length === 0) {
        throw new Error("At least one number is required");
    }
    return Math.max(...numbers);
}

console.log("\n=== 3. 様々な型の可変長引数 ===");
console.log("Mixed values:");
logValues("hello", 42, true, "world", 3.14, false);

console.log("\nMaximum values:");
console.log("Max of 1, 5, 3:", findMaxNumber(1, 5, 3));
console.log("Max of 100, 25, 75:", findMaxNumber(100, 25, 75));

// 4. ジェネリクスと可変長引数
function combineAll<T>(...items: T[]): T[] {
    return items;
}

function getFirst<T>(...items: T[]): T | undefined {
    return items[0];
}

function getLast<T>(...items: T[]): T | undefined {
    return items[items.length - 1];
}

console.log("\n=== 4. ジェネリクスと可変長引数 ===");
const numbers = combineAll(1, 2, 3, 4, 5);
const strings = combineAll("a", "b", "c");
const mixed = combineAll("hello", 42, true);

console.log("Numbers:", numbers);
console.log("Strings:", strings);
console.log("Mixed:", mixed);

console.log("First number:", getFirst(1, 2, 3, 4, 5));
console.log("Last string:", getLast("apple", "banana", "cherry"));

// 5. オブジェクトを生成する可変長引数
interface UserInfo {
    name: string;
    age: number;
    hobbies: string[];
    hobbyCount: number;
}

function createUser(name: string, age: number, ...hobbies: string[]): UserInfo {
    return {
        name,
        age,
        hobbies,
        hobbyCount: hobbies.length
    };
}

interface KeyValuePair {
    key: string;
    value: string;
}

function createConfig(...pairs: KeyValuePair[]): Record<string, string> {
    const config: Record<string, string> = {};
    pairs.forEach(pair => {
        config[pair.key] = pair.value;
    });
    return config;
}

console.log("\n=== 5. オブジェクトを生成する可変長引数 ===");
const user1 = createUser("Alice", 25, "reading", "swimming", "coding");
const user2 = createUser("Bob", 30);

console.log("User 1:", user1);
console.log("User 2:", user2);

const config = createConfig(
    { key: "host", value: "localhost" },
    { key: "port", value: "3000" },
    { key: "debug", value: "true" }
);
console.log("Config:", config);

// 6. スプレッド演算子との組み合わせ
const numbersArray = [1, 2, 3, 4, 5];
const moreNumbers = [6, 7, 8];

function multiply(multiplier: number, ...numbers: number[]): number[] {
    return numbers.map(num => num * multiplier);
}

console.log("\n=== 6. スプレッド演算子との組み合わせ ===");
console.log("Original array:", numbersArray);
console.log("Sum of array:", sum(...numbersArray));

console.log("Multiply by 2:", multiply(2, ...numbersArray));
console.log("Multiply mixed:", multiply(3, 10, ...moreNumbers, 20));

// 7. 高度な例: 関数のコンビネーション
type UnaryFunction<T, U> = (arg: T) => U;

function pipe<T>(...functions: UnaryFunction<any, any>[]) {
    return (initialValue: T) => {
        return functions.reduce((value, fn) => fn(value), initialValue);
    };
}

function compose<T>(...functions: UnaryFunction<any, any>[]) {
    return (initialValue: T) => {
        return functions.reduceRight((value, fn) => fn(value), initialValue);
    };
}

console.log("\n=== 7. 高度な例: 関数のコンビネーション ===");

const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const toString = (x: number) => x.toString();

// パイプライン: 左から右へ実行
const pipelined = pipe(addOne, double, toString);
console.log("Pipe (5):", pipelined(5)); // "12" (5 + 1 = 6, 6 * 2 = 12, 12.toString())

// コンポジション: 右から左へ実行
const composed = compose(toString, double, addOne);
console.log("Compose (5):", composed(5)); // "12" (同じ結果、異なる順序で定義)

// 8. エラーハンドリングを含む実用例
function safeCalculate(operation: string, ...numbers: number[]): number | string {
    if (numbers.length === 0) {
        return "No numbers provided";
    }

    try {
        switch (operation) {
            case "sum":
                return numbers.reduce((a, b) => a + b, 0);
            case "product":
                return numbers.reduce((a, b) => a * b, 1);
            case "average":
                return numbers.reduce((a, b) => a + b, 0) / numbers.length;
            case "max":
                return Math.max(...numbers);
            case "min":
                return Math.min(...numbers);
            default:
                return `Unknown operation: ${operation}`;
        }
    } catch (error) {
        return `Error: ${error}`;
    }
}

console.log("\n=== 8. エラーハンドリングを含む実用例 ===");
console.log('Sum:', safeCalculate("sum", 1, 2, 3, 4, 5));
console.log('Product:', safeCalculate("product", 2, 3, 4));
console.log('Average:', safeCalculate("average", 10, 20, 30));
console.log('Max:', safeCalculate("max", 15, 25, 5, 35));
console.log('Min:', safeCalculate("min", 15, 25, 5, 35));
console.log('Unknown:', safeCalculate("unknown", 1, 2, 3));
console.log('No args:', safeCalculate("sum"));