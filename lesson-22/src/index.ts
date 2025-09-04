/**
 * Lesson 22: クラスの基礎 (Class Basics)
 * TypeScriptにおけるクラスの基本的な使用方法
 */

console.log("=== Lesson 22: クラスの基礎 (Class Basics) ===");

// 1. 基本的なクラスの宣言
console.log("\n1. 基本的なクラスの宣言");

class Person {
    // プロパティの宣言
    name: string;
    age: number;
    
    // コンストラクタ
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    // メソッド
    greet(): string {
        return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
    }
    
    // メソッド（void戻り値）
    celebrateBirthday(): void {
        this.age++;
        console.log(`🎉 Happy Birthday ${this.name}! Now ${this.age} years old.`);
    }
}

const person1 = new Person("Alice", 25);
console.log(person1.greet());
person1.celebrateBirthday();

const person2 = new Person("Bob", 30);
console.log(person2.greet());

// 2. プロパティの初期化方法
console.log("\n2. プロパティの初期化方法");

class Student {
    // 直接初期化
    university: string = "Unknown University";
    
    // 必須プロパティ
    name: string;
    
    // オプショナルプロパティ
    email?: string;
    
    // readonly プロパティ（一度設定されると変更不可）
    readonly id: number;
    
    // 配列の初期化
    courses: string[] = [];
    
    // オブジェクトの初期化
    grades: { [course: string]: number } = {};
    
    constructor(name: string, id: number, university?: string) {
        this.name = name;
        this.id = id;
        if (university) {
            this.university = university;
        }
    }
    
    addCourse(course: string): void {
        if (!this.courses.includes(course)) {
            this.courses.push(course);
            console.log(`Added course: ${course}`);
        }
    }
    
    setGrade(course: string, grade: number): void {
        if (this.courses.includes(course)) {
            this.grades[course] = grade;
            console.log(`Set grade for ${course}: ${grade}`);
        } else {
            console.log(`Course ${course} not found. Add it first.`);
        }
    }
    
    getInfo(): string {
        return `Student: ${this.name} (ID: ${this.id}) at ${this.university}`;
    }
}

const student1 = new Student("Charlie", 12345, "Tokyo University");
console.log(student1.getInfo());
student1.addCourse("TypeScript");
student1.addCourse("JavaScript");
student1.setGrade("TypeScript", 95);
console.log("Courses:", student1.courses);
console.log("Grades:", student1.grades);

// student1.id = 999; // エラー: readonly プロパティは変更不可

// 3. パラメータプロパティ
console.log("\n3. パラメータプロパティ");

class Employee {
    // コンストラクタパラメータでプロパティを自動定義
    constructor(
        public name: string,          // public プロパティ（デフォルト）
        private salary: number,       // private プロパティ
        protected department: string, // protected プロパティ
        readonly id: number,          // readonly プロパティ
        public startDate: Date = new Date() // デフォルト値付き
    ) {
        console.log(`Employee ${name} created with ID ${id}`);
    }
    
    // public メソッド
    getPublicInfo(): string {
        return `${this.name} (ID: ${this.id}) - Started: ${this.startDate.toDateString()}`;
    }
    
    // private プロパティにアクセスするメソッド
    getSalary(): number {
        return this.salary;
    }
    
    setSalary(newSalary: number): void {
        if (newSalary > 0) {
            this.salary = newSalary;
            console.log(`Salary updated to: ${this.salary}`);
        }
    }
    
    // protected プロパティにアクセスするメソッド
    getDepartment(): string {
        return this.department;
    }
    
    changeDepartment(newDepartment: string): void {
        this.department = newDepartment;
        console.log(`Department changed to: ${this.department}`);
    }
}

const employee1 = new Employee("Diana", 60000, "Engineering", 54321);
console.log(employee1.getPublicInfo());
console.log(employee1.name); // public - アクセス可能
console.log(`Salary: $${employee1.getSalary()}`);
employee1.setSalary(65000);

// console.log(employee1.salary);     // エラー: private プロパティ
// console.log(employee1.department); // エラー: protected プロパティ

// 4. メソッドの種類（ゲッター、セッター、静的メソッド）
console.log("\n4. メソッドの種類");

class Calculator {
    private history: string[] = [];
    private _precision: number = 2;
    
    // インスタンスメソッド
    add(a: number, b: number): number {
        const result = a + b;
        this.history.push(`${a} + ${b} = ${result}`);
        return result;
    }
    
