/**
 * Lesson 54: テスト戦略 (Testing Strategies)
 * 
 * TypeScriptアプリケーションの包括的なテスト戦略の実装
 */

// ===== 型定義 =====

/**
 * テスト設定の型定義
 */
interface TestConfiguration {
  framework: 'jest' | 'vitest' | 'mocha' | 'ava';
  environment: 'node' | 'jsdom' | 'happy-dom';
  coverage: {
    enabled: boolean;
    threshold: number;
    reporters: string[];
    excludePatterns: string[];
  };
  parallel: boolean;
  timeout: number;
  setupFiles: string[];
  testPathPatterns: string[];
  globals?: Record<string, any>;
}

/**
 * テスト結果の型定義
 */
interface TestResult {
  passed: boolean;
  failed: boolean;
  skipped: boolean;
  duration: number;
  coverage: CoverageReport;
  errors: TestError[];
  warnings: string[];
  suites: TestSuite[];
}

/**
 * カバレッジレポートの型定義
 */
interface CoverageReport {
  lines: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  uncoveredLines: number[];
}

/**
 * テストエラーの型定義
 */
interface TestError {
  message: string;
  stack?: string;
  type: 'assertion' | 'timeout' | 'runtime' | 'setup';
  file: string;
  line?: number;
  column?: number;
}

/**
 * テストスイートの型定義
 */
interface TestSuite {
  name: string;
  tests: IndividualTest[];
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
}

/**
 * 個別テストの型定義
 */
interface IndividualTest {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: TestError;
}

/**
 * モック設定の型定義
 */
interface MockConfiguration<T = any> {
  target: string | object;
  methods?: (keyof T)[];
  properties?: (keyof T)[];
  returnValues?: Record<string, any>;
  implementation?: Partial<T>;
  callThrough?: boolean;
  persistent?: boolean;
}

/**
 * スパイ設定の型定義
 */
interface SpyConfiguration {
  calls: number;
  returnValue?: any;
  implementation?: Function;
  reject?: any;
  resolve?: any;
}

/**
 * テストファクトリーの設定
 */
interface FactoryConfiguration<T> {
  defaults: Partial<T>;
  traits: Record<string, Partial<T>>;
  sequences: Record<string, () => any>;
  associations: Record<string, () => any>;
}

// ===== テストスイート管理システム =====

/**
 * 包括的なテストスイート管理システム
 */
class ComprehensiveTestSuite {
  private config: TestConfiguration;
  private results: TestResult[] = [];
  private mocks: Map<string, any> = new Map();
  private spies: Map<string, any> = new Map();

  constructor(config: TestConfiguration) {
    this.config = config;
    this.setupTestEnvironment();
  }

  /**
   * テスト環境のセットアップ
   */
  private setupTestEnvironment(): void {
    // グローバル変数の設定
    if (this.config.globals) {
      Object.entries(this.config.globals).forEach(([key, value]) => {
        (global as any)[key] = value;
      });
    }

    // セットアップファイルの読み込み
    this.config.setupFiles.forEach(file => {
      try {
        require(file);
      } catch (error) {
        console.warn(`Failed to load setup file: ${file}`, error);
      }
    });

    // テストタイムアウトの設定
    if (typeof jest !== 'undefined') {
      jest.setTimeout(this.config.timeout);
    }
  }

