# Lesson 63: デバッグ技術 (Debugging Techniques)

## 学習目標
このレッスンでは、TypeScriptアプリケーションの効果的なデバッグ技術とトラブルシューティング手法を学習します。

### 学習内容
1. Chrome DevToolsでのTypeScriptデバッグ
2. VS Codeデバッグ設定と使い方
3. ソースマップとプロダクションビルドのデバッグ
4. パフォーマンスプロファイリングとメモリリーク検出
5. ネットワークデバッグとAPI問題の診断
6. エラー追跡とログ戦略

## 実装する機能

### 1. 統合デバッグシステム
複数のデバッグツールを統合した包括的なデバッグ環境を構築します。

### 2. パフォーマンス監視
リアルタイムのパフォーマンス監視とボトルネック検出システムを実装します。

### 3. エラートラッキング
包括的なエラー追跡とレポーティングシステムを実装します。

### 4. ログ管理
構造化ログとデバッグ情報の効率的な管理システムを実装します。

### 5. 自動診断
よくある問題の自動検出と解決提案システムを実装します。

## 型定義の特徴

### デバッグ設定型
```typescript
interface DebugConfig {
  type: 'node' | 'chrome' | 'edge';
  request: 'launch' | 'attach';
  name: string;
  program?: string;
  args?: string[];
  env?: Record<string, string>;
  console?: 'internalConsole' | 'integratedTerminal' | 'externalTerminal';
  sourceMaps?: boolean;
  outFiles?: string[];
  skipFiles?: string[];
  stopOnEntry?: boolean;
  restart?: boolean;
  port?: number;
  address?: string;
  localRoot?: string;
  remoteRoot?: string;
}
```

### パフォーマンス監視型
```typescript
interface PerformanceMetrics {
  timing: {
    navigationStart: number;
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  resources: ResourceTiming[];
}

interface ResourceTiming {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}
```

### エラー追跡型
```typescript
interface ErrorInfo {
  message: string;
  stack: string;
  filename: string;
  lineno: number;
  colno: number;
  error: Error;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  breadcrumbs: Breadcrumb[];
  context: Record<string, any>;
}

interface Breadcrumb {
  timestamp: Date;
  category: 'navigation' | 'user' | 'console' | 'network' | 'dom';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}
```

## 実用的な使用例

### Chrome DevToolsデバッグ
```typescript
// ブラウザデバッグ用のヘルパー関数
class BrowserDebugger {
  // ブレークポイントの動的設定
  static setBreakpoint(condition?: string): void {
    if (condition) {
      if (eval(condition)) {
        debugger; // 条件付きブレークポイント
      }
    } else {
      debugger; // 無条件ブレークポイント
    }
  }

  // パフォーマンス測定
  static measurePerformance(name: string, fn: () => any): any {
    performance.mark(`${name}-start`);
    const result = fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name} took ${measure.duration}ms`);
    
    return result;
  }

  // メモリ使用量監視
  static logMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.table({
        'Used JS Heap Size': `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        'Total JS Heap Size': `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        'JS Heap Size Limit': `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }
}
```

### VS Codeデバッグ設定
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript App",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/.env.debug",
      "stopOnEntry": false,
      "skipFiles": [
        "<node_internals>/**",
        "node_modules/**"
      ]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Browser App",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "userDataDir": "${workspaceFolder}/.vscode/chrome-debug-profile"
    }
  ]
}
```

## ベストプラクティス

### 1. デバッグ戦略
- 問題の再現手順を明確にする
- 最小限の再現ケースを作成
- デバッグツールを段階的に使用
- ログとブレークポイントを効果的に組み合わせ

### 2. パフォーマンスデバッグ
- CPU使用率とメモリ使用量を監視
- ボトルネックの特定と分析
- 非効率なアルゴリズムの検出
- レンダリングパフォーマンスの最適化

### 3. エラーハンドリング
- 包括的なエラーキャッチング
- コンテキスト情報の保存
- ユーザーフレンドリーなエラーメッセージ
- エラーレポートの自動送信

## 高度な機能

### 1. 自動デバッグ
```typescript
class AutoDebugger {
  private static instance: AutoDebugger;
  private breakpoints: Map<string, () => boolean> = new Map();
  private watchers: Map<string, () => any> = new Map();