    subtract(a: number, b: number): number {
        const result = a - b;
        this.history.push(`${a} - ${b} = ${result}`);
        return result;
    }
    
    // ゲッター（プロパティのように使える）
    get lastOperation(): string | undefined {
        return this.history[this.history.length - 1];
    }
    
    get operationCount(): number {
        return this.history.length;
    }
    
    get allHistory(): string[] {
        return [...this.history]; // コピーを返す（カプセル化）
    }
    
    // セッター
    set precision(value: number) {
        if (value >= 0 && value <= 10) {
            this._precision = value;
        } else {
            throw new Error("Precision must be between 0 and 10");
        }
    }
    
    get precision(): number {
        return this._precision;
    }
    
    // 履歴をクリアする特別なセッター
    set clearHistory(clear: boolean) {
        if (clear) {
            this.history = [];
            console.log("History cleared");
        }
    }
    
    // 結果を指定精度で丸める
    roundResult(value: number): number {
        return Math.round(value * Math.pow(10, this._precision)) / Math.pow(10, this._precision);
    }
    
    // 静的メソッド（インスタンス不要）
    static multiply(a: number, b: number): number {
        return a * b;
    }
    
    static divide(a: number, b: number): number {
        if (b === 0) {
            throw new Error("Division by zero");
        }
        return a / b;
    }
    
    // 静的プロパティ
    static readonly version: string = "2.1.0";
    static readonly maxHistorySize: number = 100;
    
    // 静的ユーティリティメソッド
    static isValidNumber(value: any): boolean {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }
}

const calc = new Calculator();

// インスタンスメソッド
console.log("5 + 3 =", calc.add(5, 3));
console.log("10 - 4 =", calc.subtract(10, 4));

// ゲッター使用
console.log("Last operation:", calc.lastOperation);
console.log("Operation count:", calc.operationCount);

// セッター使用
calc.precision = 3;
console.log("Precision:", calc.precision);

// 静的メソッド・プロパティ（クラス名で呼び出し）
console.log("6 × 7 =", Calculator.multiply(6, 7));
console.log("15 ÷ 3 =", Calculator.divide(15, 3));
console.log("Calculator version:", Calculator.version);
console.log("Is 42 valid number?", Calculator.isValidNumber(42));
console.log("Is 'hello' valid number?", Calculator.isValidNumber("hello"));

// 履歴クリア
calc.clearHistory = true;
console.log("Operation count after clear:", calc.operationCount);

// 5. thisコンテキストとバインディング
console.log("\n5. thisコンテキストとバインディング");

class Counter {
    private count: number = 0;
    private name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    // 通常のメソッド
    increment(): void {
        this.count++;
        console.log(`${this.name} Counter: ${this.count}`);
    }
    
    // アロー関数でthisをバインド（常にインスタンスを指す）
    incrementArrow = (): void => {
        this.count++;
        console.log(`${this.name} Counter (Arrow): ${this.count}`);
    }
    
    decrement = (): void => {
        this.count--;
        console.log(`${this.name} Counter: ${this.count}`);
    }
    
    getCount(): number {
        return this.count;
    }
    
    reset(): void {
        this.count = 0;
        console.log(`${this.name} Counter reset`);
    }
    
    // チェーニング可能なメソッド
    add(value: number): Counter {
        this.count += value;
        return this; // thisを返すことでメソッドチェーンが可能
    }
    
    multiply(value: number): Counter {
        this.count *= value;
        return this;
    }
}

const counter = new Counter("Main");

// 直接呼び出し
counter.increment(); // OK
counter.incrementArrow(); // OK

// メソッドチェーニング
counter.add(5).multiply(2).add(3);
console.log(`Final count: ${counter.getCount()}`);

// メソッドを変数に代入してのテスト
const incrementFunc = counter.increment;
const incrementArrowFunc = counter.incrementArrow;

// 通常のメソッドはthisコンテキストが失われる可能性があるため、
// 実際のプロジェクトでは注意が必要
// incrementFunc(); // この場合は動作するが、環境によっては問題になることがある

// アロー関数は常にthisがバインドされている
incrementArrowFunc(); // 常に安全

// 6. メソッドオーバーロード
console.log("\n6. メソッドオーバーロード");

class TextProcessor {
    private processCount: number = 0;
    
    // メソッドオーバーロード（型定義）
    process(input: string): string;
    process(input: string[]): string[];
    process(input: number): string;
    
