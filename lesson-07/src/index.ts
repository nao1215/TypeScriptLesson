interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

export const users: User[] = [
    { id: 1, name: "田中太郎", email: "tanaka@example.com", age: 30 },
    { id: 2, name: "佐藤花子", email: "sato@example.com", age: 25 },
    { id: 3, name: "鈴木一郎", email: "suzuki@example.com", age: 35 }
];

export const products: Product[] = [
    { id: 1, name: "ノートPC", price: 80000, category: "電子機器", inStock: true },
    { id: 2, name: "マウス", price: 2000, category: "電子機器", inStock: false },
    { id: 3, name: "デスク", price: 25000, category: "家具", inStock: true },
    { id: 4, name: "椅子", price: 15000, category: "家具", inStock: true }
];

// 基本的な配列操作
export function getProductNames(products: Product[]): string[] {
    return products.map(product => product.name);
}

export function getProductSummaries(products: Product[]): string[] {
    return products.map(product => `${product.name}: ¥${product.price.toLocaleString()}`);
}

export function getInStockProducts(products: Product[]): Product[] {
    return products.filter(product => product.inStock);
}

export function getElectronicsProducts(products: Product[]): Product[] {
    return products.filter(product => product.category === "電子機器");
}

export function getProductsInPriceRange(products: Product[], min: number, max: number): Product[] {
    return products.filter(product => product.price >= min && product.price <= max);
}

export function findProductById(products: Product[], id: number): Product | undefined {
    return products.find(product => product.id === id);
}

export function findCheapestProduct(products: Product[]): Product | undefined {
    return products.reduce((cheapest, current) => 
        cheapest && cheapest.price <= current.price ? cheapest : current
    );
}

export function getTotalPrice(products: Product[]): number {
    return products.reduce((total, product) => total + product.price, 0);
}

export function getProductsByCategory(products: Product[]): Record<string, Product[]> {
    return products.reduce((acc, product) => {
        const category = product.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);
}

export function hasExpensiveProducts(products: Product[]): boolean {
    return products.some(product => product.price > 50000);
}

export function allProductsInStock(products: Product[]): boolean {
    return products.every(product => product.inStock);
}

export function sortProductsByPrice(products: Product[]): Product[] {
    return [...products].sort((a, b) => a.price - b.price);
}

export function sortProductsByName(products: Product[]): Product[] {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
}

// 型安全な配列操作
export function isNumber(value: unknown): value is number {
    return typeof value === "number";
}

export function isString(value: unknown): value is string {
    return typeof value === "string";
}

export function processUntypedArray(values: unknown[]): {
    numbers: number[];
    strings: string[];
    others: unknown[];
} {
    const numbers = values.filter(isNumber);
    const strings = values.filter(isString);
    const others = values.filter(value => !isNumber(value) && !isString(value));
    
    return { numbers, strings, others };
}

export function removeNullish<T>(array: (T | null | undefined)[]): T[] {
    return array.filter((item): item is T => item != null);
}

export function processOptionalUsers(users: (User | null | undefined)[]): {
    validUsers: User[];
    userNames: string[];
    totalAge: number;
} {
    const validUsers = removeNullish(users);
    const userNames = validUsers.map(user => user.name);
    const totalAge = validUsers.reduce((sum, user) => sum + user.age, 0);
    
    return { validUsers, userNames, totalAge };
}

// ショッピングカート
interface CartItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    discount?: number;
}

interface Order {
    id: string;
    customerId: number;
    items: CartItem[];
    orderDate: Date;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

export class ShoppingCart {
    private items: CartItem[] = [];
    
    addItem(productId: number, productName: string, price: number, quantity: number = 1): void {
        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId,
                productName,
                price,
                quantity
            });
        }
    }
    
    removeItem(productId: number): void {
        this.items = this.items.filter(item => item.productId !== productId);
    }
    
    updateQuantity(productId: number, quantity: number): void {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
            }
        }
    }
    
    applyDiscount(productId: number, discountPercent: number): void {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            item.discount = Math.min(Math.max(discountPercent, 0), 100);
        }
    }
    
    getItems(): CartItem[] {
        return [...this.items];
    }
    
    getTotalPrice(): number {
        return this.items.reduce((total, item) => {
            const itemPrice = item.price * item.quantity;
            const discount = item.discount ? (itemPrice * item.discount / 100) : 0;
            return total + (itemPrice - discount);
        }, 0);
    }
    
    getItemCount(): number {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    clear(): void {
        this.items = [];
    }
    
    createOrder(customerId: number): Order {
        if (this.items.length === 0) {
            throw new Error("カートが空です");
        }
        
        return {
            id: `order-${Date.now()}`,
            customerId,
            items: [...this.items],
            orderDate: new Date(),
            status: 'pending'
        };
    }
}

// データ分析
interface TimeSeriesData {
    timestamp: Date;
    value: number;
    category?: string;
}

