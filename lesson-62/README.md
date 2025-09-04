# Lesson 62: ESLintとPrettier (ESLint & Prettier)

## 学習目標
このレッスンでは、TypeScriptプロジェクトでのESLintとPrettierの完全な統合と高度なカスタマイズを学習します。

### 学習内容
1. ESLintとTypeScriptの完全統合
2. Prettierとのシームレスな連携
3. カスタムルールとプラグインの作成
4. CI/CDパイプラインとの統合
5. コード品質メトリクスと自動修正
6. チーム開発での設定管理と共有

## 実装する機能

### 1. 統合コード品質システム
ESLint、Prettier、TypeScriptを統合した包括的なコード品質管理システムを実装します。

### 2. インテリジェントルールエンジン
AIを活用したコードパターン分析と自動ルール適用システムを実装します。

### 3. リアルタイムコードフォーマット
IDE統合とリアルタイムコードフォーマッティングシステムを実装します。

### 4. コード品質メトリクス
コード品質の測定と継続的な改善をサポートするメトリクスシステムを実装します。

### 5. チーム設定管理
チーム全体での設定共有と同期システムを実装します。

## 型定義の特徴

### ESLint設定型
```typescript
interface ESLintConfig {
  root: boolean;
  parser: string;
  parserOptions: {
    ecmaVersion: number;
    sourceType: 'module' | 'script';
    project: string | string[];
    tsconfigRootDir?: string;
  };
  extends: string[];
  plugins: string[];
  rules: Record<string, RuleConfig>;
  env: Record<string, boolean>;
  globals: Record<string, boolean | 'readonly' | 'writable'>;
  overrides: ESLintOverride[];
  settings: Record<string, any>;
}

type RuleConfig = 
  | 'off' | 'warn' | 'error'
  | 0 | 1 | 2
  | [0 | 1 | 2 | 'off' | 'warn' | 'error', ...any[]];
```

### Prettier設定型
```typescript
interface PrettierConfig {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  quoteProps: 'as-needed' | 'consistent' | 'preserve';
  trailingComma: 'none' | 'es5' | 'all';
  bracketSpacing: boolean;
  bracketSameLine: boolean;
  arrowParens: 'always' | 'avoid';
  endOfLine: 'lf' | 'crlf' | 'cr' | 'auto';
  overrides: PrettierOverride[];
}
```

## 実用的な使用例

### 統合設定の作成
```typescript
const qualityConfig = new CodeQualityManager({
  eslint: {
    extends: ['@typescript-eslint/recommended'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'prefer-const': 'warn'
    }
  },
  prettier: {
    printWidth: 100,
    singleQuote: true,
    trailingComma: 'es5'
  },
  integration: {
    conflictResolution: 'prettier-wins',
    autoFix: true
  }
});
```

### カスタムルールの作成
```typescript
const customRule = createESLintRule({
  name: 'enforce-error-handling',
  description: 'エラーハンドリングの強制',
  category: 'Best Practices',
  check: (context) => ({
    TryStatement: (node) => {
      // カスタムルールロジック
    }
  })
});
```

## ベストプラクティス

### 1. 設定管理
- プロジェクトレベルでの一元管理
- 環境別設定の分離
- チームメンバー間での設定同期

### 2. ルール設計
- 段階的なルール適用
- プロジェクト固有のパターン考慮
- パフォーマンスと品質のバランス

### 3. CI/CD統合
- 自動チェックと修正
- プルリクエスト連携
- 品質メトリクスの継続追跡

## 高度な機能

### 1. コード解析
```typescript
const analyzer = new CodeQualityAnalyzer({
  metrics: ['complexity', 'maintainability', 'testability'],
  thresholds: {
    cyclomaticComplexity: 10,
    cognitiveComplexity: 15,
    maintainabilityIndex: 70
  },
  reporting: {
    format: 'html',
    trends: true,
    suggestions: true
  }
});
```

### 2. 自動修正
```typescript
const autoFixer = new AutoFixer({
  rules: ['formatting', 'imports', 'simple-logic'],
  safetyLevel: 'conservative',
  backup: true,
  confirmation: 'interactive'
});
```

### 3. IDE統合
- Visual Studio Code拡張
- WebStormプラグイン
- Vim/Neovim設定
- リアルタイムフィードバック

## チーム開発対応

### 1. 設定共有
- Git hooksでの自動チェック
- プロジェクトテンプレート
- 設定ファイルのバージョン管理

### 2. コードレビュー連携
- 自動品質チェック
- レビューコメント生成
- 品質スコア表示

### 3. ドキュメンテーション
- ルール説明の自動生成
- ベストプラクティスガイド
- チーム固有ルールの文書化

## パフォーマンス最適化

### 1. ビルド時間最適化
- キャッシュ機能の活用
- 増分チェックの実装
- 並列処理の最適化

### 2. メモリ使用量管理
- 効率的なAST解析
- ガベージコレクション最適化
- メモリリークの防止

## セキュリティ

### 1. コードセキュリティ
- 脆弱性パターンの検出
- セキュアコーディングプラクティス
- 機密情報の漏えい防止

### 2. 依存関係セキュリティ
- パッケージの脆弱性チェック
- ライセンスコンプライアンス
- 依存関係の管理

## ビルドと実行

```bash
# コード品質チェック
npm run lint

# 自動修正
npm run lint:fix

# コードフォーマット
npm run format

# 品質メトリクス測定
npm run quality:check

# 全品質チェック
npm run quality:all

# 設定ファイル生成
npm run quality:init
```

## 次のステップ
次のLesson 63では、デバッグ技術について学習し、効果的なバグ修正とパフォーマンス問題の解決手法を習得します。