    // 実際の実装
    process(input: string | string[] | number): string | string[] {
        this.processCount++;
        
        if (typeof input === 'number') {
            return `Number: ${input}`;
        } else if (Array.isArray(input)) {
            return input.map(str => str.toUpperCase());
        } else {
            return input.toUpperCase();
        }
    }
    
    getProcessCount(): number {
        return this.processCount;
    }
    
    // 複数パラメータのオーバーロード
    format(text: string): string;
    format(text: string, uppercase: boolean): string;
    format(text: string, prefix: string, suffix: string): string;
    
    format(text: string, arg1?: boolean | string, arg2?: string): string {
        if (typeof arg1 === 'boolean') {
            return arg1 ? text.toUpperCase() : text.toLowerCase();
        } else if (typeof arg1 === 'string' && typeof arg2 === 'string') {
            return `${arg1}${text}${arg2}`;
        } else {
            return text;
        }
    }
}

const processor = new TextProcessor();

// オーバーロードされたメソッドの使用
console.log(processor.process("hello world"));              // "HELLO WORLD"
console.log(processor.process(["hello", "world", "!"]));    // ["HELLO", "WORLD", "!"]
console.log(processor.process(42));                         // "Number: 42"

console.log(processor.format("TypeScript"));                    // "TypeScript"
console.log(processor.format("TypeScript", true));              // "TYPESCRIPT"
console.log(processor.format("TypeScript", "[", "]"));          // "[TypeScript]"

console.log(`Process count: ${processor.getProcessCount()}`);

// 7. 複雑なクラス例：銀行口座
console.log("\n7. 複雑なクラス例：銀行口座");

class BankAccount {
    private _balance: number = 0;
    private _transactions: Array<{type: 'deposit' | 'withdraw', amount: number, date: Date}> = [];
    private static _nextAccountNumber: number = 1000;
    
    constructor(
        private _accountNumber: string,
        initialBalance: number = 0,
        private _ownerName: string
    ) {
        if (!BankAccount.validateAccountNumber(_accountNumber)) {
            throw new Error("Invalid account number format");
        }
        
        if (initialBalance < 0) {
            throw new Error("Initial balance cannot be negative");
        }
        
        this._balance = initialBalance;
        if (initialBalance > 0) {
            this._transactions.push({
                type: 'deposit',
                amount: initialBalance,
                date: new Date()
            });
        }
    }
    
    // getter/setterでカプセル化
    get balance(): number {
        return this._balance;
    }
    
    get accountNumber(): string {
        return this._accountNumber;
    }
    
    get ownerName(): string {
        return this._ownerName;
    }
    
    get accountInfo(): string {
        return `Account: ${this._accountNumber} | Owner: ${this._ownerName} | Balance: $${this._balance.toFixed(2)}`;
    }
    
    get transactionHistory(): Array<{type: string, amount: number, date: string}> {
        return this._transactions.map(t => ({
            type: t.type,
            amount: t.amount,
            date: t.date.toISOString()
        }));
    }
    
    // 入金
    deposit(amount: number): boolean {
        if (!this.validateAmount(amount)) {
            console.log("Invalid deposit amount");
            return false;
        }
        
        this._balance += amount;
        this._transactions.push({
            type: 'deposit',
            amount: amount,
            date: new Date()
        });
        
        console.log(`Deposited $${amount.toFixed(2)}. New balance: $${this._balance.toFixed(2)}`);
        return true;
    }
    
    // 出金
    withdraw(amount: number): boolean {
        if (!this.validateAmount(amount)) {
            console.log("Invalid withdrawal amount");
            return false;
        }
        
        if (amount > this._balance) {
            console.log("Insufficient funds");
            return false;
        }
        
        this._balance -= amount;
        this._transactions.push({
            type: 'withdraw',
            amount: amount,
            date: new Date()
        });
        
        console.log(`Withdrew $${amount.toFixed(2)}. New balance: $${this._balance.toFixed(2)}`);
        return true;
    }
    
    // 残高照会
    checkBalance(): void {
        console.log(`Current balance: $${this._balance.toFixed(2)}`);
    }
    
    // プライベート検証メソッド
    private validateAmount(amount: number): boolean {
        return typeof amount === 'number' && amount > 0 && isFinite(amount);
    }
    
    // 静的メソッド：口座番号の検証
    static validateAccountNumber(accountNumber: string): boolean {
        return /^\d{10}$/.test(accountNumber);
    }
    
    // 静的メソッド：新しい口座番号を生成
    static generateAccountNumber(): string {
        return (BankAccount._nextAccountNumber++).toString().padStart(10, '0');
    }
    