  /**
   * 全テストの実行
   */
  async runAllTests(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('Starting comprehensive test suite...');
      
      // 単体テストの実行
      const unitTestResult = await this.runUnitTests();
      
      // 統合テストの実行
      const integrationTestResult = await this.runIntegrationTests();
      
      // E2Eテストの実行
      const e2eTestResult = await this.runE2ETests();

      // 結果の集計
      const aggregatedResult = this.aggregateResults([
        unitTestResult,
        integrationTestResult,
        e2eTestResult
      ]);

      const duration = Date.now() - startTime;
      console.log(`Test suite completed in ${duration}ms`);

      return {
        ...aggregatedResult,
        duration
      };
    } catch (error) {
      console.error('Test suite execution failed:', error);
      throw error;
    }
  }

  /**
   * 単体テストの実行
   */
  async runUnitTests(): Promise<TestResult> {
    console.log('Running unit tests...');
    
    const suites: TestSuite[] = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    const errors: TestError[] = [];

    // 実際のテスト実行ロジック
    // この部分は実際のテストフレームワークと統合される
    
    return {
      passed: totalPassed > 0 && totalFailed === 0,
      failed: totalFailed > 0,
      skipped: totalSkipped > 0,
      duration: 0,
      coverage: this.generateCoverageReport(),
      errors,
      warnings: [],
      suites
    };
  }

  /**
   * 統合テストの実行
   */
  async runIntegrationTests(): Promise<TestResult> {
    console.log('Running integration tests...');
    
    // データベースやAPIの準備
    await this.setupIntegrationEnvironment();
    
    const suites: TestSuite[] = [];
    const errors: TestError[] = [];

    // 統合テストの実行ロジック
    
    // 環境のクリーンアップ
    await this.teardownIntegrationEnvironment();
    
    return {
      passed: true,
      failed: false,
      skipped: false,
      duration: 0,
      coverage: this.generateCoverageReport(),
      errors,
      warnings: [],
      suites
    };
  }

  /**
   * E2Eテストの実行
   */
  async runE2ETests(): Promise<TestResult> {
    console.log('Running E2E tests...');
    
    // ブラウザ環境の準備
    const browser = await this.launchBrowser();
    
    try {
      const suites: TestSuite[] = [];
      const errors: TestError[] = [];

      // E2Eテストの実行ロジック
      
      return {
        passed: true,
        failed: false,
        skipped: false,
        duration: 0,
        coverage: this.generateCoverageReport(),
        errors,
        warnings: [],
        suites
      };
    } finally {
      await browser?.close();
    }
  }

  /**
   * 結果の集計
   */
  private aggregateResults(results: TestResult[]): TestResult {
    const aggregated: TestResult = {
      passed: results.every(r => r.passed),
      failed: results.some(r => r.failed),
      skipped: results.some(r => r.skipped),
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      coverage: this.mergeCoverageReports(results.map(r => r.coverage)),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings),
      suites: results.flatMap(r => r.suites)
    };

    return aggregated;
  }

  /**
   * カバレッジレポートの生成
   */
  private generateCoverageReport(): CoverageReport {
    // 実際の実装では、カバレッジツールからデータを取得
    return {
      lines: { total: 1000, covered: 850, percentage: 85 },
      statements: { total: 800, covered: 720, percentage: 90 },
      functions: { total: 150, covered: 135, percentage: 90 },
      branches: { total: 200, covered: 160, percentage: 80 },
      uncoveredLines: [45, 67, 89, 123, 156]
    };
  }

  /**
   * カバレッジレポートのマージ
   */
  private mergeCoverageReports(reports: CoverageReport[]): CoverageReport {
    if (reports.length === 0) {
      return this.generateCoverageReport();
    }

    // 複数のカバレッジレポートを統合
    const merged = reports.reduce((acc, report) => ({
      lines: {
        total: acc.lines.total + report.lines.total,
        covered: acc.lines.covered + report.lines.covered,
        percentage: 0 // 後で計算
      },
      statements: {
        total: acc.statements.total + report.statements.total,
        covered: acc.statements.covered + report.statements.covered,
        percentage: 0
      },
      functions: {
        total: acc.functions.total + report.functions.total,
        covered: acc.functions.covered + report.functions.covered,
        percentage: 0
      },
      branches: {
        total: acc.branches.total + report.branches.total,
        covered: acc.branches.covered + report.branches.covered,
        percentage: 0
      },
      uncoveredLines: [...acc.uncoveredLines, ...report.uncoveredLines]
    }));

    // パーセンテージの再計算
    merged.lines.percentage = (merged.lines.covered / merged.lines.total) * 100;
    merged.statements.percentage = (merged.statements.covered / merged.statements.total) * 100;
    merged.functions.percentage = (merged.functions.covered / merged.functions.total) * 100;
    merged.branches.percentage = (merged.branches.covered / merged.branches.total) * 100;

    return merged;
  }

  /**
   * 統合テスト環境のセットアップ
   */
  private async setupIntegrationEnvironment(): Promise<void> {
    // データベースの準備
    console.log('Setting up test database...');
    
    // テストサーバーの起動
    console.log('Starting test server...');
    
    // 外部サービスのモック
    console.log('Setting up external service mocks...');
  }

  /**
   * 統合テスト環境のクリーンアップ
   */
  private async teardownIntegrationEnvironment(): Promise<void> {
    console.log('Cleaning up test environment...');
    
    // データベースのクリーンアップ
    // テストサーバーの停止
    // モックの削除
  }

  /**
   * ブラウザの起動
   */
  private async launchBrowser(): Promise<any> {
    // 実際の実装では Playwright や Puppeteer を使用
    console.log('Launching browser for E2E tests...');
    return null;
  }
}

