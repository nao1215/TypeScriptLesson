# Lesson 95: テストとQuality Assurance

## 学習目標
- Next.jsアプリケーションの包括的なテスト戦略を理解する
- ユニットテスト、統合テスト、E2Eテストの実装方法を学ぶ
- テストカバレッジの測定と品質保証プロセスを習得する
- CI/CDパイプラインでのテスト自動化を実装する

## 概要

品質の高いNext.jsアプリケーションを構築するためには、適切なテスト戦略が不可欠です。このレッスンでは、テストピラミッドに基づいた包括的なテストアプローチを学びます。

## テスト環境のセットアップ

### 依存関係のインストール

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest-environment-jsdom
npm install -D @playwright/test
npm install -D cypress
```

### Jest設定

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのパス
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// モックの設定
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Next.js Image コンポーネントのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return React.createElement('img', props)
  },
}))

// Next.js Router のモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

## ユニットテスト

### コンポーネントテスト

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/ui/Button'

describe('Button Component', () => {
  it('正しくレンダリングされる', () => {
    render(<Button>テストボタン</Button>)
    
    const button = screen.getByRole('button', { name: 'テストボタン' })
    expect(button).toBeInTheDocument()
  })

  it('クリックイベントが正常に動作する', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>クリック</Button>)
    
    const button = screen.getByRole('button', { name: 'クリック' })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled状態で正しく表示される', () => {
    render(<Button disabled>無効ボタン</Button>)
    
    const button = screen.getByRole('button', { name: '無効ボタン' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')
  })

  it('各variantで正しいスタイルが適用される', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-500')

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-500')
  })
})
```

### フックテスト

```tsx
// __tests__/hooks/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear()
  })

  it('初期値が正しく設定される', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default-value')
    )
    
    expect(result.current[0]).toBe('default-value')
  })

  it('値の更新が正常に動作する', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'initial')
    )
    
    act(() => {
      result.current[1]('updated')
    })
    
    expect(result.current[0]).toBe('updated')
    expect(localStorage.getItem('test-key')).toBe('"updated"')
  })

  it('LocalStorageから値を読み込む', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default')
    )
    
    expect(result.current[0]).toBe('stored-value')
  })
})
```

### ユーティリティ関数テスト

```tsx
// __tests__/lib/utils.test.ts
import { formatCurrency, validateEmail, debounce } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('formatCurrency', () => {
    it('正しい通貨フォーマットを返す', () => {
      expect(formatCurrency(1000)).toBe('¥1,000')
      expect(formatCurrency(1000000)).toBe('¥1,000,000')
      expect(formatCurrency(0)).toBe('¥0')
    })

    it('小数点を正しく処理する', () => {
      expect(formatCurrency(1000.5)).toBe('¥1,001')
      expect(formatCurrency(999.4)).toBe('¥999')
    })
  })

  describe('validateEmail', () => {
    it('有効なメールアドレスでtrueを返す', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.jp')).toBe(true)
    })

    it('無効なメールアドレスでfalseを返す', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('指定した遅延後に関数が実行される', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 300)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(300)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})
```

## 統合テスト

### APIルートテスト

```tsx
// __tests__/api/products.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/products'
import { prismaMock } from '@/lib/__mocks__/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('/api/products', () => {
  it('商品一覧を取得できる', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 1000 },
      { id: '2', name: 'Product 2', price: 2000 },
    ]

    prismaMock.product.findMany.mockResolvedValue(mockProducts)

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      products: mockProducts,
    })
  })

  it('商品を作成できる', async () => {
    const newProduct = {
      name: 'New Product',
      price: 1500,
      description: 'Test product'
    }

    const createdProduct = { id: '3', ...newProduct }
    prismaMock.product.create.mockResolvedValue(createdProduct)

    const { req, res } = createMocks({
      method: 'POST',
      body: newProduct,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toEqual({
      product: createdProduct,
    })
  })

  it('無効なリクエストでエラーを返す', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: '' }, // 無効なデータ
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
  })
})
```

### データベース統合テスト

```tsx
// __tests__/integration/user-service.test.ts
import { PrismaClient } from '@prisma/client'
import { UserService } from '@/lib/services/UserService'

const prisma = new PrismaClient()
const userService = new UserService(prisma)

describe('UserService Integration Tests', () => {
  beforeEach(async () => {
    // テストデータのクリーンアップ
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('ユーザーの作成と取得', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    }

    const createdUser = await userService.createUser(userData)
    
    expect(createdUser.email).toBe(userData.email)
    expect(createdUser.name).toBe(userData.name)
    expect(createdUser.id).toBeDefined()

    const foundUser = await userService.getUserById(createdUser.id)
    expect(foundUser?.email).toBe(userData.email)
  })

  it('重複するメールアドレスでエラーが発生', async () => {
    const userData = {
      email: 'duplicate@example.com',
      name: 'User 1',
      password: 'password123'
    }

    await userService.createUser(userData)

    const duplicateUserData = {
      ...userData,
      name: 'User 2'
    }

    await expect(
      userService.createUser(duplicateUserData)
    ).rejects.toThrow('Email already exists')
  })
})
```

## E2Eテスト

