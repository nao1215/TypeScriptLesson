export function capitalizeWords(text: string): string {
    if (!text.trim()) return text;
    
    return text
        .split(' ')
        .map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

export function countWords(text: string): number {
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    
    return trimmed.split(/\s+/).length;
}

export function reverseString(text: string): string {
    return text.split('').reverse().join('');
}

export function isPalindrome(text: string): boolean {
    const cleaned = text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    
    return cleaned === reverseString(cleaned);
}

export function extractNumbers(text: string): number[] {
    const matches = text.match(/\d+/g);
    if (!matches) return [];
    
    return matches.map(match => Number(match));
}

function demonstrateSolutions() {
    console.log("=== Lesson 04: 演習問題の解答例 ===\n");

    console.log("1. 単語の先頭を大文字化");
    const text1 = "hello world typescript";
    console.log(`"${text1}" → "${capitalizeWords(text1)}"`);
    console.log();

    console.log("2. 単語数カウント");
    const text2 = "  hello   world  ";
    console.log(`"${text2}" の単語数: ${countWords(text2)}`);
    console.log(`空文字列の単語数: ${countWords("")}`);
    console.log();

    console.log("3. 文字列反転");
    const text3 = "TypeScript";
    console.log(`"${text3}" → "${reverseString(text3)}"`);
    console.log();

    console.log("4. 回文判定");
    const palindromes = [
        "racecar",
        "A man a plan a canal Panama",
        "race a car",
        "hello"
    ];
    
    palindromes.forEach(text => {
        console.log(`"${text}" は回文: ${isPalindrome(text)}`);
    });
    console.log();

    console.log("5. 数値抽出");
    const text5 = "abc123def456ghi789";
    const numbers = extractNumbers(text5);
    console.log(`"${text5}" から抽出した数値: [${numbers.join(', ')}]`);
    
    const noNumbers = "hello world";
    console.log(`"${noNumbers}" から抽出した数値: [${extractNumbers(noNumbers).join(', ')}]`);
}

if (require.main === module) {
    demonstrateSolutions();
}