// Lesson 27: ジェネリクスの制約 (Generic Constraints)

console.log("=== Lesson 27: ジェネリクスの制約 (Generic Constraints) ===");

// 1. extends制約
function getLength<T extends { length: number }>(arg: T): number {
    return arg.length;
}

console.log("1. extends制約:");
console.log(getLength([1, 2, 3]));     // 3
console.log(getLength("hello"));      // 5

// 2. keyof制約
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

interface User {
    id: string;
    name: string;
    age: number;
}

const user: User = { id: '1', name: 'John', age: 30 };

console.log("\n2. keyof制約:");
console.log(getProperty(user, 'id'));     // "1"
console.log(getProperty(user, 'name'));   // "John"

// 3. 条件型の基礎
type IsArray<T> = T extends any[] ? true : false;
type StringArrayCheck = IsArray<string[]>; // true
type StringCheck = IsArray<string>;        // false

console.log("\n3. 条件型の基礎:");
console.log("StringArrayCheck (should be true):", {} as StringArrayCheck);
console.log("StringCheck (should be false):", {} as StringCheck);

console.log("\n=== Lesson 27 Complete! ===");