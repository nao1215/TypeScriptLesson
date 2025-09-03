export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
}

export function validatePassword(password: string): {
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

export function formatName(firstName: string, lastName: string): string {
    const formattedFirst = firstName.trim().charAt(0).toUpperCase() + 
                          firstName.trim().slice(1).toLowerCase();
    const formattedLast = lastName.trim().charAt(0).toUpperCase() + 
                         lastName.trim().slice(1).toLowerCase();
    return `${formattedLast} ${formattedFirst}`;
}

export function createSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

interface TemplateData {
    [key: string]: string | number;
}

export function processTemplate(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key]?.toString() || match;
    });
}

export function compareIgnoreCase(str1: string, str2: string): boolean {
    return str1.toLowerCase() === str2.toLowerCase();
}

export function safeStringOperation(input: string | null | undefined): string {
    if (input == null) return "";
    return input.trim();
}

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function main() {
    console.log("=== Lesson 04: 文字列型の例 ===\n");

    console.log("1. 基本的な文字列操作");
    const text = "  TypeScript Programming  ";
    console.log(`元の文字列: "${text}"`);
    console.log(`長さ: ${text.length}`);
    console.log(`大文字: "${text.toUpperCase()}"`);
    console.log(`小文字: "${text.toLowerCase()}"`);
    console.log(`トリム: "${text.trim()}"`);
    console.log(`部分文字列: "${text.substring(2, 12)}"`);
    console.log();

    console.log("2. テンプレートリテラル");
    const userName = "田中さん";
    const age = 25;
    const introduction = `私の名前は${userName}で、${age}歳です。`;
    console.log(introduction);
    
    function getCurrentTime(): string {
        return new Date().toLocaleString();
    }
    console.log(`現在時刻: ${getCurrentTime()}`);
    console.log();

    console.log("3. バリデーション");
    const email = "test@example.com";
    const isValidEmail = validateEmail(email);
    console.log(`メール "${email}" は${isValidEmail ? "有効" : "無効"}です`);
    
    const password = "Password123";
    const passwordValidation = validatePassword(password);
    console.log(`パスワード "${password}": ${passwordValidation.isValid ? "OK" : "NG"}`);
    if (!passwordValidation.isValid) {
        passwordValidation.errors.forEach(error => console.log(`  - ${error}`));
    }
    console.log();

    console.log("4. テキスト処理ユーティリティ");
    console.log(`名前フォーマット: "${formatName("taro", "tanaka")}"`);
    console.log(`スラッグ作成: "${createSlug("TypeScript入門ガイド！")}"`);
    console.log(`テキスト省略: "${truncateText("これは長いテキストの例です", 10)}"`);
    console.log(`検索語ハイライト: "${highlightSearchTerm("TypeScript is great", "Script")}"`);
    console.log();

    console.log("5. テンプレート処理");
    const emailTemplate = "こんにちは、{{name}}さん。残高は{{balance}}円です。";
    const result = processTemplate(emailTemplate, {
        name: "田中太郎",
        balance: 50000
    });
    console.log(result);
}

if (require.main === module) {
    main();
}