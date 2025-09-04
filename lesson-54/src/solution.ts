/**
 * Lesson 54: テスト戦略 - 解答例
 * 
 * 演習問題の完全な実装例とベストプラクティス
 */

// ===== 解答 1: カスタムテストフレームワーク =====

interface TestCase {
  description: string;
  fn: () => void | Promise<void>;
  timeout?: number;
}

interface TestSuite {
  description: string;
  tests: TestCase[];
  suites: TestSuite[];
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
}

interface TestReport {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: TestFailure[];
}

interface TestFailure {
  suite: string;
  test: string;
  error: Error;
  stack?: string;
}

class CustomTestFramework {
  private currentSuite: TestSuite | null = null;
  private rootSuite: TestSuite = {
    description: 'Root',
    tests: [],
    suites: []
  };
  private matchers: Map<string, Function> = new Map();

  /**
   * テストスイートの定義
   */
  describe(description: string, fn: () => void): void {
    const parentSuite = this.currentSuite || this.rootSuite;
    const suite: TestSuite = {
      description,
      tests: [],
      suites: []
    };
    
    parentSuite.suites.push(suite);
    const previousSuite = this.currentSuite;
    this.currentSuite = suite;
    
    try {
      fn();
    } finally {
      this.currentSuite = previousSuite;
    }
  }

  /**
   * テストケースの定義
   */
  it(description: string, fn: () => void | Promise<void>, timeout?: number): void {
    if (!this.currentSuite) {
      throw new Error('テストは describe ブロック内で定義してください');
    }
    
    this.currentSuite.tests.push({
      description,
      fn,
      timeout: timeout || 5000
    });
  }

  /**
   * セットアップフックの定義
   */
  beforeEach(fn: () => void | Promise<void>): void {
    if (!this.currentSuite) {
      throw new Error('beforeEach は describe ブロック内で定義してください');
    }
    this.currentSuite.beforeEach = fn;
  }

  /**
   * クリーンアップフックの定義
   */
  afterEach(fn: () => void | Promise<void>): void {
    if (!this.currentSuite) {
      throw new Error('afterEach は describe ブロック内で定義してください');
    }
    this.currentSuite.afterEach = fn;
  }

  /**
   * 全テストの実行
   */
  async run(): Promise<TestReport> {
    const report: TestReport = {
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      failures: []
    };

    const startTime = Date.now();
    await this.runSuite(this.rootSuite, report);
    report.duration = Date.now() - startTime;
    
    return report;
  }

  /**
   * スイートの実行
   */
  private async runSuite(suite: TestSuite, report: TestReport): Promise<void> {
    // beforeAll の実行
    if (suite.beforeAll) {
      await suite.beforeAll();
    }

    // テストの実行
    for (const test of suite.tests) {
      try {
        // beforeEach の実行
        if (suite.beforeEach) {
          await suite.beforeEach();
        }

        // テスト実行
        await Promise.race([
          test.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), test.timeout)
          )
        ]);

        report.passed++;

        // afterEach の実行
        if (suite.afterEach) {
          await suite.afterEach();
        }
      } catch (error) {
        report.failed++;
        report.failures.push({
          suite: suite.description,
          test: test.description,
          error: error as Error,
          stack: (error as Error).stack
        });
      }
    }

    // 子スイートの実行
    for (const childSuite of suite.suites) {
      await this.runSuite(childSuite, report);
    }

    // afterAll の実行
    if (suite.afterAll) {
      await suite.afterAll();
    }
  }

  /**
   * カスタムマッチャーの追加
   */
  addMatcher(name: string, matcher: Function): void {
    this.matchers.set(name, matcher);
  }

  /**
   * アサーション関数
   */
  expect(actual: any) {
    const self = this;
    return {
      toBe(expected: any) {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toEqual(expected: any) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toThrow(expectedError?: string | RegExp) {
        if (typeof actual !== 'function') {
          throw new Error('Expected a function');
        }
        
        let didThrow = false;
        let thrownError: Error | null = null;
        
        try {
          actual();
        } catch (error) {
          didThrow = true;
          thrownError = error as Error;
        }
        
        if (!didThrow) {
          throw new Error('Expected function to throw');
        }
        
        if (expectedError && thrownError) {
          if (typeof expectedError === 'string') {
            if (!thrownError.message.includes(expectedError)) {
              throw new Error(`Expected error message to contain "${expectedError}"`);
            }
          } else if (expectedError instanceof RegExp) {
            if (!expectedError.test(thrownError.message)) {
              throw new Error(`Expected error message to match ${expectedError}`);
            }
          }
        }
      }
    };
  }
}

