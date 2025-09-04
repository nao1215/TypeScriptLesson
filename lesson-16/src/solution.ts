/**
 * Lesson 16: オブジェクト型 - 解答例
 */

/**
 * 演習1: 書籍管理システム
 */
export interface Book {
    id: number;
    title: string;
    author: string;
    publishedYear: number;
    isbn?: string;
    genre?: string;
    isAvailable: boolean;
}

export function getAvailableBooks(books: Book[]): Book[] {
    return books.filter(book => book.isAvailable);
}

export function findBooksByAuthor(books: Book[], author: string): Book[] {
    return books.filter(book => book.author.toLowerCase() === author.toLowerCase());
}

/**
 * 演習2: アプリケーション設定管理
 */
export interface AppSettings {
    readonly appName: string;
    readonly version: string;
    readonly apiEndpoint: string;
    timeout: number;
    retryCount: number;
    enableLogging: boolean;
    theme?: string;
}

export function createDefaultSettings(): AppSettings {
    return {
        appName: "MyApp",
        version: "1.0.0",
        apiEndpoint: "https://api.example.com",
        timeout: 5000,
        retryCount: 3,
        enableLogging: true
    };
}

export function updateSettings(
    settings: AppSettings,
    updates: Partial<Pick<AppSettings, 'timeout' | 'retryCount' | 'enableLogging' | 'theme'>>
): AppSettings {
    return {
        ...settings,
        ...updates
    };
}

/**
 * 演習3: 辞書型オブジェクト操作
 */
export interface Dictionary {
    [key: string]: string;
}

export function addToDictionary(dict: Dictionary, key: string, value: string): Dictionary {
    return {
        ...dict,
        [key]: value
    };
}

export function getDictionaryKeys(dict: Dictionary): string[] {
    return Object.keys(dict);
}

export function findKeysByValue(dict: Dictionary, searchValue: string): string[] {
    return Object.keys(dict).filter(key => dict[key] === searchValue);
}

/**
 * 演習4: ネストした型を持つ複雑なオブジェクト
 */
export interface Address {
    street: string;
    city: string;
    country: string;
    zipCode?: string;
}

export interface Employee {
    id: number;
    name: string;
    position: string;
    salary: number;
    email?: string;
}

export interface Department {
    name: string;
    manager: Employee;
    employees: Employee[];
    budget?: number;
}

export interface Company {
    name: string;
    founded: number;
    address: Address;
    departments: Department[];
}

export function getTotalEmployeeCount(company: Company): number {
    return company.departments.reduce((total, department) => {
        // 各部署の従業員数 + マネージャー（従業員配列に含まれていない場合を考慮）
        const managerCount = department.employees.some(emp => emp.id === department.manager.id) ? 0 : 1;
        return total + department.employees.length + managerCount;
    }, 0);
}

export function findDepartmentByName(company: Company, departmentName: string): Department | undefined {
    return company.departments.find(department => 
        department.name.toLowerCase() === departmentName.toLowerCase()
    );
}

export function getAverageSalary(company: Company): number {
    const allEmployees: Employee[] = [];
    
    company.departments.forEach(department => {
        // マネージャーを追加（重複しないように）
        if (!allEmployees.some(emp => emp.id === department.manager.id)) {
            allEmployees.push(department.manager);
        }
        
        // 部署の従業員を追加（重複しないように）
        department.employees.forEach(employee => {
            if (!allEmployees.some(emp => emp.id === employee.id)) {
                allEmployees.push(employee);
            }
        });
    });
    
    if (allEmployees.length === 0) {
        return 0;
    }
    
    const totalSalary = allEmployees.reduce((sum, employee) => sum + employee.salary, 0);
    return totalSalary / allEmployees.length;
}