### Playwright設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2Eテストケース

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('認証フロー', () => {
  test('ユーザーログイン', async ({ page }) => {
    await page.goto('/login')
    
    // ログインフォームに入力
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    
    // ログインボタンをクリック
    await page.click('[data-testid="login-button"]')
    
    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('/dashboard')
    
    // ユーザー情報が表示されることを確認
    await expect(page.getByTestId('user-name')).toContainText('Test User')
  })

  test('無効なログイン情報でエラー表示', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'invalid@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')
    
    // エラーメッセージが表示されることを確認
    await expect(page.getByTestId('error-message'))
      .toContainText('認証情報が正しくありません')
  })

  test('ログアウト機能', async ({ page, context }) => {
    // ログイン済み状態でテストを開始
    await context.addCookies([{
      name: 'auth-token',
      value: 'valid-token',
      domain: 'localhost',
      path: '/'
    }])

    await page.goto('/dashboard')
    
    // ログアウトボタンをクリック
    await page.click('[data-testid="logout-button"]')
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login')
  })
})
```

### ショッピング機能のE2Eテスト

```typescript
// e2e/shopping.spec.ts
import { test, expect } from '@playwright/test'

test.describe('ショッピング機能', () => {
  test('商品をカートに追加して注文', async ({ page }) => {
    await page.goto('/products')
    
    // 商品をカートに追加
    await page.click('[data-testid="product-1"] [data-testid="add-to-cart"]')
    
    // カート通知が表示されることを確認
    await expect(page.getByTestId('cart-notification'))
      .toContainText('カートに追加されました')
    
    // カートページに移動
    await page.click('[data-testid="cart-link"]')
    
    // カート内容を確認
    await expect(page.getByTestId('cart-item')).toBeVisible()
    await expect(page.getByTestId('cart-total')).toContainText('¥1,000')
    
    // チェックアウトに進む
    await page.click('[data-testid="checkout-button"]')
    
    // 配送情報を入力
    await page.fill('[data-testid="shipping-name"]', '山田太郎')
    await page.fill('[data-testid="shipping-address"]', '東京都渋谷区...')
    await page.fill('[data-testid="shipping-phone"]', '090-1234-5678')
    
    // 決済情報を入力（テストモード）
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    
    // 注文を確定
    await page.click('[data-testid="place-order"]')
    
    // 注文完了ページが表示されることを確認
    await expect(page.getByTestId('order-success'))
      .toContainText('ご注文ありがとうございます')
  })
})
```

## ビジュアルリグレッションテスト

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('ビジュアルリグレッション', () => {
  test('ホームページのスクリーンショット', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('homepage.png')
  })

  test('商品一覧ページのスクリーンショット', async ({ page }) => {
    await page.goto('/products')
    
    // ローディングが完了するまで待機
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('products.png')
  })

  test('モバイル版ナビゲーション', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // モバイルメニューを開く
    await page.click('[data-testid="mobile-menu-button"]')
    
    await expect(page).toHaveScreenshot('mobile-nav.png')
  })
})
```

## パフォーマンステスト

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('パフォーマンス', () => {
  test('ページロード時間', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // 3秒以内にロードされることを確認
    expect(loadTime).toBeLessThan(3000)
  })

  test('Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals = {}
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime
            }
          })
          
          resolve(vitals)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      })
    })
    
    expect(metrics.lcp).toBeLessThan(2500) // 2.5秒以内
  })
})
```

## CI/CD統合

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## 品質ゲート

```typescript
// scripts/quality-gate.ts
import { execSync } from 'child_process'

interface QualityMetrics {
  testCoverage: number
  eslintErrors: number
  typescriptErrors: number
  e2ePassRate: number
}

async function runQualityGate(): Promise<boolean> {
  const metrics: QualityMetrics = {
    testCoverage: getTestCoverage(),
    eslintErrors: getESLintErrors(),
    typescriptErrors: getTypeScriptErrors(),
    e2ePassRate: getE2EPassRate()
  }

  console.log('Quality Metrics:', metrics)

  const qualityGates = [
    { name: 'Test Coverage', value: metrics.testCoverage, threshold: 80 },
    { name: 'ESLint Errors', value: metrics.eslintErrors, threshold: 0 },
    { name: 'TypeScript Errors', value: metrics.typescriptErrors, threshold: 0 },
    { name: 'E2E Pass Rate', value: metrics.e2ePassRate, threshold: 95 }
  ]

  let passed = true

  qualityGates.forEach(gate => {
    const isPassing = gate.name.includes('Errors') 
      ? gate.value <= gate.threshold 
      : gate.value >= gate.threshold

    console.log(`${gate.name}: ${gate.value} (${isPassing ? 'PASS' : 'FAIL'})`)
    
    if (!isPassing) {
      passed = false
    }
  })

  return passed
}

function getTestCoverage(): number {
  try {
    const output = execSync('npm run test:coverage -- --silent', { encoding: 'utf8' })
    const match = output.match(/All files.*?(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0
  } catch {
    return 0
  }
}

function getESLintErrors(): number {
  try {
    execSync('npm run lint', { encoding: 'utf8' })
    return 0
  } catch (error: any) {
    const errorCount = (error.stdout.match(/error/g) || []).length
    return errorCount
  }
}

// 実行
runQualityGate().then(passed => {
  process.exit(passed ? 0 : 1)
})
```

## 演習問題

1. **テストピラミッド**: 適切なテスト配分の実装
2. **モックストラテジー**: 外部サービスのモック化
3. **テストデータ管理**: ファクトリーパターンの実装
4. **継続的改善**: テストメトリクスの監視システム

## 実行方法

```bash
# ユニットテスト
npm run test:unit

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# 全テストスイート
npm run test:all

# カバレッジ付きテスト
npm run test:coverage
```

## まとめ

Lesson 91-95では、Next.jsアプリケーションの高度な機能を学習しました：
- パフォーマンス最適化（Core Web Vitals、バンドル最適化）
- SEO最適化（構造化データ、メタデータ管理）
- Progressive Web App（オフライン機能、プッシュ通知）
- 国際化（多言語対応、地域設定）
- テストとQA（包括的なテスト戦略、品質保証）

これらの知識により、本格的なプロダクションレディなアプリケーションが構築できるようになりました。次のフェーズでは、デプロイメントと運用について学習します。