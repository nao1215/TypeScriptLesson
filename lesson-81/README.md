# Lesson 81: 状態管理（Zustand, Context API）

## 学習目標
- Next.jsアプリケーションでの状態管理手法を理解する
- Zustandを使った軽量な状態管理を学ぶ
- React Context APIの適切な使用方法を習得する
- Server ComponentsとClient Componentsでの状態管理の違いを理解する

## 概要

Next.jsアプリケーションでは、状態管理が重要な要素です。特にApp RouterのServer ComponentsとClient Componentsの使い分けを考慮した状態管理が必要です。

## Zustandを使った状態管理

### Zustandのセットアップ

```bash
npm install zustand
```

### 基本的なストア作成

```tsx
// lib/stores/useUserStore.ts
import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
}

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const user = await response.json()
      set({ user, isLoading: false })
    } catch (error) {
      set({ error: 'ログインに失敗しました', isLoading: false })
    }
  },
  
  logout: () => {
    set({ user: null })
  },
  
  updateUser: (updatedUser: Partial<User>) => {
    const { user } = get()
    if (user) {
      set({ user: { ...user, ...updatedUser } })
    }
  }
}))
```

### ショッピングカートストア

```tsx
// lib/stores/useCartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartState {
  items: CartItem[]
  total: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (newItem) => {
        const { items } = get()
        const existingItem = items.find(item => item.id === newItem.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...newItem, quantity: 1 }]
          })
        }
        
        // 合計金額を更新
        const newItems = get().items
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        set({ total: newTotal })
      },
      
      removeItem: (id) => {
        const newItems = get().items.filter(item => item.id !== id)
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        set({ items: newItems, total: newTotal })
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        const newItems = get().items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        set({ items: newItems, total: newTotal })
      },
      
      clearCart: () => {
        set({ items: [], total: 0 })
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
      // LocalStorageに永続化
    }
  )
)
```

### Client Componentでの使用

```tsx
// components/UserProfile.tsx
'use client'

import { useUserStore } from '@/lib/stores/useUserStore'

export default function UserProfile() {
  const { user, isLoading, login, logout } = useUserStore()

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  if (!user) {
    return (
      <button onClick={() => login('test@example.com', 'password')}>
        ログイン
      </button>
    )
  }

  return (
    <div>
      <h2>ようこそ、{user.name}さん</h2>
      <button onClick={logout}>ログアウト</button>
    </div>
  )
}
```

## Context APIを使った状態管理

### テーマコンテキスト

```tsx
// contexts/ThemeContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // ローカルストレージから読み込み
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // テーマ変更時にローカルストレージとDOMを更新
    localStorage.setItem('theme', theme)
    document.documentElement.className = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

### 通知コンテキスト

```tsx
// contexts/NotificationContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // 5秒後に自動削除
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
```

## プロバイダーの組み合わせ

```tsx
// components/Providers.tsx
'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  )
}
```

```tsx
// app/layout.tsx
import Providers from '@/components/Providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## Server Componentsでの状態管理

```tsx
// Server Componentでは状態を直接管理できない
// 代わりにクエリパラメータやCookieを使用

// app/products/page.tsx
import ProductList from '@/components/ProductList'

interface PageProps {
  searchParams: {
    category?: string
    page?: string
  }
}

export default function ProductsPage({ searchParams }: PageProps) {
  const category = searchParams.category || 'all'
  const page = Number(searchParams.page) || 1

  return <ProductList category={category} page={page} />
}
```

## カスタムフック

```tsx
// hooks/useLocalStorage.ts
'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
```

## 演習問題

1. **ユーザー管理**: ログイン状態を管理するストアの実装
2. **ショッピングカート**: 商品の追加・削除・数量変更機能
3. **テーマ切り替え**: ダーク・ライトモードの実装
4. **通知システム**: トースト通知の表示・管理システム

## 実行方法

```bash
npm install zustand
npm run dev
# 各種状態管理機能をテスト
npm test
```

## 次のステップ

次のレッスンでは、NextAuth.jsを使った認証システムの実装を学習します。