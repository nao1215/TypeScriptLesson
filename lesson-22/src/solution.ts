/**
 * Lesson 22: クラスの基礎演習問題 - 解答例
 */

// 演習1: 図書館の本管理システム 解答例
console.log("=== 演習1: 図書館の本管理システム 解答例 ===");

class Book {
    readonly id: number;
    title: string;
    author: string;
    isbn: string;
    private _isAvailable: boolean = true;
    private _borrower?: string;
    private _borrowDate?: Date;
    private _dueDate?: Date;

    constructor(id: number, title: string, author: string, isbn: string) {
        if (!Book.validateISBN(isbn)) {
            throw new Error("Invalid ISBN format");
        }
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }

    get isAvailable(): boolean {
        return this._isAvailable;
    }

    get borrower(): string | undefined {
        return this._borrower;
    }

    get dueDate(): Date | undefined {
        return this._dueDate;
    }

    borrow(borrowerName: string, days: number = 14): boolean {
        if (!this._isAvailable) {
            console.log(`Book "${this.title}" is already borrowed`);
            return false;
        }

        this._borrower = borrowerName;
        this._borrowDate = new Date();
        this._dueDate = new Date();
        this._dueDate.setDate(this._dueDate.getDate() + days);
        this._isAvailable = false;

        console.log(`Book "${this.title}" borrowed by ${borrowerName}`);
        return true;
    }

    return(): boolean {
        if (this._isAvailable) {
            console.log(`Book "${this.title}" is not currently borrowed`);
            return false;
        }

        console.log(`Book "${this.title}" returned by ${this._borrower}`);
        this._borrower = undefined;
        this._borrowDate = undefined;
        this._dueDate = undefined;
        this._isAvailable = true;

        return true;
    }

    getInfo(): string {
        const status = this._isAvailable ? "Available" : `Borrowed by ${this._borrower}`;
        const dueInfo = this._dueDate ? ` (Due: ${this._dueDate.toDateString()})` : "";
        return `[${this.id}] "${this.title}" by ${this.author} - ${status}${dueInfo}`;
    }

    static validateISBN(isbn: string): boolean {
        // Simple format check: ISBN-10 (10 digits) or ISBN-13 (13 digits with optional hyphens)
        const cleaned = isbn.replace(/-/g, '');
        return /^\d{10}$/.test(cleaned) || /^\d{13}$/.test(cleaned);
    }
}

// テスト
const book1 = new Book(1, "Clean Code", "Robert C. Martin", "978-0132350884");
const book2 = new Book(2, "TypeScript Handbook", "Microsoft", "123-4567890123");

console.log(book1.getInfo());
book1.borrow("Alice", 7);
console.log(book1.getInfo());
book1.return();

// 演習2: ゲーム用のCharacterクラス 解答例
console.log("\n=== 演習2: ゲーム用のCharacterクラス 解答例 ===");

class GameCharacter {
    readonly name: string;
    private _level: number = 1;
    private _experience: number = 0;
    private _health: number;
    private _maxHealth: number;
    private _mana: number;
    private _maxMana: number;
    private _stats: { strength: number, intelligence: number, agility: number };

    constructor(name: string, characterClass: 'warrior' | 'mage' | 'rogue') {
        this.name = name;
        
        // クラス別初期ステータス
        switch (characterClass) {
            case 'warrior':
                this._maxHealth = 120;
                this._maxMana = 30;
                this._stats = { strength: 15, intelligence: 8, agility: 10 };
                break;
            case 'mage':
                this._maxHealth = 70;
                this._maxMana = 100;
                this._stats = { strength: 6, intelligence: 18, agility: 8 };
                break;
            case 'rogue':
                this._maxHealth = 90;
                this._maxMana = 50;
                this._stats = { strength: 12, intelligence: 10, agility: 16 };
                break;
        }
        
        this._health = this._maxHealth;
        this._mana = this._maxMana;
    }

    get level(): number { return this._level; }
    get experience(): number { return this._experience; }
    get health(): number { return this._health; }
    get maxHealth(): number { return this._maxHealth; }
    get mana(): number { return this._mana; }
    get maxMana(): number { return this._maxMana; }
    get stats() { return { ...this._stats }; }

