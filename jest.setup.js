/**
 * Jest セットアップファイル
 * 全テストの実行前に一度だけ実行される設定ファイル
 */

// テスト環境の初期化
console.log('🚀 TypeScript学習コース - テスト環境を初期化中...');

// グローバルなテスト設定
global.console = {
  ...console,
  // テスト中のconsole.logを制御（必要に応じて）
  log: jest.fn((...args) => {
    // 重要なログのみ表示
    if (args.some(arg => typeof arg === 'string' && arg.includes('✅'))) {
      console.log(...args);
    }
  }),
  warn: jest.fn(console.warn),
  error: jest.fn(console.error),
};

// テスト用のヘルパー関数を定義
global.testHelper = {
  /**
   * 非同期処理のテスト用ヘルパー
   * @param ms 待機時間（ミリ秒）
   */
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * 型テスト用ヘルパー - 型が正しいかをテスト時にチェック
   * @param value テスト対象の値
   * @param expectedType 期待する型の文字列
   */
  checkType: (value, expectedType) => {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(`型が一致しません: expected ${expectedType}, got ${actualType}`);
    }
    return true;
  },
  
  /**
   * オブジェクトの構造をテストするヘルパー
   * @param obj テスト対象オブジェクト
   * @param expectedKeys 期待するキーの配列
   */
  checkObjectStructure: (obj, expectedKeys) => {
    const actualKeys = Object.keys(obj).sort();
    const sortedExpectedKeys = [...expectedKeys].sort();
    
    if (JSON.stringify(actualKeys) !== JSON.stringify(sortedExpectedKeys)) {
      throw new Error(`オブジェクト構造が一致しません: expected keys ${sortedExpectedKeys}, got ${actualKeys}`);
    }
    return true;
  }
};

// TypeScript学習向けのカスタムマッチャーを追加
expect.extend({
  /**
   * 配列の要素がすべて指定した型かをテストするマッチャー
   * @param received テスト対象の配列
   * @param expectedType 期待する型
   */
  toBeArrayOfType(received, expectedType) {
    const pass = Array.isArray(received) && 
                 received.every(item => typeof item === expectedType);
    
    if (pass) {
      return {
        message: () => `配列のすべての要素が ${expectedType} 型です`,
        pass: true,
      };
    } else {
      return {
        message: () => `配列のすべての要素が ${expectedType} 型である必要があります`,
        pass: false,
      };
    }
  },
  
  /**
   * オブジェクトが指定したインターフェースを満たすかテストするマッチャー
   * @param received テスト対象のオブジェクト
   * @param expectedInterface 期待するプロパティの配列
   */
  toSatisfyInterface(received, expectedInterface) {
    const hasAllProperties = expectedInterface.every(prop => 
      received.hasOwnProperty(prop)
    );
    
    if (hasAllProperties) {
      return {
        message: () => `オブジェクトが期待するインターフェースを満たしています`,
        pass: true,
      };
    } else {
      const missingProps = expectedInterface.filter(prop => 
        !received.hasOwnProperty(prop)
      );
      return {
        message: () => `オブジェクトに必要なプロパティが不足しています: ${missingProps.join(', ')}`,
        pass: false,
      };
    }
  }
});

// Lesson別のテスト設定
const setupLessonTest = (lessonNumber) => {
  beforeEach(() => {
    console.log(`📚 Lesson ${lessonNumber.toString().padStart(2, '0')} のテストを開始します`);
  });
  
  afterEach(() => {
    console.log(`✅ Lesson ${lessonNumber.toString().padStart(2, '0')} のテストが完了しました`);
  });
};

// グローバルにsetupLessonTestを公開
global.setupLessonTest = setupLessonTest;

// テスト実行前の最終メッセージ
console.log('🎯 TypeScript学習コースのテスト環境の準備が完了しました！');
console.log('💡 各Lessonでは実践的なTypeScriptコードをテストしていきます');
console.log('🔧 カスタムマッチャーとヘルパー関数が利用可能です');
console.log('');

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 未処理のPromise拒否が発生しました:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 キャッチされていない例外が発生しました:', error);
});