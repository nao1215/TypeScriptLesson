# Lesson 07: 配列型

## 学習目標
- TypeScriptの配列型の基本的な使い方を理解する
- 配列の操作メソッド（map、filter、reduce等）の型安全な使用方法を学ぶ
- ジェネリクスを使った配列型の活用方法を身につける
- 実用的な配列操作のパターンを理解する

## 概要
TypeScriptの配列型は、同じ型の要素を順序付けて格納するコレクションです。型安全性を保ちながら、JavaScriptの豊富な配列メソッドを活用できます。

## 主な内容

### 1. 配列型の基本
```typescript
// 配列型の宣言方法（2つの記法）
let numbers1: number[] = [1, 2, 3, 4, 5];
let numbers2: Array<number> = [1, 2, 3, 4, 5]; // ジェネリクス記法

// 文字列配列
let fruits: string[] = ["apple", "banana", "orange"];

// boolean配列
let flags: boolean[] = [true, false, true];

// 型推論による配列型の推定
let inferredNumbers = [1, 2, 3]; // number[]として推論される
let inferredStrings = ["a", "b", "c"]; // string[]として推論される

// 空配列の場合は明示的な型指定が必要
let emptyNumbers: number[] = [];
let emptyStrings: string[] = [];
```

### 2. 多次元配列
```typescript
// 2次元配列
let matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

// 3次元配列
let cube: number[][][] = [
    [[1, 2], [3, 4]],
    [[5, 6], [7, 8]]
];

// ジャグ配列（要素の長さが異なる配列）
let jaggedArray: number[][] = [
    [1, 2],
    [3, 4, 5, 6],
    [7]
];
```

### 3. オブジェクト配列
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// オブジェクトの配列
let users: User[] = [
    { id: 1, name: "田中太郎", email: "tanaka@example.com", age: 30 },
    { id: 2, name: "佐藤花子", email: "sato@example.com", age: 25 },
    { id: 3, name: "鈴木一郎", email: "suzuki@example.com", age: 35 }
];

// インラインオブジェクト型
let products: { id: number; name: string; price: number }[] = [
    { id: 1, name: "ノートPC", price: 80000 },
    { id: 2, name: "マウス", price: 2000 }
];
```

### 4. Union型の配列
```typescript
// 異なる型の要素を含む配列
let mixedValues: (string | number)[] = ["hello", 42, "world", 100];
let nullableStrings: (string | null)[] = ["a", null, "b", null, "c"];

// 複雑なUnion型
type Status = "pending" | "completed" | "cancelled";
let taskStatuses: Status[] = ["pending", "completed", "cancelled"];

// オプション型を含む配列
let optionalUsers: (User | undefined)[] = [
    { id: 1, name: "田中", email: "tanaka@example.com", age: 30 },
    undefined,
    { id: 2, name: "佐藤", email: "sato@example.com", age: 25 }
];
```

### 5. 配列の基本操作
```typescript
function demonstrateArrayBasics(): void {
    let numbers: number[] = [1, 2, 3];
    
    // 要素の追加
    numbers.push(4);        // [1, 2, 3, 4]
    numbers.unshift(0);     // [0, 1, 2, 3, 4]
    
    // 要素の削除
    let last = numbers.pop();      // last = 4, numbers = [0, 1, 2, 3]
    let first = numbers.shift();   // first = 0, numbers = [1, 2, 3]
    
    // インデックスアクセス
    let firstElement = numbers[0];     // 1
    let lastElement = numbers[numbers.length - 1]; // 3
    
    // 要素の存在確認
    let hasTwo = numbers.includes(2);   // true
    let indexOfThree = numbers.indexOf(3); // 2
    
    // 配列のコピー
    let copy1 = [...numbers];          // スプレッド演算子
    let copy2 = numbers.slice();       // slice()メソッド
}
```

### 6. 高階関数メソッド
```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