    gainExperience(amount: number): boolean {
        this._experience += amount;
        const requiredExp = GameCharacter.getRequiredExperience(this._level);
        
        if (this._experience >= requiredExp) {
            this._level++;
            this._experience -= requiredExp;
            
            // レベルアップ時のステータス上昇
            this._stats.strength += 2;
            this._stats.intelligence += 2;
            this._stats.agility += 2;
            this._maxHealth += 10;
            this._maxMana += 5;
            this._health = this._maxHealth; // 全回復
            this._mana = this._maxMana;
            
            console.log(`${this.name} leveled up to ${this._level}!`);
            return true;
        }
        return false;
    }

    takeDamage(damage: number): boolean {
        this._health -= damage;
        if (this._health <= 0) {
            this._health = 0;
            console.log(`${this.name} has fallen!`);
            return true; // 死亡
        }
        return false; // 生存
    }

    heal(amount: number): void {
        this._health = Math.min(this._health + amount, this._maxHealth);
    }

    useMana(amount: number): boolean {
        if (this._mana < amount) return false;
        this._mana -= amount;
        return true;
    }

    restoreMana(amount: number): void {
        this._mana = Math.min(this._mana + amount, this._maxMana);
    }

    getCharacterInfo(): string {
        return `${this.name} (Lv.${this._level}) - HP:${this._health}/${this._maxHealth} MP:${this._mana}/${this._maxMana} EXP:${this._experience}`;
    }

    static getRequiredExperience(level: number): number {
        return level * 100;
    }
}

// テスト
const warrior = new GameCharacter("Aragorn", "warrior");
const mage = new GameCharacter("Gandalf", "mage");

console.log(warrior.getCharacterInfo());
console.log(mage.getCharacterInfo());

warrior.gainExperience(150);
warrior.takeDamage(30);
console.log(warrior.getCharacterInfo());

// 演習3: ショッピングカートシステム 解答例
console.log("\n=== 演習3: ショッピングカートシステム 解答例 ===");

class ShoppingItem {
    readonly id: number;
    name: string;
    price: number;
    category: string;
    private _stock: number;

    constructor(id: number, name: string, price: number, category: string, stock: number) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this._stock = stock;
    }

    get stock(): number {
        return this._stock;
    }

    reduceStock(quantity: number): boolean {
        if (quantity <= 0 || quantity > this._stock) {
            return false;
        }
        this._stock -= quantity;
        return true;
    }

    addStock(quantity: number): void {
        if (quantity > 0) {
            this._stock += quantity;
        }
    }

    getItemInfo(): string {
        return `${this.name} - ¥${this.price} (Stock: ${this._stock})`;
    }
}

class CartItem {
    constructor(
        public item: ShoppingItem,
        private _quantity: number
    ) {
        if (_quantity <= 0) {
            throw new Error("Quantity must be positive");
        }
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        if (value <= 0) {
            throw new Error("Quantity must be positive");
        }
        this._quantity = value;
    }

    get totalPrice(): number {
        return this.item.price * this._quantity;
    }
}

class ShoppingCart {
    private items: CartItem[] = [];
    private _discount: number = 0;

    addItem(item: ShoppingItem, quantity: number): boolean {
        if (!item.reduceStock(quantity)) {
            console.log(`Cannot add ${quantity} of ${item.name} - insufficient stock`);
            return false;
        }

        const existingItem = this.items.find(cartItem => cartItem.item.id === item.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push(new CartItem(item, quantity));
        }

        console.log(`Added ${quantity} ${item.name} to cart`);
        return true;
    }

    removeItem(itemId: number): boolean {
        const index = this.items.findIndex(cartItem => cartItem.item.id === itemId);
        if (index === -1) return false;

        const removedItem = this.items.splice(index, 1)[0];
        removedItem.item.addStock(removedItem.quantity); // 在庫を戻す
        console.log(`Removed ${removedItem.item.name} from cart`);
        return true;
    }

    updateQuantity(itemId: number, quantity: number): boolean {
        const cartItem = this.items.find(item => item.item.id === itemId);
        if (!cartItem) return false;

        const difference = quantity - cartItem.quantity;
        if (difference > 0) {
            if (!cartItem.item.reduceStock(difference)) {
                return false;
            }
        } else if (difference < 0) {
            cartItem.item.addStock(-difference);
        }

        cartItem.quantity = quantity;
        return true;
    }

    get subtotal(): number {
        return this.items.reduce((total, item) => total + item.totalPrice, 0);
    }

    set discount(value: number) {
        if (value >= 0 && value <= 100) {
            this._discount = value;
        }
    }

    get discount(): number {
        return this._discount;
    }

    get total(): number {
        return this.subtotal * (1 - this._discount / 100);
    }

