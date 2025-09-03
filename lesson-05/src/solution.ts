export function isEven(num: number): boolean {
    return num % 2 === 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

export function isValidPassword(password: string): boolean {
    if (password.length < 8) {
        return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

export function canVote(age: number, isCitizen: boolean): boolean {
    return age >= 18 && isCitizen;
}

export function isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0=日曜日, 6=土曜日
}

function demonstrateSolutions() {
    console.log("=== Lesson 05: 演習問題の解答例 ===\n");

    console.log("1. 偶数判定");
    const numbers = [1, 2, 3, 4, 5, 6];
    numbers.forEach(num => {
        console.log(`${num} は偶数: ${isEven(num)}`);
    });
    console.log();

    console.log("2. 範囲内判定");
    const testValues = [5, 15, 0, 10, -5];
    const min = 1, max = 10;
    testValues.forEach(value => {
        console.log(`${value} は範囲 [${min}, ${max}] 内: ${isInRange(value, min, max)}`);
    });
    console.log();

    console.log("3. パスワード強度チェック");
    const passwords = [
        "password",
        "Password123",
        "Password123!",
        "Pass123!",
        "PASSWORD123!"
    ];
    passwords.forEach(password => {
        console.log(`"${password}" は有効なパスワード: ${isValidPassword(password)}`);
    });
    console.log();

    console.log("4. 投票資格チェック");
    const candidates = [
        { age: 16, citizen: true },
        { age: 20, citizen: true },
        { age: 25, citizen: false },
        { age: 18, citizen: true }
    ];
    candidates.forEach(candidate => {
        console.log(`年齢${candidate.age}, 市民権${candidate.citizen}: 投票可能 ${canVote(candidate.age, candidate.citizen)}`);
    });
    console.log();

    console.log("5. 週末判定");
    const dates = [
        new Date('2023-12-15'), // 金曜日
        new Date('2023-12-16'), // 土曜日
        new Date('2023-12-17'), // 日曜日
        new Date('2023-12-18')  // 月曜日
    ];
    dates.forEach(date => {
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const dayName = dayNames[date.getDay()];
        console.log(`${date.toISOString().split('T')[0]} (${dayName}曜日) は週末: ${isWeekend(date)}`);
    });
}

if (require.main === module) {
    demonstrateSolutions();
}