import {
    isString,
    isNumber,
    isBoolean,
    isObject,
    isArray,
    isStringArray,
    isNumberArray,
    isArrayOf,
    hasProperty,
    processUnknownValue,
    processObjectValue,
    handleError,
    safeJsonParse,
    FormValidator,
    ApiClient,
    ConfigLoader
} from '../src/index';

import {
    isValidUser,
    safeGetArrayLength,
    extractStringProperties,
    parseNumberSafely,
    mergeObjects
} from '../src/solution';

describe('Lesson 10: any型とunknown型', () => {
    describe('基本的な型ガード', () => {
        test('isString', () => {
            expect(isString("hello")).toBe(true);
            expect(isString("")).toBe(true);
            expect(isString(42)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString({})).toBe(false);
        });

        test('isNumber', () => {
            expect(isNumber(42)).toBe(true);
            expect(isNumber(3.14)).toBe(true);
            expect(isNumber(0)).toBe(true);
            expect(isNumber(-1)).toBe(true);
            expect(isNumber(NaN)).toBe(false);
            expect(isNumber("42")).toBe(false);
            expect(isNumber(null)).toBe(false);
        });

        test('isBoolean', () => {
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(false)).toBe(true);
            expect(isBoolean(1)).toBe(false);
            expect(isBoolean(0)).toBe(false);
            expect(isBoolean("true")).toBe(false);
        });

        test('isObject', () => {
            expect(isObject({})).toBe(true);
            expect(isObject({ a: 1 })).toBe(true);
            expect(isObject([])).toBe(false);
            expect(isObject(null)).toBe(false);
            expect(isObject("object")).toBe(false);
            expect(isObject(42)).toBe(false);
        });

        test('isArray', () => {
            expect(isArray([])).toBe(true);
            expect(isArray([1, 2, 3])).toBe(true);
            expect(isArray({})).toBe(false);
            expect(isArray("array")).toBe(false);
        });

        test('isStringArray', () => {
            expect(isStringArray(["a", "b", "c"])).toBe(true);
            expect(isStringArray([])).toBe(true);
            expect(isStringArray([1, 2, 3])).toBe(false);
            expect(isStringArray(["a", 1, "c"])).toBe(false);
            expect(isStringArray("not array")).toBe(false);
        });

        test('isNumberArray', () => {
            expect(isNumberArray([1, 2, 3])).toBe(true);
            expect(isNumberArray([])).toBe(true);
            expect(isNumberArray(["a", "b"])).toBe(false);
            expect(isNumberArray([1, "2", 3])).toBe(false);
        });

        test('isArrayOf', () => {
            const isStringItem = (item: unknown): item is string => typeof item === "string";
            
            expect(isArrayOf(["a", "b"], isStringItem)).toBe(true);
            expect(isArrayOf([1, 2], isStringItem)).toBe(false);
            expect(isArrayOf("not array", isStringItem)).toBe(false);
        });

        test('hasProperty', () => {
            const obj = { name: "John", age: 30 };
            
            expect(hasProperty(obj, "name")).toBe(true);
            expect(hasProperty(obj, "age")).toBe(true);
            expect(hasProperty(obj, "email")).toBe(false);
        });
    });

    describe('値の処理', () => {
        test('processUnknownValue', () => {
            expect(processUnknownValue("hello")).toBe("HELLO");
            expect(processUnknownValue(42)).toBe("42");
            expect(processUnknownValue(true)).toBe("true");
            expect(processUnknownValue(false)).toBe("false");
            expect(processUnknownValue({})).toBe("Unknown type");
        });

        test('processObjectValue', () => {
            const date = new Date("2023-01-01");
            expect(processObjectValue(date)).toBe(date.toISOString());
            
            expect(processObjectValue([1, 2, 3])).toBe("Array with 3 items");
            
            const error = new Error("Test error");
            expect(processObjectValue(error)).toBe("Error: Test error");
            
            expect(processObjectValue({})).toBe("Not a recognized object type");
        });
    });

    describe('エラーハンドリング', () => {
        test('handleError', () => {
            const error = new Error("Test error");
            expect(handleError(error)).toBe("Error: Test error");
            
            expect(handleError("String error")).toBe("String error: String error");
            
            const objError = { message: "Object error" };
            expect(handleError(objError)).toBe("Object error: Object error");
            
            expect(handleError(42)).toBe("Unknown error: 42");
        });
    });

    describe('JSON解析', () => {
        test('safeJsonParse - 成功', () => {
            const result = safeJsonParse('{"name": "John"}');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ name: "John" });
            }
        });

        test('safeJsonParse - 失敗', () => {
            const result = safeJsonParse('invalid json');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Error:");
            }
        });
    });

    describe('フォームバリデーション', () => {
        test('有効なフォームデータ', () => {
            const validForm = {
                name: "田中太郎",
                email: "tanaka@example.com",
                age: 30,
                subscribe: true,
                interests: ["TypeScript"]
            };
            
            expect(FormValidator.isValidFormData(validForm)).toBe(true);
            
            const validation = FormValidator.validateFormData(validForm);
            expect(validation.isValid).toBe(true);
            expect(validation.data).toEqual(validForm);
        });

        test('無効なフォームデータ', () => {
            const invalidForm = {
                name: "",
                email: "invalid-email",
                age: -5,
                subscribe: "yes"
            };
            
            expect(FormValidator.isValidFormData(invalidForm)).toBe(false);
            
            const validation = FormValidator.validateFormData(invalidForm);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        test('オブジェクトでない入力', () => {
            expect(FormValidator.isValidFormData("not object")).toBe(false);
            
            const validation = FormValidator.validateFormData("not object");
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain("データはオブジェクトである必要があります");
        });
    });

    describe('APIクライアント', () => {
        let apiClient: ApiClient;

        beforeEach(() => {
            apiClient = new ApiClient("https://api.example.com");
        });

        test('ユーザー取得成功', async () => {
            const user = await apiClient.getUser(1);
            expect(user.id).toBe(1);
            expect(user.username).toBe("testuser");
            expect(user.email).toBe("test@example.com");
        });

        test('ユーザーデータ変換', () => {
            const rawData = {
                id: 123,
                username: "testuser",
                email: "test@example.com",
                profile: {
                    firstName: "Test",
                    lastName: "User"
                },
                roles: ["user", "admin"]
            };
            
            const transformed = apiClient.transformUserData(rawData);
            expect(transformed.id).toBe(123);
            expect(transformed.username).toBe("testuser");
            expect(transformed.profile?.firstName).toBe("Test");
        });

        test('不正なデータの変換', () => {
            const transformed1 = apiClient.transformUserData("not object");
            expect(Object.keys(transformed1)).toHaveLength(0);
            
            const transformed2 = apiClient.transformUserData({ id: "invalid" });
            expect(transformed2.id).toBeUndefined();
        });
    });

    describe('設定管理', () => {
        const validConfigJson = `{
            "database": {
                "host": "localhost",
                "port": 5432,
                "username": "postgres",
                "password": "password",
                "database": "myapp"
            },
            "server": {
                "port": 3000
            },
            "logging": {
                "level": "info",
                "console": true
            }
        }`;

        test('有効な設定ファイルの読み込み', () => {
            const config = ConfigLoader.loadConfig(validConfigJson);
            expect(config.database.host).toBe("localhost");
            expect(config.server.port).toBe(3000);
            expect(config.logging.level).toBe("info");
        });

        test('設定の検証', () => {
            const config = ConfigLoader.loadConfig(validConfigJson);
            const validation = ConfigLoader.validateConfig(config);
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        test('不正な設定ファイル', () => {
            expect(() => {
                ConfigLoader.loadConfig('invalid json');
            }).toThrow();
            
            expect(() => {
                ConfigLoader.loadConfig('{"invalid": "config"}');
            }).toThrow();
        });

        test('不正なポート番号', () => {
            const configWithInvalidPort = JSON.stringify({
                database: {
                    host: "localhost",
                    port: 99999, // 無効なポート
                    username: "postgres",
                    password: "password",
                    database: "myapp"
                },
                server: { port: 3000 },
                logging: { level: "info", console: true }
            });
            
            const config = ConfigLoader.loadConfig(configWithInvalidPort);
            const validation = ConfigLoader.validateConfig(config);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });
    });

    describe('演習問題の解答', () => {
        test('isValidUser', () => {
            const validUser = {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                isActive: true
            };
            expect(isValidUser(validUser)).toBe(true);
            
            expect(isValidUser({ id: "1", name: "John", email: "john@example.com", isActive: true })).toBe(false);
            expect(isValidUser({ id: 1, name: "", email: "john@example.com", isActive: true })).toBe(false);
            expect(isValidUser({ id: 1, name: "John", email: "invalid-email", isActive: true })).toBe(false);
            expect(isValidUser({ id: 1, name: "John", email: "john@example.com" })).toBe(false);
            expect(isValidUser("not object")).toBe(false);
        });

        test('safeGetArrayLength', () => {
            expect(safeGetArrayLength([1, 2, 3])).toBe(3);
            expect(safeGetArrayLength([])).toBe(0);
            expect(safeGetArrayLength("hello")).toBe(null);
            expect(safeGetArrayLength({ length: 5 })).toBe(null);
            expect(safeGetArrayLength(null)).toBe(null);
        });

        test('extractStringProperties', () => {
            expect(extractStringProperties({ a: "hello", b: 42, c: "world" })).toEqual(["hello", "world"]);
            expect(extractStringProperties({ x: 1, y: 2 })).toEqual([]);
            expect(extractStringProperties("not object")).toEqual([]);
            expect(extractStringProperties(null)).toEqual([]);
            expect(extractStringProperties({})).toEqual([]);
        });

        test('parseNumberSafely', () => {
            expect(parseNumberSafely(42)).toBe(42);
            expect(parseNumberSafely("123")).toBe(123);
            expect(parseNumberSafely("45.67")).toBe(45.67);
            expect(parseNumberSafely("-10")).toBe(-10);
            expect(parseNumberSafely("abc")).toBe(null);
            expect(parseNumberSafely("")).toBe(null);
            expect(parseNumberSafely(null)).toBe(null);
            expect(parseNumberSafely(true)).toBe(null);
        });

        test('mergeObjects', () => {
            expect(mergeObjects({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
            expect(mergeObjects({ a: 1 }, "not object")).toEqual({ a: 1 });
            expect(mergeObjects("not object", { b: 2 })).toEqual({ b: 2 });
            expect(mergeObjects("not object", "also not object")).toEqual({});
            expect(mergeObjects({}, {})).toEqual({});
        });
    });

    describe('型安全性のテスト', () => {
        test('型の絞り込み', () => {
            function processValue(value: unknown): string {
                if (isString(value)) {
                    // この時点でvalueはstring型として扱える
                    return value.toUpperCase();
                }
                
                if (isNumber(value)) {
                    // この時点でvalueはnumber型として扱える
                    return value.toFixed(2);
                }
                
                return "unknown";
            }
            
            expect(processValue("hello")).toBe("HELLO");
            expect(processValue(3.14159)).toBe("3.14");
            expect(processValue(true)).toBe("unknown");
        });

        test('オブジェクトプロパティの安全なアクセス', () => {
            function safeGetName(obj: unknown): string | null {
                if (isObject(obj) && hasProperty(obj, "name") && isString(obj.name)) {
                    return obj.name;
                }
                return null;
            }
            
            expect(safeGetName({ name: "John" })).toBe("John");
            expect(safeGetName({ name: 123 })).toBe(null);
            expect(safeGetName({ age: 30 })).toBe(null);
            expect(safeGetName("not object")).toBe(null);
        });
    });
});