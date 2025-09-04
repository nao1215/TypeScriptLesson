/**
 * Lesson 22: クラスの基礎 - テスト
 */

describe('Lesson 22: クラスの基礎', () => {
    test('基本的なクラスの宣言と使用', () => {
        class Person {
            name: string;
            age: number;
            
            constructor(name: string, age: number) {
                this.name = name;
                this.age = age;
            }
            
            greet(): string {
                return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
            }
        }

        const person = new Person("Alice", 25);
        expect(person.name).toBe("Alice");
        expect(person.age).toBe(25);
        expect(person.greet()).toBe("Hello, I'm Alice and I'm 25 years old.");
    });

    test('パラメータプロパティ', () => {
        class Employee {
            constructor(
                public name: string,
                private salary: number,
                protected department: string,
                readonly id: number
            ) {}
            
            getSalary(): number {
                return this.salary;
            }
            
            getDepartment(): string {
                return this.department;
            }
        }

        const employee = new Employee("Bob", 50000, "IT", 12345);
        expect(employee.name).toBe("Bob");
        expect(employee.id).toBe(12345);
        expect(employee.getSalary()).toBe(50000);
        expect(employee.getDepartment()).toBe("IT");

        // private/protected プロパティには直接アクセスできない（TypeScriptコンパイル時エラー）
        // expect(employee.salary).toBeUndefined(); // これはコンパイルエラー
        // expect(employee.department).toBeUndefined(); // これはコンパイルエラー
    });

    test('ゲッターとセッター', () => {
        class Temperature {
            private _celsius: number = 0;
            
            get celsius(): number {
                return this._celsius;
            }
            
            set celsius(value: number) {
                this._celsius = value;
            }
            
            get fahrenheit(): number {
                return (this._celsius * 9/5) + 32;
            }
            
            set fahrenheit(value: number) {
                this._celsius = (value - 32) * 5/9;
            }
        }

        const temp = new Temperature();
        temp.celsius = 25;
        expect(temp.celsius).toBe(25);
        expect(temp.fahrenheit).toBeCloseTo(77, 1);
        
        temp.fahrenheit = 86;
        expect(temp.celsius).toBeCloseTo(30, 1);
    });

    test('静的メソッドとプロパティ', () => {
        class MathHelper {
            static readonly PI: number = 3.14159;
            
            static add(a: number, b: number): number {
                return a + b;
            }
            
            static multiply(a: number, b: number): number {
                return a * b;
            }
            
            static circleArea(radius: number): number {
                return MathHelper.PI * radius * radius;
            }
        }

        expect(MathHelper.PI).toBe(3.14159);
        expect(MathHelper.add(5, 3)).toBe(8);
        expect(MathHelper.multiply(4, 6)).toBe(24);
        expect(MathHelper.circleArea(2)).toBeCloseTo(12.566, 2);
    });

    test('メソッドオーバーロード', () => {
        class TextProcessor {
            process(input: string): string;
            process(input: string[]): string[];
            process(input: string | string[]): string | string[] {
                if (Array.isArray(input)) {
                    return input.map(str => str.toUpperCase());
                } else {
                    return input.toUpperCase();
                }
            }
        }

        const processor = new TextProcessor();
        expect(processor.process("hello")).toBe("HELLO");
        expect(processor.process(["hello", "world"])).toEqual(["HELLO", "WORLD"]);
    });

    test('プロパティの初期化', () => {
        class Student {
            university: string = "Unknown University";
            name: string;
            email?: string;
            readonly id: number;
            courses: string[] = [];
            
            constructor(name: string, id: number) {
                this.name = name;
                this.id = id;
            }
        }

        const student = new Student("Charlie", 12345);
        expect(student.name).toBe("Charlie");
        expect(student.id).toBe(12345);
        expect(student.university).toBe("Unknown University");
        expect(student.email).toBeUndefined();
        expect(student.courses).toEqual([]);
    });

    test('thisコンテキストとアロー関数', () => {
        class Counter {
            private count: number = 0;
            
            increment(): void {
                this.count++;
            }
            
            incrementArrow = (): void => {
                this.count++;
            }
            
            getCount(): number {
                return this.count;
            }
        }

        const counter = new Counter();
        
        counter.increment();
        expect(counter.getCount()).toBe(1);
        
        counter.incrementArrow();
        expect(counter.getCount()).toBe(2);
        
        // アロー関数はthisがバインドされている
        const arrowFunc = counter.incrementArrow;
        arrowFunc();
        expect(counter.getCount()).toBe(3);
    });

    test('カプセル化の例', () => {
        class BankAccount {
            private _balance: number = 0;
            
            constructor(private accountNumber: string, initialBalance: number = 0) {
                this._balance = initialBalance;
            }
            
            get balance(): number {
                return this._balance;
            }
            
            deposit(amount: number): boolean {
                if (amount > 0) {
                    this._balance += amount;
                    return true;
                }
                return false;
            }
            
            withdraw(amount: number): boolean {
                if (amount > 0 && amount <= this._balance) {
                    this._balance -= amount;
                    return true;
                }
                return false;
            }
        }

        const account = new BankAccount("1234567890", 1000);
        expect(account.balance).toBe(1000);
        
        expect(account.deposit(500)).toBe(true);
        expect(account.balance).toBe(1500);
        
        expect(account.withdraw(200)).toBe(true);
        expect(account.balance).toBe(1300);
        
        expect(account.withdraw(2000)).toBe(false); // 残高不足
        expect(account.balance).toBe(1300);
        
        expect(account.deposit(-100)).toBe(false); // 負の金額
        expect(account.balance).toBe(1300);
    });

    test('メソッドチェーニング', () => {
        class Calculator {
            private value: number = 0;
            
            add(n: number): Calculator {
                this.value += n;
                return this;
            }
            
            multiply(n: number): Calculator {
                this.value *= n;
                return this;
            }
            
            subtract(n: number): Calculator {
                this.value -= n;
                return this;
            }
            
            getValue(): number {
                return this.value;
            }
            
            reset(): Calculator {
                this.value = 0;
                return this;
            }
        }

        const calc = new Calculator();
        const result = calc.add(10).multiply(2).subtract(5).getValue();
        expect(result).toBe(15); // (0 + 10) * 2 - 5 = 15
        
        calc.reset().add(5);
        expect(calc.getValue()).toBe(5);
    });

    test('静的メンバーとインスタンスメンバーの違い', () => {
        class TestClass {
            static staticCount: number = 0;
            instanceCount: number = 0;
            
            constructor() {
                TestClass.staticCount++;
                this.instanceCount = 1;
            }
            
            static getStaticCount(): number {
                return TestClass.staticCount;
            }
            
            getInstanceCount(): number {
                return this.instanceCount;
            }
        }

        expect(TestClass.staticCount).toBe(0);
        
        const instance1 = new TestClass();
        expect(TestClass.staticCount).toBe(1);
        expect(instance1.getInstanceCount()).toBe(1);
        
        const instance2 = new TestClass();
        expect(TestClass.staticCount).toBe(2); // 静的プロパティは共有
        expect(instance2.getInstanceCount()).toBe(1); // インスタンスプロパティは独立
        
        expect(TestClass.getStaticCount()).toBe(2);
    });

    test('読み取り専用プロパティ', () => {
        class User {
            readonly id: number;
            name: string;
            
            constructor(id: number, name: string) {
                this.id = id;
                this.name = name;
            }
        }

        const user = new User(1, "Alice");
        expect(user.id).toBe(1);
        expect(user.name).toBe("Alice");
        
        user.name = "Bob"; // 変更可能
        expect(user.name).toBe("Bob");
        
        // user.id = 2; // これはコンパイルエラーになる（readonly）
    });
});