// ===== 自動テスト生成システム =====

/**
 * AIを活用した自動テスト生成システム
 */
class AutoTestGenerator {
  private config: {
    analysisDepth: 'shallow' | 'deep';
    generateMocks: boolean;
    includeEdgeCases: boolean;
    testFramework: string;
  };

  constructor(config: any) {
    this.config = config;
  }

  /**
   * モジュールのテストを自動生成
   */
  async generateTestsForModule(modulePath: string): Promise<string> {
    console.log(`Generating tests for module: ${modulePath}`);
    
    // モジュールの分析
    const analysis = await this.analyzeModule(modulePath);
    
    // テストケースの生成
    const testCases = this.generateTestCases(analysis);
    
    // テストコードの生成
    const testCode = this.generateTestCode(testCases);
    
    return testCode;
  }

  /**
   * モジュールの分析
   */
  private async analyzeModule(modulePath: string): Promise<any> {
    // TypeScript AST を解析して関数、クラス、型を抽出
    return {
      functions: [],
      classes: [],
      interfaces: [],
      exports: [],
      dependencies: []
    };
  }

  /**
   * テストケースの生成
   */
  private generateTestCases(analysis: any): any[] {
    const testCases: any[] = [];
    
    // 関数のテストケース生成
    analysis.functions.forEach((func: any) => {
      testCases.push(...this.generateFunctionTests(func));
    });
    
    // クラスのテストケース生成
    analysis.classes.forEach((cls: any) => {
      testCases.push(...this.generateClassTests(cls));
    });
    
    return testCases;
  }

  /**
   * 関数のテストケース生成
   */
  private generateFunctionTests(func: any): any[] {
    const tests = [];
    
    // 正常系のテスト
    tests.push({
      type: 'normal',
      description: `should handle normal case for ${func.name}`,
      setup: this.generateNormalInputs(func),
      expectation: this.generateNormalExpectation(func)
    });
    
    // エッジケースのテスト
    if (this.config.includeEdgeCases) {
      tests.push(...this.generateEdgeCaseTests(func));
    }
    
    // エラーケースのテスト
    tests.push(...this.generateErrorCaseTests(func));
    
    return tests;
  }

  /**
   * クラスのテストケース生成
   */
  private generateClassTests(cls: any): any[] {
    const tests = [];
    
    // コンストラクターのテスト
    tests.push({
      type: 'constructor',
      description: `should create instance of ${cls.name}`,
      setup: this.generateConstructorInputs(cls),
      expectation: 'instance creation'
    });
    
    // メソッドのテスト
    cls.methods.forEach((method: any) => {
      tests.push(...this.generateMethodTests(method, cls));
    });
    
    return tests;
  }

  /**
   * テストコードの生成
   */
  private generateTestCode(testCases: any[]): string {
    let testCode = '';
    
    // インポート文の生成
    testCode += this.generateImports();
    
    // テストスイートの生成
    testCode += this.generateTestSuite(testCases);
    
    return testCode;
  }

  /**
   * インポート文の生成
   */
  private generateImports(): string {
    return `import { describe, it, expect, jest } from '@jest/globals';\n\n`;
  }

  /**
   * テストスイートの生成
   */
  private generateTestSuite(testCases: any[]): string {
    let suite = 'describe("Generated Tests", () => {\n';
    
    testCases.forEach(testCase => {
      suite += this.generateTestCase(testCase);
    });
    
    suite += '});\n';
    
    return suite;
  }

