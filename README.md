# TypeScript初心者向け100Lesson

TypeScriptを基礎から学び、最終的にNext.jsで実践的なWebアプリケーションを作成できるようになるための学習コース。

## 🎯 学習目標
- TypeScriptの基本構文から応用まで体系的に学習
- 実践的なコーディング能力の習得
- Next.jsを使った現代的なWebアプリケーション開発
- テスト駆動開発の理解と実践

## 📚 コース構成

### 📖 フェーズ1：TypeScript基礎 (Lesson 1-20)
基本的な構文、変数、型システム、関数について学習

| Lesson | タイトル | 学習内容 |
|--------|---------|----------|
| [01](lesson-01/) | Hello World | 最初のTypeScriptプログラム |
| [02](lesson-02/) | 変数と基本型 | string, number, boolean |
| [03](lesson-03/) | 配列と型注釈 | Array型の基礎 |
| [04](lesson-04/) | オブジェクトと型 | オブジェクトの型定義 |
| [05](lesson-05/) | 関数の基礎 | 関数の定義と型 |
| [06](lesson-06/) | 関数の型安全性 | 引数と戻り値の型 |
| [07](lesson-07/) | Union型 | 複数の型を許可する |
| [08](lesson-08/) | Literal型 | 具体的な値の型 |
| [09](lesson-09/) | 型エイリアス | カスタム型の定義 |
| [10](lesson-10/) | タプル型 | 固定長配列の型 |
| [11](lesson-11/) | インターフェース基礎 | オブジェクトの構造定義 |
| [12](lesson-12/) | インターフェース継承 | 型の拡張 |
| [13](lesson-13/) | オプショナルプロパティ | 任意のプロパティ |
| [14](lesson-14/) | インデックスシグネチャ | 動的なプロパティ |
| [15](lesson-15/) | 関数型 | 関数をプロパティとする型 |
| [16](lesson-16/) | メソッドの型定義 | オブジェクトのメソッド |
| [17](lesson-17/) | 型ガード | 実行時の型チェック |
| [18](lesson-18/) | typeof演算子 | 型の取得 |
| [19](lesson-19/) | keyof演算子 | オブジェクトのキー |
| [20](lesson-20/) | 条件分岐と型 | if文での型絞り込み |

### 🏗️ フェーズ2：TypeScript中級 (Lesson 21-40)
クラス、ジェネリクス、モジュールシステムについて学習

| Lesson | タイトル | 学習内容 |
|--------|---------|----------|
| [21](lesson-21/) | クラスの基礎 | クラス定義と継承 |
| [22](lesson-22/) | アクセス修飾子 | public, private, protected |
| [23](lesson-23/) | 抽象クラス | abstract class |
| [24](lesson-24/) | ジェネリクス基礎 | 型パラメータ |
| [25](lesson-25/) | ジェネリクス制約 | extends制約 |
| 26-40 | *後で実装予定* | |

### 🚀 フェーズ3：TypeScript応用 (Lesson 41-60)
高度な型システム、非同期処理について学習

### 🛠️ フェーズ4：開発環境・ツール (Lesson 61-70)
実際の開発で使用するツールの設定と使用方法

### ⚛️ フェーズ5：Next.js入門 (Lesson 71-85)
Next.jsの基本からSSR/SSGまで

### 🌐 フェーズ6：Next.js実践 (Lesson 86-100)
実際のWebアプリケーション開発

## 🚀 クイックスタート

### 必要な環境
- Node.js 18以上
- npm または yarn

### セットアップ
```bash
# リポジトリをクローン
git clone <repository-url>
cd TypeScriptLesson

# 依存関係をインストール
npm install

# 全体のテストを実行
npm test

# 特定のLessonをビルド・実行
cd lesson-01
npm run build
npm run start
npm test
```

## 📝 学習の進め方

1. **順番に学習**: Lesson 01から順番に進めることを推奨
2. **実際にコードを書く**: 各LessonのREADMEを読んだ後、コードを実際に動かす
3. **演習問題にチャレンジ**: `exercise.ts`の問題を解く
4. **テストを実行**: 理解度を確認するためにテストを実行
5. **解答例を確認**: `solution.ts`で正解を確認

## 🧪 テストの実行方法

```bash
# 全Lessonのテストを実行
npm test

# 特定のLessonのテストを実行
npm test lesson-01

# ウォッチモードでテスト実行
npm test -- --watch
```

## 🏗️ ビルド方法

```bash
# 全Lessonをビルド
npm run build

# 特定のLessonをビルド
cd lesson-XX
npm run build
```

## 📖 各Lessonの構成

```
lesson-XX/
├── README.md          # Lessonの説明と学習目標
├── src/
│   ├── index.ts      # メインのコード例
│   ├── exercise.ts   # 演習問題
│   └── solution.ts   # 演習の解答例
├── tests/
│   └── index.test.ts # テストコード
└── package.json      # 個別の依存関係
```

## 🎓 学習のコツ

- **エラーを恐れない**: TypeScriptのエラーメッセージは親切。しっかり読んで理解する
- **型を意識する**: 常に「この変数はどんな型か？」を考える習慣をつける
- **小さく始める**: 複雑な型を一度に書かず、段階的に構築する
- **公式ドキュメントを読む**: [TypeScript公式ドキュメント](https://www.typescriptlang.org/)も参考にする

## 🤝 貢献

このプロジェクトへの貢献を歓迎します。Issueやプルリクエストをお送りください。

## 📄 ライセンス

MIT License

---

**Happy Learning! 🚀**