    displayCart(): void {
        console.log("\n--- Shopping Cart ---");
        this.items.forEach(cartItem => {
            console.log(`${cartItem.item.name} x${cartItem.quantity} - ¥${cartItem.totalPrice}`);
        });
        console.log(`Subtotal: ¥${this.subtotal}`);
        if (this._discount > 0) {
            console.log(`Discount: ${this._discount}%`);
        }
        console.log(`Total: ¥${this.total}`);
    }

    clear(): void {
        // 在庫を戻す
        this.items.forEach(cartItem => {
            cartItem.item.addStock(cartItem.quantity);
        });
        this.items = [];
    }
}

// テスト
const laptop = new ShoppingItem(1, "Gaming Laptop", 150000, "Electronics", 5);
const mouse = new ShoppingItem(2, "Wireless Mouse", 3000, "Electronics", 20);

const cart = new ShoppingCart();
cart.addItem(laptop, 1);
cart.addItem(mouse, 2);
cart.discount = 10;
cart.displayCart();

// 演習4: 温度変換器クラス 解答例
console.log("\n=== 演習4: 温度変換器クラス 解答例 ===");

class Temperature {
    private _celsius: number;

    constructor(temperature: number, unit: 'C' | 'F' | 'K' = 'C') {
        switch (unit) {
            case 'F':
                this._celsius = Temperature.fahrenheitToCelsius(temperature);
                break;
            case 'K':
                this._celsius = Temperature.kelvinToCelsius(temperature);
                break;
            default:
                this._celsius = temperature;
        }

        if (this._celsius < Temperature.ABSOLUTE_ZERO_CELSIUS) {
            throw new Error("Temperature cannot be below absolute zero");
        }
    }

    get celsius(): number {
        return this._celsius;
    }

    set celsius(value: number) {
        if (value < Temperature.ABSOLUTE_ZERO_CELSIUS) {
            throw new Error("Temperature cannot be below absolute zero");
        }
        this._celsius = value;
    }

    get fahrenheit(): number {
        return Temperature.celsiusToFahrenheit(this._celsius);
    }

    set fahrenheit(value: number) {
        const celsius = Temperature.fahrenheitToCelsius(value);
        if (celsius < Temperature.ABSOLUTE_ZERO_CELSIUS) {
            throw new Error("Temperature cannot be below absolute zero");
        }
        this._celsius = celsius;
    }

    get kelvin(): number {
        return Temperature.celsiusToKelvin(this._celsius);
    }

    set kelvin(value: number) {
        const celsius = Temperature.kelvinToCelsius(value);
        if (celsius < Temperature.ABSOLUTE_ZERO_CELSIUS) {
            throw new Error("Temperature cannot be below absolute zero");
        }
        this._celsius = celsius;
    }

    isHotterThan(other: Temperature): boolean {
        return this._celsius > other._celsius;
    }

    isCoolerThan(other: Temperature): boolean {
        return this._celsius < other._celsius;
    }

    equals(other: Temperature): boolean {
        return Math.abs(this._celsius - other._celsius) < 0.01; // 小数点以下2桁で比較
    }

    toString(): string {
        return `${this._celsius.toFixed(1)}°C / ${this.fahrenheit.toFixed(1)}°F / ${this.kelvin.toFixed(1)}K`;
    }

    static celsiusToFahrenheit(celsius: number): number {
        return (celsius * 9/5) + 32;
    }

    static fahrenheitToCelsius(fahrenheit: number): number {
        return (fahrenheit - 32) * 5/9;
    }

    static celsiusToKelvin(celsius: number): number {
        return celsius + 273.15;
    }

    static kelvinToCelsius(kelvin: number): number {
        return kelvin - 273.15;
    }

    static readonly ABSOLUTE_ZERO_CELSIUS: number = -273.15;
    static readonly WATER_FREEZING_CELSIUS: number = 0;
    static readonly WATER_BOILING_CELSIUS: number = 100;
}

// テスト
const roomTemp = new Temperature(20, 'C');
const boilingPoint = new Temperature(212, 'F');
const absoluteZero = new Temperature(0, 'K');

console.log(`Room temperature: ${roomTemp.toString()}`);
console.log(`Boiling point: ${boilingPoint.toString()}`);
console.log(`Absolute zero: ${absoluteZero.toString()}`);

console.log(`Room temp is hotter than freezing: ${roomTemp.isHotterThan(new Temperature(0, 'C'))}`);

console.log("\n=== すべての演習問題の解答例完了 ===");