  /**
   * 個別のテストケース生成
   */
  private generateTestCase(testCase: any): string {
    return `
  it("${testCase.description}", () => {
    // Setup
    ${testCase.setup}
    
    // Act & Assert
    ${testCase.expectation}
  });
`;
  }

  // その他のヘルパーメソッド
  private generateNormalInputs(func: any): string {
    return '// Normal inputs setup';
  }

  private generateNormalExpectation(func: any): string {
    return 'expect(result).toBeDefined();';
  }

  private generateEdgeCaseTests(func: any): any[] {
    return [];
  }

  private generateErrorCaseTests(func: any): any[] {
    return [];
  }

  private generateConstructorInputs(cls: any): string {
    return '// Constructor inputs';
  }

  private generateMethodTests(method: any, cls: any): any[] {
    return [];
  }
}

// ===== 高度なモック・スパイシステム =====

/**
 * 高度なモック・スパイ機能を提供するシステム
 */
class AdvancedMockSystem {
  private mocks: Map<string, any> = new Map();
  private spies: Map<string, any> = new Map();
  private originalValues: Map<string, any> = new Map();

  /**
   * オブジェクトのモック作成
   */
  createMock<T>(target: new (...args: any[]) => T, config?: MockConfiguration<T>): T {
    const mockInstance = {} as T;
    const constructor = target as any;
    
    // プロトタイプからメソッドを取得
    const prototype = constructor.prototype;
    const propertyNames = Object.getOwnPropertyNames(prototype);
    
    propertyNames.forEach(name => {
      if (name !== 'constructor' && typeof prototype[name] === 'function') {
        (mockInstance as any)[name] = jest.fn();
      }
    });
    
    // 設定に基づくカスタマイズ
    if (config) {
      this.applyMockConfiguration(mockInstance, config);
    }
    
    // モックの登録
    const mockId = `mock_${Date.now()}_${Math.random()}`;
    this.mocks.set(mockId, mockInstance);
    
    return mockInstance;
  }

  /**
   * モック設定の適用
   */
  private applyMockConfiguration<T>(mock: T, config: MockConfiguration<T>): void {
    // 戻り値の設定
    if (config.returnValues) {
      Object.entries(config.returnValues).forEach(([method, value]) => {
        if ((mock as any)[method] && typeof (mock as any)[method].mockReturnValue === 'function') {
          (mock as any)[method].mockReturnValue(value);
        }
      });
    }
    
    // 実装の設定
    if (config.implementation) {
      Object.entries(config.implementation).forEach(([method, impl]) => {
        if ((mock as any)[method] && typeof (mock as any)[method].mockImplementation === 'function') {
          (mock as any)[method].mockImplementation(impl);
        }
      });
    }
  }

  /**
   * スパイの作成
   */
  createSpy<T, K extends keyof T>(target: T, method: K, config?: SpyConfiguration): jest.SpyInstance {
    const spy = jest.spyOn(target, method as any);
    
    if (config) {
      if (config.returnValue !== undefined) {
        spy.mockReturnValue(config.returnValue);
      }
      
      if (config.implementation) {
        spy.mockImplementation(config.implementation);
      }
      
      if (config.resolve) {
        spy.mockResolvedValue(config.resolve);
      }
      
      if (config.reject) {
        spy.mockRejectedValue(config.reject);
      }
    }
    
    const spyId = `spy_${String(method)}_${Date.now()}`;
    this.spies.set(spyId, spy);
    
    return spy;
  }

  /**
   * 部分的なモック作成
   */
  createPartialMock<T>(original: T, overrides: Partial<T>): T {
    const partialMock = { ...original };
    
    Object.entries(overrides).forEach(([key, value]) => {
      if (typeof value === 'function') {
        (partialMock as any)[key] = jest.fn().mockImplementation(value);
      } else {
        (partialMock as any)[key] = value;
      }
    });
    
    return partialMock;
  }

  /**
   * モジュール全体のモック
   */
  mockModule(modulePath: string, mockImplementation: any): void {
    jest.mock(modulePath, () => mockImplementation);
  }

  /**
   * 時間のモック
   */
  mockTime(date: Date | number): void {
    const mockDate = typeof date === 'number' ? new Date(date) : date;
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  }

