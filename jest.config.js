/** @type {import('jest').Config} */
module.exports = {
  // テスト環境の設定
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // テストファイルのパターン
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/src/**/*.test.ts'
  ],
  
  // テスト対象から除外するパターン
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // TypeScriptの設定
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        compilerOptions: {
          target: 'ES2020',
          module: 'CommonJS',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      }
    }]
  },
  
  // その他の設定
  verbose: true,
  clearMocks: true
};