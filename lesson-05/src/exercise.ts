export function isEven(num: number): boolean {
    // TODO: 数値が偶数かどうかを判定する関数を実装してください
    // ヒント: 数値を2で割った余り（%演算子）が0かどうかをチェック
    // 例: isEven(4) → true, isEven(3) → false
    throw new Error("Not implemented yet");
}

export function isInRange(value: number, min: number, max: number): boolean {
    // TODO: 値が指定された範囲内にあるかを判定する関数を実装してください
    // ヒント: value >= min && value <= max
    // 例: isInRange(5, 1, 10) → true, isInRange(15, 1, 10) → false
    throw new Error("Not implemented yet");
}

export function isValidPassword(password: string): boolean {
    // TODO: パスワードが以下の条件を満たすかを判定する関数を実装してください
    // - 8文字以上
    // - 大文字を含む
    // - 小文字を含む  
    // - 数字を含む
    // - 特殊文字（!@#$%^&*）のいずれかを含む
    // ヒント: 正規表現を使用してください
    // 例: isValidPassword("Password123!") → true
    throw new Error("Not implemented yet");
}

export function canVote(age: number, isCitizen: boolean): boolean {
    // TODO: 投票資格があるかを判定する関数を実装してください
    // 条件: 18歳以上かつ市民権を持っている
    // 例: canVote(20, true) → true, canVote(16, true) → false
    throw new Error("Not implemented yet");
}

export function isWeekend(date: Date): boolean {
    // TODO: 指定された日付が週末（土曜日または日曜日）かを判定する関数を実装してください
    // ヒント: date.getDay()を使用。0=日曜日, 6=土曜日
    // 例: isWeekend(new Date('2023-12-16')) → true (土曜日)
    throw new Error("Not implemented yet");
}