  /**
   * 全モック・スパイのリセット
   */
  resetAll(): void {
    // 全てのモックをリセット
    this.mocks.forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
    
    // 全てのスパイを復元
    this.spies.forEach(spy => {
      if (spy.mockRestore) {
        spy.mockRestore();
      }
    });
    
    // タイマーの復元
    jest.useRealTimers();
    
    // マップのクリア
    this.mocks.clear();
    this.spies.clear();
    this.originalValues.clear();
  }

  /**
   * 呼び出し履歴の検証
   */
  verifyCallHistory(mockOrSpy: any, expectedCalls: any[]): boolean {
    if (!jest.isMockFunction(mockOrSpy)) {
      return false;
    }
    
    const calls = mockOrSpy.mock.calls;
    
    if (calls.length !== expectedCalls.length) {
      return false;
    }
    
    return expectedCalls.every((expectedCall, index) => {
      const actualCall = calls[index];
      return JSON.stringify(actualCall) === JSON.stringify(expectedCall);
    });
  }
}

// ===== テストデータファクトリー =====

/**
 * テストデータを効率的に生成するファクトリーシステム
 */
class TestDataFactory<T> {
  private config: FactoryConfiguration<T>;
  private sequenceCounters: Map<string, number> = new Map();

  constructor(config: FactoryConfiguration<T>) {
    this.config = config;
  }

  /**
   * デフォルトデータの生成
   */
  create(overrides?: Partial<T>): T {
    const base = { ...this.config.defaults };
    const withSequences = this.applySequences(base);
    const withAssociations = this.applyAssociations(withSequences);
    const final = { ...withAssociations, ...overrides };
    
    return final as T;
  }

  /**
   * 複数データの生成
   */
  createList(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * 特性適用済みデータの生成
   */
  createWithTraits(traits: string[], overrides?: Partial<T>): T {
    let base = { ...this.config.defaults };
    
    // 特性を順番に適用
    traits.forEach(trait => {
      if (this.config.traits[trait]) {
        base = { ...base, ...this.config.traits[trait] };
      }
    });
    
    const withSequences = this.applySequences(base);
    const withAssociations = this.applyAssociations(withSequences);
    const final = { ...withAssociations, ...overrides };
    
    return final as T;
  }

  /**
   * シーケンスの適用
   */
  private applySequences(data: any): any {
    const result = { ...data };
    
    Object.entries(this.config.sequences).forEach(([key, generator]) => {
      if (result[key] === undefined) {
        const currentCount = this.sequenceCounters.get(key) || 0;
        this.sequenceCounters.set(key, currentCount + 1);
        result[key] = generator();
      }
    });
    
    return result;
  }

  /**
   * 関連データの適用
   */
  private applyAssociations(data: any): any {
    const result = { ...data };
    
    Object.entries(this.config.associations).forEach(([key, generator]) => {
      if (result[key] === undefined) {
        result[key] = generator();
      }
    });
    
    return result;
  }

  /**
   * カスタム特性の追加
   */
  addTrait(name: string, trait: Partial<T>): void {
    this.config.traits[name] = trait;
  }

  /**
   * シーケンスカウンターのリセット
   */
  resetSequences(): void {
    this.sequenceCounters.clear();
  }
}

// ===== パフォーマンステストシステム =====

/**
 * パフォーマンステストの実行と分析
 */
class PerformanceTestRunner {
  private results: Array<{
    name: string;
    duration: number;
    memory: number;
    iterations: number;
  }> = [];