const products: Product[] = [
    { id: 1, name: "ノートPC", price: 80000, category: "電子機器", inStock: true },
    { id: 2, name: "マウス", price: 2000, category: "電子機器", inStock: false },
    { id: 3, name: "デスク", price: 25000, category: "家具", inStock: true },
    { id: 4, name: "椅子", price: 15000, category: "家具", inStock: true }
];

// map: 配列の各要素を変換
function getProductNames(products: Product[]): string[] {
    return products.map(product => product.name);
}

function getProductSummaries(products: Product[]): string[] {
    return products.map(product => `${product.name}: ¥${product.price.toLocaleString()}`);
}

// filter: 条件に合う要素のみを抽出
function getInStockProducts(products: Product[]): Product[] {
    return products.filter(product => product.inStock);
}

function getElectronicsProducts(products: Product[]): Product[] {
    return products.filter(product => product.category === "電子機器");
}

function getProductsInPriceRange(products: Product[], min: number, max: number): Product[] {
    return products.filter(product => product.price >= min && product.price <= max);
}

// find: 条件に合う最初の要素を取得
function findProductById(products: Product[], id: number): Product | undefined {
    return products.find(product => product.id === id);
}

function findCheapestProduct(products: Product[]): Product | undefined {
    return products.find(product => 
        product.price === Math.min(...products.map(p => p.price))
    );
}

// reduce: 配列を単一の値に集約
function getTotalPrice(products: Product[]): number {
    return products.reduce((total, product) => total + product.price, 0);
}

