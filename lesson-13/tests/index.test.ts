import { 
    greet, 
    createUser, 
    buildUrl, 
    formatDate, 
    calculatePrice 
} from '../src/index';
import { 
    createProfile, 
    slice, 
    mergeConfig 
} from '../src/solution';

describe('Lesson 13: オプショナル引数', () => {
    describe('基本的なオプショナル引数', () => {
        test('greet関数が正しく動作する', () => {
            expect(greet("Alice")).toBe("Hello, Alice!");
            expect(greet("Bob", "Good morning")).toBe("Good morning, Bob!");
            expect(greet("Charlie", "Hi")).toBe("Hi, Charlie!");
        });

        test('createUser関数が正しく動作する', () => {
            expect(createUser("Alice")).toEqual({
                name: "Alice",
                age: 0,
                email: "unknown@example.com"
            });
            
            expect(createUser("Bob", 25)).toEqual({
                name: "Bob",
                age: 25,
                email: "unknown@example.com"
            });
            
            expect(createUser("Charlie", 30, "charlie@example.com")).toEqual({
                name: "Charlie",
                age: 30,
                email: "charlie@example.com"
            });
        });
    });

    describe('複数のオプショナル引数', () => {
        test('buildUrl関数が正しく動作する', () => {
            expect(buildUrl("https", "example.com")).toBe("https://example.com");
            expect(buildUrl("https", "example.com", "api/users")).toBe("https://example.com/api/users");
            expect(buildUrl("http", "localhost", undefined, 3000)).toBe("http://localhost:3000");
            expect(buildUrl("https", "api.example.com", "v1/products", 443)).toBe("https://api.example.com:443/v1/products");
        });

        test('formatDate関数が正しく動作する', () => {
            const date = new Date(2024, 0, 15);
            expect(formatDate(date)).toBe("2024-01-15");
            expect(formatDate(date, "DD/MM/YYYY")).toBe("15/01/2024");
            expect(formatDate(date, "MM/DD/YYYY", "en-US")).toBe("01/15/2024");
        });
    });

    describe('オプショナル引数の計算', () => {
        test('calculatePrice関数が正しく動作する', () => {
            expect(calculatePrice(100)).toBe(110);
            expect(calculatePrice(100, 0.08)).toBe(108);
            expect(calculatePrice(100, 0.08, 0.1)).toBe(97.2);
            expect(calculatePrice(50, 0.05, 0.2)).toBe(42);
        });
    });

    describe('演習問題', () => {
        test('createProfile関数が正しく動作する', () => {
            expect(createProfile("Alice")).toBe("Name: Alice");
            expect(createProfile("Bob", 25)).toBe("Name: Bob, Age: 25");
            expect(createProfile("Charlie", 0)).toBe("Name: Charlie, Age: 0");
        });

        test('slice関数が正しく動作する', () => {
            const array = [1, 2, 3, 4, 5];
            
            expect(slice(array)).toEqual([1, 2, 3, 4, 5]);
            expect(slice(array, 2)).toEqual([3, 4, 5]);
            expect(slice(array, 1, 4)).toEqual([2, 3, 4]);
            expect(slice(array, undefined, 3)).toEqual([1, 2, 3]);
            expect(slice([], 1, 3)).toEqual([]);
        });

        test('mergeConfig関数が正しく動作する', () => {
            expect(mergeConfig()).toEqual({
                apiUrl: "https://api.example.com",
                timeout: 5000,
                retries: 3
            });
            
            expect(mergeConfig({ apiUrl: "https://custom.com" })).toEqual({
                apiUrl: "https://custom.com",
                timeout: 5000,
                retries: 3
            });
            
            expect(mergeConfig({ timeout: 10000, retries: 5 })).toEqual({
                apiUrl: "https://api.example.com",
                timeout: 10000,
                retries: 5
            });
            
            expect(mergeConfig({})).toEqual({
                apiUrl: "https://api.example.com",
                timeout: 5000,
                retries: 3
            });
        });
    });
});