  /**
   * 関数のパフォーマンステスト
   */
  async benchmarkFunction<T extends any[], R>(
    name: string,
    fn: (...args: T) => R | Promise<R>,
    args: T,
    iterations: number = 1000
  ): Promise<{ averageTime: number; totalTime: number; memoryUsage: number }> {
    // ガベージコレクションの実行（可能であれば）
    if (global.gc) {
      global.gc();
    }

    const startMemory = process.memoryUsage().heapUsed;
    const startTime = process.hrtime.bigint();

    // 複数回実行してパフォーマンスを測定
    for (let i = 0; i < iterations; i++) {
      await fn(...args);
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage().heapUsed;

    const totalTimeNs = Number(endTime - startTime);
    const totalTimeMs = totalTimeNs / 1_000_000;
    const averageTimeMs = totalTimeMs / iterations;
    const memoryUsage = endMemory - startMemory;

    const result = {
      averageTime: averageTimeMs,
      totalTime: totalTimeMs,
      memoryUsage
    };

    // 結果の保存
    this.results.push({
      name,
      duration: averageTimeMs,
      memory: memoryUsage,
      iterations
    });

    return result;
  }

  /**
   * 複数関数の比較テスト
   */
  async comparePerformance<T extends any[], R>(
    tests: Array<{
      name: string;
      fn: (...args: T) => R | Promise<R>;
      args: T;
    }>,
    iterations: number = 1000
  ): Promise<Array<{ name: string; result: any; relativeFactor: number }>> {
    const results = [];
    
    // 各関数のパフォーマンスを測定
    for (const test of tests) {
      const result = await this.benchmarkFunction(
        test.name, 
        test.fn, 
        test.args, 
        iterations
      );
      results.push({ name: test.name, result });
    }
    
    // 最速の関数を基準とした相対的な倍率を計算
    const fastest = results.reduce((min, current) => 
      current.result.averageTime < min.result.averageTime ? current : min
    );
    
    return results.map(r => ({
      ...r,
      relativeFactor: r.result.averageTime / fastest.result.averageTime
    }));
  }

  /**
   * メモリリークテスト
   */
  async testForMemoryLeaks<T extends any[], R>(
    name: string,
    fn: (...args: T) => R | Promise<R>,
    args: T,
    iterations: number = 1000,
    sampleInterval: number = 100
  ): Promise<{ hasLeak: boolean; memoryGrowth: number; samples: number[] }> {
    const memorySamples: number[] = [];
    
    // 定期的にメモリ使用量をサンプリング
    for (let i = 0; i < iterations; i++) {
      await fn(...args);
      
      if (i % sampleInterval === 0) {
        if (global.gc) {
          global.gc();
        }
        memorySamples.push(process.memoryUsage().heapUsed);
      }
    }
    
    // メモリ増加の傾向を分析
    const firstSample = memorySamples[0];
    const lastSample = memorySamples[memorySamples.length - 1];
    const memoryGrowth = lastSample - firstSample;
    
    // 単純なヒューリスティック: 50%以上の増加があればリークの可能性
    const hasLeak = memoryGrowth > firstSample * 0.5;
    
    return {
      hasLeak,
      memoryGrowth,
      samples: memorySamples
    };
  }

  /**
   * 結果のレポート生成
   */
  generateReport(): string {
    let report = '=== Performance Test Report ===\n\n';
    
    this.results.forEach(result => {
      report += `${result.name}:\n`;
      report += `  Average Time: ${result.duration.toFixed(3)}ms\n`;
      report += `  Memory Usage: ${(result.memory / 1024).toFixed(2)}KB\n`;
      report += `  Iterations: ${result.iterations}\n\n`;
    });
    
    return report;
  }

  /**
   * 結果のクリア
   */
  clearResults(): void {
    this.results = [];
  }
}

// ===== 使用例とデモ =====

/**
 * テスト戦略のデモンストレーション
 */
async function demonstrateTestingStrategies(): Promise<void> {
  console.log('=== Testing Strategies Demo ===');

  // 1. 包括的テストスイートのデモ
  console.log('\n1. Comprehensive Test Suite:');
  const testConfig: TestConfiguration = {
    framework: 'jest',
    environment: 'node',
    coverage: {
      enabled: true,
      threshold: 80,
      reporters: ['text', 'html'],
      excludePatterns: ['node_modules/**']
    },
    parallel: true,
    timeout: 30000,
    setupFiles: ['<rootDir>/setup.js'],
    testPathPatterns: ['**/__tests__/**/*.test.ts'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json'
      }
    }
  };

  const testSuite = new ComprehensiveTestSuite(testConfig);
  
  try {
    const result = await testSuite.runAllTests();
    console.log('Test Results:', {
      passed: result.passed,
      duration: `${result.duration}ms`,
      coverage: `${result.coverage.lines.percentage.toFixed(1)}%`
    });
  } catch (error) {
    console.error('Test execution failed:', error);
  }

