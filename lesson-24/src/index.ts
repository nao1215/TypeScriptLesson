// Lesson 24: アクセス修飾子 (Access Modifiers)

console.log("=== Lesson 24: アクセス修飾子 (Access Modifiers) ===\n");

// 1. 基本的なアクセス修飾子
console.log("1. 基本的なアクセス修飾子");

// public（デフォルト）
class Person {
    public name: string; // public は省略可能
    age: number; // デフォルトでpublic
    
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    public greet(): void {
        console.log(`Hello, I'm ${this.name}`);
    }
}

const person = new Person("Alice", 25);
console.log(`Name: ${person.name}, Age: ${person.age}`);
person.greet();

// private
class BankAccount {
    private balance: number = 0;
    private accountNumber: string;
    
    constructor(accountNumber: string, initialBalance: number) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }
    
    private validateAmount(amount: number): boolean {
        return amount > 0 && amount <= this.balance;
    }
    
    public withdraw(amount: number): boolean {
        if (this.validateAmount(amount)) {
            this.balance -= amount;
            console.log(`Withdrawn: $${amount}. Remaining balance: $${this.balance}`);
            return true;
        }
        console.log(`Invalid withdrawal amount: $${amount}`);
        return false;
    }
    
    public deposit(amount: number): void {
        if (amount > 0) {
            this.balance += amount;
            console.log(`Deposited: $${amount}. New balance: $${this.balance}`);
        }
    }
    
    public getBalance(): number {
        return this.balance;
    }
}

const account = new BankAccount("12345", 1000);
console.log(`Initial balance: $${account.getBalance()}`);
account.withdraw(200);
account.deposit(50);
// console.log(account.balance); // エラー: private

console.log();

// 2. protected修飾子
console.log("2. protected修飾子");

class Animal {
    protected name: string;
    protected species: string;
    
    constructor(name: string, species: string) {
        this.name = name;
        this.species = species;
    }
    
    protected makeSound(): void {
        console.log("Some generic sound");
    }
    
    public introduce(): void {
        console.log(`I'm ${this.name}, a ${this.species}`);
    }
}

class Dog extends Animal {
    private breed: string;
    
    constructor(name: string, breed: string) {
        super(name, "Dog");
        this.breed = breed;
    }
    
    public bark(): void {
        console.log(`${this.name} (${this.breed}) barks: Woof!`);
        this.makeSound(); // protected メソッド呼び出し可能
    }
    
    public getInfo(): string {
        return `${this.name} is a ${this.breed} ${this.species}`;
    }
}

const dog = new Dog("Rex", "German Shepherd");
dog.introduce();
dog.bark();
console.log(dog.getInfo());

console.log();

// 3. Parameter Properties（引数プロパティ）
console.log("3. Parameter Properties（引数プロパティ）");

class Student {
    constructor(
        private name: string,
        private age: number,
        public grade: string,
        protected studentId: string
    ) {
        // 自動的にプロパティが作成され、値が代入される
    }
    
    public getStudentInfo(): string {
        return `${this.name} (${this.age}): Grade ${this.grade}, ID: ${this.studentId}`;
    }
    
    public updateGrade(newGrade: string): void {
        this.grade = newGrade;
        console.log(`${this.name}'s grade updated to ${newGrade}`);
    }
}

const student = new Student("Bob", 16, "10th", "STD001");
console.log(student.getStudentInfo());
console.log(`Public grade: ${student.grade}`);
student.updateGrade("11th");

console.log();

// 4. readonly修飾子
console.log("4. readonly修飾子");

class Configuration {
    readonly apiUrl: string;
    readonly version: number;
    private readonly secretKey: string;
    
    constructor(apiUrl: string, version: number, secretKey: string) {
        this.apiUrl = apiUrl;
        this.version = version;
        this.secretKey = secretKey;
    }
    
    public getPublicConfig(): object {
        return {
            apiUrl: this.apiUrl,
            version: this.version
        };
    }
}

class ImmutablePoint {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) {}
    
    public distance(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    public toString(): string {
        return `Point(${this.x}, ${this.y})`;
    }
}

const config = new Configuration("https://api.example.com", 1.2, "secret123");
console.log("Config:", config.getPublicConfig());

const point = new ImmutablePoint(3, 4);
console.log(`${point.toString()}, Distance: ${point.distance()}`);
// point.x = 5; // エラー: readonly

console.log();

// 5. static修飾子
console.log("5. static修飾子");

class MathUtils {
    public static readonly PI = 3.14159;
    private static instanceCount = 0;
    
    public static add(a: number, b: number): number {
        return a + b;
    }
    
    public static multiply(a: number, b: number): number {
        return a * b;
    }
    
    public static circleArea(radius: number): number {
        return MathUtils.PI * radius * radius;
    }
    
    public static getInstanceCount(): number {
        return MathUtils.instanceCount;
    }
    
    constructor() {
        MathUtils.instanceCount++;
        console.log(`MathUtils instance created. Total: ${MathUtils.instanceCount}`);
    }
    
    public static createInstance(): MathUtils {
        return new MathUtils();
    }
}

console.log(`PI: ${MathUtils.PI}`);
console.log(`5 + 3 = ${MathUtils.add(5, 3)}`);
console.log(`4 * 6 = ${MathUtils.multiply(4, 6)}`);
console.log(`Circle area (r=5): ${MathUtils.circleArea(5)}`);
console.log(`Instance count: ${MathUtils.getInstanceCount()}`);

