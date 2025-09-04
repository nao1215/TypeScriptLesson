# Lesson 73: App Routerと新しいファイル規則

## 学習目標
- Next.js 13+のApp Routerの理解を深める
- 新しいファイル規則（layout、loading、error等）を活用する
- Server ComponentsとClient Componentsの適切な使い分けを学ぶ
- ストリーミングとSuspenseを理解する

## 概要

App Routerは、Next.js 13で導入された新しいルーティングシステムです。React 18の新機能を活用し、より柔軟で直感的な開発体験を提供します。

## 新しいファイル規則

### 基本のファイル規則

```
app/
├── layout.tsx          # ルートレイアウト（必須）
├── page.tsx            # ホームページ
├── loading.tsx         # ローディングUI
├── error.tsx           # エラーハンドリング
├── not-found.tsx       # 404ページ
└── global-error.tsx    # グローバルエラー
```

### セグメント固有のファイル

```
app/
├── dashboard/
│   ├── layout.tsx      # ダッシュボード用レイアウト
│   ├── page.tsx        # /dashboard
│   ├── loading.tsx     # ダッシュボードローディング
│   ├── error.tsx       # ダッシュボードエラー
│   └── analytics/
│       ├── page.tsx    # /dashboard/analytics
│       └── loading.tsx # アナリティクスローディング
```

## レイアウト (layout.tsx)

```tsx
// app/layout.tsx - ルートレイアウト（必須）
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Next.js App',
  description: 'Built with Next.js 14'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <nav>ナビゲーション</nav>
        </header>
        <main>{children}</main>
        <footer>フッター</footer>
      </body>
    </html>
  )
}
```

```tsx
// app/dashboard/layout.tsx - ネストしたレイアウト
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <aside>
        <nav>ダッシュボードメニュー</nav>
      </aside>
      <section>{children}</section>
    </div>
  )
}
```

## ローディング UI (loading.tsx)

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>読み込み中...</p>
    </div>
  )
}
```

```tsx
// app/dashboard/analytics/loading.tsx
export default function AnalyticsLoading() {
  return (
    <div>
      <h1>アナリティクス</h1>
      <div className="skeleton">
        <div className="skeleton-chart"></div>
        <div className="skeleton-stats"></div>
      </div>
    </div>
  )
}
```

## エラー処理 (error.tsx)

```tsx
// app/error.tsx
'use client' // エラーコンポーネントはClient Component

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="error">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>
        再試行
      </button>
    </div>
  )
}
```

```tsx
// app/dashboard/error.tsx
'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="dashboard-error">
      <h2>ダッシュボードでエラーが発生</h2>
      <details>
        <summary>エラー詳細</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={reset}>リロード</button>
    </div>
  )
}
```

## 404 ページ (not-found.tsx)

```tsx
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found">
      <h2>ページが見つかりません</h2>
      <p>お探しのページは存在しないか、削除されました。</p>
      <Link href="/">ホームに戻る</Link>
    </div>
  )
}
```

## テンプレート (template.tsx)

```tsx
// app/template.tsx
export default function Template({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="template-wrapper">
      {children}
    </div>
  )
}
```

## API Routes (route.ts)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = [
    { id: 1, name: '太郎' },
    { id: 2, name: '花子' }
  ]
  
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // ユーザー作成ロジック
  const newUser = {
    id: Date.now(),
    ...body
  }
  
  return NextResponse.json(newUser, { status: 201 })
}
```

## ストリーミングとSuspense

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { Analytics } from './analytics'
import { UserStats } from './user-stats'

export default function Dashboard() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      
      <Suspense fallback={<div>アナリティクス読み込み中...</div>}>
        <Analytics />
      </Suspense>
      
      <Suspense fallback={<div>統計読み込み中...</div>}>
        <UserStats />
      </Suspense>
    </div>
  )
}
```

## メタデータ API

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

## Server Actions

```tsx
// app/forms/page.tsx
import { redirect } from 'next/navigation'

async function createUser(formData: FormData) {
  'use server'
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  
  // データベースへの保存
  await saveUser({ name, email })
  
  redirect('/users')
}

export default function CreateUserPage() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="名前" required />
      <input name="email" type="email" placeholder="メール" required />
      <button type="submit">作成</button>
    </form>
  )
}
```

## 演習問題

1. **レイアウト設計**: 複数レベルのネストしたレイアウトを実装
2. **エラーハンドリング**: 各レベルでのエラー処理を実装
3. **ローディング状態**: スケルトンUIを含むローディング画面を作成
4. **メタデータ**: 動的なメタデータ生成を実装

## 実行方法

```bash
npm run dev
# 各ページでローディング、エラー状態をテスト
npm test
```

## 次のステップ

次のレッスンでは、レイアウトとメタデータについてさらに詳しく学習します。