# Lesson 80: 画像最適化とフォント

## 学習目標
- Next.jsの画像最適化機能を理解し活用する
- Web フォントの最適化とカスタムフォントの導入方法を学ぶ
- パフォーマンス向上のベストプラクティスを理解する
- 画像とフォントのローディング最適化を実装する

## 概要

Next.jsは、画像とフォントの最適化において強力な機能を提供します。これらを適切に活用することで、ページの読み込み速度を大幅に改善できます。

## 画像最適化

### next/image コンポーネント

```tsx
// 基本的な使用方法
import Image from 'next/image'

export default function BasicImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="ヒーロー画像"
      width={800}
      height={400}
    />
  )
}
```

```tsx
// 外部画像の使用
import Image from 'next/image'

export default function ExternalImage() {
  return (
    <Image
      src="https://example.com/image.jpg"
      alt="外部画像"
      width={800}
      height={400}
      // 外部ドメインは next.config.js で許可が必要
    />
  )
}
```

### レスポンシブ画像

```tsx
// fill プロパティを使用
import Image from 'next/image'

export default function ResponsiveImage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Image
        src="/hero.jpg"
        alt="レスポンシブ画像"
        fill
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}
```

```tsx
// sizes プロパティで詳細制御
import Image from 'next/image'

export default function AdvancedResponsive() {
  return (
    <Image
      src="/hero.jpg"
      alt="高度なレスポンシブ画像"
      width={800}
      height={400}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{
        width: '100%',
        height: 'auto',
      }}
    />
  )
}
```

### 画像のプリロード

```tsx
// priority プロパティ
import Image from 'next/image'

export default function HeroSection() {
  return (
    <Image
      src="/hero.jpg"
      alt="メインビジュアル"
      width={1200}
      height={600}
      priority // Above the fold の画像に設定
    />
  )
}
```

### 画像の遅延読み込み

```tsx
// loading プロパティ（デフォルトは lazy）
import Image from 'next/image'

export default function LazyImages() {
  return (
    <div>
      {Array.from({ length: 10 }).map((_, i) => (
        <Image
          key={i}
          src={`/gallery/image-${i + 1}.jpg`}
          alt={`ギャラリー画像 ${i + 1}`}
          width={400}
          height={300}
          loading="lazy"
        />
      ))}
    </div>
  )
}
```

### プレースホルダー

```tsx
// blur プレースホルダー
import Image from 'next/image'

export default function BlurPlaceholder() {
  return (
    <Image
      src="/portrait.jpg"
      alt="ポートレート"
      width={400}
      height={500}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // 小さなbase64画像
    />
  )
}
```

```tsx
// empty プレースホルダー
import Image from 'next/image'

export default function EmptyPlaceholder() {
  return (
    <Image
      src="/product.jpg"
      alt="商品画像"
      width={300}
      height={300}
      placeholder="empty"
    />
  )
}
```

## フォント最適化

### Google Fonts の使用

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body>
        <div className={robotoMono.className}>
          <code>モノスペースフォント</code>
        </div>
        {children}
      </body>
    </html>
  )
}
```

### カスタムフォント

```tsx
// app/fonts.ts
import localFont from 'next/font/local'

export const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
})

export const japaneseFont = localFont({
  src: './fonts/NotoSansJP-Variable.woff2',
  display: 'swap',
  variable: '--font-japanese',
})
```

```tsx
// app/layout.tsx でカスタムフォントを使用
import { myFont, japaneseFont } from './fonts'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${myFont.className} ${japaneseFont.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### フォントの変数設定

```css
/* globals.css */
:root {
  --font-main: var(--font-inter);
  --font-mono: var(--font-roboto-mono);
  --font-japanese: var(--font-noto-sans-jp);
}

body {
  font-family: var(--font-main), var(--font-japanese), sans-serif;
}

code {
  font-family: var(--font-mono), monospace;
}
```

## next.config.js での画像設定

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 外部画像ドメインを許可
    domains: [
      'example.com',
      'cdn.example.com',
      'images.unsplash.com'
    ],
    // リモートパターン（より柔軟）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    // 画像形式の設定
    formats: ['image/webp', 'image/avif'],
    // 画像サイズの設定
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 画像最適化の無効化（必要に応じて）
    unoptimized: false,
  },
}

module.exports = nextConfig
```

## パフォーマンス最適化

### 画像のプリフェッチ

```tsx
// プリフェッチコンポーネント
import { useEffect } from 'react'

interface ImagePrefetchProps {
  images: string[]
}

export function ImagePrefetch({ images }: ImagePrefetchProps) {
  useEffect(() => {
    images.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }, [images])

  return null
}
```

### 画像の動的インポート

```tsx
// 動的画像読み込み
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface DynamicImageProps {
  imagePath: string
  alt: string
  width: number
  height: number
}

export function DynamicImage({ imagePath, alt, width, height }: DynamicImageProps) {
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    import(`../public/images/${imagePath}`)
      .then((module) => setSrc(module.default))
      .catch(() => setSrc('/fallback.jpg'))
  }, [imagePath])

  if (!src) {
    return <div>画像を読み込み中...</div>
  }

  return <Image src={src} alt={alt} width={width} height={height} />
}
```

### 画像の遅延ハイドレーション

```tsx
// クライアントサイドでのみ画像を表示
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function HydratedImage({
  src,
  alt,
  width,
  height,
  ...props
}: {
  src: string
  alt: string
  width: number
  height: number
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div 
        style={{ width, height, backgroundColor: '#f0f0f0' }}
        aria-label={alt}
      />
    )
  }

  return <Image src={src} alt={alt} width={width} height={height} {...props} />
}
```

## アクセシビリティ

### 画像のalt属性

```tsx
// 適切なalt属性の設定
import Image from 'next/image'

export default function AccessibleImages() {
  return (
    <div>
      {/* 装飾的な画像 */}
      <Image
        src="/decoration.svg"
        alt=""
        width={50}
        height={50}
      />
      
      {/* 情報を含む画像 */}
      <Image
        src="/chart.png"
        alt="2023年売上グラフ：第1四半期から第4四半期にかけて増加傾向"
        width={600}
        height={400}
      />
      
      {/* ロゴ */}
      <Image
        src="/logo.svg"
        alt="会社名"
        width={120}
        height={40}
      />
    </div>
  )
}
```

## 演習問題

1. **画像ギャラリー**: レスポンシブな画像ギャラリーを作成
2. **フォント統合**: Google FontsとカスタムフォントのMix
3. **パフォーマンス最適化**: 大量画像の効率的な表示
4. **アクセシビリティ**: スクリーンリーダー対応の画像実装

## 実行方法

```bash
npm run dev
# 画像とフォントの最適化を確認
npm run build
npm start
# 本番環境でのパフォーマンスをチェック
```

## まとめ

Lesson 71-80では、Next.jsの基礎から画像・フォント最適化まで学習しました。次のフェーズでは、状態管理、認証、データベース連携など、より実践的な内容に進みます。