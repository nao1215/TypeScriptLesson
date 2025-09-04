# Lesson 51: ルーティングとナビゲーション (Routing & Navigation)

## 学習目標
このレッスンでは、TypeScriptを使ったSPA（Single Page Application）のルーティングシステムとナビゲーション機能を学習します。

### 学習内容
1. SPA向けルーターの実装
2. History APIとハッシュベースルーティング
3. ルートパラメータとクエリ文字列
4. ナビゲーションガードとミドルウェア
5. 遅延ロードとコード分割

## 実装する機能

### 1. 基本ルーター
History APIを使用したモダンなルーティングシステムを実装します。

### 2. 動的ルーティング
パラメータ付きルートとネストルートに対応したルーティング機能を提供します。

### 3. ナビゲーションガード
認証状態やデータの状態に基づいたルートアクセス制御を実装します。

### 4. 遅延ローディング
大規模アプリケーション向けの動的インポートとコード分割機能を提供します。

### 5. ブラウザ統合
ブラウザの戻る/進むボタン、ブックマーク対応、SEO最適化機能を実装します。

## 型定義の特徴

### ルート定義型
```typescript
interface Route {
  path: string;
  component?: ComponentType;
  loader?: () => Promise<ComponentType>;
  guards?: RouteGuard[];
  children?: Route[];
  meta?: RouteMeta;
}

interface RouteMatch {
  route: Route;
  params: Record<string, string>;
  query: Record<string, string>;
  path: string;
}
```

### ナビゲーション型
```typescript
interface NavigationOptions {
  replace?: boolean;
  state?: unknown;
  preserveQuery?: boolean;
  fragment?: string;
}

type BeforeNavigate = (to: Route, from: Route | null) => boolean | Promise<boolean>;
type AfterNavigate = (to: Route, from: Route | null) => void | Promise<void>;
```

## 実用的な使用例

### 基本的なルーター使用
```typescript
const router = new Router([
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/users/:id',
    component: UserDetailPage,
    guards: [authGuard]
  },
  {
    path: '/admin/*',
    loader: () => import('./AdminModule'),
    guards: [adminGuard]
  }
]);

// プログラマティックナビゲーション
router.navigate('/users/123', { state: { fromSearch: true } });
```

### ナビゲーションガードの使用
```typescript
const authGuard: RouteGuard = (to, from) => {
  if (!isAuthenticated()) {
    router.navigate('/login');
    return false;
  }
  return true;
};
```

## パフォーマンス最適化

### 1. コード分割
- 動的インポートによる遅延ローディング
- ルートベースの分割戦略
- プリロード機能

### 2. キャッシュ戦略
- ルートデータのキャッシュ
- コンポーネントの再利用
- メモ化による最適化

### 3. SEO対応
- Server-Side Rendering (SSR)
- メタタグの動的更新
- 構造化データの対応

## アクセシビリティ考慮事項

### 1. フォーカス管理
- ナビゲーション後のフォーカス制御
- スキップリンクの実装
- ARIA属性の適切な使用

### 2. スクリーンリーダー対応
- 動的コンテンツの更新通知
- ランドマーク要素の使用
- 意味的なHTML構造

## セキュリティ考慮事項

### 1. ルートガード
- 認証状態の検証
- 認可レベルのチェック
- CSRFトークンの検証

### 2. パラメータ検証
- 入力値のサニタイゼーション
- SQLインジェクション対策
- XSS防止

## ビルドとテスト

```bash
# ビルド
npm run build

# テスト実行
npm test

# 型チェック
npm run type-check
```

## 次のステップ
次のLesson 52では、認証と認可について学習し、セキュアなアプリケーション開発の基盤技術を習得します。