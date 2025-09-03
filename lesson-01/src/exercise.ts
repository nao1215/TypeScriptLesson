/**
 * Lesson 01: 演習問題
 * 
 * 以下の問題を解いて、TypeScriptの基礎を身につけましょう！
 * 各問題では適切な型注釈を使用してください。
 */

// ===== 問題1: 基本的な変数宣言 =====
/**
 * 【課題】以下の要件に従って変数を宣言してください
 * 
 * 1. あなたの名前を格納する変数 'myName'（string型）
 * 2. あなたの年齢を格納する変数 'myAge'（number型）
 * 3. プログラミングが好きかどうかの変数 'likeProgramming'（boolean型）
 */

// ここにコードを書いてください
// const myName: string = ?;
// const myAge: number = ?;
// const likeProgramming: boolean = ?;

// ===== 問題2: 関数の作成 =====
/**
 * 【課題】以下の関数を実装してください
 * 
 * 関数名: introduce
 * 引数: name (string型), age (number型)
 * 戻り値: string型
 * 機能: "私の名前は○○です。年齢は△△歳です。" という文字列を返す
 */

// ここに関数を書いてください
function introduce(/* 引数を書いてください */): /* 戻り値の型を書いてください */ {
  // 関数の内容を実装してください
}

// ===== 問題3: 計算関数の作成 =====
/**
 * 【課題】以下の数学関数を実装してください
 * 
 * 関数名: multiply
 * 引数: x (number型), y (number型)
 * 戻り値: number型
 * 機能: 2つの数値を掛け算した結果を返す
 */

// ここに関数を書いてください
function multiply(/* 引数を書いてください */): /* 戻り値の型を書いてください */ {
  // 関数の内容を実装してください
}

// ===== 問題4: より実践的な関数 =====
/**
 * 【課題】以下の実用的な関数を実装してください
 * 
 * 関数名: createEmail
 * 引数: username (string型), domain (string型)
 * 戻り値: string型
 * 機能: "username@domain" 形式のメールアドレスを生成して返す
 * 
 * 例: createEmail("taro", "example.com") → "taro@example.com"
 */

// ここに関数を書いてください
function createEmail(/* 引数を書いてください */): /* 戻り値の型を書いてください */ {
  // 関数の内容を実装してください
}

// ===== 問題5: 条件分岐を含む関数 =====
/**
 * 【課題】以下の関数を実装してください
 * 
 * 関数名: getAgeCategory
 * 引数: age (number型)
 * 戻り値: string型
 * 機能: 年齢に応じて以下のカテゴリを返す
 *   - 0-12: "子供"
 *   - 13-19: "青少年"  
 *   - 20-64: "大人"
 *   - 65以上: "高齢者"
 */

// ここに関数を書いてください
function getAgeCategory(/* 引数を書いてください */): /* 戻り値の型を書いてください */ {
  // 関数の内容を実装してください（if文またはswitch文を使用）
}

// ===== ボーナス問題: 複数の引数とデフォルト値 =====
/**
 * 【発展課題】以下の関数を実装してください
 * 
 * 関数名: greetWithTime
 * 引数: name (string型), hour (number型, デフォルト値: 12)
 * 戻り値: string型
 * 機能: 時間に応じて異なる挨拶を返す
 *   - 5-11時: "おはよう"
 *   - 12-17時: "こんにちは"
 *   - 18-23時: "こんばんは"
 *   - 0-4時: "夜更かしですね"
 * 
 * 例: greetWithTime("太郎", 9) → "おはよう、太郎さん！"
 */

// ここに関数を書いてください（デフォルト引数の書き方: hour: number = 12）
function greetWithTime(/* 引数を書いてください */): /* 戻り値の型を書いてください */ {
  // 関数の内容を実装してください
}

// ===== テスト用のコード（実装後にコメントアウトを外して実行してみてください） =====
/*
console.log('=== 演習問題の実行結果 ===');

// 問題1のテスト
console.log(`名前: ${myName}`);
console.log(`年齢: ${myAge}`);
console.log(`プログラミング好き: ${likeProgramming}`);

// 問題2のテスト  
console.log(introduce(myName, myAge));

// 問題3のテスト
console.log(`5 × 3 = ${multiply(5, 3)}`);

// 問題4のテスト
console.log(createEmail("taro", "example.com"));

// 問題5のテスト
console.log(`25歳のカテゴリ: ${getAgeCategory(25)}`);

// ボーナス問題のテスト
console.log(greetWithTime("太郎", 9));
console.log(greetWithTime("花子")); // デフォルト値のテスト
*/

/**
 * 💡 ヒント:
 * 1. 型注釈は 変数名: 型名 の形で書きます
 * 2. 関数の戻り値の型は 関数名(): 戻り値の型 の形で書きます
 * 3. テンプレートリテラル（`文字列 ${変数} 文字列`）を使うと便利です
 * 4. if文やswitch文を使って条件分岐を実装しましょう
 * 
 * 🔧 実行方法:
 * npx ts-node src/exercise.ts
 */