function getProductsByCategory(products: Product[]): Record<string, Product[]> {
    return products.reduce((acc, product) => {
        const category = product.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);
}

// some/every: 条件チェック
function hasExpensiveProducts(products: Product[]): boolean {
    return products.some(product => product.price > 50000);
}

function allProductsInStock(products: Product[]): boolean {
    return products.every(product => product.inStock);
}

// sort: 配列のソート
function sortProductsByPrice(products: Product[]): Product[] {
    return [...products].sort((a, b) => a.price - b.price); // 昇順
}

function sortProductsByName(products: Product[]): Product[] {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
}
```

### 7. 型安全な配列操作
```typescript
// 型ガードを使った配列操作
function isNumber(value: unknown): value is number {
    return typeof value === "number";
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function processUntypedArray(values: unknown[]): {
    numbers: number[];
    strings: string[];
    others: unknown[];
} {
    const numbers = values.filter(isNumber);
    const strings = values.filter(isString);
    const others = values.filter(value => !isNumber(value) && !isString(value));
    
    return { numbers, strings, others };
}

// null/undefined の安全な処理
function removeNullish<T>(array: (T | null | undefined)[]): T[] {
    return array.filter((item): item is T => item != null);
}

function processOptionalUsers(users: (User | null | undefined)[]): {
    validUsers: User[];
    userNames: string[];
    totalAge: number;
} {
    const validUsers = removeNullish(users);
    const userNames = validUsers.map(user => user.name);
    const totalAge = validUsers.reduce((sum, user) => sum + user.age, 0);
    
    return { validUsers, userNames, totalAge };
}
```

## 実践的な使用例

### 例1: Eコマースの商品管理システム
```typescript
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

class ShoppingCart {
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
        return [...this.items]; // 防御的コピー
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
```

### 例2: 学習管理システム
```typescript
interface Student {
    id: number;
    name: string;
    email: string;
    enrollmentDate: Date;
}

interface Course {
    id: number;
    title: string;
    description: string;
    credits: number;
    instructor: string;
}

interface Grade {
    studentId: number;
    courseId: number;
    score: number;
    semester: string;
    year: number;
}

interface Enrollment {
    studentId: number;
    courseId: number;
    enrollmentDate: Date;
    status: 'active' | 'completed' | 'dropped';
}

class AcademicSystem {
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: Grade[] = [];
    private enrollments: Enrollment[] = [];
    
    // 学生管理
    addStudent(student: Omit<Student, 'id'>): Student {
        const newStudent: Student = {
            ...student,
            id: this.students.length + 1
        };
        this.students.push(newStudent);
        return newStudent;
    }
    
    getStudentsByEnrollmentYear(year: number): Student[] {
        return this.students.filter(student => 
            student.enrollmentDate.getFullYear() === year
        );
    }
    
    // コース管理
    addCourse(course: Omit<Course, 'id'>): Course {
        const newCourse: Course = {
            ...course,
            id: this.courses.length + 1
        };
        this.courses.push(newCourse);
        return newCourse;
    }
    
    getCoursesByCredits(minCredits: number, maxCredits: number): Course[] {
        return this.courses.filter(course => 
            course.credits >= minCredits && course.credits <= maxCredits
        );
    }
    
    getCoursesByInstructor(instructor: string): Course[] {
        return this.courses.filter(course => 
            course.instructor.toLowerCase().includes(instructor.toLowerCase())
        );
    }
    
    // 履修管理
    enrollStudent(studentId: number, courseId: number): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        
        if (!student || !course) {
            throw new Error("学生またはコースが見つかりません");
        }
        
        const existingEnrollment = this.enrollments.find(e => 
            e.studentId === studentId && e.courseId === courseId && e.status === 'active'
        );
        
        if (existingEnrollment) {
            throw new Error("既に履修済みです");
        }
        
        this.enrollments.push({
            studentId,
            courseId,
            enrollmentDate: new Date(),
            status: 'active'
        });
    }
    
    getStudentCourses(studentId: number): Course[] {
        const studentEnrollments = this.enrollments.filter(e => 
            e.studentId === studentId && e.status === 'active'
        );
        
        return studentEnrollments
            .map(enrollment => this.courses.find(c => c.id === enrollment.courseId))
            .filter((course): course is Course => course !== undefined);
    }
    
    getCourseStudents(courseId: number): Student[] {
        const courseEnrollments = this.enrollments.filter(e => 
            e.courseId === courseId && e.status === 'active'
        );
        
        return courseEnrollments
            .map(enrollment => this.students.find(s => s.id === enrollment.studentId))
            .filter((student): student is Student => student !== undefined);
    }
    
    // 成績管理
    addGrade(grade: Grade): void {
        if (grade.score < 0 || grade.score > 100) {
            throw new Error("成績は0-100の範囲で入力してください");
        }
        
        const existingGradeIndex = this.grades.findIndex(g => 
            g.studentId === grade.studentId && 
            g.courseId === grade.courseId && 
            g.semester === grade.semester && 
            g.year === grade.year
        );
        
        if (existingGradeIndex >= 0) {
            this.grades[existingGradeIndex] = grade;
        } else {
            this.grades.push(grade);
        }
    }
    
    getStudentGrades(studentId: number): Grade[] {
        return this.grades.filter(grade => grade.studentId === studentId);
    }
    
    calculateGPA(studentId: number, year?: number): number {
        let studentGrades = this.getStudentGrades(studentId);
        
        if (year) {
            studentGrades = studentGrades.filter(grade => grade.year === year);
        }
        
        if (studentGrades.length === 0) {
            return 0;
        }
        
        const totalPoints = studentGrades.reduce((sum, grade) => {
            const course = this.courses.find(c => c.id === grade.courseId);
            const gpa = this.scoreToGPA(grade.score);
            return sum + (gpa * (course?.credits || 1));
        }, 0);
        
        const totalCredits = studentGrades.reduce((sum, grade) => {
            const course = this.courses.find(c => c.id === grade.courseId);
            return sum + (course?.credits || 1);
        }, 0);
        
        return totalPoints / totalCredits;
    }
    
    private scoreToGPA(score: number): number {
        if (score >= 90) return 4.0;
        if (score >= 80) return 3.0;
        if (score >= 70) return 2.0;
        if (score >= 60) return 1.0;
        return 0.0;
    }
    
    getTopStudents(limit: number = 10): Array<Student & { gpa: number }> {
        return this.students
            .map(student => ({
                ...student,
                gpa: this.calculateGPA(student.id)
            }))
            .filter(student => student.gpa > 0)
            .sort((a, b) => b.gpa - a.gpa)
            .slice(0, limit);
    }
    
    getCourseStatistics(courseId: number): {
        enrolledStudents: number;
        averageGrade: number;
        passRate: number;
        gradeDistribution: Record<string, number>;
    } {
        const enrolledStudents = this.getCourseStudents(courseId).length;
        const courseGrades = this.grades.filter(grade => grade.courseId === courseId);
        
        if (courseGrades.length === 0) {
            return {
                enrolledStudents,
                averageGrade: 0,
                passRate: 0,
                gradeDistribution: {}
            };
        }
        
        const averageGrade = courseGrades.reduce((sum, grade) => sum + grade.score, 0) / courseGrades.length;
        const passCount = courseGrades.filter(grade => grade.score >= 60).length;
        const passRate = (passCount / courseGrades.length) * 100;
        
        const gradeDistribution = courseGrades.reduce((distribution, grade) => {
            let gradeLevel: string;
            if (grade.score >= 90) gradeLevel = "A";
            else if (grade.score >= 80) gradeLevel = "B";
            else if (grade.score >= 70) gradeLevel = "C";
            else if (grade.score >= 60) gradeLevel = "D";
            else gradeLevel = "F";
            
            distribution[gradeLevel] = (distribution[gradeLevel] || 0) + 1;
            return distribution;
        }, {} as Record<string, number>);
        
        return {
            enrolledStudents,
            averageGrade,
            passRate,
            gradeDistribution
        };
    }
}
```

### 例3: データ分析ユーティリティ
```typescript
interface DataPoint {
    x: number;
    y: number;
    label?: string;
}

interface TimeSeriesData {
    timestamp: Date;
    value: number;
    category?: string;
}

class DataAnalyzer {
    // 基本統計
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
    
    // 時系列データ分析
    static groupByPeriod(data: TimeSeriesData[], period: 'hour' | 'day' | 'month'): Map<string, TimeSeriesData[]> {
        const groups = new Map<string, TimeSeriesData[]>();
        
        data.forEach(point => {
            let key: string;
            const date = point.timestamp;
            
            switch (period) {
                case 'hour':
                    key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
                    break;
                case 'day':
                    key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${date.getMonth()}`;
                    break;
                default:
                    throw new Error(`未対応の期間: ${period}`);
            }
            
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(point);
        });
        
        return groups;
    }
    
    static calculateMovingAverage(data: TimeSeriesData[], windowSize: number): TimeSeriesData[] {
        if (windowSize <= 0 || windowSize > data.length) {
            throw new Error("不正なウィンドウサイズです");
        }
        
        const sortedData = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const result: TimeSeriesData[] = [];
        
        for (let i = windowSize - 1; i < sortedData.length; i++) {
            const window = sortedData.slice(i - windowSize + 1, i + 1);
            const average = window.reduce((sum, point) => sum + point.value, 0) / windowSize;
            
            result.push({
                timestamp: sortedData[i].timestamp,
                value: average,
                category: 'moving_average'
            });
        }
        
        return result;
    }
    
    // データクリーニング
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
                const threshold = 3; // 3σルール
                
                return data.filter(value => 
                    Math.abs((value - mean) / stdDev) <= threshold
                );
                
            default:
                throw new Error(`未対応の手法: ${method}`);
        }
    }
    
    static fillMissingValues(data: (number | null)[], method: 'mean' | 'median' | 'forward' = 'mean'): number[] {
        const validValues = data.filter((value): value is number => value !== null);
        
        if (validValues.length === 0) {
            throw new Error("有効なデータがありません");
        }
        
        let fillValue: number;
        switch (method) {
            case 'mean':
                fillValue = this.mean(validValues);
                break;
            case 'median':
                fillValue = this.median(validValues);
                break;
            case 'forward':
                // 前方補間は複雑なので簡単な実装
                return data.map((value, index) => {
                    if (value !== null) return value;
                    // 前の有効な値を探す
                    for (let i = index - 1; i >= 0; i--) {
                        if (data[i] !== null) return data[i]!;
                    }
                    // 見つからなければ最初の有効な値を使用
                    return validValues[0];
                });
            default:
                throw new Error(`未対応の手法: ${method}`);
        }
        
        return data.map(value => value ?? fillValue);
    }
    
    // データ変換
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
    
    static binData(data: number[], binCount: number): { bin: [number, number]; count: number; values: number[] }[] {
        if (data.length === 0 || binCount <= 0) return [];
        
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binWidth = (max - min) / binCount;
        
        const bins: { bin: [number, number]; count: number; values: number[] }[] = [];
        
        for (let i = 0; i < binCount; i++) {
            const binMin = min + i * binWidth;
            const binMax = i === binCount - 1 ? max : binMin + binWidth;
            
            const valuesInBin = data.filter(value => 
                value >= binMin && (i === binCount - 1 ? value <= binMax : value < binMax)
            );
            
            bins.push({
                bin: [binMin, binMax],
                count: valuesInBin.length,
                values: valuesInBin
            });
        }
        
        return bins;
    }
}
```

## よくある落とし穴と対処法

### 1. 配列の変更メソッドと非変更メソッド
```typescript
// 危険: 元の配列を変更してしまう
function badSort(numbers: number[]): number[] {
    return numbers.sort((a, b) => a - b); // 元の配列が変更される
}

// 安全: 元の配列を保持
function goodSort(numbers: number[]): number[] {
    return [...numbers].sort((a, b) => a - b); // コピーを作成してソート
}

// その他の変更メソッドに注意
function demonstrateMutatingMethods(): void {
    let original = [1, 2, 3];
    
    // これらは元の配列を変更する
    original.push(4);         // [1, 2, 3, 4]
    original.pop();           // [1, 2, 3]
    original.splice(1, 1);    // [1, 3]
    original.reverse();       // [3, 1]
    original.sort();          // [1, 3]
    
    // 非変更の代替手段
    let numbers = [3, 1, 4, 2];
    let added = [...numbers, 5];                    // push の代わり
    let removed = numbers.slice(0, -1);             // pop の代わり
    let spliced = [...numbers.slice(0, 1), ...numbers.slice(2)]; // splice の代わり
    let reversed = [...numbers].reverse();          // reverse の代わり
    let sorted = [...numbers].sort();               // sort の代わり
}
```

### 2. 配列のインデックスアクセスの型安全性
```typescript
// 危険: undefined の可能性を考慮していない
function badAccess(numbers: number[]): number {
    return numbers[0] * 2; // numbers[0] は undefined の可能性がある
}

// 安全: undefined をチェック
function goodAccess(numbers: number[]): number {
    const first = numbers[0];
    return first !== undefined ? first * 2 : 0;
}

// より安全な方法
function safeAccess(numbers: number[]): number {
    return (numbers[0] ?? 0) * 2;
}

// Optional Chaining（配列では直接使えないが、オブジェクト配列で有用）
interface Item {
    value: number;
}

function accessNestedValue(items: Item[]): number | undefined {
    return items[0]?.value; // 安全にアクセス
}
```

### 3. 空配列の処理
```typescript
// 危険: 空配列の場合を考慮していない
function badReduce(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num); // 空配列でエラー
}

// 安全: 初期値を提供
function goodReduce(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0);
}

// 事前チェック
function safeCalculation(numbers: number[]): number | null {
    if (numbers.length === 0) {
        return null;
    }
    return numbers.reduce((sum, num) => sum + num) / numbers.length;
}
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `getUniqueValues<T>(array: T[]): T[]` - 重複を除いた配列を返す
2. `groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]>` - 指定キーでグループ化
3. `findMaxBy<T>(array: T[], getValue: (item: T) => number): T | undefined` - 最大値を持つ要素を検索
4. `chunkArray<T>(array: T[], size: number): T[][]` - 配列を指定サイズで分割
5. `flattenArray<T>(array: (T | T[])[]): T[]` - ネストされた配列を平坦化

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-07
```

## 次のレッスン
[Lesson 08: タプル型](../lesson-08/README.md)では、固定長の配列であるタプル型について学習します。