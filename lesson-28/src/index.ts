// Lesson 28: ユーティリティ型 (Utility Types)

console.log("=== Lesson 28: ユーティリティ型 (Utility Types) ===");

interface User {
    id: string;
    name: string;
    email: string;
    age: number;
}

// 1. 基本的なユーティリティ型
console.log("1. 基本的なユーティリティ型:");

// Partial - すべてのプロパティをオプショナルに
type PartialUser = Partial<User>;
const partialUser: PartialUser = { name: 'John' };
console.log("Partial User:", partialUser);

// Pick - 特定のプロパティを選択
type UserSummary = Pick<User, 'id' | 'name'>;
const summary: UserSummary = { id: '1', name: 'John' };
console.log("User Summary:", summary);

// Omit - 特定のプロパティを除外
type UserWithoutId = Omit<User, 'id'>;
const userWithoutId: UserWithoutId = { name: 'John', email: 'john@example.com', age: 30 };
console.log("User Without ID:", userWithoutId);

// 2. Record型
console.log("\n2. Record型:");
type UserRoles = Record<'admin' | 'user' | 'guest', boolean>;
const roles: UserRoles = { admin: false, user: true, guest: false };
console.log("User Roles:", roles);

// 3. ReturnTypeとParameters
function getUser(): User {
    return { id: '1', name: 'John', email: 'john@example.com', age: 30 };
}

type GetUserReturn = ReturnType<typeof getUser>; // User
const returnedUser: GetUserReturn = getUser();
console.log("\n3. ReturnType:", returnedUser);

console.log("\n=== Lesson 28 Complete! ===");