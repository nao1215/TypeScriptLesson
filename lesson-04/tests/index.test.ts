import {
    validateEmail,
    validatePassword,
    formatName,
    createSlug,
    truncateText,
    highlightSearchTerm,
    processTemplate,
    compareIgnoreCase,
    safeStringOperation,
    isNonEmptyString
} from '../src/index';

import {
    capitalizeWords,
    countWords,
    reverseString,
    isPalindrome,
    extractNumbers
} from '../src/solution';

describe('Lesson 04: 文字列型', () => {
    describe('バリデーション関数', () => {
        test('メールアドレスバリデーション', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.jp')).toBe(true);
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('  test@example.com  ')).toBe(true);
        });

        test('パスワードバリデーション', () => {
            const validPassword = validatePassword('Password123');
            expect(validPassword.isValid).toBe(true);
            expect(validPassword.errors).toHaveLength(0);

            const weakPassword = validatePassword('pass');
            expect(weakPassword.isValid).toBe(false);
            expect(weakPassword.errors.length).toBeGreaterThan(0);

            const noUpperCase = validatePassword('password123');
            expect(noUpperCase.isValid).toBe(false);
            expect(noUpperCase.errors).toContain('大文字を含む必要があります');
        });
    });

    describe('テキスト処理ユーティリティ', () => {
        test('名前フォーマット', () => {
            expect(formatName('taro', 'tanaka')).toBe('Tanaka Taro');
            expect(formatName('  HANAKO  ', '  SUZUKI  ')).toBe('Suzuki Hanako');
            expect(formatName('yuki', 'yamada')).toBe('Yamada Yuki');
        });

        test('スラッグ作成', () => {
            expect(createSlug('Hello World')).toBe('hello-world');
            expect(createSlug('TypeScript入門ガイド！')).toBe('typescript');
            expect(createSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
            expect(createSlug('Special@#$%Characters')).toBe('specialcharacters');
        });

        test('テキスト省略', () => {
            expect(truncateText('短いテキスト', 10)).toBe('短いテキスト');
            expect(truncateText('これは長いテキストです', 8)).toBe('これは長い....');
            expect(truncateText('TypeScript', 5)).toBe('Ty...');
        });

        test('検索語ハイライト', () => {
            expect(highlightSearchTerm('TypeScript is great', 'Script'))
                .toBe('Type<mark>Script</mark> is great');
            expect(highlightSearchTerm('Hello World', 'world'))
                .toBe('Hello <mark>World</mark>');
            expect(highlightSearchTerm('No match', '')).toBe('No match');
        });
    });

    describe('テンプレート処理', () => {
        test('テンプレート変数置換', () => {
            const template = 'Hello {{name}}, you have {{count}} messages';
            const result = processTemplate(template, { name: 'John', count: 5 });
            expect(result).toBe('Hello John, you have 5 messages');

            const partialTemplate = 'Hello {{name}}, {{unknown}} variable';
            const partialResult = processTemplate(partialTemplate, { name: 'Jane' });
            expect(partialResult).toBe('Hello Jane, {{unknown}} variable');
        });
    });

    describe('文字列比較とユーティリティ', () => {
        test('大文字小文字を区別しない比較', () => {
            expect(compareIgnoreCase('Hello', 'hello')).toBe(true);
            expect(compareIgnoreCase('TypeScript', 'TYPESCRIPT')).toBe(true);
            expect(compareIgnoreCase('Java', 'JavaScript')).toBe(false);
        });

        test('安全な文字列操作', () => {
            expect(safeStringOperation('  hello  ')).toBe('hello');
            expect(safeStringOperation(null)).toBe('');
            expect(safeStringOperation(undefined)).toBe('');
            expect(safeStringOperation('')).toBe('');
        });

        test('非空文字列判定', () => {
            expect(isNonEmptyString('hello')).toBe(true);
            expect(isNonEmptyString('  valid  ')).toBe(true);
            expect(isNonEmptyString('')).toBe(false);
            expect(isNonEmptyString('   ')).toBe(false);
            expect(isNonEmptyString(null)).toBe(false);
            expect(isNonEmptyString(undefined)).toBe(false);
            expect(isNonEmptyString(123)).toBe(false);
        });
    });

    describe('演習問題の解答', () => {
        test('単語の先頭大文字化', () => {
            expect(capitalizeWords('hello world')).toBe('Hello World');
            expect(capitalizeWords('typescript programming')).toBe('Typescript Programming');
            expect(capitalizeWords('')).toBe('');
            expect(capitalizeWords('UPPERCASE')).toBe('Uppercase');
        });

        test('単語数カウント', () => {
            expect(countWords('hello world')).toBe(2);
            expect(countWords('  hello   world  ')).toBe(2);
            expect(countWords('')).toBe(0);
            expect(countWords('   ')).toBe(0);
            expect(countWords('single')).toBe(1);
        });

        test('文字列反転', () => {
            expect(reverseString('hello')).toBe('olleh');
            expect(reverseString('TypeScript')).toBe('tpircSepyT');
            expect(reverseString('')).toBe('');
            expect(reverseString('a')).toBe('a');
        });

        test('回文判定', () => {
            expect(isPalindrome('racecar')).toBe(true);
            expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
            expect(isPalindrome('race a car')).toBe(false);
            expect(isPalindrome('hello')).toBe(false);
            expect(isPalindrome('Madam')).toBe(true);
        });

        test('数値抽出', () => {
            expect(extractNumbers('abc123def456')).toEqual([123, 456]);
            expect(extractNumbers('no numbers here')).toEqual([]);
            expect(extractNumbers('1a2b3c')).toEqual([1, 2, 3]);
            expect(extractNumbers('100 200 300')).toEqual([100, 200, 300]);
        });
    });
});