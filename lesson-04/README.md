# Lesson 04: 文字列型 (String Type)

## 学習目標
- TypeScriptのstring型の基本的な使い方を理解する
- テンプレートリテラルの活用方法を学ぶ
- 文字列操作の基本メソッドを身につける
- 実用的な文字列処理の実装方法を理解する

## 概要
TypeScriptの`string`型は、テキストデータを扱うための基本的な型です。JavaScriptの文字列機能に加えて、TypeScriptでは型安全性により文字列操作でのエラーを事前に防ぐことができます。

## 主な内容

### 1. string型の基本
```typescript
// 明示的な型指定
let name: string = "田中太郎";
let message: string = 'こんにちは';

// 型推論（推奨）
let greeting = "おはようございます"; // TypeScriptが自動的にstring型と推論
let title = `TypeScript入門`;
```

### 2. 文字列リテラル
```typescript
// シングルクォート
let singleQuote = 'シングルクォートの文字列';

// ダブルクォート
let doubleQuote = "ダブルクォートの文字列";

// バッククォート（テンプレートリテラル）
let templateLiteral = `テンプレートリテラルの文字列`;

// エスケープシーケンス
let escaped = "改行を含む\n文字列です";
let quoted = "彼は\"こんにちは\"と言いました";
```

### 3. テンプレートリテラル
```typescript
const userName = "田中さん";
const age = 25;

// 変数の埋め込み
let introduction = `私の名前は${userName}で、${age}歳です。`;

// 式の埋め込み
let calculation = `10 + 20 = ${10 + 20}`;

// 複数行の文字列
let multiLine = `
    これは複数行の
    文字列です。
    インデントも保持されます。
`;

// 関数呼び出しの埋め込み
function getCurrentTime(): string {
    return new Date().toLocaleString();
}
let timeMessage = `現在時刻: ${getCurrentTime()}`;
```

### 4. 文字列メソッド
```typescript
let text = "  TypeScript Programming  ";

// 長さ
console.log(text.length); // 25

// 大文字・小文字変換
console.log(text.toUpperCase()); // "  TYPESCRIPT PROGRAMMING  "
console.log(text.toLowerCase()); // "  typescript programming  "

// 前後の空白削除
console.log(text.trim()); // "TypeScript Programming"

// 部分文字列の取得
console.log(text.substring(2, 12)); // "TypeScript"
console.log(text.slice(2, 12)); // "TypeScript"

// 文字列の検索
console.log(text.indexOf("Script")); // 6
console.log(text.includes("Type")); // true
console.log(text.startsWith("  Type")); // true
console.log(text.endsWith("ing  ")); // true

// 文字列の置換
console.log(text.replace("TypeScript", "JavaScript"));
console.log(text.replaceAll(" ", "_"));

// 文字列の分割と結合
let words = "apple,banana,orange".split(",");
console.log(words.join(" | ")); // "apple | banana | orange"
```

## 実践的な使用例

### 例1: バリデーション関数
```typescript
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
}

function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push("パスワードは8文字以上である必要があります");
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push("大文字を含む必要があります");
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push("小文字を含む必要があります");
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push("数字を含む必要があります");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
```

### 例2: テキスト処理ユーティリティ
```typescript
function formatName(firstName: string, lastName: string): string {
    const formattedFirst = firstName.trim().charAt(0).toUpperCase() + 
                          firstName.trim().slice(1).toLowerCase();
    const formattedLast = lastName.trim().charAt(0).toUpperCase() + 
                         lastName.trim().slice(1).toLowerCase();
    return `${formattedLast} ${formattedFirst}`;
}

function createSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
}

function highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}
```

### 例3: 文字列テンプレートシステム
```typescript
interface TemplateData {
    [key: string]: string | number;
}

function processTemplate(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key]?.toString() || match;
    });
}

// 使用例
const emailTemplate = `
こんにちは、{{name}}さん

あなたのアカウント残高は{{balance}}円です。
ポイント: {{points}}pt

よろしくお願いいたします。
`;

const result = processTemplate(emailTemplate, {
    name: "田中太郎",
    balance: 50000,
    points: 1250
});
```

## よくある落とし穴と対処法

### 1. 文字列の比較
```typescript
// 大文字小文字を区別しない比較
function compareIgnoreCase(str1: string, str2: string): boolean {
    return str1.toLowerCase() === str2.toLowerCase();
}

// 日本語の比較（正規化）
function compareJapanese(str1: string, str2: string): boolean {
    return str1.normalize('NFC') === str2.normalize('NFC');
}
```

### 2. 型安全性の活用
```typescript
// 型安全な文字列操作
function safeStringOperation(input: string | null | undefined): string {
    if (input == null) return "";
    return input.trim();
}

// 型ガードの使用
function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}
```

## 演習問題
`src/exercise.ts`ファイルで以下の関数を実装してください：

1. `capitalizeWords(text: string): string` - 各単語の最初の文字を大文字にする
2. `countWords(text: string): number` - 単語数をカウントする
3. `reverseString(text: string): string` - 文字列を反転する
4. `isPalindrome(text: string): boolean` - 回文かどうかを判定する
5. `extractNumbers(text: string): number[]` - 文字列から数値を抽出する

## ビルドとテスト

```bash
# プロジェクトルートから実行
npm run build
npm test -- lesson-04
```

## 次のレッスン
[Lesson 05: 真偽値型](../lesson-05/README.md)では、boolean型と論理演算について学習します。