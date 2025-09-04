function add(a: number, b: number): number {
    return a + b;
}

const multiply = function(a: number, b: number): number {
    return a * b;
};

const subtract = (a: number, b: number): number => {
    return a - b;
};

const divide = (a: number, b: number): number => a / b;

function sayHello(name: string): void {
    console.log(`Hello, ${name}!`);
}

function greet(name: string, age: number): string {
    return `My name is ${name} and I am ${age} years old.`;
}

const isEven = (n: number): boolean => n % 2 === 0;

const double = (n: number): number => n * 2;

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(double);

console.log("add(5, 3) =", add(5, 3));
console.log("multiply(4, 7) =", multiply(4, 7));
console.log("subtract(10, 4) =", subtract(10, 4));
console.log("divide(20, 4) =", divide(20, 4));

sayHello("TypeScript");

console.log(greet("Alice", 25));

console.log("isEven(4) =", isEven(4));
console.log("isEven(5) =", isEven(5));

console.log("Original numbers:", numbers);
console.log("Doubled numbers:", doubled);

function processArray(arr: number[], callback: (n: number) => number): number[] {
    return arr.map(callback);
}

const squared = processArray(numbers, n => n * n);
console.log("Squared numbers:", squared);

export { add, multiply, subtract, divide, sayHello, greet, isEven, double, processArray };