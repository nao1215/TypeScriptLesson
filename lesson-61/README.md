# Lesson 61: webpack設定 (Webpack Configuration)

## 学習目標
このレッスンでは、TypeScriptプロジェクトでのwebpackの完全な設定と最適化手法を学習します。

### 学習内容
1. TypeScript対応webpack設定の基礎
2. 開発・本番環境の最適化設定
3. モジュールバンドリング戦略
4. コード分割と遅延読み込み
5. アセット処理とローダー設定
6. プラグインの活用とカスタムプラグイン作成
7. パフォーマンス最適化とバンドル解析

## 実装する機能

### 1. マルチ環境対応webpack設定
開発・本番・テスト環境に最適化されたwebpack設定を実装します。

### 2. TypeScript統合システム
TypeScriptとwebpackの完全統合とビルドプロセス最適化を実装します。

### 3. 高度なコード分割
動的インポートとチャンク最適化による効率的なコード分割を実装します。

### 4. カスタムローダーとプラグイン
独自のローダーとプラグインを作成し、ビルドプロセスをカスタマイズします。

### 5. バンドル分析とデバッグ
バンドルサイズ分析とパフォーマンス最適化ツールを実装します。

## 型定義の特徴

### webpack設定型
```typescript
interface WebpackConfig {
  mode: 'development' | 'production' | 'none';
  entry: string | string[] | Record<string, string | string[]>;
  output: {
    path: string;
    filename: string;
    publicPath: string;
    clean: boolean;
  };
  resolve: {
    extensions: string[];
    alias: Record<string, string>;
    modules: string[];
  };
  module: {
    rules: WebpackRule[];
  };
  plugins: WebpackPlugin[];
  optimization: OptimizationConfig;
  devServer?: DevServerConfig;
  externals?: ExternalsConfig;
}

interface WebpackRule {
  test: RegExp;
  use: string | LoaderConfig | (string | LoaderConfig)[];
  exclude?: RegExp | string | (RegExp | string)[];
  include?: RegExp | string | (RegExp | string)[];
}
```

### 最適化設定型
```typescript
interface OptimizationConfig {
  minimize: boolean;
  minimizer: WebpackPlugin[];
  splitChunks: {
    chunks: 'all' | 'async' | 'initial';
    cacheGroups: Record<string, CacheGroupConfig>;
  };
  runtimeChunk: boolean | 'single' | 'multiple';
  usedExports: boolean;
  sideEffects: boolean;
}

interface CacheGroupConfig {
  test: RegExp | string | Function;
  name: string;
  chunks: 'all' | 'async' | 'initial';
  minSize: number;
  maxSize: number;
  priority: number;
  reuseExistingChunk: boolean;
}
```

## 実用的な使用例

### 基本的なwebpack設定
```typescript
const config = createWebpackConfig({
  mode: 'production',
  typescript: {
    configFile: 'tsconfig.json',
    transpileOnly: false,
    typeCheck: true
  },
  optimization: {
    splitChunks: true,
    treeShaking: true,
    compression: 'gzip'
  }
});
```

### カスタムローダーの作成
```typescript
const customLoader = createCustomLoader({
  name: 'typescript-decorator-loader',
  test: /\.ts$/,
  transform: (source, context) => {
    return transformDecorators(source, context.options);
  }
});
```

## webpack設定戦略

### 1. 開発環境最適化
- 高速リビルド設定
- ホットモジュール置換（HMR）
- ソースマップ生成
- 開発サーバー設定

### 2. 本番環境最適化
- コード圧縮と最適化
- Tree Shaking有効化
- バンドル分析とサイズ最適化
- キャッシュ戦略

### 3. TypeScript統合
- ts-loaderとBabel統合
- 型チェックの最適化
- インクリメンタルビルド
- ソースマップ設定

## パフォーマンス最適化

### 1. ビルド時間最適化
```typescript
const optimizedConfig = {
  // 並列処理の活用
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'thread-loader',
            options: { workers: 4 }
          },
          'ts-loader'
        ]
      }
    ]
  },
  
  // キャッシュ戦略
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

### 2. バンドルサイズ最適化
```typescript
const sizeOptimization = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

## カスタムプラグインとローダー

### 1. プラグイン開発
- webpack APIの活用
- ビルドプロセスのフック
- アセット生成とカスタマイズ
- 統計情報の収集

### 2. ローダー開発
- ファイル変換処理
- TypeScript AST操作
- ソースマップ生成
- キャッシュ対応

## デバッグとトラブルシューティング

### 1. バンドル分析
- webpack-bundle-analyzer
- source-map-explorer
- パフォーマンス測定
- 依存関係の可視化

### 2. デバッグ設定
- 詳細なログ出力
- エラー解析
- ビルドプロセス追跡
- メモリ使用量監視

## CI/CD統合

### 1. ビルドパイプライン
- 環境別設定管理
- キャッシュ戦略
- 並列ビルド
- アーティファクト管理

### 2. 品質管理
- バンドルサイズ制限
- パフォーマンス閾値
- セキュリティチェック
- 依存関係監査

## ビルドと実行

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# バンドル分析
npm run analyze

# ビルド統計出力
npm run stats

# 型チェック付きビルド
npm run build:check
```

## 次のステップ
次のLesson 62では、ESLintとPrettierについて学習し、コード品質とフォーマットの自動化を習得します。