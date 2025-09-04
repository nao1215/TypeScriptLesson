# Lesson 91: パフォーマンス最適化

## 学習目標
- Next.jsアプリケーションのパフォーマンス測定方法を学ぶ
- Core Web Vitals の改善手法を理解する
- バンドル最適化とコード分割の実装方法を習得する
- 画像・フォント・CSS の最適化戦略を実践する

## 概要

Webアプリケーションのパフォーマンスは、ユーザー体験とSEOに直接影響します。このレッスンでは、Next.jsが提供する最適化機能を活用し、実測可能な改善を実現します。

## パフォーマンス測定

### Core Web Vitals

```tsx
// lib/performance/webVitals.ts
export function reportWebVitals(metric: any) {
  const { id, name, value, label } = metric

  // Google Analytics に送信
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Custom',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    })
  }

  // 開発環境でのログ出力
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name}: ${value} (${label})`)
  }

  // カスタム分析サービスに送信
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      value,
      id,
      timestamp: Date.now(),
      url: window.location.href
    })
  }).catch(console.error)
}
```

```tsx
// app/layout.tsx で Web Vitals を有効化
import { reportWebVitals } from '@/lib/performance/webVitals'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
                onCLS(${reportWebVitals.toString()});
                onFID(${reportWebVitals.toString()});
                onFCP(${reportWebVitals.toString()});
                onLCP(${reportWebVitals.toString()});
                onTTFB(${reportWebVitals.toString()});
              });
            `
          }}
        />
      </body>
    </html>
  )
}
```

### パフォーマンス監視

```tsx
// components/performance/PerformanceMonitor.tsx
'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstPaint: number
  firstContentfulPaint: number
  largestContentfulPaint: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0

      // Largest Contentful Paint
      let largestContentfulPaint = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        largestContentfulPaint = lastEntry.startTime
      })
      observer.observe({ type: 'largest-contentful-paint', buffered: true })

      setMetrics({
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint,
        firstContentfulPaint,
        largestContentfulPaint
      })
    }

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        measurePerformance()
      } else {
        window.addEventListener('load', measurePerformance)
        return () => window.removeEventListener('load', measurePerformance)
      }
    }
  }, [])

  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded text-xs font-mono">
      <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
      <div>DOM Content Loaded: {metrics.domContentLoaded.toFixed(2)}ms</div>
      <div>First Paint: {metrics.firstPaint.toFixed(2)}ms</div>
      <div>FCP: {metrics.firstContentfulPaint.toFixed(2)}ms</div>
      <div>LCP: {metrics.largestContentfulPaint.toFixed(2)}ms</div>
    </div>
  )
}
```

## コード分割とバンドル最適化

### 動的インポート

```tsx
// pages/admin/dashboard.tsx
import { lazy, Suspense } from 'react'

// 重いコンポーネントの遅延読み込み
const AnalyticsChart = lazy(() => import('@/components/analytics/AnalyticsChart'))
const DataTable = lazy(() => import('@/components/tables/DataTable'))
const ReportsPanel = lazy(() => import('@/components/reports/ReportsPanel'))

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">管理ダッシュボード</h1>
      
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsPanel />
      </Suspense>
    </div>
  )
}

// スケルトンローダー
function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-300 rounded"></div>
    </div>
  )
}
```

### next.config.js 最適化

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 実験的機能
  experimental: {
    // App Router の並列コンポーネント
    parallelServerRendering: true,
    // Server Actions の最適化
    serverActions: true,
  },

  // バンドル分析
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // バンドル分析の有効化
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      )
    }

    // Tree shaking の最適化
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    }

    // 重複する依存関係の最適化
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    }

    return config
  },

  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7日間
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 圧縮設定
  compress: true,
  
  // Headers 最適化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## 画像最適化

### レスポンシブ画像コンポーネント

```tsx
// components/ui/OptimizedImage.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  sizes?: string
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
          <span>画像を読み込めませんでした</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
    </div>
  )
}
```

### 画像の遅延読み込み