// ===== 解答 2: 高度なモックシステム =====

interface AutoMockOptions {
  deep: boolean;
  strict: boolean;
  recordCalls: boolean;
  persistMocks: boolean;
}

interface MockScenario<T> {
  name: string;
  setup: (mock: T) => void;
  teardown?: (mock: T) => void;
  expectations: MockExpectation<T>[];
}

interface MockExpectation<T> {
  method: keyof T;
  args?: any[];
  returnValue?: any;
  callCount?: number;
  callOrder?: number;
}

interface MockBehaviorRecord<T> {
  calls: Array<{
    method: keyof T;
    args: any[];
    returnValue: any;
    timestamp: number;
  }>;
}

interface ValidationResult {
  passed: boolean;
  violations: string[];
  summary: {
    expectedCalls: number;
    actualCalls: number;
    matchingCalls: number;
  };
}

class AdvancedAutoMockSystem {
  private mocks: Map<any, any> = new Map();
  private callRecords: Map<any, MockBehaviorRecord<any>> = new Map();

  /**
   * 型安全な自動モック生成
   */
  createAutoMock<T>(target: new (...args: any[]) => T, options: AutoMockOptions = {
    deep: false,
    strict: false,
    recordCalls: true,
    persistMocks: false
  }): T {
    const mockInstance = {} as T;
    const prototype = target.prototype;
    
    // プロトタイプのメソッドをモック化
    const propertyNames = Object.getOwnPropertyNames(prototype);
    propertyNames.forEach(name => {
      if (name !== 'constructor' && typeof prototype[name] === 'function') {
        (mockInstance as any)[name] = this.createMockFunction(name, options);
      }
    });

    if (options.deep) {
      // ディープモッキングの実装
      this.applyDeepMocking(mockInstance, options);
    }

    if (options.recordCalls) {
      this.callRecords.set(mockInstance, { calls: [] });
    }

    this.mocks.set(target, mockInstance);
    return mockInstance;
  }

  /**
   * モック関数の作成
   */
  private createMockFunction(methodName: string, options: AutoMockOptions): Function {
    return (...args: any[]) => {
      if (options.recordCalls) {
        // 呼び出しの記録
        console.log(`Mock method ${methodName} called with:`, args);
      }
      
      // デフォルトの戻り値
      return undefined;
    };
  }

  /**
   * ディープモッキング
   */
  createDeepMock<T>(target: T, depth: number = 3): T {
    if (depth <= 0) return target;
    
    const mock = {} as T;
    
    Object.keys(target as any).forEach(key => {
      const value = (target as any)[key];
      if (typeof value === 'object' && value !== null) {
        (mock as any)[key] = this.createDeepMock(value, depth - 1);
      } else if (typeof value === 'function') {
        (mock as any)[key] = jest.fn();
      } else {
        (mock as any)[key] = value;
      }
    });
    
    return mock;
  }

  /**
   * ディープモッキングの適用
   */
  private applyDeepMocking<T>(mock: T, options: AutoMockOptions): void {
    // ネストしたオブジェクトのプロパティも自動的にモック化
    Object.keys(mock as any).forEach(key => {
      const value = (mock as any)[key];
      if (typeof value === 'object' && value !== null) {
        (mock as any)[key] = this.createDeepMock(value, 2);
      }
    });
  }

  /**
   * シナリオベースモック
   */
  createScenarioMock<T>(target: T, scenarios: MockScenario<T>[]): T {
    const mock = { ...target };
    let currentScenario = 0;

    // 各シナリオの設定を適用
    const applyScenario = (index: number) => {
      if (index < scenarios.length) {
        const scenario = scenarios[index];
        scenario.setup(mock);
      }
    };

    // 初回シナリオの適用
    applyScenario(0);

    // シナリオ切り替えメソッドを追加
    (mock as any).nextScenario = () => {
      currentScenario++;
      applyScenario(currentScenario);
    };

    return mock;
  }

  /**
   * モック動作の記録
   */
  recordMockBehavior<T>(mock: T): MockBehaviorRecord<T> {
    const record = this.callRecords.get(mock);
    if (!record) {
      return { calls: [] };
    }
    return record;
  }

  /**
   * 記録された動作の再生
   */
  replayMockBehavior<T>(mock: T, record: MockBehaviorRecord<T>): void {
    // 記録された呼び出しを順番に再生
    record.calls.forEach(call => {
      const method = (mock as any)[call.method];
      if (typeof method === 'function') {
        method.mockReturnValue(call.returnValue);
      }
    });
  }

