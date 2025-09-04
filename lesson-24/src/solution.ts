// Lesson 24 解答例: アクセス修飾子 (Access Modifiers)

// 解答1: ライブラリ管理システム
class Book {
    public readonly id: number;
    public readonly title: string;
    public readonly author: string;
    private isbn: string;
    private isAvailable: boolean = true;
    private borrowedDate: Date | null = null;
    
    private static nextId = 1;
    
    constructor(title: string, author: string, isbn: string) {
        this.id = Book.nextId++;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
    
    public borrowBook(): boolean {
        if (this.isAvailable) {
            this.isAvailable = false;
            this.borrowedDate = new Date();
            return true;
        }
        return false;
    }
    
    public returnBook(): boolean {
        if (!this.isAvailable) {
            this.isAvailable = true;
            this.borrowedDate = null;
            return true;
        }
        return false;
    }
    
    public getBookInfo(): object {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            isAvailable: this.isAvailable,
            borrowedDate: this.borrowedDate?.toLocaleDateString()
        };
    }
    
    public getIsAvailable(): boolean {
        return this.isAvailable;
    }
    
    protected getBorrowDuration(): number | null {
        if (!this.borrowedDate) return null;
        const now = new Date();
        const diffTime = now.getTime() - this.borrowedDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    
    private calculateLateFee(): number {
        const duration = this.getBorrowDuration();
        if (!duration || duration <= 30) return 0;
        return (duration - 30) * 10;
    }
    
    public getLateFee(): number {
        return this.calculateLateFee();
    }
}

class Library {
    public readonly name: string;
    private books: Book[] = [];
    private readonly maxBooks: number;
    
    constructor(name: string, maxBooks: number) {
        this.name = name;
        this.maxBooks = maxBooks;
    }
    
    public addBook(book: Book): boolean {
        if (this.books.length >= this.maxBooks) {
            return false;
        }
        this.books.push(book);
        return true;
    }
    
    public removeBook(bookId: number): boolean {
        const bookIndex = this.books.findIndex(book => book.id === bookId);
        if (bookIndex === -1) return false;
        
        const book = this.books[bookIndex];
        if (!book.getIsAvailable()) return false; // 借用中は削除不可
        
        this.books.splice(bookIndex, 1);
        return true;
    }
    
    public findBook(bookId: number): Book | undefined {
        return this.books.find(book => book.id === bookId);
    }
    
    public getAvailableBooks(): Book[] {
        return this.books.filter(book => book.getIsAvailable());
    }
    
    public getLibraryStats(): object {
        const available = this.getAvailableBooks().length;
        return {
            name: this.name,
            totalBooks: this.books.length,
            availableBooks: available,
            borrowedBooks: this.books.length - available,
            maxCapacity: this.maxBooks,
            utilizationRate: `${((this.books.length / this.maxBooks) * 100).toFixed(1)}%`
        };
    }
}

// 解答2: 銀行口座システム
abstract class Account {
    public readonly accountNumber: string;
    protected balance: number;
    protected readonly accountType: string;
    private transactions: Array<{type: string, amount: number, date: Date}> = [];
    
    private static nextAccountNumber = 1000;
    
    constructor(initialBalance: number, accountType: string) {
        this.accountNumber = `ACC${Account.nextAccountNumber++}`;
        this.balance = initialBalance;
        this.accountType = accountType;
        this.addTransaction('OPENING', initialBalance);
    }
    
    abstract calculateInterest(): number;
    
    public deposit(amount: number): boolean {
        if (!this.validateAmount(amount)) return false;
        
        this.balance += amount;
        this.addTransaction('DEPOSIT', amount);
        return true;
    }
    
    public getBalance(): number {
        return this.balance;
    }
    
    protected addTransaction(type: string, amount: number): void {
        this.transactions.push({
            type,
            amount,
            date: new Date()
        });
    }
    
    protected getTransactions(): Array<{type: string, amount: number, date: Date}> {
        return [...this.transactions]; // コピーを返す
    }
    
    private validateAmount(amount: number): boolean {
        return amount > 0 && Number.isFinite(amount);
    }
}

class SavingsAccount extends Account {
    private readonly interestRate: number;
    private readonly minimumBalance: number;
    
    constructor(initialBalance: number, interestRate: number, minimumBalance: number = 0) {
        super(initialBalance, 'SAVINGS');
        this.interestRate = interestRate;
        this.minimumBalance = minimumBalance;
    }
    
    calculateInterest(): number {
        return this.balance * this.interestRate;
    }
    
    public withdraw(amount: number): boolean {
        if (amount <= 0 || !Number.isFinite(amount)) return false;
        if (this.balance - amount < this.minimumBalance) return false;
        
        this.balance -= amount;
        this.addTransaction('WITHDRAWAL', amount);
        return true;
    }
    
