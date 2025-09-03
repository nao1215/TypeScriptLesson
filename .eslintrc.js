module.exports = {
  // 基本的な設定
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true
  },
  
  // パーサーとパーサーオプション
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  
  // プラグイン
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  
  // 継承する設定
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'plugin:prettier/recommended'
  ],
  
  // 初心者向けTypeScript学習用のルール設定
  rules: {
    // === TypeScript特有のルール ===
    
    // 型注釈を明示的に書くことを推奨（学習目的）
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // 厳密な型チェック
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // 未使用変数とインポート
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    '@typescript-eslint/no-unused-imports': 'error',
    
    // === 一般的なJavaScript/TypeScriptのベストプラクティス ===
    
    // コンソール出力（学習用途なので警告レベル）
    'no-console': 'warn',
    
    // デバッガー
    'no-debugger': 'warn',
    
    // 等価性チェック
    'eqeqeq': ['error', 'always'],
    'no-implicit-coercion': 'error',
    
    // 変数宣言
    'prefer-const': 'error',
    'no-var': 'error',
    
    // 関数
    'prefer-arrow-callback': 'warn',
    'arrow-spacing': 'error',
    
    // オブジェクト
    'object-shorthand': 'warn',
    'quote-props': ['error', 'as-needed'],
    
    // 配列
    'array-callback-return': 'error',
    
    // === コードスタイル（Prettierと連携） ===
    'prettier/prettier': ['error', {
      singleQuote: true,
      semi: true,
      trailingComma: 'es5',
      tabWidth: 2,
      useTabs: false,
      printWidth: 80,
      bracketSpacing: true,
      arrowParens: 'avoid'
    }],
    
    // === 学習用の特別ルール ===
    
    // コメントの推奨（初心者向けなので詳細なコメントを推奨）
    'spaced-comment': ['error', 'always', { 
      markers: ['/'],
      exceptions: ['-', '=', '*']
    }],
    
    // ネーミング規則
    '@typescript-eslint/naming-convention': [
      'error',
      // 変数名はキャメルケース
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow'
      },
      // 関数名はキャメルケース
      {
        selector: 'function',
        format: ['camelCase']
      },
      // 型名はパスカルケース
      {
        selector: 'typeLike',
        format: ['PascalCase']
      },
      // インターフェース名は I で始まることを許可（オプション）
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false
        }
      }
    ]
  },
  
  // 特定のファイル/ディレクトリ向けの追加設定
  overrides: [
    // テストファイル用の設定
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
      env: {
        jest: true
      },
      rules: {
        // テストでは型注釈を緩める
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        // テストでconsole.logを許可
        'no-console': 'off'
      }
    },
    
    // 演習ファイル用の設定
    {
      files: ['**/exercise.ts', '**/solution.ts'],
      rules: {
        // 演習では一部ルールを緩める
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off'
      }
    },
    
    // 設定ファイル用の設定
    {
      files: ['*.config.js', '*.setup.js', 'scripts/**/*.js'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off'
      }
    }
  ],
  
  // 除外パターン
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.d.ts',
    'lesson-*/dist/',
    'lesson-*/node_modules/'
  ]
};