export class DataAnalyzer {
    static mean(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    }
    
    static median(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        
        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    
    static standardDeviation(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        
        const avg = this.mean(numbers);
        const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
        const avgSquareDiff = this.mean(squareDiffs);
        
        return Math.sqrt(avgSquareDiff);
    }
    
    static percentile(numbers: number[], p: number): number {
        if (numbers.length === 0) return 0;
        if (p < 0 || p > 100) throw new Error("パーセンタイルは0-100の範囲で指定してください");
        
        const sorted = [...numbers].sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        
        if (Number.isInteger(index)) {
            return sorted[index];
        }
        
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    static removeOutliers(data: number[], method: 'iqr' | 'zscore' = 'iqr'): number[] {
        if (data.length === 0) return [];
        
        switch (method) {
            case 'iqr':
                const q1 = this.percentile(data, 25);
                const q3 = this.percentile(data, 75);
                const iqr = q3 - q1;
                const lowerBound = q1 - 1.5 * iqr;
                const upperBound = q3 + 1.5 * iqr;
                
                return data.filter(value => value >= lowerBound && value <= upperBound);
                
            case 'zscore':
                const mean = this.mean(data);
                const stdDev = this.standardDeviation(data);
                const threshold = 3;
                
                return data.filter(value => 
                    Math.abs((value - mean) / stdDev) <= threshold
                );
                
            default:
                throw new Error(`未対応の手法: ${method}`);
        }
    }
    
    static normalizeData(data: number[], min: number = 0, max: number = 1): number[] {
        if (data.length === 0) return [];
        
        const dataMin = Math.min(...data);
        const dataMax = Math.max(...data);
        
        if (dataMin === dataMax) {
            return data.map(() => min);
        }
        
        const scale = (max - min) / (dataMax - dataMin);
        
        return data.map(value => min + (value - dataMin) * scale);
    }
}

function main() {
    console.log("=== Lesson 07: 配列型の例 ===\n");

    console.log("1. 基本的な配列操作");
    console.log("商品名:", getProductNames(products));
    console.log("在庫あり商品:", getInStockProducts(products).length + "件");
    console.log("電子機器:", getElectronicsProducts(products).length + "件");
    console.log();

    console.log("2. 配列の検索と集計");
    const cheapest = findCheapestProduct(products);
    console.log("最安商品:", cheapest?.name, "-", cheapest?.price + "円");
    console.log("総額:", getTotalPrice(products).toLocaleString() + "円");
    console.log("高額商品あり:", hasExpensiveProducts(products) ? "はい" : "いいえ");
    console.log();

    console.log("3. カテゴリ別グループ化");
    const byCategory = getProductsByCategory(products);
    Object.entries(byCategory).forEach(([category, items]) => {
        console.log(`${category}: ${items.length}件`);
    });
    console.log();

    console.log("4. ショッピングカート例");
    const cart = new ShoppingCart();
    cart.addItem(1, "ノートPC", 80000, 1);
    cart.addItem(2, "マウス", 2000, 2);
    cart.applyDiscount(1, 10); // 10%割引
    
    console.log("カート内容:", cart.getItems().length + "種類");
    console.log("商品数:", cart.getItemCount() + "個");
    console.log("合計金額:", cart.getTotalPrice().toLocaleString() + "円");
    console.log();

    console.log("5. データ分析例");
    const salesData = [100, 150, 200, 175, 125, 300, 250, 180, 160, 220];
    console.log("売上データ:", salesData);
    console.log("平均:", DataAnalyzer.mean(salesData).toFixed(2));
    console.log("中央値:", DataAnalyzer.median(salesData));
    console.log("標準偏差:", DataAnalyzer.standardDeviation(salesData).toFixed(2));
    console.log("25パーセンタイル:", DataAnalyzer.percentile(salesData, 25));
    console.log("75パーセンタイル:", DataAnalyzer.percentile(salesData, 75));
    
    const withoutOutliers = DataAnalyzer.removeOutliers(salesData);
    console.log("外れ値除去後:", withoutOutliers);
    
    const normalized = DataAnalyzer.normalizeData(salesData);
    console.log("正規化データ:", normalized.map(v => v.toFixed(3)));
    console.log();

    console.log("6. 型安全な配列処理例");
    const mixedData: unknown[] = ["hello", 42, true, null, "world", 3.14];
    const processed = processUntypedArray(mixedData);
    console.log("数値:", processed.numbers);
    console.log("文字列:", processed.strings);
    console.log("その他:", processed.others.length + "件");
    
    const optionalUsers = [users[0], null, users[1], undefined, users[2]];
    const userResult = processOptionalUsers(optionalUsers);
    console.log("有効ユーザー:", userResult.validUsers.length + "人");
    console.log("ユーザー名:", userResult.userNames);
    console.log("平均年齢:", (userResult.totalAge / userResult.validUsers.length).toFixed(1) + "歳");
}

if (require.main === module) {
    main();
}