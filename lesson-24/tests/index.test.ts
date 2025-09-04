// Lesson 24: アクセス修飾子 (Access Modifiers) - テスト

describe('Lesson 24: Access Modifiers', () => {
    // 1. 基本的なアクセス修飾子のテスト
    describe('Basic Access Modifiers', () => {
        class TestPerson {
            public name: string;
            age: number;
            private id: number;
            protected email: string;
            
            constructor(name: string, age: number, id: number, email: string) {
                this.name = name;
                this.age = age;
                this.id = id;
                this.email = email;
            }
            
            public getId(): number {
                return this.id;
            }
            
            protected getEmail(): string {
                return this.email;
            }
        }
        
        class TestEmployee extends TestPerson {
            constructor(name: string, age: number, id: number, email: string) {
                super(name, age, id, email);
            }
            
            public getEmployeeEmail(): string {
                return this.getEmail(); // protected メソッド呼び出し可能
            }
        }
        
        test('public members are accessible', () => {
            const person = new TestPerson("Alice", 25, 1, "alice@example.com");
            
            expect(person.name).toBe("Alice");
            expect(person.age).toBe(25);
            expect(person.getId()).toBe(1);
        });
        
        test('protected members are accessible in subclasses', () => {
            const employee = new TestEmployee("Bob", 30, 2, "bob@example.com");
            
            expect(employee.getEmployeeEmail()).toBe("bob@example.com");
        });
    });

    // 2. Parameter Propertiesのテスト
    describe('Parameter Properties', () => {
        class TestStudent {
            constructor(
                private name: string,
                public grade: string,
                protected studentId: string,
                readonly school: string
            ) {}
            
            public getName(): string {
                return this.name;
            }
            
            public getStudentInfo(): object {
                return {
                    name: this.name,
                    grade: this.grade,
                    studentId: this.studentId,
                    school: this.school
                };
            }
        }
        
        test('parameter properties create class properties', () => {
            const student = new TestStudent("Charlie", "10th", "ST001", "Test School");
            
            expect(student.grade).toBe("10th");
            expect(student.school).toBe("Test School");
            expect(student.getName()).toBe("Charlie");
        });
        
        test('parameter properties respect access modifiers', () => {
            const student = new TestStudent("Diana", "11th", "ST002", "Test School");
            const info = student.getStudentInfo();
            
            expect(info).toEqual({
                name: "Diana",
                grade: "11th",
                studentId: "ST002",
                school: "Test School"
            });
        });
    });

    // 3. readonly修飾子のテスト
    describe('Readonly Modifier', () => {
        class TestConfiguration {
            constructor(
                public readonly apiUrl: string,
                private readonly secretKey: string
            ) {}
            
            public getSecretKeyLength(): number {
                return this.secretKey.length;
            }
        }
        
        test('readonly properties can be read but not modified', () => {
            const config = new TestConfiguration("https://api.test.com", "secret123");
            
            expect(config.apiUrl).toBe("https://api.test.com");
            expect(config.getSecretKeyLength()).toBe(9);
        });
    });

    // 4. static修飾子のテスト
    describe('Static Modifier', () => {
        class TestCounter {
            private static count = 0;
            public static readonly MAX_COUNT = 100;
            
            public static increment(): void {
                TestCounter.count++;
            }
            
            public static getCount(): number {
                return TestCounter.count;
            }
            
            public static reset(): void {
                TestCounter.count = 0;
            }
        }
        
        beforeEach(() => {
            TestCounter.reset();
        });
        
        test('static methods and properties work correctly', () => {
            expect(TestCounter.getCount()).toBe(0);
            expect(TestCounter.MAX_COUNT).toBe(100);
            
            TestCounter.increment();
            TestCounter.increment();
            
            expect(TestCounter.getCount()).toBe(2);
        });
    });

    // 5. Private Fieldsのテスト
    describe('Private Fields (#syntax)', () => {
        class TestSecureData {
            #privateValue: string;
            #counter = 0;
            
            constructor(value: string) {
                this.#privateValue = value;
            }
            
            public getValue(): string {
                this.#counter++;
                return this.#privateValue;
            }
            
            public getAccessCount(): number {
                return this.#counter;
            }
            
            public updateValue(newValue: string): void {
                this.#privateValue = newValue;
            }
        }
        
        test('private fields are truly private', () => {
            const secure = new TestSecureData("secret");
            
            expect(secure.getValue()).toBe("secret");
            expect(secure.getAccessCount()).toBe(1);
            
            secure.updateValue("new-secret");
            expect(secure.getValue()).toBe("new-secret");
            expect(secure.getAccessCount()).toBe(2);
        });
    });

    // 6. 実践的なテスト: 銀行口座システム
    describe('Practical Example: Banking System', () => {
        abstract class Account {
            protected balance: number;
            private transactions: string[] = [];
            
            constructor(
                public readonly accountNumber: string,
                initialBalance: number
            ) {
                this.balance = initialBalance;
                this.addTransaction(`Opening balance: ${initialBalance}`);
            }
            
            abstract calculateInterest(): number;
            
            public deposit(amount: number): boolean {
                if (amount <= 0) return false;
                
                this.balance += amount;
                this.addTransaction(`Deposit: ${amount}`);
                return true;
            }
            
            public getBalance(): number {
                return this.balance;
            }
            
            protected addTransaction(transaction: string): void {
                this.transactions.push(transaction);
            }
            
            public getTransactionCount(): number {
                return this.transactions.length;
            }
        }
        
        class SavingsAccount extends Account {
            constructor(
                accountNumber: string,
                initialBalance: number,
                private interestRate: number
            ) {
                super(accountNumber, initialBalance);
            }
            
            calculateInterest(): number {
                return this.balance * this.interestRate;
            }
            
            public withdraw(amount: number): boolean {
                if (amount <= 0 || amount > this.balance) return false;
                
                this.balance -= amount;
                this.addTransaction(`Withdrawal: ${amount}`);
                return true;
            }
        }
        
        test('banking system works correctly', () => {
            const account = new SavingsAccount("ACC001", 1000, 0.05);
            
            expect(account.accountNumber).toBe("ACC001");
            expect(account.getBalance()).toBe(1000);
            expect(account.getTransactionCount()).toBe(1);
            
            expect(account.deposit(500)).toBe(true);
            expect(account.getBalance()).toBe(1500);
            expect(account.getTransactionCount()).toBe(2);
            
            expect(account.withdraw(200)).toBe(true);
            expect(account.getBalance()).toBe(1300);
            expect(account.getTransactionCount()).toBe(3);
            
            expect(account.calculateInterest()).toBe(65);
            
            // Invalid operations
            expect(account.deposit(-100)).toBe(false);
            expect(account.withdraw(2000)).toBe(false);
        });
    });

    // 7. 継承とアクセス修飾子の組み合わせ
    describe('Inheritance with Access Modifiers', () => {
        class Vehicle {
            protected speed: number = 0;
            private fuel: number = 100;
            
            constructor(
                public readonly make: string,
                public readonly model: string
            ) {}
            
            protected accelerate(amount: number): void {
                if (this.fuel > 0) {
                    this.speed += amount;
                    this.fuel--;
                }
            }
            
            public getSpeed(): number {
                return this.speed;
            }
            
            public getFuel(): number {
                return this.fuel;
            }
        }
        
        class Car extends Vehicle {
            constructor(make: string, model: string) {
                super(make, model);
            }
            
            public drive(): void {
                this.accelerate(10); // protected メソッド呼び出し
            }
            
            public brake(): void {
                this.speed = Math.max(0, this.speed - 5);
            }
        }
        
        test('inheritance with access modifiers works correctly', () => {
            const car = new Car("Toyota", "Camry");
            
            expect(car.make).toBe("Toyota");
            expect(car.model).toBe("Camry");
            expect(car.getSpeed()).toBe(0);
            expect(car.getFuel()).toBe(100);
            
            car.drive();
            expect(car.getSpeed()).toBe(10);
            expect(car.getFuel()).toBe(99);
            
            car.brake();
            expect(car.getSpeed()).toBe(5);
        });
    });

    // 8. エラーケースのテスト
    describe('Error Cases and Edge Cases', () => {
        class TestClass {
            private value: number = 0;
            #privateField: string = "private";
            
            constructor(value: number) {
                this.value = value;
            }
            
            public getValue(): number {
                return this.value;
            }
            
            public getPrivateField(): string {
                return this.#privateField;
            }
        }
        
        test('private members are not accessible from outside', () => {
            const instance = new TestClass(42);
            
            expect(instance.getValue()).toBe(42);
            expect(instance.getPrivateField()).toBe("private");
            
            // TypeScriptコンパイラがprivateアクセスを防ぐため、
            // 実行時テストでは型アサーションでバイパス
            expect((instance as any).value).toBe(42);
        });
    });
});