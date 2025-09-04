let myFunc: (x: number, y: number) => number;
myFunc = (a, b) => a + b;
console.log("myFunc(3, 4) =", myFunc(3, 4));

type MathOperation = (x: number, y: number) => number;

const add: MathOperation = (x, y) => x + y;
const subtract: MathOperation = (x, y) => x - y;
const multiply: MathOperation = (x, y) => x * y;
const divide: MathOperation = (x, y) => x / y;

console.log("add(10, 5) =", add(10, 5));
console.log("subtract(10, 5) =", subtract(10, 5));
console.log("multiply(10, 5) =", multiply(10, 5));
console.log("divide(10, 5) =", divide(10, 5));

type DescribableFunction = {
    description: string;
    (someArg: number): boolean;
};

function isPositive(n: number): boolean {
    return n > 0;
}

(isPositive as DescribableFunction).description = "Checks if a number is positive";

const describable = isPositive as DescribableFunction;
console.log(describable.description);
console.log("isPositive(5) =", describable(5));
console.log("isPositive(-3) =", describable(-3));

type StringProcessor = (input: string) => string;
type NumberProcessor = (input: number) => number;
type Processor = StringProcessor | NumberProcessor;

const upperCase: StringProcessor = (s) => s.toUpperCase();
const double: NumberProcessor = (n) => n * 2;

console.log("upperCase('hello') =", upperCase('hello'));
console.log("double(5) =", double(5));

function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
    if (d !== undefined && y !== undefined) {
        return new Date(y, mOrTimestamp, d);
    } else {
        return new Date(mOrTimestamp);
    }
}

const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
console.log("makeDate(12345678) =", d1);
console.log("makeDate(5, 5, 5) =", d2);

type Callback<T> = (value: T) => void;

function processValue<T>(value: T, callback: Callback<T>): void {
    console.log("Processing value:", value);
    callback(value);
}

processValue(42, (n) => console.log("Number is:", n));
processValue("hello", (s) => console.log("String is:", s));

type AsyncOperation = () => Promise<string>;

const fetchData: AsyncOperation = async () => {
    return "Data fetched successfully";
};

fetchData().then(result => console.log(result));

type Calculator = {
    add: MathOperation;
    subtract: MathOperation;
    multiply: MathOperation;
    divide: MathOperation;
};

const calculator: Calculator = {
    add: (x, y) => x + y,
    subtract: (x, y) => x - y,
    multiply: (x, y) => x * y,
    divide: (x, y) => x / y,
};

console.log("calculator.add(8, 2) =", calculator.add(8, 2));
console.log("calculator.subtract(8, 2) =", calculator.subtract(8, 2));

export { 
    MathOperation, 
    DescribableFunction, 
    StringProcessor, 
    NumberProcessor, 
    Processor,
    makeDate,
    Callback,
    processValue,
    AsyncOperation,
    Calculator,
    calculator
};