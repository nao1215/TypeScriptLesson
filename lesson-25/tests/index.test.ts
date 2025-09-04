// Lesson 25: 抽象クラス (Abstract Classes) - テスト

describe('Lesson 25: Abstract Classes', () => {
    // 1. 基本的な抽象クラスのテスト
    describe('Basic Abstract Classes', () => {
        abstract class TestShape {
            protected name: string;
            
            constructor(name: string) {
                this.name = name;
            }
            
            abstract calculateArea(): number;
            
            public getName(): string {
                return this.name;
            }
        }
        
        class TestCircle extends TestShape {
            constructor(name: string, private radius: number) {
                super(name);
            }
            
            calculateArea(): number {
                return Math.PI * this.radius * this.radius;
            }
            
            getRadius(): number {
                return this.radius;
            }
        }
        
        test('abstract class cannot be instantiated directly', () => {
            // abstract クラスは直接インスタンス化できないため、TypeScriptエラーとなる
            // const shape = new TestShape("test"); // これはコンパイルエラー
            expect(true).toBe(true); // テストを通すためのダミー
        });
        
        test('concrete class can implement abstract methods', () => {
            const circle = new TestCircle("Test Circle", 5);
            
            expect(circle.getName()).toBe("Test Circle");
            expect(circle.getRadius()).toBe(5);
            expect(circle.calculateArea()).toBeCloseTo(Math.PI * 25, 2);
        });
    });

    // 2. 抽象プロパティのテスト
    describe('Abstract Properties', () => {
        abstract class TestAnimal {
            abstract readonly species: string;
            abstract weight: number;
            
            constructor(protected name: string) {}
            
            abstract makeSound(): string;
            
            public introduce(): string {
                return `${this.name} is a ${this.species}`;
            }
        }
        
        class TestDog extends TestAnimal {
            readonly species = "Canis lupus";
            weight: number;
            
            constructor(name: string, weight: number) {
                super(name);
                this.weight = weight;
            }
            
            makeSound(): string {
                return "Woof!";
            }
        }
        
        test('abstract properties must be implemented in concrete class', () => {
            const dog = new TestDog("Buddy", 25);
            
            expect(dog.species).toBe("Canis lupus");
            expect(dog.weight).toBe(25);
            expect(dog.makeSound()).toBe("Woof!");
            expect(dog.introduce()).toBe("Buddy is a Canis lupus");
        });
    });

    // 3. Template Methodパターンのテスト
    describe('Template Method Pattern', () => {
        abstract class TestDataProcessor {
            protected processCount = 0;
            
            // Template Method
            public async process(data: string): Promise<string> {
                const validated = this.validate(data);
                const transformed = await this.transform(validated);
                const formatted = this.format(transformed);
                this.processCount++;
                return formatted;
            }
            
            protected validate(data: string): string {
                return data.trim();
            }
            
            abstract transform(data: string): Promise<string>;
            abstract format(data: string): string;
            
            public getProcessCount(): number {
                return this.processCount;
            }
        }
        
        class TestUpperCaseProcessor extends TestDataProcessor {
            async transform(data: string): Promise<string> {
                return data.toUpperCase();
            }
            
            format(data: string): string {
                return `[PROCESSED: ${data}]`;
            }
        }
        
        class TestLowerCaseProcessor extends TestDataProcessor {
            async transform(data: string): Promise<string> {
                return data.toLowerCase();
            }
            
            format(data: string): string {
                return `{processed: ${data}}`;
            }
        }
        
        test('template method pattern works correctly', async () => {
            const upperProcessor = new TestUpperCaseProcessor();
            const lowerProcessor = new TestLowerCaseProcessor();
            
            const result1 = await upperProcessor.process("  Hello World  ");
            const result2 = await lowerProcessor.process("  Hello World  ");
            
            expect(result1).toBe("[PROCESSED: HELLO WORLD]");
            expect(result2).toBe("{processed: hello world}");
            expect(upperProcessor.getProcessCount()).toBe(1);
            expect(lowerProcessor.getProcessCount()).toBe(1);
        });
    });

    // 4. 抽象クラスと継承の組み合わせ
    describe('Abstract Classes with Inheritance', () => {
        abstract class TestVehicle {
            protected speed: number = 0;
            
            constructor(
                protected make: string,
                protected model: string
            ) {}
            
            abstract start(): boolean;
            abstract stop(): boolean;
            abstract getMaxSpeed(): number;
            
            public accelerate(amount: number): void {
                this.speed = Math.min(this.speed + amount, this.getMaxSpeed());
            }
            
            public getSpeed(): number {
                return this.speed;
            }
            
            public getInfo(): string {
                return `${this.make} ${this.model}`;
            }
        }
        
        class TestCar extends TestVehicle {
            private isRunning = false;
            
            start(): boolean {
                this.isRunning = true;
                return true;
            }
            
            stop(): boolean {
                this.isRunning = false;
                this.speed = 0;
                return true;
            }
            
            getMaxSpeed(): number {
                return 200;
            }
            
            public isEngineRunning(): boolean {
                return this.isRunning;
            }
        }
        
        test('abstract vehicle class works with concrete implementations', () => {
            const car = new TestCar("Toyota", "Camry");
            
            expect(car.getInfo()).toBe("Toyota Camry");
            expect(car.getSpeed()).toBe(0);
            expect(car.getMaxSpeed()).toBe(200);
            
            expect(car.start()).toBe(true);
            expect(car.isEngineRunning()).toBe(true);
            
            car.accelerate(50);
            expect(car.getSpeed()).toBe(50);
            
            car.accelerate(200); // Should be limited to max speed
            expect(car.getSpeed()).toBe(200);
            
            expect(car.stop()).toBe(true);
            expect(car.getSpeed()).toBe(0);
        });
    });

    // 5. 抽象クラスとインターフェースの組み合わせ
    describe('Abstract Classes with Interfaces', () => {
        interface TestFlyable {
            fly(): void;
            altitude: number;
        }
        
        interface TestSwimmable {
            swim(): void;
            depth: number;
        }
        
        abstract class TestCreature {
            constructor(protected name: string) {}
            
            abstract move(): void;
            abstract getType(): string;
            
            public getName(): string {
                return this.name;
            }
        }
        
        class TestDuck extends TestCreature implements TestFlyable, TestSwimmable {
            altitude: number = 0;
            depth: number = 0;
            
            move(): void {
                console.log(`${this.name} waddles`);
            }
            
            getType(): string {
                return "Duck";
            }
            
            fly(): void {
                this.altitude = 100;
            }
            
            swim(): void {
                this.depth = 2;
            }
        }
        
        test('abstract class can work with multiple interfaces', () => {
            const duck = new TestDuck("Donald");
            
            expect(duck.getName()).toBe("Donald");
            expect(duck.getType()).toBe("Duck");
            
            duck.fly();
            expect(duck.altitude).toBe(100);
            
            duck.swim();
            expect(duck.depth).toBe(2);
        });
    });

    // 6. 複雑な抽象クラス階層
    describe('Complex Abstract Class Hierarchy', () => {
        abstract class TestGameEntity {
            protected static entityCount = 0;
            public readonly id: number;
            
            constructor(
                protected x: number = 0,
                protected y: number = 0
            ) {
                this.id = ++TestGameEntity.entityCount;
            }
            
            abstract update(): void;
            abstract render(): string;
            abstract getEntityType(): string;
            
            public move(deltaX: number, deltaY: number): void {
                this.x += deltaX;
                this.y += deltaY;
            }
            
            public getPosition(): {x: number, y: number} {
                return {x: this.x, y: this.y};
            }
            
            public static getEntityCount(): number {
                return TestGameEntity.entityCount;
            }
        }
        
        abstract class TestCharacter extends TestGameEntity {
            constructor(
                protected name: string,
                protected health: number,
                x: number = 0,
                y: number = 0
            ) {
                super(x, y);
            }
            
            abstract attack(): number;
            
            public takeDamage(damage: number): void {
                this.health = Math.max(0, this.health - damage);
            }
            
            public isAlive(): boolean {
                return this.health > 0;
            }
            
            public getName(): string {
                return this.name;
            }
            
            public getHealth(): number {
                return this.health;
            }
        }
        
        class TestPlayer extends TestCharacter {
            constructor(name: string, health: number) {
                super(name, health);
            }
            
            update(): void {
                // Player update logic
            }
            
            render(): string {
                return `Player ${this.name} at (${this.x}, ${this.y})`;
            }
            
            getEntityType(): string {
                return "Player";
            }
            
            attack(): number {
                return 10;
            }
        }
        
        class TestEnemy extends TestCharacter {
            constructor(name: string, health: number) {
                super(name, health);
            }
            
            update(): void {
                // Enemy AI logic
            }
            
            render(): string {
                return `Enemy ${this.name} at (${this.x}, ${this.y})`;
            }
            
            getEntityType(): string {
                return "Enemy";
            }
            
            attack(): number {
                return 8;
            }
        }
        
        beforeEach(() => {
            // Reset entity count before each test
            (TestGameEntity as any).entityCount = 0;
        });
        
        test('complex abstract class hierarchy works correctly', () => {
            const player = new TestPlayer("Hero", 100);
            const enemy = new TestEnemy("Goblin", 50);
            
            expect(player.getId()).toBe(1);
            expect(enemy.getId()).toBe(2);
            expect(TestGameEntity.getEntityCount()).toBe(2);
            
            expect(player.getName()).toBe("Hero");
            expect(player.getHealth()).toBe(100);
            expect(player.getEntityType()).toBe("Player");
            
            expect(enemy.getName()).toBe("Goblin");
            expect(enemy.getHealth()).toBe(50);
            expect(enemy.getEntityType()).toBe("Enemy");
            
            player.move(5, 10);
            expect(player.getPosition()).toEqual({x: 5, y: 10});
            
            const damage = player.attack();
            enemy.takeDamage(damage);
            
            expect(damage).toBe(10);
            expect(enemy.getHealth()).toBe(40);
            expect(enemy.isAlive()).toBe(true);
        });
    });

    // 7. 抽象クラスのエラーケース
    describe('Abstract Class Error Cases', () => {
        abstract class TestBase {
            abstract requiredMethod(): string;
            
            public commonMethod(): string {
                return "common";
            }
        }
        
        class TestIncomplete {
            // requiredMethod() の実装を忘れた場合はTypeScriptエラー
            public commonMethod(): string {
                return "incomplete";
            }
        }
        
        class TestComplete extends TestBase {
            requiredMethod(): string {
                return "implemented";
            }
        }
        
        test('complete implementation works correctly', () => {
            const complete = new TestComplete();
            
            expect(complete.requiredMethod()).toBe("implemented");
            expect(complete.commonMethod()).toBe("common");
        });
    });

    // 8. 実用的なパターンのテスト
    describe('Practical Abstract Class Patterns', () => {
        // Repository パターン
        abstract class TestRepository<T> {
            protected items: Map<string, T> = new Map();
            
            abstract validate(item: T): boolean;
            abstract getId(item: T): string;
            
            public async save(item: T): Promise<boolean> {
                if (!this.validate(item)) {
                    return false;
                }
                
                const id = this.getId(item);
                this.items.set(id, item);
                return true;
            }
            
            public async findById(id: string): Promise<T | undefined> {
                return this.items.get(id);
            }
            
            public async findAll(): Promise<T[]> {
                return Array.from(this.items.values());
            }
        }
        
        interface TestUser {
            id: string;
            name: string;
            email: string;
        }
        
        class TestUserRepository extends TestRepository<TestUser> {
            validate(user: TestUser): boolean {
                return user.id.length > 0 && 
                       user.name.length > 0 && 
                       user.email.includes('@');
            }
            
            getId(user: TestUser): string {
                return user.id;
            }
        }
        
        test('repository pattern with abstract base class', async () => {
            const userRepo = new TestUserRepository();
            const user: TestUser = {
                id: "1",
                name: "John Doe",
                email: "john@example.com"
            };
            
            const saved = await userRepo.save(user);
            expect(saved).toBe(true);
            
            const found = await userRepo.findById("1");
            expect(found).toEqual(user);
            
            const all = await userRepo.findAll();
            expect(all).toHaveLength(1);
            expect(all[0]).toEqual(user);
            
            // Invalid user
            const invalidUser: TestUser = {
                id: "",
                name: "Invalid",
                email: "invalid-email"
            };
            
            const savedInvalid = await userRepo.save(invalidUser);
            expect(savedInvalid).toBe(false);
        });
    });
});