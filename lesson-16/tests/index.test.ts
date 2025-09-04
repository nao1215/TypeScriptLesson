/**
 * Lesson 16: オブジェクト型 - テストコード
 */

import {
    Book,
    getAvailableBooks,
    findBooksByAuthor,
    AppSettings,
    createDefaultSettings,
    updateSettings,
    Dictionary,
    addToDictionary,
    getDictionaryKeys,
    findKeysByValue,
    Address,
    Employee,
    Department,
    Company,
    getTotalEmployeeCount,
    findDepartmentByName,
    getAverageSalary
} from '../src/solution';

describe('Lesson 16: オブジェクト型', () => {
    describe('書籍管理システム', () => {
        const books: Book[] = [
            {
                id: 1,
                title: "TypeScript Handbook",
                author: "Microsoft",
                publishedYear: 2020,
                isbn: "123-456-789",
                genre: "Programming",
                isAvailable: true
            },
            {
                id: 2,
                title: "JavaScript: The Good Parts",
                author: "Douglas Crockford",
                publishedYear: 2008,
                isAvailable: false
            },
            {
                id: 3,
                title: "Clean Code",
                author: "Robert Martin",
                publishedYear: 2008,
                genre: "Programming",
                isAvailable: true
            }
        ];

        test('getAvailableBooks: 利用可能な書籍のみを返す', () => {
            const available = getAvailableBooks(books);
            expect(available).toHaveLength(2);
            expect(available[0].title).toBe("TypeScript Handbook");
            expect(available[1].title).toBe("Clean Code");
        });

        test('findBooksByAuthor: 指定した著者の書籍を返す', () => {
            const microsoftBooks = findBooksByAuthor(books, "Microsoft");
            expect(microsoftBooks).toHaveLength(1);
            expect(microsoftBooks[0].title).toBe("TypeScript Handbook");
        });

        test('findBooksByAuthor: 大文字小文字を区別しない', () => {
            const books2 = findBooksByAuthor(books, "MICROSOFT");
            expect(books2).toHaveLength(1);
        });

        test('findBooksByAuthor: 存在しない著者の場合は空配列', () => {
            const noBooks = findBooksByAuthor(books, "Unknown Author");
            expect(noBooks).toHaveLength(0);
        });
    });

    describe('アプリケーション設定管理', () => {
        test('createDefaultSettings: デフォルト設定を作成', () => {
            const settings = createDefaultSettings();
            expect(settings.appName).toBe("MyApp");
            expect(settings.version).toBe("1.0.0");
            expect(settings.apiEndpoint).toBe("https://api.example.com");
            expect(settings.timeout).toBe(5000);
            expect(settings.retryCount).toBe(3);
            expect(settings.enableLogging).toBe(true);
            expect(settings.theme).toBeUndefined();
        });

        test('updateSettings: 設定を部分的に更新', () => {
            const original = createDefaultSettings();
            const updated = updateSettings(original, {
                timeout: 10000,
                enableLogging: false,
                theme: "dark"
            });

            // 読み取り専用プロパティは変更されない
            expect(updated.appName).toBe("MyApp");
            expect(updated.version).toBe("1.0.0");
            expect(updated.apiEndpoint).toBe("https://api.example.com");

            // 変更可能プロパティは更新される
            expect(updated.timeout).toBe(10000);
            expect(updated.enableLogging).toBe(false);
            expect(updated.theme).toBe("dark");
            expect(updated.retryCount).toBe(3); // 更新されていない
        });
    });

    describe('辞書型オブジェクト操作', () => {
        const testDict: Dictionary = {
            name: "Alice",
            city: "Tokyo",
            country: "Japan",
            language: "Japanese"
        };

        test('addToDictionary: 新しいキーと値を追加', () => {
            const updated = addToDictionary(testDict, "age", "25");
            expect(updated.age).toBe("25");
            expect(updated.name).toBe("Alice"); // 既存の値は保持
            expect(testDict.age).toBeUndefined(); // 元のオブジェクトは変更されない
        });

        test('getDictionaryKeys: すべてのキーを取得', () => {
            const keys = getDictionaryKeys(testDict);
            expect(keys).toContain("name");
            expect(keys).toContain("city");
            expect(keys).toContain("country");
            expect(keys).toContain("language");
            expect(keys).toHaveLength(4);
        });

        test('findKeysByValue: 指定した値を持つキーを検索', () => {
            const dict: Dictionary = {
                key1: "value1",
                key2: "value2",
                key3: "value1",
                key4: "value3"
            };
            
            const keys = findKeysByValue(dict, "value1");
            expect(keys).toContain("key1");
            expect(keys).toContain("key3");
            expect(keys).toHaveLength(2);
        });

        test('findKeysByValue: 存在しない値の場合は空配列', () => {
            const keys = findKeysByValue(testDict, "nonexistent");
            expect(keys).toHaveLength(0);
        });
    });

    describe('ネストした型を持つ複雑なオブジェクト', () => {
        const testCompany: Company = {
            name: "Tech Corp",
            founded: 2010,
            address: {
                street: "123 Tech Street",
                city: "San Francisco",
                country: "USA",
                zipCode: "94105"
            },
            departments: [
                {
                    name: "Engineering",
                    manager: {
                        id: 1,
                        name: "Alice Johnson",
                        position: "Engineering Manager",
                        salary: 120000,
                        email: "alice@techcorp.com"
                    },
                    employees: [
                        {
                            id: 2,
                            name: "Bob Smith",
                            position: "Senior Developer",
                            salary: 90000
                        },
                        {
                            id: 3,
                            name: "Carol Davis",
                            position: "Developer",
                            salary: 75000,
                            email: "carol@techcorp.com"
                        }
                    ],
                    budget: 500000
                },
                {
                    name: "Marketing",
                    manager: {
                        id: 4,
                        name: "David Wilson",
                        position: "Marketing Manager",
                        salary: 95000
                    },
                    employees: [
                        {
                            id: 5,
                            name: "Eve Brown",
                            position: "Marketing Specialist",
                            salary: 60000
                        }
                    ]
                }
            ]
        };

        test('getTotalEmployeeCount: 全従業員数を計算（マネージャー含む）', () => {
            const count = getTotalEmployeeCount(testCompany);
            expect(count).toBe(5); // 2つの部署のマネージャー + 3人の従業員
        });

        test('findDepartmentByName: 部署名で部署を検索', () => {
            const engineering = findDepartmentByName(testCompany, "Engineering");
            expect(engineering).toBeDefined();
            expect(engineering?.name).toBe("Engineering");
            expect(engineering?.manager.name).toBe("Alice Johnson");
        });

        test('findDepartmentByName: 大文字小文字を区別しない', () => {
            const marketing = findDepartmentByName(testCompany, "MARKETING");
            expect(marketing).toBeDefined();
            expect(marketing?.name).toBe("Marketing");
        });

        test('findDepartmentByName: 存在しない部署の場合はundefined', () => {
            const hr = findDepartmentByName(testCompany, "HR");
            expect(hr).toBeUndefined();
        });

        test('getAverageSalary: 全従業員の平均給与を計算', () => {
            const avgSalary = getAverageSalary(testCompany);
            // (120000 + 90000 + 75000 + 95000 + 60000) / 5 = 88000
            expect(avgSalary).toBe(88000);
        });

        test('空の会社の場合の処理', () => {
            const emptyCompany: Company = {
                name: "Empty Corp",
                founded: 2023,
                address: {
                    street: "Empty St",
                    city: "Empty City",
                    country: "Empty Country"
                },
                departments: []
            };

            expect(getTotalEmployeeCount(emptyCompany)).toBe(0);
            expect(getAverageSalary(emptyCompany)).toBe(0);
            expect(findDepartmentByName(emptyCompany, "Any")).toBeUndefined();
        });
    });
});