    public getAccountInfo(): object {
        return {
            accountNumber: this.accountNumber,
            accountType: this.accountType,
            balance: this.balance,
            interestRate: `${(this.interestRate * 100).toFixed(2)}%`,
            minimumBalance: this.minimumBalance,
            estimatedAnnualInterest: this.calculateInterest(),
            transactionCount: this.getTransactions().length
        };
    }
}

// 解答3: ゲームキャラクターシステム
class Character {
    #inventory: string[] = [];
    
    constructor(
        public readonly name: string,
        protected health: number,
        protected level: number = 1,
        private experience: number = 0
    ) {
        this.maxHealth = health;
    }
    
    protected maxHealth: number;
    
    public takeDamage(damage: number): boolean {
        if (damage < 0) return false;
        
        this.health = Math.max(0, this.health - damage);
        return this.health > 0;
    }
    
    protected heal(amount: number): void {
        if (amount > 0) {
            this.health = Math.min(this.maxHealth, this.health + amount);
        }
    }
    
    protected gainExperience(exp: number): boolean {
        if (exp <= 0) return false;
        
        this.experience += exp;
        const expForNextLevel = this.level * 100;
        
        if (this.experience >= expForNextLevel) {
            this.level++;
            this.experience -= expForNextLevel;
            this.maxHealth += 20;
            this.health = this.maxHealth; // レベルアップで全回復
            return true;
        }
        return false;
    }
    
    public addItem(item: string): void {
        this.#inventory.push(item);
    }
    
    public getInventory(): string[] {
        return [...this.#inventory]; // コピーを返す
    }
    
    protected removeItem(item: string): boolean {
        const index = this.#inventory.indexOf(item);
        if (index !== -1) {
            this.#inventory.splice(index, 1);
            return true;
        }
        return false;
    }
    
    public getCharacterInfo(): object {
        return {
            name: this.name,
            level: this.level,
            health: this.health,
            maxHealth: this.maxHealth,
            experience: this.experience,
            expToNextLevel: (this.level * 100) - this.experience,
            inventoryCount: this.#inventory.length
        };
    }
}

class Player extends Character {
    public readonly playerId: string;
    private playerClass: string;
    
    private static playerCount = 0;
    
    constructor(name: string, health: number, level: number, playerClass: string) {
        super(name, health, level);
        this.playerId = `PLAYER_${++Player.playerCount}`;
        this.playerClass = playerClass;
    }
    
    public levelUp(): boolean {
        const requiredExp = this.level * 100;
        return this.gainExperience(requiredExp);
    }
    
    public usePotion(): boolean {
        if (this.removeItem('Potion')) {
            this.heal(50);
            return true;
        }
        return false;
    }
    
    public attackMonster(monsterLevel: number): boolean {
        const damage = Math.floor(Math.random() * 20) + this.level;
        const expGained = monsterLevel * 10;
        
        console.log(`${this.name} attacks! Damage: ${damage}`);
        const leveledUp = this.gainExperience(expGained);
        
        if (leveledUp) {
            console.log(`${this.name} leveled up to ${this.level}!`);
        }
        
        return true;
    }
    
    public getPlayerStats(): object {
        const characterInfo = this.getCharacterInfo();
        return {
            ...characterInfo,
            playerId: this.playerId,
            playerClass: this.playerClass,
            inventory: this.getInventory()
        };
    }
    
    public static getPlayerCount(): number {
        return Player.playerCount;
    }
}

// 解答4: データベース接続プールシステム
class DatabaseConnection {
    public readonly id: string;
    private isActive: boolean = false;
    private lastUsed: Date = new Date();
    private readonly connectionString: string;
    
    #isConnected = false;
    
    private static connectionCount = 0;
    
    constructor(connectionString: string) {
        this.id = `CONN_${++DatabaseConnection.connectionCount}`;
        this.connectionString = connectionString;
    }
    
    public connect(): boolean {
        if (this.#isConnected) return false;
        
        this.#isConnected = true;
        this.isActive = true;
        this.updateLastUsed();
        return true;
    }
    
    public disconnect(): void {
        this.#isConnected = false;
        this.isActive = false;
    }
    
    public executeQuery(query: string): string {
        if (!this.#isConnected) {
            throw new Error('Connection not established');
        }
        
        this.updateLastUsed();
        // シミュレーション
        return `Query executed: ${query.substring(0, 50)}...`;
    }
    
    protected updateLastUsed(): void {
        this.lastUsed = new Date();
    }
    
    public isConnected(): boolean {
        return this.#isConnected;
    }
    
    public getConnectionInfo(): object {
        return {
            id: this.id,
            isActive: this.isActive,
            isConnected: this.#isConnected,
            lastUsed: this.lastUsed.toLocaleString(),
            connectionString: this.connectionString.replace(/password=[^;]+/i, 'password=***')
        };
    }
    
    public static getTotalConnections(): number {
        return DatabaseConnection.connectionCount;
    }
}

class ConnectionPool {
    private readonly poolSize: number;
    private connections: DatabaseConnection[];
    private availableConnections: DatabaseConnection[];
    
