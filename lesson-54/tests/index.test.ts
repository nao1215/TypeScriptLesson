/**
 * Lesson 54: テスト戦略 - テストコード
 * 
 * テスト戦略機能の包括的なテストケース
 */

import {
  ComprehensiveTestSuite,
  AutoTestGenerator,
  AdvancedMockSystem,
  TestDataFactory,
  PerformanceTestRunner
} from '../src/index';

import {
  CustomTestFramework,
  AdvancedAutoMockSystem
} from '../src/solution';

describe('Lesson 54: Testing Strategies Tests', () => {

  // ===== 基本テストスイート機能テスト =====

  describe('ComprehensiveTestSuite', () => {
    test('should create test suite with configuration', () => {
      const config = {
        framework: 'jest' as const,
        environment: 'node' as const,
        coverage: {
          enabled: true,
          threshold: 80,
          reporters: ['text'],
          excludePatterns: []
        },
        parallel: true,
        timeout: 30000,
        setupFiles: [],
        testPathPatterns: ['**/*.test.ts']
      };

      const suite = new ComprehensiveTestSuite(config);
      expect(suite).toBeDefined();
    });
  });

  // ===== 自動テスト生成テスト =====

  describe('AutoTestGenerator', () => {
    test('should initialize with configuration', () => {
      const generator = new AutoTestGenerator({
        analysisDepth: 'deep',
        generateMocks: true,
        includeEdgeCases: true
      });
      
      expect(generator).toBeDefined();
    });
  });

  // ===== モックシステムテスト =====

  describe('AdvancedMockSystem', () => {
    let mockSystem: AdvancedMockSystem;

    beforeEach(() => {
      mockSystem = new AdvancedMockSystem();
    });

    afterEach(() => {
      mockSystem.resetAll();
    });

    test('should create mock with configuration', () => {
      class TestService {
        getValue(): string {
          return 'real value';
        }
      }

      const mock = mockSystem.createMock(TestService, {
        returnValues: {
          getValue: 'mock value'
        }
      });

      expect(mock).toBeDefined();
      expect(typeof mock.getValue).toBe('function');
    });

    test('should create partial mock', () => {
      const original = {
        method1: () => 'original1',
        method2: () => 'original2'
      };

      const partialMock = mockSystem.createPartialMock(original, {
        method1: () => 'mocked1'
      });

      expect(partialMock.method2()).toBe('original2');
    });
  });

  // ===== テストデータファクトリーテスト =====

  describe('TestDataFactory', () => {
    interface TestUser {
      id: string;
      name: string;
      email: string;
      age: number;
    }

    let factory: TestDataFactory<TestUser>;

    beforeEach(() => {
      factory = new TestDataFactory<TestUser>({
        defaults: {
          name: 'Test User',
          email: 'test@example.com',
          age: 25
        },
        traits: {
          admin: { name: 'Admin User', email: 'admin@example.com' }
        },
        sequences: {
          id: () => `user_${Math.random()}`
        },
        associations: {}
      });
    });

    test('should create object with defaults', () => {
      const user = factory.create();
      
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.age).toBe(25);
      expect(user.id).toBeDefined();
    });

    test('should create object with overrides', () => {
      const user = factory.create({ name: 'Custom Name' });
      
      expect(user.name).toBe('Custom Name');
      expect(user.email).toBe('test@example.com');
    });

    test('should create multiple objects', () => {
      const users = factory.createList(3);
      
      expect(users).toHaveLength(3);
      expect(users[0].name).toBe('Test User');
      expect(users[1].name).toBe('Test User');
    });

    test('should create object with traits', () => {
      const adminUser = factory.createWithTraits(['admin']);
      
      expect(adminUser.name).toBe('Admin User');
      expect(adminUser.email).toBe('admin@example.com');
    });
  });

  // ===== パフォーマンステストランナーテスト =====

  describe('PerformanceTestRunner', () => {
    let runner: PerformanceTestRunner;

    beforeEach(() => {
      runner = new PerformanceTestRunner();
    });

    afterEach(() => {
      runner.clearResults();
    });

    test('should benchmark function performance', async () => {
      const testFunction = (n: number) => {
        let result = 0;
        for (let i = 0; i < n; i++) {
          result += i;
        }
        return result;
      };

      const result = await runner.benchmarkFunction(
        'testFunction',
        testFunction,
        [1000],
        10
      );

      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(typeof result.memoryUsage).toBe('number');
    });

    test('should compare multiple functions', async () => {
      const fastFunction = (n: number) => n * 2;
      const slowFunction = (n: number) => {
        let result = 0;
        for (let i = 0; i < n; i++) {
          result += 2;
        }
        return result;
      };

      const comparison = await runner.comparePerformance([
        { name: 'fast', fn: fastFunction, args: [100] },
        { name: 'slow', fn: slowFunction, args: [100] }
      ], 5);

      expect(comparison).toHaveLength(2);
      expect(comparison[0].relativeFactor).toBeGreaterThanOrEqual(1);
      expect(comparison[1].relativeFactor).toBeGreaterThanOrEqual(1);
    });

    test('should generate performance report', () => {
      const report = runner.generateReport();
      expect(typeof report).toBe('string');
      expect(report).toContain('Performance Test Report');
    });
  });

  // ===== カスタムテストフレームワークテスト（解答例） =====

  describe('CustomTestFramework (Solution)', () => {
    let framework: CustomTestFramework;

    beforeEach(() => {
      framework = new CustomTestFramework();
    });

    test('should define and run simple test suite', async () => {
      let setupCalled = false;
      let teardownCalled = false;
      let testExecuted = false;

      framework.describe('Sample Suite', () => {
        framework.beforeEach(() => {
          setupCalled = true;
        });

        framework.afterEach(() => {
          teardownCalled = true;
        });

        framework.it('should pass simple test', () => {
          testExecuted = true;
          framework.expect(2 + 2).toBe(4);
        });
      });

      const report = await framework.run();

      expect(report.passed).toBe(1);
      expect(report.failed).toBe(0);
      expect(setupCalled).toBe(true);
      expect(teardownCalled).toBe(true);
      expect(testExecuted).toBe(true);
    });

    test('should handle test failures', async () => {
      framework.describe('Failing Suite', () => {
        framework.it('should fail', () => {
          framework.expect(2 + 2).toBe(5); // This should fail
        });
      });

      const report = await framework.run();

      expect(report.passed).toBe(0);
      expect(report.failed).toBe(1);
      expect(report.failures).toHaveLength(1);
      expect(report.failures[0].error.message).toContain('Expected 4 to be 5');
    });

    test('should support async tests', async () => {
      framework.describe('Async Suite', () => {
        framework.it('should handle async operations', async () => {
          const result = await Promise.resolve(42);
          framework.expect(result).toBe(42);
        });
      });

      const report = await framework.run();

      expect(report.passed).toBe(1);
      expect(report.failed).toBe(0);
    });

    test('should support nested describe blocks', async () => {
      framework.describe('Outer Suite', () => {
        framework.describe('Inner Suite', () => {
          framework.it('should work in nested suite', () => {
            framework.expect(true).toBeTruthy();
          });
        });
      });

      const report = await framework.run();

      expect(report.passed).toBe(1);
      expect(report.failed).toBe(0);
    });
  });

  // ===== 高度な自動モックシステムテスト（解答例） =====

  describe('AdvancedAutoMockSystem (Solution)', () => {
    let mockSystem: AdvancedAutoMockSystem;

    beforeEach(() => {
      mockSystem = new AdvancedAutoMockSystem();
    });

    afterEach(() => {
      mockSystem.resetAllMocks();
    });

    test('should create auto mock with options', () => {
      class TestService {
        getData(): string {
          return 'real data';
        }
        
        processData(data: string): string {
          return `processed: ${data}`;
        }
      }

      const mock = mockSystem.createAutoMock(TestService, {
        deep: false,
        strict: false,
        recordCalls: true,
        persistMocks: false
      });

      expect(mock).toBeDefined();
      expect(typeof mock.getData).toBe('function');
      expect(typeof mock.processData).toBe('function');
    });

    test('should create deep mock', () => {
      const complexObject = {
        level1: {
          level2: {
            method: () => 'deep method',
            value: 'deep value'
          }
        },
        simpleMethod: () => 'simple'
      };

      const deepMock = mockSystem.createDeepMock(complexObject, 3);

      expect(deepMock).toBeDefined();
      expect(deepMock.level1).toBeDefined();
      expect(deepMock.level1.level2).toBeDefined();
    });
  });

  // ===== 統合テスト =====

  describe('Testing Strategies Integration', () => {
    test('should work together seamlessly', async () => {
      // テストスイート
      const config = {
        framework: 'jest' as const,
        environment: 'node' as const,
        coverage: {
          enabled: true,
          threshold: 70,
          reporters: ['text'],
          excludePatterns: []
        },
        parallel: false,
        timeout: 10000,
        setupFiles: [],
        testPathPatterns: []
      };

      const suite = new ComprehensiveTestSuite(config);
      
      // モックシステム
      const mockSystem = new AdvancedMockSystem();
      
      // テストデータファクトリー
      interface User {
        id: string;
        name: string;
      }
      
      const userFactory = new TestDataFactory<User>({
        defaults: { name: 'Test User' },
        traits: {},
        sequences: {
          id: () => `user_${Date.now()}`
        },
        associations: {}
      });
      
      // パフォーマンステスト
      const perfRunner = new PerformanceTestRunner();
      
      // 全体的なテスト
      expect(suite).toBeDefined();
      expect(mockSystem).toBeDefined();
      expect(userFactory).toBeDefined();
      expect(perfRunner).toBeDefined();
      
      const testUser = userFactory.create({ name: 'Integration Test User' });
      expect(testUser.name).toBe('Integration Test User');
      expect(testUser.id).toBeDefined();
      
      // クリーンアップ
      mockSystem.resetAll();
      perfRunner.clearResults();
    });
  });
});

// テスト用ヘルパー関数

/**
 * 非同期操作の待機
 */
async function waitForCondition(condition: () => boolean, timeout: number = 1000): Promise<void> {
  const start = Date.now();
  
  while (!condition() && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  if (!condition()) {
    throw new Error('Condition not met within timeout');
  }
}

/**
 * モックアサーション
 */
function expectMockToBeCalled(mockFn: any, times?: number): void {
  if (jest.isMockFunction(mockFn)) {
    if (times !== undefined) {
      expect(mockFn).toHaveBeenCalledTimes(times);
    } else {
      expect(mockFn).toHaveBeenCalled();
    }
  } else {
    throw new Error('Expected a mock function');
  }
}

/**
 * パフォーマンスアサーション
 */
function expectPerformanceWithinBounds(actualTime: number, maxTime: number): void {
  expect(actualTime).toBeLessThanOrEqual(maxTime);
  expect(actualTime).toBeGreaterThan(0);
}

// エクスポート
export {
  waitForCondition,
  expectMockToBeCalled,
  expectPerformanceWithinBounds
};