/**
 * Lesson 01: 演習問題の解答例
 * 
 * exercise.tsの問題に対する解答例です。
 * まず自分で考えてから、こちらを参考にしてください。
 */

// ===== 問題1の解答: 基本的な変数宣言 =====

// 自分の名前を格納する変数（string型）
const myName: string = '太郎';

// 自分の年齢を格納する変数（number型）
const myAge: number = 25;

// プログラミングが好きかどうか（boolean型）
const likeProgramming: boolean = true;

console.log('=== 問題1の解答 ===');
console.log(`名前: ${myName}`);
console.log(`年齢: ${myAge}`);
console.log(`プログラミング好き: ${likeProgramming}`);

// ===== 問題2の解答: introduce関数 =====

/**
 * 自己紹介メッセージを作成する関数
 * @param name 名前（string型）
 * @param age 年齢（number型）
 * @returns 自己紹介メッセージ（string型）
 */
function introduce(name: string, age: number): string {
  return `私の名前は${name}です。年齢は${age}歳です。`;
}

console.log('\n=== 問題2の解答 ===');
console.log(introduce(myName, myAge));
console.log(introduce('花子', 30));

// ===== 問題3の解答: multiply関数 =====

/**
 * 2つの数値を掛け算する関数
 * @param x 第1の数値（number型）
 * @param y 第2の数値（number型）
 * @returns 掛け算の結果（number型）
 */
function multiply(x: number, y: number): number {
  return x * y;
}

console.log('\n=== 問題3の解答 ===');
console.log(`5 × 3 = ${multiply(5, 3)}`);
console.log(`7 × 8 = ${multiply(7, 8)}`);
console.log(`12 × 0 = ${multiply(12, 0)}`);

// ===== 問題4の解答: createEmail関数 =====

/**
 * メールアドレスを生成する関数
 * @param username ユーザー名（string型）
 * @param domain ドメイン名（string型）
 * @returns メールアドレス（string型）
 */
function createEmail(username: string, domain: string): string {
  return `${username}@${domain}`;
}

console.log('\n=== 問題4の解答 ===');
console.log(createEmail('taro', 'example.com'));
console.log(createEmail('hanako', 'gmail.com'));
console.log(createEmail('admin', 'company.co.jp'));

// ===== 問題5の解答: getAgeCategory関数 =====

/**
 * 年齢に応じたカテゴリを判定する関数
 * @param age 年齢（number型）
 * @returns 年齢カテゴリ（string型）
 */
function getAgeCategory(age: number): string {
  if (age >= 0 && age <= 12) {
    return '子供';
  } else if (age >= 13 && age <= 19) {
    return '青少年';
  } else if (age >= 20 && age <= 64) {
    return '大人';
  } else if (age >= 65) {
    return '高齢者';
  } else {
    // 負の数などの不正な値の場合
    return '不正な年齢';
  }
}

console.log('\n=== 問題5の解答 ===');
console.log(`8歳のカテゴリ: ${getAgeCategory(8)}`);
console.log(`16歳のカテゴリ: ${getAgeCategory(16)}`);
console.log(`25歳のカテゴリ: ${getAgeCategory(25)}`);
console.log(`70歳のカテゴリ: ${getAgeCategory(70)}`);

// ===== 問題5の別解: switch文を使用した場合 =====

/**
 * switch文を使用した年齢カテゴリ判定（別解）
 * @param age 年齢（number型）
 * @returns 年齢カテゴリ（string型）
 */
function getAgeCategorySwitch(age: number): string {
  // 年齢を範囲で判定するためのヘルパー
  if (age < 0) return '不正な年齢';
  
  const ageRange: number = Math.floor(age / 10); // 10で割った商を使用
  
  switch (true) {
    case age <= 12:
      return '子供';
    case age <= 19:
      return '青少年';
    case age <= 64:
      return '大人';
    default:
      return '高齢者';
  }
}

// ===== ボーナス問題の解答: greetWithTime関数 =====

/**
 * 時間に応じた挨拶をする関数
 * @param name 名前（string型）
 * @param hour 時間（number型、デフォルト値: 12）
 * @returns 時間に応じた挨拶メッセージ（string型）
 */
function greetWithTime(name: string, hour: number = 12): string {
  let greeting: string;
  
  if (hour >= 5 && hour <= 11) {
    greeting = 'おはよう';
  } else if (hour >= 12 && hour <= 17) {
    greeting = 'こんにちは';
  } else if (hour >= 18 && hour <= 23) {
    greeting = 'こんばんは';
  } else if (hour >= 0 && hour <= 4) {
    greeting = '夜更かしですね';
  } else {
    // 0-23の範囲外の場合
    greeting = 'こんにちは'; // デフォルト
  }
  
  return `${greeting}、${name}さん！`;
}

console.log('\n=== ボーナス問題の解答 ===');
console.log(greetWithTime('太郎', 9));   // おはよう
console.log(greetWithTime('花子', 14));  // こんにちは
console.log(greetWithTime('次郎', 20));  // こんばんは
console.log(greetWithTime('三郎', 2));   // 夜更かし
console.log(greetWithTime('四郎'));      // デフォルト値のテスト

// ===== 追加の学習ポイント =====

console.log('\n=== 追加の学習ポイント ===');

// 1. 型推論 - TypeScriptが自動で型を推測する
const autoInferredString = 'TypeScriptが自動で型を推測';  // string型と推論される
const autoInferredNumber = 42;  // number型と推論される

console.log(`型推論の例: ${autoInferredString} (${typeof autoInferredString})`);
console.log(`型推論の例: ${autoInferredNumber} (${typeof autoInferredNumber})`);

// 2. 複数の型を持つ可能性がある場合の型注釈（Union型の予習）
// これは後のLessonで詳しく学習しますが、参考として
// const flexibleValue: string | number = 'Hello';  // 文字列または数値

// 3. 関数のオーバーロード（上級者向けの参考）
// これも後のLessonで学習します

console.log('\n🎉 Lesson 01の演習問題、お疲れ様でした！');
console.log('💡 重要なポイント:');
console.log('  - 型注釈により、コードの意図が明確になる');
console.log('  - エディタの補完機能が向上する');
console.log('  - コンパイル時にエラーを検出できる');
console.log('🚀 次のLessonでは、より詳細な型システムを学習しましょう！');