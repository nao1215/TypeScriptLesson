# Lesson 71: Next.js セットアップとプロジェクト構造

## 学習目標
- Next.jsプロジェクトを一から作成する方法を理解する
- Next.js 14の新しいApp Routerの概念を学ぶ
- プロジェクト構造とファイル規則を理解する
- TypeScriptとの統合方法を学ぶ

## 概要

Next.jsは、ReactベースのWebアプリケーション構築のためのフレームワークです。Server-Side Rendering (SSR)、Static Site Generation (SSG)、API Routes、Image Optimizationなど、多くの機能を提供します。

## Next.js 14の主な特徴

### App Router（推奨）
- ファイルシステムベースのルーティング
- Server ComponentsとClient Componentsの区別
- ネストしたレイアウト
- 並列ルーティング

### Pages Router（従来）
- pages/ディレクトリベースのルーティング
- 従来のReactコンポーネント

## プロジェクト構造

```
my-nextjs-app/
├── app/                    # App Router（Next.js 13+）
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── about/
│   │   └── page.tsx       # /about ページ
│   └── api/
│       └── hello/
│           └── route.ts   # API Route
├── components/            # 再利用可能なコンポーネント
├── lib/                   # ユーティリティ関数
├── public/                # 静的ファイル
├── styles/                # スタイルファイル
├── next.config.js         # Next.js設定
├── package.json
└── tsconfig.json
```

## セットアップ手順

### 1. プロジェクト作成
```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
```

### 2. 開発サーバー起動
```bash
npm run dev
```

### 3. ビルド
```bash
npm run build
npm start
```

## App Routerの基本

### Server Components（デフォルト）
```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>ホームページ</h1>
      <p>これはServer Componentです</p>
    </div>
  )
}
```

### Client Components
```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      カウント: {count}
    </button>
  )
}
```

## 演習問題

1. **基本セットアップ**: Next.js 14プロジェクトを作成し、TypeScriptを設定してください
2. **ページ作成**: `/about` と `/contact` ページを作成してください
3. **コンポーネント作成**: Header、Footer、Navigationコンポーネントを作成してください
4. **レイアウト設定**: 全ページで共通のレイアウトを設定してください

## 実行方法

```bash
# パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:3000 を開く

# テストを実行
npm test

# ビルド
npm run build
```

## 次のステップ

次のレッスンでは、Next.jsのページルーティングとナビゲーションについて詳しく学習します。