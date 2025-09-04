# Lesson 85: スタイリング（Tailwind CSS + CSS Modules）

## 学習目標
- Next.jsでのスタイリング手法を理解する
- Tailwind CSSを使った効率的なスタイリング方法を学ぶ
- CSS Modulesによるスコープ付きCSSの活用方法を習得する
- コンポーネントベースのスタイリング戦略を実装する

## 概要

Next.jsは多様なスタイリング手法をサポートしています。Tailwind CSSとCSS Modulesを組み合わせることで、保守性と効率性を兼ね備えたスタイリングが可能になります。

## Tailwind CSSのセットアップ

### インストールと設定

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500;
  }
  
  .btn-secondary {
    @apply btn bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md border border-gray-200 p-6;
  }
}
```

## Tailwind CSSの実践的な使用例

### レスポンシブコンポーネント

```tsx
// components/Hero.tsx
export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
      <div className="container mx-auto px-4 py-12 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            革新的なWebソリューション
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            次世代のWeb技術で、あなたのビジネスを成功に導きます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-8 py-3 text-lg">
              今すぐ始める
            </button>
            <button className="btn bg-white text-primary-500 hover:bg-gray-50 px-8 py-3 text-lg">
              詳細を見る
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### グリッドレイアウト

```tsx
// components/ProductGrid.tsx
interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="card hover:shadow-lg transition-shadow">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-3">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-500">
              ¥{product.price.toLocaleString()}
            </span>
            <button className="btn-primary">
              カートに追加
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## CSS Modulesの活用

### 基本的なCSS Modules

```css
/* components/Header.module.css */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.navList {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.navItem a {
  color: white;
  text-decoration: none;
  transition: opacity 0.2s;
}

.navItem a:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .navList {
    display: none;
  }
}
```

```tsx
// components/Header.tsx
import styles from './Header.module.css'
import Link from 'next/link'

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link href="/">MyApp</Link>
        </div>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link href="/about">About</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/products">Products</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
```

### 動的スタイリング

```css
/* components/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.primary:hover {
  background-color: #2563eb;
}

.secondary {
  background-color: #6b7280;
  color: white;
}

.secondary:hover {
  background-color: #4b5563;
}

.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

```tsx
// components/Button.tsx
import styles from './Button.module.css'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    size !== 'medium' ? styles[size] : '',
    disabled ? styles.disabled : ''
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classNames}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

## TailwindとCSS Modulesの組み合わせ

### ハイブリッドアプローチ

```tsx
// components/Modal.tsx
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Tailwindでオーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* CSS Modulesでモーダルコンテンツ */}
      <div className={`${styles.modal} relative bg-white rounded-lg shadow-xl`}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
```

```css
/* components/Modal.module.css */
.modal {
  max-width: 90vw;
  max-height: 90vh;
  padding: 2rem;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .modal {
    max-width: 500px;
  }
}

.modal::-webkit-scrollbar {
  width: 6px;
}

.modal::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
```

## スタイリング戦略

### デザインシステムの実装

```tsx
// components/ui/Typography.tsx
interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption'
  children: React.ReactNode
  className?: string
}

const variantClasses = {
  h1: 'text-4xl font-bold text-gray-900',
  h2: 'text-3xl font-semibold text-gray-800',
  h3: 'text-2xl font-medium text-gray-700',
  body: 'text-base text-gray-600',
  caption: 'text-sm text-gray-500'
}

export default function Typography({ variant, children, className = '' }: TypographyProps) {
  const Tag = variant === 'body' ? 'p' : variant === 'caption' ? 'span' : variant
  
  return (
    <Tag className={`${variantClasses[variant]} ${className}`}>
      {children}
    </Tag>
  )
}
```

### レスポンシブデザインパターン

```tsx
// components/Layout.tsx
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export default function Layout({ children, sidebar }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* メインコンテンツ */}
          <main className="lg:col-span-3">
            {children}
          </main>
          
          {/* サイドバー */}
          {sidebar && (
            <aside className="mt-8 lg:mt-0">
              <div className="sticky top-8">
                {sidebar}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
```

## パフォーマンス最適化

### クリティカルCSSの分離

```css
/* styles/critical.css - 重要なスタイル */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.above-fold {
  /* Above the foldのコンテンツスタイル */
}
```

### CSS-in-JSとの比較

```tsx
// styled-componentsの例（参考）
import styled from 'styled-components'

const StyledButton = styled.button<{ variant: string }>`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.variant === 'primary' ? '#3b82f6' : '#6b7280'};
  color: white;
  border: none;
  border-radius: 0.375rem;
`

// TailwindとCSS Modulesの方が推奨される理由：
// - ビルド時最適化
// - ファイルサイズの削減
// - 開発体験の向上
```

## 演習問題

1. **コンポーネントライブラリ**: 再利用可能なUIコンポーネントセット
2. **レスポンシブデザイン**: モバイルファーストのレイアウト実装
3. **テーマシステム**: ダーク・ライトテーマの切り替え機能
4. **アニメーション**: Tailwindとfreameworks/motionの組み合わせ

## 実行方法

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography
npx tailwindcss init -p
npm run dev
# 各種スタイリングをテスト
```

## まとめ

Lesson 81-85では、Next.jsの中級機能を学習しました：
- 状態管理（Zustand、Context API）
- 認証システム（NextAuth.js）
- データベース連携（Prisma + PostgreSQL）
- フォーム処理（React Hook Form + Zod）
- スタイリング（Tailwind CSS + CSS Modules）

次のフェーズでは、これらの知識を活用して実践的なWebアプリケーションを構築します。