const utils1 = new MathUtils();
const utils2 = MathUtils.createInstance();
console.log(`Final instance count: ${MathUtils.getInstanceCount()}`);

console.log();

// 6. Private Fields (#構文)
console.log("6. Private Fields (#構文)");

class SecureData {
    #secretValue: string;
    #encryptionKey = "super-secret-key";
    public createdAt: Date;
    
    constructor(secret: string) {
        this.#secretValue = this.#encrypt(secret);
        this.createdAt = new Date();
    }
    
    #encrypt(data: string): string {
        // 簡単な暗号化例（実際の用途では適切な暗号化を使用）
        return data.split('').reverse().join('') + this.#encryptionKey.length;
    }
    
    #decrypt(encryptedData: string): string {
        const keyLength = this.#encryptionKey.length;
        return encryptedData.slice(0, -keyLength.toString().length)
                           .split('').reverse().join('');
    }
    
    public getDecryptedValue(): string {
        return this.#decrypt(this.#secretValue);
    }
    
    public updateSecret(newSecret: string): void {
        console.log("Updating secret value...");
        this.#secretValue = this.#encrypt(newSecret);
    }
    
    public getInfo(): object {
        return {
            hasSecret: this.#secretValue.length > 0,
            createdAt: this.createdAt
        };
    }
}

const secure = new SecureData("my-secret-password");
console.log("Secure data info:", secure.getInfo());
console.log("Decrypted value:", secure.getDecryptedValue());
secure.updateSecret("new-secret");
console.log("New decrypted value:", secure.getDecryptedValue());

console.log();

// 7. 実践的な例: ユーザー管理システム
console.log("7. 実践的な例: ユーザー管理システム");

class User {
    private static nextId = 1;
    private static users: User[] = [];
    
    public readonly id: number;
    #passwordHash: string;
    private lastLogin: Date | null = null;
    
    constructor(
        public readonly username: string,
        private email: string,
        password: string,
        protected role: 'user' | 'admin' = 'user'
    ) {
        this.id = User.nextId++;
        this.#passwordHash = this.#hashPassword(password);
        User.users.push(this);
        console.log(`User created: ${username} (ID: ${this.id})`);
    }
    
    #hashPassword(password: string): string {
        // 実際のハッシュ化ロジックを想定
        return `hashed_${password}_${this.id}`;
    }
    
    public verifyPassword(password: string): boolean {
        return this.#passwordHash === this.#hashPassword(password);
    }
    
    public login(password: string): boolean {
        if (this.verifyPassword(password)) {
            this.lastLogin = new Date();
            console.log(`${this.username} logged in at ${this.lastLogin.toLocaleTimeString()}`);
            return true;
        }
        console.log(`Failed login attempt for ${this.username}`);
        return false;
    }
    
    protected updateEmail(newEmail: string): void {
        const oldEmail = this.email;
        this.email = newEmail;
        console.log(`Email updated for ${this.username}: ${oldEmail} -> ${newEmail}`);
    }
    
    public getPublicInfo(): object {
        return {
            id: this.id,
            username: this.username,
            role: this.role,
            lastLogin: this.lastLogin?.toLocaleString()
        };
    }
    
    public static findUserById(id: number): User | undefined {
        return User.users.find(user => user.id === id);
    }
    
    public static findUserByUsername(username: string): User | undefined {
        return User.users.find(user => user.username === username);
    }
    
    public static getUserCount(): number {
        return User.users.length;
    }
    
    public static getAllUsers(): object[] {
        return User.users.map(user => user.getPublicInfo());
    }
}

class AdminUser extends User {
    constructor(username: string, email: string, password: string) {
        super(username, email, password, 'admin');
    }
    
    public promoteUser(userId: number): boolean {
        const user = User.findUserById(userId);
        if (user && (user as any).role === 'user') {
            (user as any).role = 'admin';
            console.log(`User ${user.username} promoted to admin by ${this.username}`);
            return true;
        }
        console.log(`Cannot promote user with ID ${userId}`);
        return false;
    }
    
    public changeUserEmail(userId: number, newEmail: string): boolean {
        const user = User.findUserById(userId);
        if (user) {
            // protected メソッド呼び出し（継承による）
            (user as any).updateEmail(newEmail);
            return true;
        }
        console.log(`User with ID ${userId} not found`);
        return false;
    }
    
    public getAllUsersInfo(): void {
        console.log("All users:", User.getAllUsers());
    }
}

// ユーザー管理システムのデモ
const regularUser = new User("john_doe", "john@example.com", "password123");
const admin = new AdminUser("admin_alice", "alice@admin.com", "admin_pass");

console.log(`Total users: ${User.getUserCount()}`);

regularUser.login("wrong_password");
regularUser.login("password123");

admin.login("admin_pass");
admin.promoteUser(1);
admin.changeUserEmail(1, "john.doe@newdomain.com");

console.log("\nUser info:");
console.log("Regular user:", regularUser.getPublicInfo());
console.log("Admin user:", admin.getPublicInfo());

admin.getAllUsersInfo();

console.log("\n=== Lesson 24 Complete! ===");