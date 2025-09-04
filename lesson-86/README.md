# Lesson 86: Eコマースサイトの構築

## 学習目標
- 本格的なEコマースサイトをNext.jsで構築する
- 商品管理、ショッピングカート、決済システムを実装する
- 管理者機能と顧客機能を分離したアーキテクチャを学ぶ
- 実践的なプロジェクト構造とデータベース設計を理解する

## 概要

この実践的なレッスンでは、フル機能のEコマースサイトを構築します。商品管理から注文処理まで、実際のビジネスで使用される機能を全て実装します。

## プロジェクト構造

```
ecommerce-app/
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── users/
│   │   └── layout.tsx
│   ├── (shop)/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── orders/
│   ├── api/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── payments/
│   └── layout.tsx
├── components/
│   ├── admin/
│   ├── shop/
│   └── ui/
├── lib/
│   ├── db/
│   ├── auth/
│   └── utils/
└── types/
```

## データベース設計

```sql
-- Prisma Schema

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  orders    Order[]
  reviews   Review[]
  
  @@map("users")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  stock       Int
  category    String
  images      String[]
  slug        String   @unique
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  orderItems  OrderItem[]
  reviews     Review[]
  
  @@map("products")
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  status    OrderStatus @default(PENDING)
  total     Float
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
  
  @@map("orders")
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  
  @@map("order_items")
}

enum Role {
  ADMIN
  CUSTOMER
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## 商品管理システム

### 商品一覧コンポーネント

```tsx
// components/shop/ProductGrid.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs rounded">
              残り{product.stock}点
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">売り切れ</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            ¥{product.price.toLocaleString()}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
```

### ショッピングカート

```tsx
// components/shop/ShoppingCart.tsx
'use client'

import { useCartStore } from '@/lib/stores/useCartStore'
import Image from 'next/image'
import Link from 'next/link'

export default function ShoppingCart() {
  const { items, total, updateQuantity, removeItem, getItemCount } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-4">カートが空です</h2>
        <Link 
          href="/products" 
          className="btn-primary"
        >
          商品を見る
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">ショッピングカート</h1>
      
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow">
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="rounded-md mr-4"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">¥{item.price.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center space-x-2 mr-4">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
              >
                -
              </button>
              <span className="w-12 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
              >
                +
              </button>
            </div>
            
            <div className="text-right mr-4">
              <p className="font-semibold">
                ¥{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
            
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between text-xl font-bold mb-4">
          <span>合計: ¥{total.toLocaleString()}</span>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/products" 
            className="btn-secondary flex-1 text-center"
          >
            買い物を続ける
          </Link>
          <Link 
            href="/checkout" 
            className="btn-primary flex-1 text-center"
          >
            レジに進む
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## 決済システム

### チェックアウトプロセス

```tsx
// app/checkout/page.tsx
'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/stores/useCartStore'
import { useUserStore } from '@/lib/stores/useUserStore'
import CheckoutForm from '@/components/shop/CheckoutForm'
import OrderSummary from '@/components/shop/OrderSummary'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user } = useUserStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleOrderSubmit = async (orderData: any) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          ...orderData
        })
      })
      
      if (response.ok) {
        const order = await response.json()
        clearCart()
        // 注文完了ページにリダイレクト
        router.push(`/orders/${order.id}/success`)
      }
    } catch (error) {
      console.error('Order submission failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return <div>ログインが必要です</div>
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold mb-8">お支払い情報</h1>
        <CheckoutForm 
          onSubmit={handleOrderSubmit}
          isProcessing={isProcessing}
        />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">注文内容</h2>
        <OrderSummary items={items} total={total} />
      </div>
    </div>
  )
}
```

### Stripe決済連携

```tsx
// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function createPaymentIntent(amount: number) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // 円をセントに変換
    currency: 'jpy',
    automatic_payment_methods: {
      enabled: true,
    },
  })
}
```

```tsx
// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()
    
    const paymentIntent = await createPaymentIntent(amount)
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    })
  } catch (error) {
    return NextResponse.json(
      { error: '決済処理でエラーが発生しました' },
      { status: 500 }
    )
  }
}
```

## 管理者機能

### 商品管理ダッシュボード

```tsx
// app/(admin)/admin/products/page.tsx
import ProductManagementTable from '@/components/admin/ProductManagementTable'
import { getProducts } from '@/lib/db/products'

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">商品管理</h1>
        <Link 
          href="/admin/products/new" 
          className="btn-primary"
        >
          新しい商品を追加
        </Link>
      </div>
      
      <ProductManagementTable products={products} />
    </div>
  )
}
```

### 注文管理システム

```tsx
// components/admin/OrderManagement.tsx
'use client'

import { useState } from 'react'
import { Order, OrderStatus } from '@/types'

interface OrderManagementProps {
  orders: Order[]
}

export default function OrderManagement({ orders }: OrderManagementProps) {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL')

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter)

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    
    // リフレッシュロジック
  }

  return (
    <div>
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as OrderStatus | 'ALL')}
          className="border rounded px-3 py-2"
        >
          <option value="ALL">すべて</option>
          <option value="PENDING">待機中</option>
          <option value="PROCESSING">処理中</option>
          <option value="SHIPPED">発送済み</option>
          <option value="DELIVERED">配送完了</option>
        </select>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                注文ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                合計金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id.slice(-8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ¥{order.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <OrderActions 
                    order={order} 
                    onStatusUpdate={updateOrderStatus}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

## 演習問題

1. **商品レビュー機能**: レビュー投稿・表示システムの実装
2. **在庫管理**: 自動在庫更新と低在庫アラート
3. **クーポンシステム**: 割引クーポンの作成・適用機能
4. **配送追跡**: 注文追跡システムの実装

## テスト

```tsx
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/shop/ProductCard'
import { mockProduct } from '@/lib/test-utils'

describe('ProductCard', () => {
  it('商品情報が正しく表示される', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText(`¥${mockProduct.price.toLocaleString()}`)).toBeInTheDocument()
    expect(screen.getByAltText(mockProduct.name)).toBeInTheDocument()
  })

  it('在庫切れの場合は売り切れ表示される', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getByText('売り切れ')).toBeInTheDocument()
  })
})
```

## 実行方法

```bash
# データベース設定
npx prisma generate
npx prisma db push

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# ビルド
npm run build
```

## 次のステップ

次のレッスンでは、ブログシステムの構築を通して、コンテンツ管理と静的サイト生成について学習します。