```tsx
// components/ui/LazyImage.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  placeholder?: string
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = '/placeholder.jpg'
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className={`relative ${className}`} style={{ width, height }}>
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <Image
          src={placeholder}
          alt="読み込み中..."
          width={width}
          height={height}
          className="opacity-50"
        />
      )}
    </div>
  )
}
```

## CSS最適化

### Critical CSS

```tsx
// components/layout/CriticalCSS.tsx
export default function CriticalCSS() {
  const criticalCSS = `
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    .above-fold {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 1rem;
      text-align: center;
    }
  `

  return (
    <style
      dangerouslySetInnerHTML={{ __html: criticalCSS }}
      data-purpose="critical-css"
    />
  )
}
```

### CSS-in-JS 最適化

```tsx
// lib/styles/styled.ts
import { styled } from 'styled-components'

// 動的スタイルの最適化
export const OptimizedButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  /* 静的スタイル */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* 動的スタイル */
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: #3b82f6;
          color: white;
          &:hover { background-color: #2563eb; }
        `
      case 'secondary':
        return `
          background-color: #6b7280;
          color: white;
          &:hover { background-color: #4b5563; }
        `
    }
  }}
`

// スタイルコンポーネントのメモ化
export const MemoizedCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`
```

## JavaScript最適化

### Tree Shaking

```tsx
// utils/optimizedImports.ts
// ❌ 悪い例 - ライブラリ全体をインポート
import * as _ from 'lodash'
import moment from 'moment'

// ✅ 良い例 - 必要な関数のみインポート
import { debounce, throttle } from 'lodash'
import { format } from 'date-fns'

// より軽量な代替ライブラリの使用
import { formatDistanceToNow } from 'date-fns'
import dayjs from 'dayjs' // moment.js の代替
```

### Service Worker によるキャッシュ

```typescript
// public/sw.js
const CACHE_NAME = 'app-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // 必要な静的アセット
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response
        }
        
        return fetch(event.request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return fetchResponse
        })
      })
    )
  }
})
```

## データベースクエリ最適化

### データローダーパターン

```tsx
// lib/dataLoaders/productLoader.ts
import DataLoader from 'dataloader'
import { prisma } from '@/lib/prisma'

export const productLoader = new DataLoader(async (productIds: readonly string[]) => {
  const products = await prisma.product.findMany({
    where: {
      id: { in: [...productIds] }
    },
    include: {
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { reviews: true }
      }
    }
  })

  // DataLoaderは順序を保持する必要がある
  return productIds.map(id => products.find(product => product.id === id) || null)
})

// 使用例
export async function getProductsWithReviews(productIds: string[]) {
  return Promise.all(productIds.map(id => productLoader.load(id)))
}
```

## パフォーマンス監視とアラート

```tsx
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  recordMetric(name: string, value: number) {
    const values = this.metrics.get(name) || []
    values.push(value)
    
    // 直近100件のみ保持
    if (values.length > 100) {
      values.shift()
    }
    
    this.metrics.set(name, values)

    // 閾値チェック
    this.checkThreshold(name, value)
  }

  private checkThreshold(name: string, value: number) {
    const thresholds = {
      'page-load-time': 3000, // 3秒
      'api-response-time': 1000, // 1秒
      'memory-usage': 50 * 1024 * 1024, // 50MB
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    if (threshold && value > threshold) {
      this.sendAlert(name, value, threshold)
    }
  }

  private async sendAlert(metric: string, value: number, threshold: number) {
    await fetch('/api/monitoring/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric,
        value,
        threshold,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    })
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || []
    return values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length 
      : 0
  }
}
```

## 演習問題

1. **バンドル分析**: webpack-bundle-analyzer を使った最適化
2. **画像最適化**: WebP/AVIF フォーマットの活用
3. **キャッシュ戦略**: Redis を使ったデータキャッシング
4. **監視システム**: Real User Monitoring の実装

## 実行方法

```bash
# バンドル分析
ANALYZE=true npm run build

# パフォーマンステスト
npm run lighthouse

# 開発サーバー（パフォーマンス監視付き）
npm run dev

# ロードテスト
npm run loadtest
```

## 次のステップ

次のレッスンでは、SEO最適化について詳しく学習し、検索エンジンでの可視性を向上させる方法を学びます。