    // 静的メソッド：利息計算
    static calculateInterest(principal: number, rate: number, time: number): number {
        return principal * rate * time;
    }
    
    // 静的定数
    static readonly MINIMUM_BALANCE: number = 0;
    static readonly MAXIMUM_DAILY_WITHDRAWAL: number = 1000;
    static readonly BANK_NAME: string = "TypeScript Bank";
}

// 銀行口座のテスト
const account1 = new BankAccount("1234567890", 1000, "Alice Johnson");
console.log(account1.accountInfo);

account1.deposit(500);
account1.withdraw(200);
account1.checkBalance();

console.log("Transaction history:");
account1.transactionHistory.forEach((transaction, index) => {
    console.log(`${index + 1}. ${transaction.type}: $${transaction.amount} at ${transaction.date}`);
});

// 静的メソッドの使用
console.log("New account number:", BankAccount.generateAccountNumber());
console.log("Is valid account number?", BankAccount.validateAccountNumber("9876543210"));
console.log("Interest for $1000 at 5% for 1 year:", 
           BankAccount.calculateInterest(1000, 0.05, 1));
console.log("Bank name:", BankAccount.BANK_NAME);

// 8. クラスを使った実用的な例：タスク管理
console.log("\n8. 実用的な例：タスク管理");

class Task {
    private static nextId: number = 1;
    public readonly id: number;
    private _completed: boolean = false;
    private _createdAt: Date;
    private _completedAt?: Date;
    
    constructor(
        public title: string,
        public description: string = "",
        public priority: 'low' | 'medium' | 'high' = 'medium'
    ) {
        this.id = Task.nextId++;
        this._createdAt = new Date();
    }
    
    get completed(): boolean {
        return this._completed;
    }
    
    get createdAt(): Date {
        return new Date(this._createdAt); // コピーを返す
    }
    
    get completedAt(): Date | undefined {
        return this._completedAt ? new Date(this._completedAt) : undefined;
    }
    
    get duration(): number | null {
        if (this._completed && this._completedAt) {
            return this._completedAt.getTime() - this._createdAt.getTime();
        }
        return null;
    }
    
    complete(): boolean {
        if (!this._completed) {
            this._completed = true;
            this._completedAt = new Date();
            return true;
        }
        return false;
    }
    
    reopen(): boolean {
        if (this._completed) {
            this._completed = false;
            this._completedAt = undefined;
            return true;
        }
        return false;
    }
    
    toString(): string {
        const status = this._completed ? '✅' : '⏳';
        return `${status} [${this.priority.toUpperCase()}] ${this.title}`;
    }
}

class TaskManager {
    private tasks: Task[] = [];
    
    addTask(title: string, description?: string, priority?: 'low' | 'medium' | 'high'): Task {
        const task = new Task(title, description, priority);
        this.tasks.push(task);
        console.log(`Task added: ${task.toString()}`);
        return task;
    }
    
    completeTask(taskId: number): boolean {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.complete()) {
            console.log(`Task completed: ${task.toString()}`);
            return true;
        }
        return false;
    }
    
    listTasks(filter: 'all' | 'completed' | 'pending' = 'all'): Task[] {
        let filteredTasks = this.tasks;
        
        if (filter === 'completed') {
            filteredTasks = this.tasks.filter(t => t.completed);
        } else if (filter === 'pending') {
            filteredTasks = this.tasks.filter(t => !t.completed);
        }
        
        console.log(`\n--- ${filter.toUpperCase()} TASKS ---`);
        filteredTasks.forEach(task => {
            console.log(`ID: ${task.id} - ${task.toString()}`);
        });
        
        return filteredTasks;
    }
    
    get taskCount(): number {
        return this.tasks.length;
    }
    
    get completedCount(): number {
        return this.tasks.filter(t => t.completed).length;
    }
    
    get pendingCount(): number {
        return this.tasks.filter(t => !t.completed).length;
    }
}

// タスク管理システムのテスト
const taskManager = new TaskManager();

taskManager.addTask("Learn TypeScript classes", "Master the basics of OOP in TypeScript", "high");
taskManager.addTask("Write unit tests", "Create comprehensive test coverage", "medium");
taskManager.addTask("Review code", "Review pull requests from team", "low");

taskManager.completeTask(1);

taskManager.listTasks('all');
taskManager.listTasks('pending');

console.log(`\nStatistics: ${taskManager.completedCount}/${taskManager.taskCount} tasks completed`);

console.log("\n=== クラスの基礎学習完了！ ===");