    constructor(poolSize: number, connectionString: string) {
        this.poolSize = poolSize;
        this.connections = [];
        this.availableConnections = [];
        
        // プールを初期化
        for (let i = 0; i < poolSize; i++) {
            const connection = this.createConnection(connectionString);
            this.connections.push(connection);
            this.availableConnections.push(connection);
        }
    }
    
    public getConnection(): DatabaseConnection | null {
        const connection = this.availableConnections.pop();
        if (connection) {
            connection.connect();
            return connection;
        }
        return null;
    }
    
    public releaseConnection(connection: DatabaseConnection): boolean {
        // 接続がこのプールのものかチェック
        if (!this.connections.includes(connection)) {
            return false;
        }
        
        // 既に利用可能リストにある場合はスキップ
        if (this.availableConnections.includes(connection)) {
            return false;
        }
        
        connection.disconnect();
        this.availableConnections.push(connection);
        return true;
    }
    
    public getPoolStats(): object {
        const activeConnections = this.connections.length - this.availableConnections.length;
        
        return {
            totalConnections: this.connections.length,
            availableConnections: this.availableConnections.length,
            activeConnections: activeConnections,
            utilizationRate: `${((activeConnections / this.poolSize) * 100).toFixed(1)}%`,
            poolSize: this.poolSize
        };
    }
    
    private createConnection(connectionString: string): DatabaseConnection {
        return new DatabaseConnection(connectionString);
    }
    
    public closeAllConnections(): void {
        this.connections.forEach(conn => conn.disconnect());
        this.availableConnections = [...this.connections];
    }
}

// テスト関数
function testLibrarySystem(): void {
    console.log("=== Library System Test ===");
    
    const library = new Library("Central Library", 5);
    const book1 = new Book("TypeScript Guide", "Author A", "123-456");
    const book2 = new Book("JavaScript Basics", "Author B", "789-012");
    
    console.log("Adding books:", library.addBook(book1), library.addBook(book2));
    console.log("Available books:", library.getAvailableBooks().length);
    console.log("Borrow book1:", book1.borrowBook());
    console.log("Available books after borrow:", library.getAvailableBooks().length);
    console.log("Book1 info:", book1.getBookInfo());
    console.log("Library stats:", library.getLibraryStats());
    console.log();
}

function testBankingSystem(): void {
    console.log("=== Banking System Test ===");
    
    const savings = new SavingsAccount(1000, 0.05, 100);
    
    console.log("Initial balance:", savings.getBalance());
    console.log("Deposit 500:", savings.deposit(500));
    console.log("New balance:", savings.getBalance());
    console.log("Withdraw 200:", savings.withdraw(200));
    console.log("Balance after withdrawal:", savings.getBalance());
    console.log("Interest:", savings.calculateInterest());
    console.log("Account info:", savings.getAccountInfo());
    console.log();
}

function testGameSystem(): void {
    console.log("=== Game System Test ===");
    
    const player = new Player("Hero", 100, 1, "Warrior");
    
    console.log("Initial player info:", player.getCharacterInfo());
    player.addItem("Sword");
    player.addItem("Potion");
    player.addItem("Shield");
    console.log("Inventory:", player.getInventory());
    
    console.log("Take damage (30):", player.takeDamage(30));
    console.log("Health after damage:", player.getCharacterInfo().health);
    
    console.log("Use potion:", player.usePotion());
    console.log("Health after potion:", player.getCharacterInfo().health);
    
    console.log("Attack monster:", player.attackMonster(2));
    console.log("Player stats:", player.getPlayerStats());
    console.log("Total players:", Player.getPlayerCount());
    console.log();
}

function testDatabaseSystem(): void {
    console.log("=== Database System Test ===");
    
    const pool = new ConnectionPool(3, "host=localhost;port=5432;database=testdb;user=admin;password=secret");
    
    console.log("Initial pool stats:", pool.getPoolStats());
    
    const conn1 = pool.getConnection();
    const conn2 = pool.getConnection();
    
    if (conn1) {
        console.log("Got connection 1:", conn1.getConnectionInfo());
        console.log("Execute query:", conn1.executeQuery("SELECT * FROM users WHERE active = 1"));
    }
    
    if (conn2) {
        console.log("Got connection 2:", conn2.getConnectionInfo());
    }
    
    console.log("Pool stats with active connections:", pool.getPoolStats());
    
    if (conn1) {
        console.log("Release connection 1:", pool.releaseConnection(conn1));
    }
    
    console.log("Final pool stats:", pool.getPoolStats());
    console.log("Total connections created:", DatabaseConnection.getTotalConnections());
    console.log();
}

// テスト実行
console.log("=== Access Modifiers Solutions Tests ===\n");

testLibrarySystem();
testBankingSystem();
testGameSystem();
testDatabaseSystem();

console.log("=== All tests completed! ===");

export {};