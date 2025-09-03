# Lesson 02: TypeScript型システムの実践的活用

## 🎯 学習目標

このレッスンでは、TypeScriptの型システムをより深く理解し、実際の開発現場で使われる高度な型定義と活用方法を学習します。完成したコードを読みながら、以下の概念を理解できます：

- 高度なインターフェースの設計と活用
- ジェネリクス（総称型）の実践的な使い方
- ユニオン型とリテラル型の組み合わせ
- 型ガード（Type Guards）と型の絞り込み
- 条件付き型とマップ型の基礎
- 実際のWebアプリケーションで使われる複雑な型定義

## 📁 ファイル構成

```
lesson-02/
├── README.md              # このファイル
├── package.json           # 依存関係
├── tsconfig.json          # TypeScript設定
├── jest.config.js         # テスト設定
└── src/
    ├── index.ts                    # メインファイル（統合実行）
    ├── advanced-interfaces.ts     # 高度なインターフェース設計
    ├── generics-examples.ts       # ジェネリクスの実践例
    ├── union-literal-types.ts     # ユニオン型とリテラル型
    ├── type-guards.ts            # 型ガードの実装
    ├── utility-types.ts          # ユーティリティ型の活用
    ├── api-client.ts            # API クライアントの型安全な実装
    └── database-models.ts       # データベースモデルの型定義
```

## 🚀 実行方法

```bash
# Lesson 02に移動
cd lesson-02

# 依存関係をインストール
npm install

# TypeScriptをコンパイル
npm run build

# コンパイル済みJavaScriptを実行
npm start

# 開発モード（TypeScriptを直接実行）
npm run dev

# テストを実行
npm test
```

## 📚 学習の進め方

1. **メインファイル（index.ts）から開始**: 全体の統合例を理解
2. **各専門ファイルを順次読む**: 
   - `advanced-interfaces.ts` - 複雑なインターフェース設計
   - `generics-examples.ts` - ジェネリクスの実用例
   - `union-literal-types.ts` - 型の組み合わせ技術
   - `type-guards.ts` - 安全な型チェック
   - `utility-types.ts` - TypeScript組み込み型の活用
   - `api-client.ts` - Web API との型安全な通信
   - `database-models.ts` - データ構造の型定義
3. **実際に実行して動作を確認**
4. **型エラーが出る箇所をコメントアウトして試す**

## 💡 重要なポイント

- **型安全性の重要性**: コンパイル時にエラーを検出し、実行時エラーを防ぐ
- **開発効率の向上**: IDEの支援機能（自動補完、リファクタリング）を最大限活用
- **保守性の向上**: 型情報がドキュメントとしても機能する
- **チーム開発での価値**: 型定義により API 契約が明確になる
- **実世界での応用**: 実際のプロジェクトで使える実践的なパターン

## 🔗 次のステップ

Lesson 03では、さらに高度な型操作と、実際のフレームワーク（React、Express.js）との組み合わせを学習します。

## 📖 参考資料

- [TypeScript Handbook - Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Handbook - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook - Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)