  static getInstance(): AutoDebugger {
    if (!AutoDebugger.instance) {
      AutoDebugger.instance = new AutoDebugger();
    }
    return AutoDebugger.instance;
  }

  // 条件付きブレークポイント
  addConditionalBreakpoint(id: string, condition: () => boolean): void {
    this.breakpoints.set(id, condition);
  }

  // 変数ウォッチャー
  watchVariable(name: string, getter: () => any): void {
    this.watchers.set(name, getter);
  }

  // デバッグセッションの開始
  startDebugging(): void {
    setInterval(() => {
      // ブレークポイントチェック
      for (const [id, condition] of this.breakpoints) {
        if (condition()) {
          console.log(`Breakpoint hit: ${id}`);
          debugger;
        }
      }

      // 変数監視
      for (const [name, getter] of this.watchers) {
        const value = getter();
        console.log(`Watch ${name}:`, value);
      }
    }, 100);
  }
}
```

### 2. ネットワークデバッグ
```typescript
class NetworkDebugger {
  private interceptedRequests: Map<string, RequestInfo> = new Map();

  // Fetch APIのインターセプト
  interceptFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo, init?: RequestInit) => {
      const requestId = Math.random().toString(36);
      const startTime = performance.now();
      
      console.group(`🌐 Network Request ${requestId}`);
      console.log('URL:', input);
      console.log('Options:', init);
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Response (${duration.toFixed(2)}ms):`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        console.groupEnd();
        
        // レスポンスをクローンして内容をログ
        const clonedResponse = response.clone();
        clonedResponse.text().then(text => {
          console.log(`📄 Response Body for ${requestId}:`, text);
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(`❌ Request failed (${duration.toFixed(2)}ms):`, error);
        console.groupEnd();
        
        throw error;
      }
    };
  }
}
```

### 3. パフォーマンス分析
```typescript
class PerformanceAnalyzer {
  private observers: Map<string, PerformanceObserver> = new Map();

  // Web Vitalsの監視
  monitorWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'], buffered: true });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let cls = 0;
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      console.log('CLS:', cls);
    }).observe({ entryTypes: ['layout-shift'], buffered: true });
  }

  // メモリリーク検出
  detectMemoryLeaks(): void {
    let baseline: number;
    
    const checkMemory = () => {
      if ('memory' in performance) {
        const current = (performance as any).memory.usedJSHeapSize;
        
        if (!baseline) {
          baseline = current;
        } else {
          const increase = current - baseline;
          if (increase > 10 * 1024 * 1024) { // 10MB以上の増加
            console.warn('Potential memory leak detected:', {
              baseline: baseline / 1024 / 1024,
              current: current / 1024 / 1024,
              increase: increase / 1024 / 1024
            });
          }
        }
      }
    };

    setInterval(checkMemory, 5000); // 5秒ごとにチェック
  }
}
```

## セキュリティ考慮事項

### 1. プロダクションでのデバッグ情報
- 本番環境でのデバッグコードの無効化
- センシティブ情報のログ出力防止
- ソースマップの適切な管理

### 2. エラーレポート
- 個人情報の除外
- データの匿名化
- 最小限の情報のみ送信

## ツール統合

### 1. IDE拡張機能
- TypeScript Hero
- Debugger for Chrome
- REST Client
- GitLens

### 2. ブラウザ拡張機能
- React Developer Tools
- Vue.js devtools
- Redux DevTools
- Lighthouse

## ビルドと実行

```bash
# デバッグビルド（ソースマップ付き）
npm run build:debug

# デバッグサーバー起動
npm run dev:debug

# テストデバッグ
npm run test:debug

# パフォーマンス分析
npm run analyze:performance

# メモリリーク検出
npm run detect:memory-leaks

# ネットワークログ有効化
npm run debug:network
```

## 次のステップ
次のLesson 64では、パッケージ管理について学習し、npm、yarn、pnpmの使い分けと効果的な依存関係管理を習得します。