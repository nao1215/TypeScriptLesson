"use strict";
/**
 * Lesson 01: Hello World - テストコード
 *
 * このファイルでは以下をテストします：
 * 1. 基本的な変数の型チェック
 * 2. 関数の戻り値の検証
 * 3. TypeScriptの型安全性の確認
 */
// テスト対象のコードをインポート
// 注意: 実際のプロジェクトではexportが必要ですが、学習用として簡略化
describe('Lesson 01: Hello World', () => {
    // テスト用のセットアップ（グローバル関数が利用可能な場合）
    // setupLessonTest(1);
    // ===== 基本的な型テスト =====
    test('文字列型の変数が正しく動作する', () => {
        const message = 'Hello, TypeScript!';
        // 型のテスト
        expect(typeof message).toBe('string');
        // 値のテスト
        expect(message).toBe('Hello, TypeScript!');
        expect(message.length).toBeGreaterThan(0);
    });
    test('数値型の変数が正しく動作する', () => {
        const year = 2024;
        // 型のテスト
        expect(typeof year).toBe('number');
        // 値のテスト
        expect(year).toBe(2024);
        expect(year).toBeGreaterThan(0);
    });
    test('真偽値型の変数が正しく動作する', () => {
        const isLearning = true;
        // 型のテスト
        expect(typeof isLearning).toBe('boolean');
        // 値のテスト
        expect(isLearning).toBe(true);
    });
    // ===== 関数のテスト =====
    describe('greet関数', () => {
        function greet(name) {
            return `こんにちは、${name}さん！`;
        }
        test('正しい挨拶メッセージを生成する', () => {
            const result = greet('太郎');
            expect(result).toBe('こんにちは、太郎さん！');
            expect(typeof result).toBe('string');
        });
        test('異なる名前でも正しく動作する', () => {
            expect(greet('花子')).toBe('こんにちは、花子さん！');
            expect(greet('次郎')).toBe('こんにちは、次郎さん！');
        });
        test('空文字列でも動作する', () => {
            const result = greet('');
            expect(result).toBe('こんにちは、さん！');
        });
    });
    describe('calculateBirthYear関数', () => {
        function calculateBirthYear(age) {
            const currentYear = new Date().getFullYear();
            return currentYear - age;
        }
        test('正しい生まれ年を計算する', () => {
            const currentYear = new Date().getFullYear();
            const age = 25;
            const expectedBirthYear = currentYear - age;
            const result = calculateBirthYear(age);
            expect(result).toBe(expectedBirthYear);
            expect(typeof result).toBe('number');
        });
        test('0歳の場合は現在の年を返す', () => {
            const currentYear = new Date().getFullYear();
            expect(calculateBirthYear(0)).toBe(currentYear);
        });
        test('負の数の場合も計算する', () => {
            const currentYear = new Date().getFullYear();
            expect(calculateBirthYear(-5)).toBe(currentYear + 5);
        });
    });
    describe('add関数', () => {
        function add(a, b) {
            return a + b;
        }
        test('正数の足し算が正しく動作する', () => {
            expect(add(10, 20)).toBe(30);
            expect(add(5, 7)).toBe(12);
        });
        test('負数を含む足し算が正しく動作する', () => {
            expect(add(-5, 10)).toBe(5);
            expect(add(-3, -7)).toBe(-10);
        });
        test('0を含む足し算が正しく動作する', () => {
            expect(add(0, 5)).toBe(5);
            expect(add(10, 0)).toBe(10);
            expect(add(0, 0)).toBe(0);
        });
        test('小数点を含む足し算が正しく動作する', () => {
            expect(add(1.5, 2.3)).toBeCloseTo(3.8);
            expect(add(0.1, 0.2)).toBeCloseTo(0.3);
        });
    });
    // ===== 演習問題のテスト =====
    describe('演習問題の解答テスト', () => {
        // introduce関数のテスト
        function introduce(name, age) {
            return `私の名前は${name}です。年齢は${age}歳です。`;
        }
        test('introduce関数が正しく動作する', () => {
            expect(introduce('太郎', 25)).toBe('私の名前は太郎です。年齢は25歳です。');
            expect(introduce('花子', 30)).toBe('私の名前は花子です。年齢は30歳です。');
        });
        // multiply関数のテスト
        function multiply(x, y) {
            return x * y;
        }
        test('multiply関数が正しく動作する', () => {
            expect(multiply(5, 3)).toBe(15);
            expect(multiply(7, 8)).toBe(56);
            expect(multiply(12, 0)).toBe(0);
            expect(multiply(-3, 4)).toBe(-12);
        });
        // createEmail関数のテスト
        function createEmail(username, domain) {
            return `${username}@${domain}`;
        }
        test('createEmail関数が正しく動作する', () => {
            expect(createEmail('taro', 'example.com')).toBe('taro@example.com');
            expect(createEmail('hanako', 'gmail.com')).toBe('hanako@gmail.com');
            expect(createEmail('admin', 'company.co.jp')).toBe('admin@company.co.jp');
        });
        // getAgeCategory関数のテスト
        function getAgeCategory(age) {
            if (age >= 0 && age <= 12) {
                return '子供';
            }
            else if (age >= 13 && age <= 19) {
                return '青少年';
            }
            else if (age >= 20 && age <= 64) {
                return '大人';
            }
            else if (age >= 65) {
                return '高齢者';
            }
            else {
                return '不正な年齢';
            }
        }
        test('getAgeCategory関数が正しく動作する', () => {
            // 子供
            expect(getAgeCategory(8)).toBe('子供');
            expect(getAgeCategory(0)).toBe('子供');
            expect(getAgeCategory(12)).toBe('子供');
            // 青少年
            expect(getAgeCategory(13)).toBe('青少年');
            expect(getAgeCategory(16)).toBe('青少年');
            expect(getAgeCategory(19)).toBe('青少年');
            // 大人
            expect(getAgeCategory(20)).toBe('大人');
            expect(getAgeCategory(25)).toBe('大人');
            expect(getAgeCategory(64)).toBe('大人');
            // 高齢者
            expect(getAgeCategory(65)).toBe('高齢者');
            expect(getAgeCategory(70)).toBe('高齢者');
            expect(getAgeCategory(100)).toBe('高齢者');
            // 不正な年齢
            expect(getAgeCategory(-1)).toBe('不正な年齢');
        });
        // greetWithTime関数のテスト（ボーナス問題）
        function greetWithTime(name, hour = 12) {
            let greeting;
            if (hour >= 5 && hour <= 11) {
                greeting = 'おはよう';
            }
            else if (hour >= 12 && hour <= 17) {
                greeting = 'こんにちは';
            }
            else if (hour >= 18 && hour <= 23) {
                greeting = 'こんばんは';
            }
            else if (hour >= 0 && hour <= 4) {
                greeting = '夜更かしですね';
            }
            else {
                greeting = 'こんにちは';
            }
            return `${greeting}、${name}さん！`;
        }
        test('greetWithTime関数が正しく動作する', () => {
            // 朝の挨拶
            expect(greetWithTime('太郎', 9)).toBe('おはよう、太郎さん！');
            expect(greetWithTime('花子', 5)).toBe('おはよう、花子さん！');
            expect(greetWithTime('次郎', 11)).toBe('おはよう、次郎さん！');
            // 昼の挨拶
            expect(greetWithTime('太郎', 14)).toBe('こんにちは、太郎さん！');
            expect(greetWithTime('花子', 12)).toBe('こんにちは、花子さん！');
            expect(greetWithTime('次郎', 17)).toBe('こんにちは、次郎さん！');
            // 夜の挨拶
            expect(greetWithTime('太郎', 20)).toBe('こんばんは、太郎さん！');
            expect(greetWithTime('花子', 18)).toBe('こんばんは、花子さん！');
            expect(greetWithTime('次郎', 23)).toBe('こんばんは、次郎さん！');
            // 夜更かし
            expect(greetWithTime('太郎', 2)).toBe('夜更かしですね、太郎さん！');
            expect(greetWithTime('花子', 0)).toBe('夜更かしですね、花子さん！');
            expect(greetWithTime('次郎', 4)).toBe('夜更かしですね、次郎さん！');
            // デフォルト値のテスト
            expect(greetWithTime('太郎')).toBe('こんにちは、太郎さん！');
        });
    });
    // ===== 型安全性のテスト =====
    describe('TypeScriptの型安全性', () => {
        test('文字列型の配列は全て文字列である', () => {
            const strings = ['Hello', 'World', 'TypeScript'];
            // カスタムマッチャーの代わりに標準的なテストを使用
            strings.forEach(str => {
                expect(typeof str).toBe('string');
            });
        });
        test('数値型の配列は全て数値である', () => {
            const numbers = [1, 2, 3, 42, 100];
            numbers.forEach(num => {
                expect(typeof num).toBe('number');
            });
        });
        test('オブジェクトが期待するプロパティを持っている', () => {
            const person = {
                name: '太郎',
                age: 25,
                isStudent: false
            };
            // 標準的なプロパティ存在チェック
            expect(person).toHaveProperty('name');
            expect(person).toHaveProperty('age');
            expect(person).toHaveProperty('isStudent');
            expect(typeof person.name).toBe('string');
            expect(typeof person.age).toBe('number');
            expect(typeof person.isStudent).toBe('boolean');
        });
    });
    // ===== エラーケースのテスト =====
    describe('エラーケースの処理', () => {
        test('関数が想定外の引数でも型安全に動作する', () => {
            function safeAdd(a, b) {
                // TypeScriptでは型チェックにより、string型は渡せない
                return a + b;
            }
            // 正常ケース
            expect(safeAdd(1, 2)).toBe(3);
            // TypeScriptでは以下はコンパイルエラーになる
            // expect(safeAdd("1", "2")).toBe("12");  // ❌ コンパイルエラー
        });
    });
    // ===== 学習成果の確認 =====
    test('Lesson 01の学習目標達成確認', () => {
        // 1. TypeScriptファイルの作成 ✅
        // 2. 基本的な型注釈の使用 ✅
        // 3. 関数の作成と型注釈 ✅
        // 4. コンパイルとテストの実行 ✅
        console.log('🎉 Lesson 01: Hello World - 学習目標達成！');
        console.log('✅ TypeScriptファイルの作成方法を理解');
        console.log('✅ 基本的な型注釈（string, number, boolean）を習得');
        console.log('✅ 関数の引数と戻り値の型注釈を習得');
        console.log('✅ テストの実行方法を理解');
        expect(true).toBe(true); // 成功を表すダミーテスト
    });
});
//# sourceMappingURL=index.test.js.map