  /**
   * 型安全なモック検証
   */
  verifyMock<T>(mock: T, expectations: MockExpectation<T>[]): ValidationResult {
    const violations: string[] = [];
    let expectedCalls = 0;
    let actualCalls = 0;
    let matchingCalls = 0;

    expectations.forEach(expectation => {
      expectedCalls++;
      const method = (mock as any)[expectation.method];
      
      if (typeof method !== 'function' || !jest.isMockFunction(method)) {
        violations.push(`Method ${String(expectation.method)} is not a mock function`);
        return;
      }

      actualCalls += method.mock.calls.length;

      // 呼び出し回数の検証
      if (expectation.callCount !== undefined) {
        if (method.mock.calls.length !== expectation.callCount) {
          violations.push(
            `Expected ${String(expectation.method)} to be called ${expectation.callCount} times, but was called ${method.mock.calls.length} times`
          );
        } else {
          matchingCalls++;
        }
      }

      // 引数の検証
      if (expectation.args) {
        const lastCall = method.mock.calls[method.mock.calls.length - 1];
        if (JSON.stringify(lastCall) !== JSON.stringify(expectation.args)) {
          violations.push(
            `Expected ${String(expectation.method)} to be called with ${JSON.stringify(expectation.args)}, but was called with ${JSON.stringify(lastCall)}`
          );
        } else {
          matchingCalls++;
        }
      }

      // 戻り値の検証
      if (expectation.returnValue !== undefined) {
        const returnValue = method.mock.results[method.mock.results.length - 1]?.value;
        if (returnValue !== expectation.returnValue) {
          violations.push(
            `Expected ${String(expectation.method)} to return ${expectation.returnValue}, but returned ${returnValue}`
          );
        } else {
          matchingCalls++;
        }
      }
    });

    return {
      passed: violations.length === 0,
      violations,
      summary: {
        expectedCalls,
        actualCalls,
        matchingCalls
      }
    };
  }

  /**
   * 全モックのリセット
   */
  resetAllMocks(): void {
    this.mocks.clear();
    this.callRecords.clear();
  }
}

// ===== 使用例 =====

/**
 * 解答例のデモンストレーション
 */
async function demonstrateSolutions(): Promise<void> {
  console.log('=== Testing Strategies Solutions Demo ===');

  // 1. カスタムテストフレームワークのデモ
  console.log('\n1. Custom Test Framework:');
  const framework = new CustomTestFramework();
  
  framework.describe('Math Operations', () => {
    framework.beforeEach(() => {
      console.log('Setting up test');
    });
    
    framework.it('should add two numbers', () => {
      const result = 2 + 2;
      framework.expect(result).toBe(4);
    });
    
    framework.it('should multiply numbers', () => {
      const result = 3 * 4;
      framework.expect(result).toBe(12);
    });
    
    framework.afterEach(() => {
      console.log('Cleaning up test');
    });
  });
  
  const report = await framework.run();
  console.log('Test Report:', report);

  // 2. 高度なモックシステムのデモ
  console.log('\n2. Advanced Mock System:');
  const mockSystem = new AdvancedAutoMockSystem();
  
  class UserService {
    async getUser(id: string): Promise<any> {
      return { id, name: 'Real User' };
    }
    
    async updateUser(id: string, data: any): Promise<boolean> {
      return true;
    }
  }
  
  const mockUserService = mockSystem.createAutoMock(UserService, {
    deep: true,
    strict: false,
    recordCalls: true,
    persistMocks: false
  });
  
  console.log('Mock user service created');
  
  // モック検証のデモ
  const expectations: MockExpectation<UserService>[] = [
    {
      method: 'getUser',
      args: ['123'],
      callCount: 1
    }
  ];
  
  // 実際にはモック関数を呼び出してからテストする
  // await mockUserService.getUser('123');
  // const validation = mockSystem.verifyMock(mockUserService, expectations);
  // console.log('Mock validation:', validation);

  console.log('Solutions demo completed!');
}

// エクスポート
export {
  CustomTestFramework,
  AdvancedAutoMockSystem,
  demonstrateSolutions,
  type TestCase,
  type TestSuite,
  type TestReport,
  type TestFailure,
  type AutoMockOptions,
  type MockScenario,
  type MockExpectation,
  type MockBehaviorRecord,
  type ValidationResult
};

// デモの実行
if (require.main === module) {
  demonstrateSolutions().catch(console.error);
}