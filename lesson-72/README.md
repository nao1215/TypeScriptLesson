# Lesson 72: ページルーティングとナビゲーション

## 学習目標
- Next.jsのファイルシステムベースルーティングを理解する
- 動的ルーティングとパラメータの取得方法を学ぶ
- プログラマティックナビゲーションを実装する
- Link コンポーネントとuseRouterフックを使いこなす

## 概要

Next.jsは、ファイルシステムを基にした直感的なルーティングシステムを提供します。App Routerでは、ディレクトリ構造がそのままURLパスになります。

## ルーティングの基本

### 静的ルーティング

```
app/
├── page.tsx              # / (ホーム)
├── about/
│   └── page.tsx          # /about
├── contact/
│   └── page.tsx          # /contact
└── blog/
    ├── page.tsx          # /blog
    └── posts/
        └── page.tsx      # /blog/posts
```

### 動的ルーティング

```
app/
├── blog/
│   ├── [slug]/
│   │   └── page.tsx      # /blog/[slug] (例: /blog/hello-world)
│   └── [category]/
│       └── [slug]/
│           └── page.tsx  # /blog/[category]/[slug]
└── shop/
    └── [...slug]/
        └── page.tsx      # /shop/[...slug] (Catch-all Routes)
```

## ナビゲーションの実装

### Link コンポーネント

```tsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">ホーム</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">ブログ</Link>
      <Link href="/blog/my-first-post">最初の投稿</Link>
    </nav>
  )
}
```

### useRouter フック

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  
  return (
    <button onClick={() => router.back()}>
      戻る
    </button>
  )
}
```

## パラメータの取得

### 動的セグメント

```tsx
// app/blog/[slug]/page.tsx
interface PageProps {
  params: {
    slug: string
  }
}

export default function BlogPost({ params }: PageProps) {
  return (
    <div>
      <h1>投稿: {params.slug}</h1>
    </div>
  )
}
```

### 検索パラメータ

```tsx
// app/search/page.tsx
interface PageProps {
  searchParams: {
    q?: string
    category?: string
  }
}

export default function SearchPage({ searchParams }: PageProps) {
  return (
    <div>
      <h1>検索結果</h1>
      <p>検索語: {searchParams.q}</p>
      <p>カテゴリ: {searchParams.category}</p>
    </div>
  )
}
```

## プログラマティックナビゲーション

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function SearchForm() {
  const router = useRouter()
  
  const handleSubmit = (formData: FormData) => {
    const query = formData.get('query') as string
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }
  
  return (
    <form action={handleSubmit}>
      <input name="query" placeholder="検索..." />
      <button type="submit">検索</button>
    </form>
  )
}
```

## ルート グループ

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx      # /about
│   └── contact/
│       └── page.tsx      # /contact
├── (shop)/
│   ├── products/
│   │   └── page.tsx      # /products
│   └── cart/
│       └── page.tsx      # /cart
└── page.tsx              # /
```

## 並列ルート

```
app/
├── @analytics/
│   └── page.tsx          # 並列ルート: アナリティクス
├── @team/
│   └── page.tsx          # 並列ルート: チーム
├── layout.tsx
└── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <div className="sidebar">
          {analytics}
          {team}
        </div>
      </body>
    </html>
  )
}
```

## インターセプティングルート

```
app/
├── feed/
│   └── page.tsx
├── photo/
│   └── [id]/
│       └── page.tsx      # /photo/[id]
└── @modal/
    └── (.)photo/
        └── [id]/
            └── page.tsx  # インターセプト
```

## 演習問題

1. **基本ルーティング**: `/about`, `/contact`, `/services` ページを作成
2. **動的ルーティング**: ブログシステムのルーティング実装
3. **ナビゲーション**: ヘッダーメニューとパンくずリストの実装
4. **検索機能**: 検索フォームと結果ページの実装

## 実行方法

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:3000 を開いて各ページをテスト

# テストを実行
npm test
```

## 次のステップ

次のレッスンでは、App Routerと新しいファイル規則について詳しく学習します。