  // 2. 自動テスト生成のデモ
  console.log('\n2. Auto Test Generation:');
  const generator = new AutoTestGenerator({
    analysisDepth: 'deep',
    generateMocks: true,
    includeEdgeCases: true,
    testFramework: 'jest'
  });

  const generatedTests = await generator.generateTestsForModule('./example.ts');
  console.log('Generated test preview:', generatedTests.substring(0, 200) + '...');

  // 3. 高度なモックシステムのデモ
  console.log('\n3. Advanced Mock System:');
  const mockSystem = new AdvancedMockSystem();

  // クラスのモック
  class ExampleService {
    async getData(id: string): Promise<any> {
      return { id, data: 'real data' };
    }
    
    updateData(id: string, data: any): boolean {
      return true;
    }
  }

  const mockService = mockSystem.createMock(ExampleService, {
    returnValues: {
      getData: Promise.resolve({ id: 'test', data: 'mock data' }),
      updateData: true
    }
  });

  console.log('Mock service created:', typeof mockService.getData);

  // スパイの作成
  const realService = new ExampleService();
  const spy = mockSystem.createSpy(realService, 'getData', {
    returnValue: Promise.resolve({ id: 'spy', data: 'spy data' })
  });

  console.log('Spy created for getData method');

  // 4. テストデータファクトリーのデモ
  console.log('\n4. Test Data Factory:');
  
  interface User {
    id: string;
    name: string;
    email: string;
    age: number;
    isActive: boolean;
  }

  const userFactory = new TestDataFactory<User>({
    defaults: {
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      isActive: true
    },
    traits: {
      admin: { name: 'Admin User', email: 'admin@example.com' },
      inactive: { isActive: false },
      young: { age: 18 },
      senior: { age: 65 }
    },
    sequences: {
      id: () => `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    },
    associations: {}
  });

  const testUser = userFactory.create({ name: 'Custom Name' });
  const adminUsers = userFactory.createList(3, { email: 'admin@test.com' });
  const youngUser = userFactory.createWithTraits(['young'], { name: 'Young User' });

  console.log('Test user created:', testUser);
  console.log('Admin users count:', adminUsers.length);
  console.log('Young user age:', youngUser.age);

  // 5. パフォーマンステストのデモ
  console.log('\n5. Performance Testing:');
  const perfTester = new PerformanceTestRunner();

  // 簡単な関数のベンチマーク
  const slowFunction = (n: number) => {
    let result = 0;
    for (let i = 0; i < n; i++) {
      result += Math.sqrt(i);
    }
    return result;
  };

  const fastFunction = (n: number) => {
    return n * Math.sqrt(n);
  };

  const perfResult = await perfTester.benchmarkFunction(
    'slowFunction',
    slowFunction,
    [10000],
    100
  );

  console.log('Performance result:', {
    averageTime: `${perfResult.averageTime.toFixed(3)}ms`,
    memoryUsage: `${(perfResult.memoryUsage / 1024).toFixed(2)}KB`
  });

  // 関数比較
  const comparison = await perfTester.comparePerformance([
    { name: 'slow', fn: slowFunction, args: [5000] },
    { name: 'fast', fn: fastFunction, args: [5000] }
  ], 50);

  console.log('Performance comparison:');
  comparison.forEach(result => {
    console.log(`  ${result.name}: ${result.relativeFactor.toFixed(2)}x slower`);
  });

  // クリーンアップ
  mockSystem.resetAll();
  perfTester.clearResults();

  console.log('\nTesting strategies demo completed!');
}

// ===== エクスポート =====

export {
  ComprehensiveTestSuite,
  AutoTestGenerator,
  AdvancedMockSystem,
  TestDataFactory,
  PerformanceTestRunner,
  demonstrateTestingStrategies,
  type TestConfiguration,
  type TestResult,
  type CoverageReport,
  type TestError,
  type TestSuite,
  type IndividualTest,
  type MockConfiguration,
  type SpyConfiguration,
  type FactoryConfiguration
};

// デモの実行
if (require.main === module) {
  demonstrateTestingStrategies().catch(console.error);
}